'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyDetail, Loading } from '@/components';
import { usePropertyStore, useAuthStore, useMessageStore, useReservationStore } from '@/store';
import type { Property, Reservation, Conversation, Message } from '@/types';

const mockProperty: Property = {
  id: '1',
  title: 'Villa Luxe en Bord de Mer',
  description:
    'Magnifique villa avec piscine et vue panoramique sur la mer Méditerranée. Cette propriété offre un confort suprême avec des équipements modernes et un design élégant.',
  type: 'villa',
  price: 250,
  location: "Côte d'Azur",
  address: '123 Rue de la Plage',
  bedrooms: 4,
  bathrooms: 3,
  area: 320,
  amenities: ['WiFi', 'Parking', 'Piscine', 'Cuisine', 'Jardin', 'Climatisation'],
  images: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
      alt: 'Villa entrance',
      order: 1,
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=1200&q=80',
      alt: 'Pool view',
      order: 2,
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
      alt: 'Living room',
      order: 3,
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80',
      alt: 'Bedroom',
      order: 4,
    },
  ],
  owner: {
    id: '1',
    email: 'owner1@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'owner',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ownerId: '1',
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function PropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const {
    getPropertyById,
    loadProperties,
    properties,
    loading: propertiesLoading,
  } = usePropertyStore();
  const { user } = useAuthStore();
  const { addConversation, loadConversations, conversations } = useMessageStore();
  const { reservations, loadReservations, addReservation } = useReservationStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les propriétés et les réservations depuis le store
    const fetchData = async () => {
      setLoading(true);
      await loadProperties();
      await loadReservations();
      loadConversations();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Une fois les propriétés chargées, chercher celle correspondant à l'ID
    if (!propertiesLoading && properties.length > 0) {
      const foundProperty = getPropertyById(params.id);
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        // Si la propriété n'est pas trouvée, utiliser mock seulement en dernier recours
        console.warn(`Property with ID ${params.id} not found`);
        setProperty(mockProperty);
      }
    }
  }, [params.id, getPropertyById, properties, propertiesLoading]);

  const handleReserve = async (reservation: Partial<Reservation>) => {
    if (!user) {
      alert('Veuillez vous connecter pour réserver');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'client') {
      alert('Seuls les clients peuvent faire des réservations');
      return;
    }

    if (!property) return;

    if (user.id === property.ownerId) {
      alert('Vous ne pouvez pas réserver votre propre annonce');
      return;
    }

    try {
      // Créer la réservation via l'API
      console.log('Creating reservation with data:', {
        propertyId: property.id,
        clientId: user.id,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests || 1,
        totalPrice: reservation.totalPrice || 0,
        depositAmount: reservation.depositAmount || 0,
        status: 'pending',
      });

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          clientId: user.id,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          guests: reservation.guests || 1,
          totalPrice: reservation.totalPrice || 0,
          depositAmount: reservation.depositAmount || 0,
          status: 'pending',
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const data = await response.json();
      console.log('Reservation created:', data);

      // Ajouter la réservation au store
      addReservation(data.reservation);

      alert('Réservation créée avec succès! Le propriétaire doit la confirmer.');
      router.push('/dashboard/client/reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert(
        `Erreur lors de la création de la réservation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleContact = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour contacter le propriétaire');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'client') {
      alert('Seuls les clients peuvent contacter les propriétaires');
      return;
    }

    if (!property) return;

    if (user.id === property.ownerId) {
      alert('Vous ne pouvez pas vous contacter vous-même');
      return;
    }

    // Vérifier si une conversation existe déjà
    let existingConversation = conversations.find(
      (c) => c.clientId === user.id && c.ownerId === property.ownerId
    );

    if (!existingConversation) {
      // Créer une nouvelle conversation via l'API
      try {
        console.log('Creating conversation via API...');
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: user.id,
            ownerId: property.ownerId,
            lastMessage: 'Conversation commencée',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          existingConversation = data.conversation;
          console.log('Conversation created:', existingConversation);
          // Ajouter à l'état local
          addConversation(existingConversation);
        } else {
          throw new Error('Failed to create conversation');
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        // Fallback: créer localement seulement
        const newConversation: Conversation = {
          id: Math.random().toString(),
          ownerId: property.ownerId,
          clientId: user.id,
          clientName: `${user.firstName} ${user.lastName}`,
          ownerName: `${property.owner?.firstName} ${property.owner?.lastName}`,
          lastMessage: 'Conversation commencée',
          lastMessageTime: new Date(),
          unread: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        existingConversation = newConversation;
        addConversation(newConversation);
        console.log('Created local conversation as fallback:', existingConversation);
      }
    }

    // Créer un message par défaut en français
    const defaultMessageText = `Bonjour, je suis intéressé par l'annonce "${property.title}". Je souhaite prendre des informations supplémentaires et organiser une visite. Pouvez-vous me contacter ?`;

    // Envoyer le message via l'API pour qu'il soit persisté
    const { sendMessage } = useMessageStore.getState();
    try {
      const sentMessage = await sendMessage(existingConversation.id, user.id, defaultMessageText);
      if (sentMessage) {
        // Message envoyé avec succès, mettre à jour la conversation
        const { updateConversation } = useMessageStore.getState();
        updateConversation(existingConversation.id, {
          lastMessage: defaultMessageText,
          lastMessageTime: sentMessage.timestamp,
          unread: true,
        });
      }
    } catch (error) {
      console.error('Error sending default message:', error);
      // Fallback: ajouter le message localement si l'API échoue
      const defaultMessage: Message = {
        id: Math.random().toString(),
        conversationId: existingConversation.id,
        senderId: user.id,
        text: defaultMessageText,
        timestamp: new Date(),
        read: false,
      };

      const { addMessage, updateConversation } = useMessageStore.getState();
      addMessage(existingConversation.id, defaultMessage);
      updateConversation(existingConversation.id, {
        lastMessage: defaultMessageText,
        lastMessageTime: defaultMessage.timestamp,
        unread: true,
      });

      // Sauvegarder le message dans localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('habitatsconnect_messages');
        const allMessages = stored ? JSON.parse(stored) : {};
        if (!allMessages[existingConversation.id]) {
          allMessages[existingConversation.id] = [];
        }
        allMessages[existingConversation.id].push(defaultMessage);
        localStorage.setItem('habitatsconnect_messages', JSON.stringify(allMessages));
      }
    }

    // Rediriger vers le chat avec la conversation sélectionnée
    router.push(`/dashboard/client/chat?conversation=${existingConversation.id}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (!property) {
    return <div className="py-12 text-center">Propriété non trouvée</div>;
  }

  // Filtrer les réservations de la propriété courante
  const propertyReservations = reservations.filter((r) => r.propertyId === property.id);

  return (
    <PropertyDetail
      property={property}
      onReserve={handleReserve}
      onContact={handleContact}
      isOwner={user?.id === property.ownerId}
      currentUserId={user?.id}
      reservations={propertyReservations}
    />
  );
}
