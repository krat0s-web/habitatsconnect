import { create } from 'zustand';
import { onSnapshot, query, where, orderBy, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message, Conversation } from '@/types';

interface MessageStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  listeners: {
    conversations?: () => void;
    messages: Record<string, (() => void) | undefined>;
  };
  addConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: string, message: Message) => void;
  sendMessage: (conversationId: string, senderId: string, text: string) => Promise<Message | null>;
  getConversationsByOwnerId: (ownerId: string) => Conversation[];
  getMessagesByConversationId: (conversationId: string) => Message[];
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  loadConversations: () => void;
  loadMessages: () => Promise<void>;
  subscribeToConversations: (userId: string) => void;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribeFromConversations: () => void;
  unsubscribeFromMessages: (conversationId: string) => void;
  saveConversations: () => void;
  saveMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  messages: {},
  listeners: {
    messages: {},
  },

  addConversation: (conversation) => {
    set((state) => {
      // Vérifier si la conversation existe déjà
      const exists = state.conversations.some(
        (c) =>
          c.id === conversation.id ||
          (c.clientId === conversation.clientId && c.ownerId === conversation.ownerId)
      );

      if (exists) return state; // Ne pas ajouter de doublon

      const newConversations = [...state.conversations, conversation];
      if (typeof window !== 'undefined') {
        localStorage.setItem('habitatsconnect_conversations', JSON.stringify(newConversations));
      }
      return { conversations: newConversations };
    });
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const newMessages = {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('habitatsconnect_messages', JSON.stringify(newMessages));
      }
      return { messages: newMessages };
    });
  },

  sendMessage: async (conversationId, senderId, text) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, senderId, text }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp),
      };

      // Don't manually add to local state - the real-time listener will handle it
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  getConversationsByOwnerId: (ownerId) => {
    const { conversations } = get();
    return conversations.filter((c) => c.ownerId === ownerId);
  },

  getMessagesByConversationId: (conversationId) => {
    const { messages } = get();
    return messages[conversationId] || [];
  },

  updateConversation: (id, updates) => {
    set((state) => {
      const newConversations = state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('habitatsconnect_conversations', JSON.stringify(newConversations));
      }
      return { conversations: newConversations };
    });
  },

  loadConversations: async () => {
    try {
      const authStore = localStorage.getItem('auth-storage');
      let currentUserId = '';

      if (authStore) {
        try {
          const { state } = JSON.parse(authStore);
          currentUserId = state.user?.id || '';
        } catch (e) {
          console.error('Error parsing auth store:', e);
        }
      }

      // Chercher les conversations pour l'utilisateur courant (comme client ou owner)
      const responses = await Promise.all([
        fetch(`/api/messages?clientId=${currentUserId}`),
        fetch(`/api/messages?ownerId=${currentUserId}`),
      ]);

      let allConversations: any[] = [];

      for (const response of responses) {
        if (response.ok) {
          const data = await response.json();
          allConversations = allConversations.concat(data.conversations || []);
        }
      }

      // Supprimer les doublons
      const uniqueConversations = Array.from(
        new Map(allConversations.map((c: any) => [c._id || c.id, c])).values()
      ).map((c: any) => ({
        ...c,
        id: c._id || c.id,
        updatedAt: new Date(c.updatedAt),
        createdAt: new Date(c.createdAt),
      }));

      set({ conversations: uniqueConversations });
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('habitatsconnect_conversations');
        if (stored) {
          try {
            const conversations = JSON.parse(stored).map((c: any) => ({
              ...c,
              updatedAt: new Date(c.updatedAt),
              createdAt: new Date(c.createdAt),
            }));
            set({ conversations });
          } catch (e) {
            console.error('Fallback error:', e);
          }
        }
      }
    }
  },

  loadMessages: async () => {
    try {
      const { conversations, messages: existingMessages } = get();
      const messages: Record<string, Message[]> = { ...existingMessages }; // Start with existing messages

      // Load messages for each conversation from Firestore API
      for (const conv of conversations) {
        try {
          const response = await fetch(`/api/messages/send?conversationId=${conv.id}`);
          if (response.ok) {
            const data = await response.json();
            const apiMessages = (data.messages || []).map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }));

            // Merge API messages with existing local messages
            // API messages take precedence for duplicates (by ID)
            const existingLocalMessages = messages[conv.id] || [];
            const mergedMessages = [...existingLocalMessages];

            // Add API messages that don't exist locally
            for (const apiMsg of apiMessages) {
              const existingIndex = mergedMessages.findIndex((m) => m.id === apiMsg.id);
              if (existingIndex >= 0) {
                // Update existing message with API data
                mergedMessages[existingIndex] = apiMsg;
              } else {
                // Add new message from API
                mergedMessages.push(apiMsg);
              }
            }

            // Sort by timestamp
            mergedMessages.sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            messages[conv.id] = mergedMessages;
          }
        } catch (error) {
          console.error(`Error loading messages for conversation ${conv.id}:`, error);
          // Keep existing messages if API fails
        }
      }

      set({ messages });
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't overwrite existing messages if there's an error
    }
  },

  saveConversations: () => {
    const { conversations } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitatsconnect_conversations', JSON.stringify(conversations));
    }
  },

  saveMessages: () => {
    const { messages } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitatsconnect_messages', JSON.stringify(messages));
    }
  },

  subscribeToConversations: (userId: string) => {
    // Unsubscribe from existing listener if any
    get().unsubscribeFromConversations();

    // Create queries for conversations where user is client or owner
    const clientQuery = query(collection(db, 'conversations'), where('clientId', '==', userId));

    const ownerQuery = query(collection(db, 'conversations'), where('ownerId', '==', userId));

    // Listen to client conversations
    const clientUnsubscribe = onSnapshot(clientQuery, async (clientSnapshot) => {
      const clientConversations = await Promise.all(
        clientSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          // Fetch owner details
          const ownerDoc = await getDoc(doc(db, 'users', data.ownerId));
          const ownerData = ownerDoc.data();

          return {
            id: docSnap.id,
            ...data,
            ownerName: ownerData ? `${ownerData.firstName} ${ownerData.lastName}` : 'Unknown Owner',
            clientName: 'You', // Since this is the client's view
            avatar: ownerData?.profileImage,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastMessageTime: data.lastMessageTime?.toDate(),
          } as Conversation;
        })
      );

      // Listen to owner conversations
      const ownerUnsubscribe = onSnapshot(ownerQuery, async (ownerSnapshot) => {
        const ownerConversations = await Promise.all(
          ownerSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            // Fetch client details
            const clientDoc = await getDoc(doc(db, 'users', data.clientId));
            const clientData = clientDoc.data();

            return {
              id: docSnap.id,
              ...data,
              clientName: clientData
                ? `${clientData.firstName} ${clientData.lastName}`
                : 'Unknown Client',
              ownerName: 'You', // Since this is the owner's view
              avatar: clientData?.profileImage,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              lastMessageTime: data.lastMessageTime?.toDate(),
            } as Conversation;
          })
        );

        // Combine and deduplicate conversations
        const allConversations = [...clientConversations, ...ownerConversations];
        const uniqueConversations = Array.from(
          new Map(allConversations.map((c) => [c.id, c])).values()
        );

        // Sort by last message time
        uniqueConversations.sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });

        set({ conversations: uniqueConversations });
      });

      // Store the combined unsubscribe function
      set((state) => ({
        listeners: {
          ...state.listeners,
          conversations: () => {
            clientUnsubscribe();
            ownerUnsubscribe();
          },
        },
      }));
    });
  },

  subscribeToMessages: (conversationId: string) => {
    // Unsubscribe from existing listener for this conversation if any
    get().unsubscribeFromMessages(conversationId);

    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Message[];

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      }));
    });

    // Store the unsubscribe function
    set((state) => ({
      listeners: {
        ...state.listeners,
        messages: {
          ...state.listeners.messages,
          [conversationId]: unsubscribe,
        },
      },
    }));
  },

  unsubscribeFromConversations: () => {
    const { listeners } = get();
    if (listeners.conversations) {
      listeners.conversations();
      set((state) => ({
        listeners: {
          ...state.listeners,
          conversations: undefined,
        },
      }));
    }
  },

  unsubscribeFromMessages: (conversationId: string) => {
    const { listeners } = get();
    if (listeners.messages[conversationId]) {
      listeners.messages[conversationId]!();
      set((state) => ({
        listeners: {
          ...state.listeners,
          messages: {
            ...state.listeners.messages,
            [conversationId]: undefined,
          },
        },
      }));
    }
  },
}));
