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
import { useAuthStore, useReservationStore, useTransactionStore, usePropertyStore } from '@/store';
import type { Reservation, Transaction } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';
export default function OwnerReservationsPage() {
  const { user } = useAuthStore();
  const {
    reservations,
    confirmReservation,
    updateReservation,
    subscribeToReservations,
    unsubscribeFromReservations,
  } = useReservationStore();
  const { addTransaction } = useTransactionStore();
  const { properties } = usePropertyStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'completed'>(
    'pending'
  );
  const [loading, setLoading] = useState(false);

  // Filter reservations for properties owned by this user
  const ownerReservations = reservations.filter((r) => r.property?.ownerId === user?.id);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to all reservations (we'll filter client-side by property owner)
      subscribeToReservations();
    }

    return () => {
      unsubscribeFromReservations();
    };
  }, [user?.id, subscribeToReservations, unsubscribeFromReservations]);
  const filteredReservations = ownerReservations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });
  const handleConfirm = async (id: string) => {
    setLoading(true);
    try {
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation || !user?.id) {
        throw new Error('Réservation ou utilisateur introuvable');
      }

      // Vérifier si une transaction existe déjà pour cette réservation
      const { transactions } = useTransactionStore.getState();
      const existingTransaction = transactions.find(
        (t) => t.reservationId === reservation.id && t.type === 'income'
      );

      // Confirmer la réservation
      await confirmReservation(id);
      console.log('Réservation confirmée avec succès:', id);

      // Créer une transaction seulement si elle n'existe pas
      if (!existingTransaction) {
        const transaction: Transaction = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ownerId: user.id,
          propertyId: reservation.propertyId,
          reservationId: reservation.id,
          amount: reservation.totalPrice,
          type: 'income',
          status: 'completed',
          description: `Réservation confirmée - ${reservation.property?.title || 'Propriété'}`,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await addTransaction(transaction);
        console.log('Transaction créée:', transaction);
      } else {
        console.log('Transaction déjà existante pour cette réservation');
      }
      
      // Message de succès
      alert('Réservation confirmée avec succès !');
    } catch (error) {
      console.error('Error confirming reservation:', error);
      alert(`Erreur lors de la confirmation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      await updateReservation(id, { status: 'rejected' });
      alert('Réservation rejetée');
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      alert(`Erreur lors du rejet: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  const handleReleaseDeposit = async (reservation: Reservation) => {
    if (!user?.id) return;

    const confirmRelease = window.confirm(
      `Êtes-vous sûr de vouloir libérer le dépôt de ${PRICE_SYMBOL}${reservation.depositAmount.toFixed(2)} pour cette réservation ? Cette action est irréversible.`
    );

    if (!confirmRelease) return;

    setLoading(true);
    try {
      // Créer une transaction de dépense pour la libération du dépôt
      const transaction: Transaction = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ownerId: user.id,
        propertyId: reservation.propertyId,
        reservationId: reservation.id,
        amount: reservation.depositAmount,
        type: 'expense',
        status: 'completed',
        description: `Libération dépôt - ${reservation.property?.title || 'Propriété'}`,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addTransaction(transaction);
      console.log('Dépôt libéré:', transaction);

      alert('Dépôt libéré avec succès ! Le client recevra son argent.');
    } catch (error) {
      console.error('Error releasing deposit:', error);
      alert(`Erreur lors de la libération du dépôt: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };
  const handleCompleteReservation = async (id: string) => {
    setLoading(true);
    try {
      await updateReservation(id, { status: 'completed' });
      alert('Réservation marquée comme complétée');
    } catch (error) {
      console.error('Error completing reservation:', error);
      alert(`Erreur lors de la completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full font-semibold text-green-700 text-sm">
            <FaCheck /> Confirmée
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full font-semibold text-yellow-700 text-sm">
            <FaHourglass /> En attente
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full font-semibold text-red-700 text-sm">
            <FaTimes /> Rejetée
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full font-semibold text-blue-700 text-sm">
            <FaCheck /> Complétée
          </span>
        );
      default:
        return null;
    }
  };
  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 text-lg">Veuillez vous connecter pour voir vos réservations</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-900 text-2xl">Gestion des Réservations</h2>
      </div>
      {/* Stats */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
        <div className="bg-white shadow-md p-4 border-yellow-500 border-l-4 rounded-xl">
          <p className="font-semibold text-slate-600 text-sm">En attente</p>
          <p className="font-bold text-yellow-600 text-3xl">
            {ownerReservations.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white shadow-md p-4 border-green-500 border-l-4 rounded-xl">
          <p className="font-semibold text-slate-600 text-sm">Confirmées</p>
          <p className="font-bold text-green-600 text-3xl">
            {ownerReservations.filter((r) => r.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white shadow-md p-4 border-red-500 border-l-4 rounded-xl">
          <p className="font-semibold text-slate-600 text-sm">Rejetées</p>
          <p className="font-bold text-red-600 text-3xl">
            {ownerReservations.filter((r) => r.status === 'rejected').length}
          </p>
        </div>
        <div className="bg-white shadow-md p-4 border-blue-500 border-l-4 rounded-xl">
          <p className="font-semibold text-slate-600 text-sm">Complétées</p>
          <p className="font-bold text-blue-600 text-3xl">
            {ownerReservations.filter((r) => r.status === 'completed').length}
          </p>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {(['pending', 'confirmed', 'rejected', 'completed', 'all'] as const).map((filterType) => (
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
            {filterType === 'rejected' && 'Rejetées'}
            {filterType === 'completed' && 'Complétées'}
          </button>
        ))}
      </div>
      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white shadow-md hover:shadow-lg border-primary-500 border-l-4 rounded-xl overflow-hidden transition"
          >
            <div className="p-6">
              <div className="gap-6 grid grid-cols-1 md:grid-cols-5">
                {/* Property & Dates */}
                <div className="md:col-span-2">
                  <h3 className="mb-2 font-bold text-slate-900 text-lg">
                    {reservation.property?.title || 'Propriété'}
                  </h3>
                  <div className="flex items-center gap-2 mb-3 text-slate-600">
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
                  <h4 className="mb-2 font-semibold text-slate-600 text-sm">Client</h4>
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
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="mb-2 text-slate-600 text-sm">Total</p>
                  <p className="mb-2 font-bold text-slate-900 text-2xl">
                    {PRICE_SYMBOL}
                    {reservation.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-slate-600 text-xs">
                    Dépôt: {PRICE_SYMBOL}
                    {reservation.depositAmount.toFixed(2)}
                  </p>
                </div>
                {/* Status & Actions */}
                <div className="flex flex-col justify-between">
                  <div className="mb-4">{getStatusBadge(reservation.status)}</div>
                  {reservation.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleConfirm(reservation.id)}
                        disabled={loading}
                        className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 px-3 py-2 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                      >
                        <FaCheck /> {loading ? 'Traitement...' : 'Confirmer'}
                      </button>
                      <button
                        onClick={() => handleReject(reservation.id)}
                        disabled={loading}
                        className="flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-2 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                      >
                        <FaTimes /> {loading ? 'Traitement...' : 'Refuser'}
                      </button>
                    </div>
                  )}
                  {reservation.status === 'confirmed' && new Date(reservation.checkOut) < new Date() && (
                    <button
                      onClick={() => handleCompleteReservation(reservation.id)}
                      disabled={loading}
                      className="flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-3 py-2 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                    >
                      <FaCheck /> {loading ? 'Traitement...' : 'Marquer Complétée'}
                    </button>
                  )}
                  {reservation.status === 'completed' && reservation.depositAmount > 0 && (
                    <button
                      onClick={() => handleReleaseDeposit(reservation)}
                      disabled={loading}
                      className="flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-3 py-2 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                    >
                      <FaCheck /> {loading ? 'Traitement...' : 'Libérer Dépôt'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredReservations.length === 0 && (
        <div className="bg-white py-12 rounded-xl text-center">
          <FaCalendarAlt className="mx-auto mb-4 text-slate-300 text-6xl" />
          <p className="font-semibold text-slate-600 text-xl">Aucune réservation</p>
          <p className="text-slate-500">
            {filter === 'pending'
              ? "Vous n'avez pas de réservation en attente"
              : 'Aucune réservation avec ce statut'}
          </p>
        </div>
      )}
    </div>
  );
}
}
