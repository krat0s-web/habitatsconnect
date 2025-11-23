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
import { useAuthStore, useFavoriteStore } from '@/store';
import type { Property } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PRICE_SYMBOL } from '@/lib/static';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavorite,
  isFavorited = false,
  index = 0,
}) => {
  const [showFull, setShowFull] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const { user } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore();
  
  const isFav = isFavorite(property.id);

  // Load average rating
  useEffect(() => {
    const loadRating = async () => {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('propertyId', '==', property.id)
        );
        
        const snapshot = await getDocs(reviewsQuery);
        const reviews = snapshot.docs.map(doc => doc.data());
        
        if (reviews.length > 0) {
          const avg = reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length;
          setAverageRating(avg);
          setReviewCount(reviews.length);
        }
      } catch (error) {
        console.error('Error loading rating:', error);
      }
    };
    
    loadRating();
  }, [property.id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(user.id, property.id);
      } else {
        await addFavorite(user.id, property);
      }
      onFavorite?.(property.id);
    } catch (error) {
      console.error('Erreur lors de la gestion du favori:', error);
      alert('Erreur lors de la gestion du favori');
    }
  };

  const getPropertyTypeVariant = (type: string): 'purple' | 'blue' | 'secondary' | 'pink' => {
    const variants: Record<string, 'purple' | 'blue' | 'secondary' | 'pink'> = {
      villa: 'purple',
      apartment: 'blue',
      garage: 'secondary',
      studio: 'pink',
    };
    return variants[type] || 'blue';
  };

  return (
    <Link href={`/properties/${property.id}`} className="block h-full">
      <Card className="group hover:shadow-2xl h-full overflow-hidden transition-all hover:-translate-y-1 duration-300 cursor-pointer transform">
        {/* Image Container */}
        <div className="relative bg-slate-200 h-64 overflow-hidden">
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
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/400x300?text=Image+Non+Disponible';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Type Badge */}
          <div className="top-4 left-4 absolute">
            <Badge variant={getPropertyTypeVariant(property.type)} className="backdrop-blur-sm">
              {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
            </Badge>
          </div>

          {/* Favorite Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleFavorite}
            className="top-4 right-4 absolute bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm rounded-full"
          >
            {isFav ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 hover:text-red-500 text-xl" />
            )}
          </Button>

          <div className="right-4 bottom-4 absolute">
            <Badge variant="default" className="bg-gradient-fluid shadow-lg px-4 py-2 text-white">
              {PRICE_SYMBOL}
              {property.price}/nuit
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          {/* Location */}
          <div className="flex items-center gap-2 mb-3 text-slate-600 text-sm">
            <FaMapMarkerAlt className="flex-shrink-0 text-primary-600" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Title */}
          <h3 className="mb-2 font-bold text-slate-900 group-hover:text-primary-600 text-lg line-clamp-2 transition">
            {property.title}
          </h3>

          {/* Description Preview */}
          <p className="mb-4 text-slate-600 text-sm line-clamp-2">{property.description}</p>

          {/* Features Grid */}
          <div className="gap-3 grid grid-cols-3 mb-4">
            <div className="flex items-center gap-2 text-center">
              <FaBed className="flex-shrink-0 text-primary-600" />
              <span className="font-semibold text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <FaBath className="flex-shrink-0 text-secondary-600" />
              <span className="font-semibold text-sm">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <FaRuler className="flex-shrink-0 text-accent-500" />
              <span className="font-semibold text-sm">{property.area} m²</span>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Rating & Owner */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold text-sm">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-slate-500 text-xs">
                ({reviewCount} avis)
              </span>
            </div>
            <span className="text-slate-500 text-xs">Par {property.owner?.firstName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
