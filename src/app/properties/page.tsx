'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import { PropertyCard } from '@/components';
import { usePropertyStore } from '@/store/propertyStore';
import type { Property } from '@/types';

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Villa Luxe en Bord de Mer',
    description: 'Magnifique villa avec piscine et vue sur la mer',
    type: 'villa',
    price: 250,
    location: 'Côte d\'Azur',
    address: '123 Rue de la Plage',
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    amenities: ['WiFi', 'Parking', 'Piscine', 'Cuisine'],
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        alt: 'Villa entrance',
        order: 1,
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
  },
];

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, loadProperties } = usePropertyStore();
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Charger les propriétés depuis le store
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    // Utiliser les propriétés du store ou les mock si le store est vide
    const propertiesToDisplay = properties.length > 0 ? properties : mockProperties;
    setDisplayedProperties(propertiesToDisplay);
  }, [properties]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Explorez nos propriétés
            </h1>
            <p className="text-lg text-slate-600">
              Trouvez votre logement idéal parmi nos {displayedProperties.length}{' '}
              annonces
            </p>
          </div>
          <button
            onClick={() => router.push('/properties/filters')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-fluid text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition"
          >
            <FaFilter /> Filtrer
          </button>
        </div>

        {/* Properties Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Empty State */}
          {displayedProperties.length === 0 && (
            <div className="text-center py-16">
              <FaSearch className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Aucune propriété trouvée
              </h3>
              <p className="text-slate-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
