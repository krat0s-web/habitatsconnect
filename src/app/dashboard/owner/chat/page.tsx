'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaComments, FaPaperPlane, FaEllipsisH, FaSearch } from 'react-icons/fa';
import { useAuthStore, useMessageStore } from '@/store';
import type { Conversation } from '@/types';

export default function ChatPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const {
    conversations,
    messages,
    getConversationsByOwnerId,
    sendMessage,
    updateConversation,
    subscribeToConversations,
    subscribeToMessages,
    unsubscribeFromConversations,
    unsubscribeFromMessages,
  } = useMessageStore();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time conversations
      subscribeToConversations(user.id);

      // Get initial conversations for selection logic
      const ownerConversations = getConversationsByOwnerId(user.id).reduce(
        (acc: Conversation[], current: Conversation) => {
          // Supprimer les doublons (même clientId)
          const exists = acc.find((c) => c.clientId === current.clientId);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        },
        []
      );

      if (ownerConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(ownerConversations[0].id);
        // Subscribe to messages for the first conversation
        subscribeToMessages(ownerConversations[0].id);
      }
    }

    // Cleanup on unmount
    return () => {
      unsubscribeFromConversations();
      // Unsubscribe from all message listeners
      Object.keys(messages).forEach((convId) => unsubscribeFromMessages(convId));
    };
  }, [user?.id, getConversationsByOwnerId, subscribeToConversations, unsubscribeFromConversations, unsubscribeFromMessages, messages, selectedConversation, subscribeToMessages]);

  // Handle conversation selection from URL parameter
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationParam);
      if (conversation && conversation.ownerId === user?.id) {
        setSelectedConversation(conversationParam);
        // Subscribe to real-time messages for this conversation
        subscribeToMessages(conversationParam);
        updateConversation(conversationParam, { unread: false });
      }
    }
  }, [searchParams, conversations, user?.id, updateConversation, subscribeToMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const conversationMessages = useMemo(() => selectedConversation ? messages[selectedConversation] || [] : [], [selectedConversation, messages]);
  const filteredConversations = conversations.filter((c) =>
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    // Subscribe to real-time messages for this conversation
    subscribeToMessages(id);
    updateConversation(id, { unread: false });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && user) {
      setSending(true);
      try {
        const message = await sendMessage(selectedConversation, user.id, newMessage);
        if (message) {
          setNewMessage('');
          // No need to manually update messages - the real-time listener will handle it
          updateConversation(selectedConversation, {
            lastMessage: newMessage,
            lastMessageTime: new Date(),
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert("Erreur lors de l'envoi du message");
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div className="flex bg-white shadow-md rounded-xl h-[calc(100vh-140px)] overflow-hidden">
      {/* Sidebar */}
      <div className="flex flex-col bg-slate-50 border-slate-200 border-r w-80">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => handleSelectConversation(conversation.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-200 transition ${
                  selectedConversation === conversation.id
                    ? 'bg-white border-l-4 border-l-primary-600'
                    : 'hover:bg-white'
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-2xl">{conversation.avatar || '👤'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">{conversation.clientName}</div>
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

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="flex justify-between items-center bg-white px-6 py-4 border-slate-200 border-b">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">{selectedConv.clientName}</h2>
                <p className="text-slate-600 text-sm">Actif maintenant</p>
              </div>
              <div className="flex gap-3">
                <button className="hover:bg-slate-100 p-2 rounded-full transition">
                  <FaEllipsisH className="text-slate-600 text-lg" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 bg-gradient-to-b from-white to-slate-50 p-6 overflow-y-auto">
              {conversationMessages.length > 0 ? (
                conversationMessages.map((message) => {
                  const isOwnerMessage = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnerMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg ${
                          isOwnerMessage
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-slate-200 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnerMessage ? 'text-primary-200' : 'text-slate-600'
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
                })
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-500">Aucun message</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 bg-white px-6 py-4 border-slate-200 border-t">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="flex items-center gap-2 bg-gradient-fluid disabled:opacity-50 hover:shadow-lg px-6 py-3 rounded-lg font-semibold text-white transition disabled:cursor-not-allowed"
              >
                <FaPaperPlane /> {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center text-slate-500">
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
