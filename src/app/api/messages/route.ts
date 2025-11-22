import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Conversation } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const ownerId = searchParams.get('ownerId');

    let query: FirebaseFirestore.Query = adminDb.collection('conversations');

    if (clientId) {
      query = query.where('clientId', '==', clientId);
    }
    if (ownerId) {
      query = query.where('ownerId', '==', ownerId);
    }

    const snapshot = await query.get();
    const conversations: Conversation[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Fetch client and owner details
      const clientDoc = await adminDb.collection('users').doc(data.clientId).get();
      const ownerDoc = await adminDb.collection('users').doc(data.ownerId).get();

      const clientData = clientDoc.data();
      const ownerData = ownerDoc.data();

      conversations.push({
        id: doc.id,
        ...data,
        clientName: clientData ? `${clientData.firstName} ${clientData.lastName}` : 'Unknown Client',
        ownerName: ownerData ? `${ownerData.firstName} ${ownerData.lastName}` : 'Unknown Owner',
        avatar: clientData?.profileImage || ownerData?.profileImage,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastMessageTime: data.lastMessageTime?.toDate(),
      } as Conversation);
    }

    // Sort manually since Firestore query limitations might apply with multiple where clauses
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.clientId || !body.ownerId) {
      return NextResponse.json(
        { error: 'clientId and ownerId are required' },
        { status: 400 }
      );
    }

    // Check if conversation exists
    const snapshot = await adminDb.collection('conversations')
      .where('clientId', '==', body.clientId)
      .where('ownerId', '==', body.ownerId)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return NextResponse.json({
        conversation: { id: doc.id, ...doc.data() }
      });
    }

    const newConversation = {
      clientId: body.clientId,
      ownerId: body.ownerId,
      lastMessage: body.lastMessage || '',
      lastMessageTime: new Date(),
      unread: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('conversations').add(newConversation);

    // Fetch details for response
    const clientDoc = await adminDb.collection('users').doc(body.clientId).get();
    const ownerDoc = await adminDb.collection('users').doc(body.ownerId).get();
    const clientData = clientDoc.data();
    const ownerData = ownerDoc.data();

    const conversationWithDetails = {
      id: docRef.id,
      ...newConversation,
      clientName: clientData ? `${clientData.firstName} ${clientData.lastName}` : 'Unknown Client',
      ownerName: ownerData ? `${ownerData.firstName} ${ownerData.lastName}` : 'Unknown Owner',
    };

    return NextResponse.json(
      { conversation: conversationWithDetails, message: 'Conversation created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
