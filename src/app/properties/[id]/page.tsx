'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyDetail, Loading, ReviewSection } from '@/components';
import { usePropertyStore, useAuthStore, useMessageStore, useReservationStore } from '@/store';
import type { Property, Reservation, Conversation, Message } from '@/types';

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
  const { reservations, loadReservations } = useReservationStore();
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
  }, [loadConversations, loadProperties, loadReservations]);

  useEffect(() => {
    // Une fois les propriétés chargées, chercher celle correspondant à l'ID
    if (!propertiesLoading && properties.length > 0) {
      const foundProperty = getPropertyById(params.id);
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        console.warn(`Property with ID ${params.id} not found`);
        setProperty(null);
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

      // La réservation est déjà créée dans Firestore via l'API
      // Elle sera automatiquement synchronisée via le listener en temps réel
      // Pas besoin d'appeler addReservation ici

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
    const existingConversationFromFind = conversations.find(
      (c) => c.clientId === user.id && c.ownerId === property.ownerId
    );

    let existingConversation: Conversation;

    if (existingConversationFromFind) {
      existingConversation = existingConversationFromFind;
    } else {
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
          if (data.conversation) {
            existingConversation = data.conversation;
            console.log('Conversation created:', existingConversation);
            // Ajouter à l'état local
            addConversation(existingConversation);
          } else {
            throw new Error('Conversation not created');
          }
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

    // Rediriger vers le chat avec la conversation sélectionnée (SANS envoyer de message)
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
    <div>
      <PropertyDetail
        property={property}
        onReserve={handleReserve}
        onContact={handleContact}
        isOwner={user?.id === property.ownerId}
        currentUserId={user?.id}
        reservations={propertyReservations}
      />
      
      {/* Review Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl">
        <ReviewSection 
          propertyId={property.id} 
          ownerId={property.ownerId} 
        />
      </div>
    </div>
  );
}
