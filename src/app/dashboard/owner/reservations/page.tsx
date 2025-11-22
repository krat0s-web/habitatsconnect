'use client';

import { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHourglass,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, useTransactionStore } from '@/store';
import type { Reservation, Transaction } from '@/types';

export default function OwnerReservationsPage() {
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending');

  useEffect(() => {
    // Charger les réservations des propriétés du propriétaire
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem('habitatsconnect_reservations');
      if (stored) {
        try {
          const allReservations = JSON.parse(stored);
          const propertiesStored = localStorage.getItem('habitatsconnect_properties');
          const properties = propertiesStored ? JSON.parse(propertiesStored) : [];

          // Filtrer les propriétés du propriétaire
          const ownerPropertyIds = properties
            .filter((p: any) => p.ownerId === user.id)
            .map((p: any) => p.id);

          // Filtrer les réservations pour ces propriétés
          const ownerReservations = allReservations.filter((r: any) =>
            ownerPropertyIds.includes(r.propertyId)
          );

          setReservations(ownerReservations);
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

  const handleConfirm = (id: string) => {
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, status: 'confirmed' as const } : r
    );
    setReservations(updated);

    // Mettre à jour localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_reservations');
      if (stored) {
        const allReservations = JSON.parse(stored);
        const updatedAll = allReservations.map((r: any) =>
          r.id === id ? { ...r, status: 'confirmed' } : r
        );
        localStorage.setItem('habitatsconnect_reservations', JSON.stringify(updatedAll));
      }
    }

    // Créer les transactions pour le paiement
    const reservation = reservations.find((r) => r.id === id);
    if (reservation && user) {
      // Transaction 1: Dépôt de garantie (reçu immédiatement)
      const depositTransaction: Transaction = {
        id: Math.random().toString(),
        ownerId: user.id,
        type: 'income',
        description: `Dépôt de garantie - ${reservation.property?.title}`,
        amount: reservation.depositAmount,
        status: 'completed',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addTransaction(depositTransaction);

      // Transaction 2: Reste du paiement (après le checkout)
      const remainingAmount = reservation.totalPrice - reservation.depositAmount;
      if (remainingAmount > 0) {
        const balanceTransaction: Transaction = {
          id: Math.random().toString(),
          ownerId: user.id,
          type: 'income',
          description: `Solde - ${reservation.property?.title} (après séjour)`,
          amount: remainingAmount,
          status: 'pending', // En attente jusqu'à la fin du séjour
          date: new Date(reservation.checkOut), // Date du checkout
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addTransaction(balanceTransaction);
      }
    }
  };

  const handleReject = (id: string) => {
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    );
    setReservations(updated);

    // Mettre à jour localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_reservations');
      if (stored) {
        const allReservations = JSON.parse(stored);
        const updatedAll = allReservations.map((r: any) =>
          r.id === id ? { ...r, status: 'cancelled' } : r
        );
        localStorage.setItem('habitatsconnect_reservations', JSON.stringify(updatedAll));
      }
    }
  };

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
        <h2 className="text-2xl font-bold text-slate-900">Gestion des Réservations</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-slate-600 font-semibold">En attente</p>
          <p className="text-3xl font-bold text-yellow-600">
            {reservations.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-slate-600 font-semibold">Confirmées</p>
          <p className="text-3xl font-bold text-green-600">
            {reservations.filter((r) => r.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-slate-600 font-semibold">Complétées</p>
          <p className="text-3xl font-bold text-blue-600">
            {reservations.filter((r) => r.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
          <p className="text-sm text-slate-600 font-semibold">Annulées</p>
          <p className="text-3xl font-bold text-red-600">
            {reservations.filter((r) => r.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {(['pending', 'confirmed', 'completed', 'all'] as const).map((filterType) => (
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
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-primary-500 hover:shadow-lg transition"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Property & Dates */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {reservation.property?.title || 'Propriété'}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <FaMapMarkerAlt className="text-primary-500" />
                    {reservation.property?.location || 'Non spécifiée'}
                  </div>

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

                {/* Client Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">Client</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <FaUser className="text-primary-500" />
                      <span className="font-semibold">
                        {reservation.client?.firstName} {reservation.client?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <FaEnvelope className="text-slate-400" />
                      {reservation.client?.email}
                    </div>
                    {reservation.client?.phone && (
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <FaPhone className="text-slate-400" />
                        {reservation.client.phone}
                      </div>
                    )}
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

                {/* Status & Actions */}
                <div className="flex flex-col justify-between">
                  <div className="mb-4">{getStatusBadge(reservation.status)}</div>

                  {reservation.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleConfirm(reservation.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                      >
                        <FaCheck /> Confirmer
                      </button>
                      <button
                        onClick={() => handleReject(reservation.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                      >
                        <FaTimes /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaCalendarAlt className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">Aucune réservation</p>
          <p className="text-slate-500">
            {filter === 'pending'
              ? 'Vous n\'avez pas de réservation en attente'
              : 'Aucune réservation avec ce statut'}
          </p>
        </div>
      )}
    </div>
  );
}
