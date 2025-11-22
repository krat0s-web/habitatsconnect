import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Reservation } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const clientId = searchParams.get('clientId');
    const ownerId = searchParams.get('ownerId');

    let query: FirebaseFirestore.Query = adminDb.collection('reservations');

    if (propertyId) {
      query = query.where('propertyId', '==', propertyId);
    }
    if (clientId) {
      query = query.where('clientId', '==', clientId);
    }

    // If ownerId is provided, we need to filter by properties owned by this user
    // This is complex in NoSQL without denormalization. 
    // Strategy: Fetch all properties of owner, then fetch reservations for those properties.
    if (ownerId) {
      const propertiesSnap = await adminDb.collection('properties')
        .where('ownerId', '==', ownerId)
        .get();

      if (propertiesSnap.empty) {
        return NextResponse.json({ reservations: [] });
      }

      const propertyIds = propertiesSnap.docs.map(doc => doc.id);

      // Firestore 'in' query is limited to 10 (or 30) items. 
      // If many properties, we might need multiple queries or client-side filtering.
      // For now, let's assume < 30 properties.
      // Actually, if we have propertyId filter already, we don't need this.
      // But usually ownerId is used to get ALL reservations for an owner.

      if (propertyIds.length > 0) {
        // Split into chunks of 10 for 'in' query
        const chunks = [];
        for (let i = 0; i < propertyIds.length; i += 10) {
          chunks.push(propertyIds.slice(i, i + 10));
        }

        const reservationsPromises = chunks.map(chunk =>
          adminDb.collection('reservations').where('propertyId', 'in', chunk).get()
        );

        const snapshots = await Promise.all(reservationsPromises);
        const allDocs = snapshots.flatMap(snap => snap.docs);

        // Process docs
        const reservations = await Promise.all(allDocs.map(async (doc) => {
          const data = doc.data();
          return fetchReservationDetails(doc.id, data);
        }));

        return NextResponse.json({ reservations });
      }
    }

    const snapshot = await query.get();
    const reservations = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      return fetchReservationDetails(doc.id, data);
    }));

    return NextResponse.json({ reservations });
  } catch (error: any) {
    console.error('Fetch reservations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

async function fetchReservationDetails(id: string, data: any) {
  // Fetch property and client details
  let property = undefined;
  let client = undefined;

  if (data.propertyId) {
    const propDoc = await adminDb.collection('properties').doc(data.propertyId).get();
    if (propDoc.exists) {
      property = { id: propDoc.id, ...propDoc.data() };
    }
  }

  if (data.clientId) {
    const clientDoc = await adminDb.collection('users').doc(data.clientId).get();
    if (clientDoc.exists) {
      const clientData = clientDoc.data();
      client = {
        id: clientDoc.id,
        email: clientData?.email,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        role: clientData?.role,
      };
    }
  }

  return {
    id,
    ...data,
    property,
    client,
    checkIn: data.checkIn?.toDate(),
    checkOut: data.checkOut?.toDate(),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Reservation;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.propertyId || !body.clientId) {
      return NextResponse.json(
        { error: 'propertyId and clientId are required' },
        { status: 400 }
      );
    }

    const newReservation = {
      propertyId: body.propertyId,
      clientId: body.clientId,
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      guests: body.guests || 1,
      totalPrice: body.totalPrice || 0,
      depositAmount: body.depositAmount || 0,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('reservations').add(newReservation);

    const reservationDetails = await fetchReservationDetails(docRef.id, newReservation);

    return NextResponse.json(
      { reservation: reservationDetails, message: 'Reservation created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create reservation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
