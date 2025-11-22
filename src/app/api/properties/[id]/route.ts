import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Property } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = adminDb.collection('properties').doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    let owner = null;

    // Fetch owner details
    if (data?.ownerId) {
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

    const property = {
      id: docSnap.id,
      ...data,
      owner,
      createdAt: data?.createdAt?.toDate(),
      updatedAt: data?.updatedAt?.toDate(),
    } as Property;

    return NextResponse.json({ property });
  } catch (error: any) {
    console.error('Fetch property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const docRef = adminDb.collection('properties').doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove id if present in body to avoid overwriting
    delete updateData.id;

    await docRef.update(updateData);

    return NextResponse.json({
      property: { id: params.id, ...docSnap.data(), ...updateData },
      message: 'Property updated successfully',
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = adminDb.collection('properties').doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      message: 'Property deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}
