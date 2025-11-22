'use client';

import { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaHourglass,
  FaTimes,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, useReservationStore } from '@/store';
import type { Reservation } from '@/types';

export default function ClientReservationsPage() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    // Charger les réservations du client
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem('habitatsconnect_reservations');
      if (stored) {
        try {
          const allReservations = JSON.parse(stored);
          const clientReservations = allReservations.filter(
            (r: any) => r.clientId === user.id
          );
          setReservations(clientReservations);
        } catch (error) {
          console.error('Erreur lors du chargement des réservations:', error);
        }
      }
    }
  }, [user]);

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <FaCheck /> Confirmée
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            <FaHourglass /> En attente
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            <FaTimes /> Annulée
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <FaCheck /> Complétée
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-600">
          Veuillez vous connecter pour voir vos réservations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Mes Réservations</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {filterType === 'all' && 'Toutes'}
            {filterType === 'pending' && 'En attente'}
            {filterType === 'confirmed' && 'Confirmées'}
            {filterType === 'completed' && 'Complétées'}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500 hover:shadow-lg transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Property Info */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {reservation.property?.title || 'Propriété'}
                </h3>
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <FaMapMarkerAlt className="text-primary-500" />
                  {reservation.property?.location || 'Non spécifiée'}
                </div>

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaCalendarAlt className="text-primary-500" />
                    <span>
                      {new Date(reservation.checkIn).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(reservation.checkOut).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {Math.ceil(
                      (new Date(reservation.checkOut).getTime() -
                        new Date(reservation.checkIn).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    nuits · {reservation.guests} voyageur(s)
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Total</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  ${reservation.totalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-slate-600">
                  Dépôt: ${reservation.depositAmount.toFixed(2)}
                </p>
              </div>

              {/* Status */}
              <div>
                <div className="mb-4">{getStatusBadge(reservation.status)}</div>
                <Link
                  href={`/properties/${reservation.propertyId}`}
                  className="block w-full px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition font-semibold text-center text-sm"
                >
                  Voir l'annonce
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaCalendarAlt className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">Aucune réservation</p>
          <p className="text-slate-500 mb-6">Vous n'avez pas encore de réservations</p>
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
