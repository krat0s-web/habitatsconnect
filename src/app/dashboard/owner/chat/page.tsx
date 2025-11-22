'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FaComments,
  FaPaperPlane,
  FaEllipsisH,
  FaPhone,
  FaVideo,
  FaSearch,
} from 'react-icons/fa';
import { useAuthStore, useMessageStore } from '@/store';
import type { Message, Conversation } from '@/types';

export default function ChatPage() {
  const { user } = useAuthStore();
  const {
    loadConversations,
    loadMessages,
    getConversationsByOwnerId,
    getMessagesByConversationId,
    sendMessage,
    updateConversation,
  } = useMessageStore();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadMessages();
    if (user?.id) {
      const ownerConversations = getConversationsByOwnerId(user.id)
        .reduce((acc: Conversation[], current: Conversation) => {
          // Supprimer les doublons (même clientId)
          const exists = acc.find((c) => c.clientId === current.clientId);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
      setConversations(ownerConversations);
      if (ownerConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(ownerConversations[0].id);
        setMessages(getMessagesByConversationId(ownerConversations[0].id));
      }
    }
  }, [user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    const convMessages = getMessagesByConversationId(id);
    setMessages(convMessages);
    updateConversation(id, { unread: false });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && user) {
      setSending(true);
      try {
        const message = await sendMessage(selectedConversation, user.id, newMessage);
        if (message) {
          setMessages([...messages, message]);
          setNewMessage('');
          updateConversation(selectedConversation, {
            lastMessage: newMessage,
            lastMessageTime: new Date(),
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Erreur lors de l\'envoi du message');
      } finally {
        setSending(false);
      }
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const filteredConversations = conversations.filter((c) =>
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl shadow-md overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaComments className="text-primary-600" /> Messages
          </h3>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    <div className="font-semibold text-slate-900">
                      {conversation.clientName}
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {conversation.lastMessage}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(conversation.lastMessageTime).toLocaleTimeString(
                        'fr-FR',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </div>
                  </div>
                  {conversation.unread && (
                    <div className="w-3 h-3 bg-primary-600 rounded-full mt-2"></div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500">
              Aucune conversation
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedConv.clientName}
                </h2>
                <p className="text-sm text-slate-600">Actif maintenant</p>
              </div>
              <div className="flex gap-3">
                <button className="p-2 hover:bg-slate-100 rounded-full transition">
                  <FaPhone className="text-primary-600 text-lg" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition">
                  <FaVideo className="text-primary-600 text-lg" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition">
                  <FaEllipsisH className="text-slate-600 text-lg" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
              {messages.length > 0 ? (
                messages.map((message) => {
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
                            isOwnerMessage
                              ? 'text-primary-200'
                              : 'text-slate-600'
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
                <div className="text-center py-12">
                  <p className="text-slate-500">Aucun message</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 bg-gradient-fluid text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane /> {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
