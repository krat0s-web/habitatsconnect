'use client';

import { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRuler,
  FaStar,
  FaHeart,
  FaRegHeart,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavorite,
  isFavorited = false,
}) => {
  const [showFull, setShowFull] = useState(false);
  const [isFav, setIsFav] = useState(isFavorited);
  const { user } = useAuthStore();

  // Charger l'état des favoris depuis localStorage au montage
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`habitatsconnect_favorites_${user.id}`);
      if (stored) {
        try {
          const favorites = JSON.parse(stored);
          setIsFav(favorites.some((p: any) => p.id === property.id));
        } catch {
          setIsFav(false);
        }
      }
    }
  }, [user, property.id]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    if (typeof window !== 'undefined') {
      const storageName = `habitatsconnect_favorites_${user.id}`;
      const stored = localStorage.getItem(storageName);
      const favorites = stored ? JSON.parse(stored) : [];
      
      let updated;
      if (isFav) {
        // Retirer des favoris
        updated = favorites.filter((p: any) => p.id !== property.id);
      } else {
        // Ajouter aux favoris
        updated = [...favorites, property];
      }
      
      localStorage.setItem(storageName, JSON.stringify(updated));
      setIsFav(!isFav);
    }
    
    onFavorite?.(property.id);
  };

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      villa: 'bg-purple-100 text-purple-700',
      apartment: 'bg-blue-100 text-blue-700',
      garage: 'bg-gray-100 text-gray-700',
      studio: 'bg-pink-100 text-pink-700',
    };
    return colors[type] || colors.apartment;
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group cursor-pointer h-full rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-slate-200">
          <img
            src={
              typeof property.images === 'string'
                ? property.images
                : Array.isArray(property.images)
                ? typeof property.images[0] === 'string'
                  ? property.images[0]
                  : property.images[0]?.url || '/placeholder-image.jpg'
                : '/placeholder-image.jpg'
            }
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Non+Disponible';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Type Badge */}
          <div className={`absolute top-4 left-4 px-4 py-2 rounded-full font-semibold text-sm ${getPropertyTypeColor(property.type)} backdrop-blur-sm`}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all"
          >
            {isFav ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 text-xl hover:text-red-500" />
            )}
          </button>

          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 bg-gradient-fluid text-white px-4 py-2 rounded-full font-bold shadow-lg">
            ${property.price}/nuit
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Location */}
          <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
            <FaMapMarkerAlt className="text-primary-600 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
            {property.title}
          </h3>

          {/* Description Preview */}
          <p className="text-slate-600 text-sm line-clamp-2 mb-4">
            {property.description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-center">
              <FaBed className="text-primary-600 flex-shrink-0" />
              <span className="text-sm font-semibold">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <FaBath className="text-secondary-600 flex-shrink-0" />
              <span className="text-sm font-semibold">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <FaRuler className="text-accent-500 flex-shrink-0" />
              <span className="text-sm font-semibold">{property.area} m²</span>
            </div>
          </div>

          {/* Rating & Owner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className="text-sm font-semibold">4.8</span>
              <span className="text-xs text-slate-500">(128 avis)</span>
            </div>
            <span className="text-xs text-slate-500">
              Par {property.owner?.firstName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
