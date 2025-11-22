'use client';

import { useState, useEffect } from 'react';
import {
  FaPaperPlane,
  FaArrowLeft,
  FaSearch,
  FaPhone,
  FaVideo,
  FaEllipsisV,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, useMessageStore } from '@/store';
import type { Message, Conversation } from '@/types';

export default function ClientChatPage() {
  const { user } = useAuthStore();
  const { conversations, messages, addMessage, loadConversations, loadMessages } =
    useMessageStore();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
    loadMessages();
  }, []);

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

  const selectedConversation = clientConversations.find(
    (c) => c.id === selectedConversationId
  );

  const conversationMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : [];

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

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversationId) {
      const newMessage: Message = {
        id: Math.random().toString(),
        conversationId: selectedConversationId,
        sender: 'client',
        senderName: user?.firstName || 'Client',
        senderIds: user?.id || '',
        content: messageText,
        timestamp: new Date(),
      };

      addMessage(selectedConversationId, newMessage);
      setMessageText('');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-600">
          Veuillez vous connecter pour accéder au chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Conversations List */}
      <div
        className={`${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 flex-col bg-white border-r border-slate-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
                className={`w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition text-left ${
                  selectedConversationId === conversation.id
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-900">
                    {getConversationName(conversation)}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {new Date(conversation.lastMessageTime).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {conversation.lastMessage}
                </p>
                {conversation.unread && (
                  <div className="mt-2 w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>Aucune conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedConversation ? (
        <div className="hidden md:flex flex-1 flex-col">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h3 className="font-bold text-slate-900">
                  {getConversationName(selectedConversation)}
                </h3>
                <p className="text-sm text-slate-500">Actif maintenant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <FaPhone className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <FaVideo className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <FaEllipsisV className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'client' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'client'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-200 text-slate-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-2">
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
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
          <p className="text-lg text-slate-500">
            Sélectionnez une conversation pour commencer
          </p>
        </div>
      )}
    </div>
  );
}
