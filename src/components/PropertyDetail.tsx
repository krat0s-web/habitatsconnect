'use client';
import { useState, useEffect } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRuler,
  FaWifi,
  FaParking,
  FaUtensils,
  FaSwimmingPool,
  FaAirbnb,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaComment,
  FaPlay,
  FaPause,
  FaIdCard,
} from 'react-icons/fa';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Calendar from './Calendar';
import type { Property, Reservation } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';
import Link from 'next/link';
interface PropertyDetailProps {
  property: Property;
  onReserve?: (reservation: Partial<Reservation>) => void;
  onContact?: () => void;
  isOwner?: boolean;
  currentUserId?: string;
  reservations?: Reservation[];
}
export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  onReserve,
  onContact,
  isOwner = false,
  currentUserId,
  reservations = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

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
  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && property.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, property.images.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < property.images.length - 1) {
      nextImage();
    }
    if (isRightSwipe && currentImageIndex > 0) {
      prevImage();
    }
  };
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };
  const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <FaWifi />,
    parking: <FaParking />,
    kitchen: <FaUtensils />,
    pool: <FaSwimmingPool />,
  };
  const handleReserve = () => {
    if (checkInDate && checkOutDate && onReserve) {
      const nights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = property.price * nights * guests;
      const depositAmount = totalPrice * 0.3; // 30% de dépôt de garantie
      onReserve({
        checkIn: new Date(checkInDate),
        checkOut: new Date(checkOutDate),
        guests,
        totalPrice,
        depositAmount,
      });
    }
  };
  const handleDateRangeSelect = (checkIn: Date, checkOut: Date) => {
    setCheckInDate(checkIn.toISOString().split('T')[0]);
    setCheckOutDate(checkOut.toISOString().split('T')[0]);
  };
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Gallery */}
      <div className="gap-4 grid grid-cols-1 lg:grid-cols-3 shadow-xl mb-8 rounded-3xl overflow-hidden">
        {/* Main Image */}
        <div className="group relative lg:col-span-2 h-96 lg:h-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={property.images[currentImageIndex]?.url || '/placeholder.jpg'}
              alt={property.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </AnimatePresence>

          {/* Navigation Buttons */}
          {property.images.length > 1 && (
            <>
              <motion.button
                onClick={prevImage}
                className="top-1/2 left-4 absolute bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 shadow-lg p-3 rounded-full transition-opacity -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FaChevronLeft />
              </motion.button>
              <motion.button
                onClick={nextImage}
                className="top-1/2 right-4 absolute bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 shadow-lg p-3 rounded-full transition-opacity -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FaChevronRight />
              </motion.button>
            </>
          )}

          {/* Auto-play Controls */}
          {property.images.length > 1 && (
            <motion.button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="top-4 right-4 absolute bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isAutoPlaying ? <FaPause /> : <FaPlay />}
            </motion.button>
          )}

          {/* Image Counter */}
          <motion.div
            className="right-4 bottom-4 absolute bg-black/50 px-3 py-1 rounded-full text-white text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {currentImageIndex + 1} / {property.images.length}
          </motion.div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="lg:flex lg:flex-col gap-2 grid grid-cols-2 lg:grid-cols-3">
          {property.images.slice(0, 6).map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`relative h-20 rounded-xl overflow-hidden transition-all ${
                idx === currentImageIndex ? 'ring-2 ring-primary-500' : 'hover:opacity-80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <motion.img
                src={img.url}
                alt={`Gallery ${idx}`}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
              {idx === currentImageIndex && (
                <motion.div
                  className="top-0 left-0 absolute bg-primary-500/20 w-full h-full"
                  layoutId="activeThumbnail"
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          ))}
          {property.images.length > 6 && (
            <motion.button
              className="flex justify-center items-center bg-slate-200 hover:bg-slate-300 rounded-xl h-20 font-semibold transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FaImages /> +{property.images.length - 6}
            </motion.button>
          )}
        </div>
      </div>
      <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-3 font-bold text-slate-900 text-4xl">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <FaMapMarkerAlt className="text-primary-600" />
                <span>{property.location}</span>
              </div>
              <button
                onClick={() => {
                  const reviewSection = document.getElementById('review-section');
                  reviewSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-1 hover:bg-slate-100 px-3 py-2 rounded-lg transition cursor-pointer"
              >
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-slate-600">
                  ({reviewCount} {reviewCount === 1 ? 'avis' : 'avis'})
                </span>
              </button>
              <span className="font-semibold text-primary-600">
                {PRICE_SYMBOL}
                {property.price} par nuit
              </span>
            </div>
          </div>
          {/* Features */}
          <div className="gap-4 grid grid-cols-4 bg-slate-50 mb-8 p-6 rounded-2xl">
            <div className="text-center">
              <FaBed className="mx-auto mb-2 text-primary-600 text-2xl" />
              <span className="font-bold text-2xl">{property.bedrooms}</span>
              <p className="text-slate-600 text-sm">Chambres</p>
            </div>
            <div className="text-center">
              <FaBath className="mx-auto mb-2 text-secondary-600 text-2xl" />
              <span className="font-bold text-2xl">{property.bathrooms}</span>
              <p className="text-slate-600 text-sm">SDB</p>
            </div>
            <div className="text-center">
              <FaRuler className="mx-auto mb-2 text-2xl text-accent-500" />
              <span className="font-bold text-2xl">{property.area}</span>
              <p className="text-slate-600 text-sm">m²</p>
            </div>
            <div className="text-center">
              <FaAirbnb className="mx-auto mb-2 text-primary-600 text-2xl" />
              <span className="font-bold text-sm capitalize">{property.type}</span>
              <p className="text-slate-600 text-sm">Type</p>
            </div>
          </div>
          {/* Description */}
          <div className="mb-8">
            <h2 className="mb-4 font-bold text-slate-900 text-2xl">À propos du lieu</h2>
            <p className="mb-6 text-slate-700 leading-relaxed">{property.description}</p>
          </div>
          {/* Amenities */}
          <div className="mb-8">
            <h2 className="mb-4 font-bold text-slate-900 text-2xl">Équipements</h2>
            <div className="gap-4 grid grid-cols-2 md:grid-cols-3">
              {property.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl transition"
                >
                  <span className="text-primary-600 text-xl">
                    {amenityIcons[amenity.toLowerCase()] || '✓'}
                  </span>
                  <span className="font-semibold text-slate-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Owner Info */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 mb-8 p-6 border border-primary-200 rounded-2xl">
            <div className="flex md:flex-row flex-col justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-gradient-fluid rounded-full w-16 h-16 text-white text-2xl">
                  <FaUser />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {property.owner?.firstName && property.owner?.lastName
                      ? `${property.owner.firstName} ${property.owner.lastName}`
                      : 'Propriétaire'}
                  </h3>
                </div>
              </div>
              <div className="flex md:flex-row flex-col gap-2 w-full md:w-auto">
                {!isOwner && property.ownerId && (
                  <>
                    <Link
                      href={`/owner-profile/${property.ownerId}`}
                      className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-semibold text-slate-700 transition"
                    >
                      <FaIdCard /> Voir profil
                    </Link>
                    <button
                      onClick={() => {
                        const reviewSection = document.getElementById('review-section');
                        reviewSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="flex flex-1 md:flex-none justify-center items-center gap-2 bg-yellow-50 hover:bg-yellow-100 px-4 py-2 border-yellow-300 border rounded-xl font-semibold text-yellow-700 transition"
                    >
                      <FaStar /> Laisser un avis
                    </button>
                  </>
                )}
                <button
                  onClick={onContact}
                  disabled={isOwner}
                  className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                    isOwner
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <FaComment /> {isOwner ? 'Votre annonce' : 'Contacter'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Reservation Card */}
        <div className="lg:col-span-1">
          <div className="top-24 sticky bg-white shadow-lg p-6 border border-slate-200 rounded-3xl">
            <div className="mb-2 font-bold text-slate-900 text-3xl">
              <span>
                {PRICE_SYMBOL}
                {property.price}
              </span>
              <span className="font-normal text-slate-600 text-lg">/nuit</span>
            </div>
            {/* Price Breakdown */}
            <div className="mb-6 pb-6 border-slate-200 border-b">
              <div className="space-y-2 text-sm">
                {checkInDate && checkOutDate && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        {Math.ceil(
                          (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        nuits × {PRICE_SYMBOL}
                        {property.price}
                      </span>
                      <span>
                        {PRICE_SYMBOL}
                        {(
                          property.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) *
                          guests
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Dépôt de garantie (30%)</span>
                      <span>
                        {PRICE_SYMBOL}
                        {(
                          property.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) *
                          guests *
                          0.3
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 font-bold text-slate-900">
                      <span>Total</span>
                      <span>
                        {PRICE_SYMBOL}
                        {(
                          property.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) *
                          guests *
                          1.3
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <Calendar
                propertyId={property.id}
                reservations={reservations}
                onDateRangeSelect={handleDateRangeSelect}
                minDays={1}
              />
              <div>
                <label className="block mb-2 font-semibold text-slate-700 text-sm">
                  Nombre de voyageurs
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 w-full"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'voyageur' : 'voyageurs'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleReserve}
              disabled={isOwner}
              className={`w-full py-3 font-bold rounded-xl transition mb-4 ${
                isOwner
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-fluid text-white hover:shadow-lg hover:shadow-primary-500/50'
              }`}
            >
              {isOwner ? 'Votre annonce (non réservable)' : 'Réserver maintenant'}
            </button>
            <p className="text-slate-600 text-sm text-center">
              Vous ne serez facturé du dépôt que si l'hôte accepte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
