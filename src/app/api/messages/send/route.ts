import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.conversationId || !body.senderId || !body.text) {
      return NextResponse.json(
        { error: 'conversationId, senderId, and text are required' },
        { status: 400 }
      );
    }

    // Verify conversation exists
    const convDoc = await adminDb.collection('conversations').doc(body.conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const newMessage = {
      conversationId: body.conversationId,
      senderId: body.senderId,
      text: body.text,
      timestamp: new Date(),
      read: false,
    };

    // Create message in subcollection
    const messageRef = await adminDb
      .collection('conversations')
      .doc(body.conversationId)
      .collection('messages')
      .add(newMessage);

    // Update conversation with last message info
    await adminDb.collection('conversations').doc(body.conversationId).update({
      lastMessage: body.text,
      lastMessageTime: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: { id: messageRef.id, ...newMessage }, success: 'Message sent' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Get messages from subcollection
    const snapshot = await adminDb
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
