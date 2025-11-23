'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaPaperPlane, FaArrowLeft, FaSearch, FaEllipsisV, FaComments } from 'react-icons/fa';
import { useAuthStore, useMessageStore } from '@/store';
import type { Conversation } from '@/types';
export default function ClientChatPage() {
  const { user } = useAuthStore();
  const {
    conversations,
    messages,
    sendMessage,
    subscribeToConversations,
    unsubscribeFromConversations,
    subscribeToMessages,
  } = useMessageStore();
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time conversations
      subscribeToConversations(user.id);
    }
    // Cleanup on unmount
    return () => {
      unsubscribeFromConversations();
    };
  }, [user?.id, subscribeToConversations, unsubscribeFromConversations]);
  // Handle conversation selection from URL parameter
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversations.length > 0) {
      // Check if the conversation exists in our client conversations
      const clientConversations = conversations
        .filter((c) => c.clientId === user?.id)
        .reduce((acc: typeof conversations, current) => {
          const exists = acc.find((c) => c.ownerId === current.ownerId);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
      const conversation = clientConversations.find((c) => c.id === conversationParam);
      if (conversation) {
        setSelectedConversationId(conversationParam);
        // Subscribe to real-time messages for this conversation
        subscribeToMessages(conversationParam);
      }
    }
  }, [searchParams, conversations, user?.id, subscribeToMessages]);
  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      subscribeToMessages(selectedConversationId);
    }
  }, [selectedConversationId, subscribeToMessages]);
  // Filtrer les conversations du client et supprimer les doublons
  const clientConversations = conversations
    .filter((c) => c.clientId === user?.id)
    .reduce((acc: typeof conversations, current) => {
      // Vérifier si une conversation avec le même propriétaire existe déjà
      const exists = acc.find((c) => c.ownerId === current.ownerId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
  const selectedConversation = clientConversations.find((c) => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];
  const filteredConversations = clientConversations.filter((c) =>
    (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Fonction pour obtenir le nom de l'autre personne
  const getConversationName = (conversation: Conversation): string => {
    // Priorité 1: ownerName si disponible
    if (conversation.ownerName && conversation.ownerName.trim()) {
      return conversation.ownerName;
    }
    // Priorité 2: clientName (fallback)
    return conversation.clientName;
  };
  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversationId && user) {
      setSending(true);
      try {
        const message = await sendMessage(selectedConversationId, user.id, messageText);
        if (message) {
          setMessageText('');
          // No need to manually update messages - the real-time listener will handle it
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert("Erreur lors de l'envoi du message");
      } finally {
        setSending(false);
      }
    }
  };
  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 text-lg">Veuillez vous connecter pour accéder au chat</p>
      </div>
    );
  }
  return (
    <div className="flex bg-white shadow-md rounded-xl h-[calc(100vh-140px)] overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div
        className={`${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 flex-col bg-slate-50 border-slate-200 border-r`}
      >
        {/* Header */}
        <div className="p-4 border-slate-200 border-b">
          <h3 className="flex items-center gap-2 mb-4 font-bold text-slate-900 text-lg">
            <FaComments className="text-primary-600" /> Messages
          </h3>
          <div className="relative">
            <FaSearch className="top-3 left-3 absolute text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pr-4 pl-10 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 w-full"
            />
          </div>
        </div>
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-200 transition ${
                  selectedConversationId === conversation.id
                    ? 'bg-white border-l-4 border-l-primary-600'
                    : 'hover:bg-white'
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-2xl">{conversation.avatar || '👤'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">
                      {getConversationName(conversation)}
                    </div>
                    <div className="text-slate-600 text-sm truncate">
                      {conversation.lastMessage}
                    </div>
                    <div className="mt-1 text-slate-500 text-xs">
                      {new Date(conversation.lastMessageTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {conversation.unread && (
                    <div className="bg-primary-600 mt-2 rounded-full w-3 h-3"></div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-slate-500 text-center">Aucune conversation</div>
          )}
        </div>
      </div>
      {/* Main Chat Area */}
      {selectedConversation ? (
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="flex justify-between items-center bg-white px-6 py-4 border-slate-200 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="md:hidden hover:bg-slate-100 p-2 rounded-lg"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h3 className="font-bold text-slate-900">
                  {getConversationName(selectedConversation)}
                </h3>
                <p className="text-slate-500 text-sm">Actif maintenant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="hover:bg-slate-100 p-2 rounded-lg">
                <FaEllipsisV className="text-slate-600" />
              </button>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 space-y-4 bg-gradient-to-b from-white to-slate-50 p-6 overflow-y-auto">
            {conversationMessages.map((message) => {
              const isClientMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isClientMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      isClientMessage
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-slate-200 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isClientMessage ? 'text-primary-200' : 'text-slate-600'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input */}
          <div className="flex gap-3 bg-white px-6 py-4 border-slate-200 border-t">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Écrivez un message..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !messageText.trim()}
              className="flex items-center gap-2 bg-gradient-fluid disabled:opacity-50 hover:shadow-lg px-6 py-3 rounded-lg font-semibold text-white transition disabled:cursor-not-allowed"
            >
              <FaPaperPlane /> {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 justify-center items-center text-slate-500">
          <p>Sélectionnez une conversation</p>
        </div>
      )}
    </div>
  );
}
