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
  location: 'Côte d\'Azur',
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
  const { getPropertyById, loadProperties, properties, loading: propertiesLoading } = usePropertyStore();
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

  const handleReserve = (reservation: Partial<Reservation>) => {
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

    // Créer la réservation
    const newReservation: Reservation = {
      id: Math.random().toString(),
      propertyId: property.id,
      property,
      clientId: user.id,
      client: user,
      checkIn: reservation.checkIn || new Date(),
      checkOut: reservation.checkOut || new Date(),
      guests: reservation.guests || 1,
      totalPrice: reservation.totalPrice || 0,
      depositAmount: reservation.depositAmount || 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_reservations');
      const allReservations = stored ? JSON.parse(stored) : [];
      allReservations.push(newReservation);
      localStorage.setItem(
        'habitatsconnect_reservations',
        JSON.stringify(allReservations)
      );
    }

    alert('Réservation créée avec succès! Le propriétaire doit la confirmer.');
    router.push('/dashboard/client/reservations');
  };

  const handleContact = () => {
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
      (c) =>
        c.clientId === user.id &&
        c.ownerId === property.ownerId
    );

    if (!existingConversation) {
      // Créer une nouvelle conversation
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

      addConversation(newConversation);

      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('habitatsconnect_conversations');
        const allConversations = stored ? JSON.parse(stored) : [];
        allConversations.push(newConversation);
        localStorage.setItem(
          'habitatsconnect_conversations',
          JSON.stringify(allConversations)
        );
      }

      existingConversation = newConversation;
    }

    // Rediriger vers le chat
    router.push('/dashboard/client/chat');
  };

  if (loading) {
    return <Loading />;
  }

  if (!property) {
    return <div className="text-center py-12">Propriété non trouvée</div>;
  }

  // Filtrer les réservations de la propriété courante
  const propertyReservations = reservations.filter(
    (r) => r.propertyId === property.id
  );

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
