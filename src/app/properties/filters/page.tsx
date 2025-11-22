'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaFilter,
  FaChartLine,
  FaBed,
  FaSearch,
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

export default function PropertiesFilterPage() {
  const router = useRouter();
  const { properties, loadProperties } = usePropertyStore();
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [bedrooms, setBedrooms] = useState(0);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    const propertiesToDisplay = properties.length > 0 ? properties : mockProperties;
    let filtered = propertiesToDisplay;

    // Appliquer les filtres
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (bedrooms > 0) {
      filtered = filtered.filter((p) => p.bedrooms >= bedrooms);
    }

    setDisplayedProperties(filtered);
  }, [properties, searchTerm, selectedType, priceRange, bedrooms]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('');
    setPriceRange([0, 1000]);
    setBedrooms(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <FaArrowLeft className="text-2xl text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Filtrer les propriétés
            </h1>
            <p className="text-lg text-slate-600">
              {displayedProperties.length} propriété(s) trouvée(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FaFilter /> Filtres
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Recherche
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Lieu, titre..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type de propriété
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Tous</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Appartement</option>
                  <option value="studio">Studio</option>
                  <option value="garage">Garage</option>
                </select>
              </div>

              {/* Price */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FaChartLine className="inline mr-2" />
                  Prix par nuit: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <FaBed className="inline mr-2" />
                  Minimum de chambres
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="0">Tous</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-semibold text-slate-700"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
    </div>
  );
}
