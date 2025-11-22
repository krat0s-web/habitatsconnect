import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('id');

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get reservation
    const resDoc = await adminDb.collection('reservations').doc(reservationId).get();
    if (!resDoc.exists) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const resData = resDoc.data();
    if (!resData) {
      return NextResponse.json(
        { error: 'Invalid reservation data' },
        { status: 400 }
      );
    }

    // Update reservation status
    await adminDb.collection('reservations').doc(reservationId).update({
      status,
      updatedAt: new Date(),
    });

    // If status is confirmed and totalPrice > 0, create a transaction
    if (status === 'confirmed' && resData.totalPrice > 0) {
      // Get property to find owner
      const propDoc = await adminDb.collection('properties').doc(resData.propertyId).get();
      const propData = propDoc.data();

      if (propData && propData.ownerId) {
        // Create transaction
        const newTransaction = {
          receiverId: propData.ownerId,
          senderId: resData.clientId,
          reservationId: reservationId,
          amount: resData.totalPrice,
          type: 'income',
          status: 'completed',
          description: `Réservation confirmée - ${propData.title || 'Property'}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await adminDb.collection('transactions').add(newTransaction);
      }
    }

    // Return updated reservation
    const updatedRes = await adminDb.collection('reservations').doc(reservationId).get();
    const updated = updatedRes.data();

    // Fetch property and client for response
    let property = undefined;
    let client = undefined;

    if (updated?.propertyId) {
      const propDoc = await adminDb.collection('properties').doc(updated.propertyId).get();
      if (propDoc.exists) {
        property = { id: propDoc.id, ...propDoc.data() };
      }
    }

    if (updated?.clientId) {
      const clientDoc = await adminDb.collection('users').doc(updated.clientId).get();
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

    return NextResponse.json(
      {
        reservation: {
          id: reservationId,
          ...updated,
          property,
          client,
          checkIn: updated?.checkIn?.toDate(),
          checkOut: updated?.checkOut?.toDate(),
          createdAt: updated?.createdAt?.toDate(),
          updatedAt: updated?.updatedAt?.toDate(),
        },
        message: 'Reservation updated and transaction created if applicable',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update reservation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reservation' },
      { status: 500 }
    );
  }
}
