import { create } from 'zustand';
import type { Message, Conversation } from '@/types';

interface MessageStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  addConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: string, message: Message) => void;
  sendMessage: (conversationId: string, senderId: string, text: string) => Promise<Message | null>;
  getConversationsByOwnerId: (ownerId: string) => Conversation[];
  getMessagesByConversationId: (conversationId: string) => Message[];
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  loadConversations: () => void;
  loadMessages: () => Promise<void>;
  saveConversations: () => void;
  saveMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  messages: {},

  addConversation: (conversation) => {
    set((state) => {
      // Vérifier si la conversation existe déjà
      const exists = state.conversations.some(
        (c) => c.id === conversation.id || 
               (c.clientId === conversation.clientId && c.ownerId === conversation.ownerId)
      );
      
      if (exists) return state; // Ne pas ajouter de doublon
      
      const newConversations = [...state.conversations, conversation];
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'habitatsconnect_conversations',
          JSON.stringify(newConversations)
        );
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
        localStorage.setItem(
          'habitatsconnect_messages',
          JSON.stringify(newMessages)
        );
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

      // Add to local state
      get().addMessage(conversationId, message);
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
        localStorage.setItem(
          'habitatsconnect_conversations',
          JSON.stringify(newConversations)
        );
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
      const { conversations } = get();
      const messages: Record<string, Message[]> = {};

      // Load messages for each conversation from Firestore API
      for (const conv of conversations) {
        try {
          const response = await fetch(`/api/messages/send?conversationId=${conv.id}`);
          if (response.ok) {
            const data = await response.json();
            messages[conv.id] = (data.messages || []).map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }));
          }
        } catch (error) {
          console.error(`Error loading messages for conversation ${conv.id}:`, error);
        }
      }

      set({ messages });
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('habitatsconnect_messages');
        if (stored) {
          try {
            const messagesData = JSON.parse(stored);
            const messages: Record<string, Message[]> = {};
            for (const [convId, msgs] of Object.entries(messagesData)) {
              messages[convId] = (msgs as any[]).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              }));
            }
            set({ messages });
          } catch (e) {
            console.error('Fallback error:', e);
          }
        }
      }
    }
  },

  saveConversations: () => {
    const { conversations } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'habitatsconnect_conversations',
        JSON.stringify(conversations)
      );
    }
  },

  saveMessages: () => {
    const { messages } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitatsconnect_messages', JSON.stringify(messages));
    }
  },
}));
