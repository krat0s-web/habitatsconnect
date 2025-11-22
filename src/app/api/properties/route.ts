import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Property } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    let query: FirebaseFirestore.Query = adminDb.collection('properties');

    if (ownerId) {
      query = query.where('ownerId', '==', ownerId);
    }

    const snapshot = await query.get();
    const properties: Property[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let owner = null;

      // Fetch owner details
      if (data.ownerId) {
        const ownerDoc = await adminDb.collection('users').doc(data.ownerId).get();
        if (ownerDoc.exists) {
          const ownerData = ownerDoc.data();
          owner = {
            id: ownerDoc.id,
            email: ownerData?.email,
            firstName: ownerData?.firstName,
            lastName: ownerData?.lastName,
            role: ownerData?.role,
          };
        }
      }

      properties.push({
        id: doc.id,
        ...data,
        owner,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Property);
    }

    return NextResponse.json({ properties });
  } catch (error: any) {
    console.error('Fetch properties error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.ownerId) {
      return NextResponse.json(
        { error: 'Title and ownerId are required' },
        { status: 400 }
      );
    }

    // Verify owner exists
    const ownerDoc = await adminDb.collection('users').doc(body.ownerId).get();
    if (!ownerDoc.exists) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    const newProperty = {
      title: body.title,
      description: body.description || '',
      type: body.type || 'apartment',
      price: body.price || 0,
      location: body.location || '',
      address: body.address || '',
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 0,
      area: body.area || 0,
      amenities: body.amenities || [],
      images: body.images || [],
      ownerId: body.ownerId,
      isAvailable: body.isAvailable !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('properties').add(newProperty);

    return NextResponse.json(
      {
        property: { id: docRef.id, ...newProperty },
        message: 'Property created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}
