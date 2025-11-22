'use client';

import { useState } from 'react';
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
} from 'react-icons/fa';
import Calendar from './Calendar';
import type { Property, Reservation } from '@/types';

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
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  const nextImage = () => {
    setCurrentImageIndex(
      (prev) => (prev + 1) % property.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
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
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 rounded-2xl overflow-hidden shadow-xl">
        {/* Main Image */}
        <div className="lg:col-span-2 relative h-96 lg:h-full group">
          <img
            src={property.images[currentImageIndex]?.url || '/placeholder.jpg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />

          {/* Navigation Buttons */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:flex lg:flex-col">
          {property.images.slice(0, 6).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                idx === currentImageIndex
                  ? 'ring-2 ring-primary-500'
                  : 'hover:opacity-80'
              }`}
            >
              <img
                src={img.url}
                alt={`Gallery ${idx}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {property.images.length > 6 && (
            <button className="flex items-center justify-center h-20 rounded-lg bg-slate-200 hover:bg-slate-300 transition font-semibold">
              <FaImages /> +{property.images.length - 6}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              {property.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-slate-600">
                <FaMapMarkerAlt className="text-primary-600" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">4.8</span>
                <span className="text-slate-600">(128 avis)</span>
              </div>
              <span className="text-primary-600 font-semibold">
                ${property.price} par nuit
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-4 gap-4 mb-8 p-6 bg-slate-50 rounded-xl">
            <div className="text-center">
              <FaBed className="text-2xl text-primary-600 mx-auto mb-2" />
              <span className="text-2xl font-bold">{property.bedrooms}</span>
              <p className="text-sm text-slate-600">Chambres</p>
            </div>
            <div className="text-center">
              <FaBath className="text-2xl text-secondary-600 mx-auto mb-2" />
              <span className="text-2xl font-bold">{property.bathrooms}</span>
              <p className="text-sm text-slate-600">SDB</p>
            </div>
            <div className="text-center">
              <FaRuler className="text-2xl text-accent-500 mx-auto mb-2" />
              <span className="text-2xl font-bold">{property.area}</span>
              <p className="text-sm text-slate-600">m²</p>
            </div>
            <div className="text-center">
              <FaAirbnb className="text-2xl text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-bold capitalize">
                {property.type}
              </span>
              <p className="text-sm text-slate-600">Type</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              À propos du lieu
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Équipements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <span className="text-xl text-primary-600">
                    {amenityIcons[amenity.toLowerCase()] || '✓'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Info */}
          <div className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl mb-8 border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-fluid flex items-center justify-center text-white text-2xl">
                  <FaUser />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {property.owner?.firstName} {property.owner?.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Propriétaire · Membre depuis 2 ans
                  </p>
                </div>
              </div>
              <button
                onClick={onContact}
                disabled={isOwner}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
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

        {/* Reservation Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              <span>${property.price}</span>
              <span className="text-lg text-slate-600 font-normal">/nuit</span>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="space-y-2 text-sm">
                {checkInDate && checkOutDate && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        {Math.ceil(
                          (new Date(checkOutDate).getTime() -
                            new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        nuits × ${property.price}
                      </span>
                      <span>
                        $
                        {(
                          property.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() -
                              new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) *
                          guests
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        Dépôt de garantie (30%)
                      </span>
                      <span>
                        $
                        {(
                          property.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() -
                              new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) *
                          guests *
                          0.3
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-2">
                      <span>Total</span>
                      <span>
                        $
                        {(
                          property.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() -
                              new Date(checkInDate).getTime()) /
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de voyageurs
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
              className={`w-full py-3 font-bold rounded-lg transition mb-4 ${
                isOwner
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-fluid text-white hover:shadow-lg hover:shadow-primary-500/50'
              }`}
            >
              {isOwner ? 'Votre annonce (non réservable)' : 'Réserver maintenant'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Vous ne serez facturé du dépôt que si l'hôte accepte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
