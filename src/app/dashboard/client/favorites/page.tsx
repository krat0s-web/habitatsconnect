'use client';

import { useState, useEffect } from 'react';
import {
  FaHeart,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRuler,
  FaStar,
  FaHome,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import type { Property } from '@/types';

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    // Charger les annonces favoris depuis localStorage
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem(`habitatsconnect_favorites_${user.id}`);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (error) {
          console.error('Erreur lors du chargement des favoris:', error);
        }
      }
    }
  }, [user]);

  const handleRemoveFavorite = (propertyId: string) => {
    const updated = favorites.filter((p) => p.id !== propertyId);
    setFavorites(updated);

    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(
        `habitatsconnect_favorites_${user.id}`,
        JSON.stringify(updated)
      );
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-600">
          Veuillez vous connecter pour voir vos favoris
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Annonces Favoris</h2>
        <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold">
          {favorites.length} favoris
        </span>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
          >
            {/* Image */}
            <div className="relative h-48 bg-slate-200 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition"
                style={{
                  backgroundImage: `url(${
                    property.images && property.images.length > 0
                      ? property.images[0].url
                      : 'https://via.placeholder.com/500x300?text=No+Image'
                  })`,
                }}
              />
              <button
                onClick={() => handleRemoveFavorite(property.id)}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
              >
                <FaHeart size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {property.title}
              </h3>

              <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                <FaMapMarkerAlt className="text-primary-500" />
                {property.location}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-200 text-center text-sm">
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-600">
                    <FaBed /> {property.bedrooms}
                  </div>
                  <div className="text-xs text-slate-500">Chambres</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-600">
                    <FaBath /> {property.bathrooms}
                  </div>
                  <div className="text-xs text-slate-500">Salle(s)</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    <FaStar /> 0
                  </div>
                  <div className="text-xs text-slate-500">(0)</div>
                </div>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-primary-600 mb-4">
                ${property.price}<span className="text-sm text-slate-600">/nuit</span>
              </div>

              {/* Actions */}
              <Link
                href={`/properties/${property.id}`}
                className="block w-full text-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition font-semibold text-sm"
              >
                Voir l'annonce
              </Link>
            </div>
          </div>
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaHome className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">Aucun favoris</p>
          <p className="text-slate-500 mb-6">Vous n'avez pas encore ajouté d'annonce aux favoris</p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-fluid text-white rounded-lg hover:shadow-lg transition"
          >
            Découvrir les propriétés
          </Link>
        </div>
      )}
    </div>
  );
}
