import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Transaction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    let query: FirebaseFirestore.Query = adminDb.collection('transactions');

    if (ownerId) {
      query = query.where('receiverId', '==', ownerId);
    }

    const snapshot = await query.get();
    const transactions: Transaction[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Fetch details
      const senderDoc = await adminDb.collection('users').doc(data.senderId).get();
      const receiverDoc = await adminDb.collection('users').doc(data.receiverId).get();
      let reservation = undefined;

      if (data.reservationId) {
        const resDoc = await adminDb.collection('reservations').doc(data.reservationId).get();
        if (resDoc.exists) {
          reservation = { id: resDoc.id, ...resDoc.data() };
        }
      }

      const senderData = senderDoc.data();
      const receiverData = receiverDoc.data();

      transactions.push({
        id: doc.id,
        ...data,
        sender: senderData ? {
          id: senderDoc.id,
          email: senderData.email,
          firstName: senderData.firstName,
          lastName: senderData.lastName
        } : undefined,
        receiver: receiverData ? {
          id: receiverDoc.id,
          email: receiverData.email,
          firstName: receiverData.firstName,
          lastName: receiverData.lastName
        } : undefined,
        reservation,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as unknown as Transaction); // Type assertion needed as Transaction type might not match exactly with populated fields
    }

    // Sort manually
    transactions.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ownerId) {
      return NextResponse.json(
        { error: 'ownerId is required' },
        { status: 400 }
      );
    }

    const newTransaction = {
      receiverId: body.ownerId,
      senderId: body.senderId || '',
      reservationId: body.reservationId || '',
      amount: body.amount || 0,
      type: body.type || 'revenue',
      status: body.status || 'completed',
      description: body.description || '',
      metadata: body.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('transactions').add(newTransaction);

    // Fetch details for response
    const senderDoc = await adminDb.collection('users').doc(newTransaction.senderId).get();
    const receiverDoc = await adminDb.collection('users').doc(newTransaction.receiverId).get();
    const senderData = senderDoc.data();
    const receiverData = receiverDoc.data();

    const transactionWithDetails = {
      id: docRef.id,
      ...newTransaction,
      sender: senderData ? {
        id: senderDoc.id,
        email: senderData.email,
        firstName: senderData.firstName,
        lastName: senderData.lastName
      } : undefined,
      receiver: receiverData ? {
        id: receiverDoc.id,
        email: receiverData.email,
        firstName: receiverData.firstName,
        lastName: receiverData.lastName
      } : undefined,
    };

    return NextResponse.json(
      { transaction: transactionWithDetails, message: 'Transaction created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
