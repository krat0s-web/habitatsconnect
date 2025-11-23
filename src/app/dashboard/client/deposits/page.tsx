'use client';

import { useState, useEffect } from 'react';
import {
  FaLock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHourglass,
  FaTimesCircle,
  FaDollarSign,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, useReservationStore } from '@/store';
import type { Reservation } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';

export default function DepositsPage() {
  const { user } = useAuthStore();
  const { reservations, loading, subscribeToReservations, unsubscribeFromReservations } =
    useReservationStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'refunded'>('all');

  // Filter reservations to get deposits
  const deposits = reservations.filter((r) => r.clientId === user?.id && r.depositAmount > 0);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time reservations for this client
      subscribeToReservations(user.id);
    }

    return () => {
      unsubscribeFromReservations();
    };
  }, [user?.id, subscribeToReservations, unsubscribeFromReservations]);

  const filteredDeposits = deposits.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return d.status === 'pending';
    if (filter === 'confirmed') return d.status === 'confirmed';
    if (filter === 'refunded') return d.status === 'completed';
    return true;
  });

  const totalDeposits = deposits.reduce((sum, d) => sum + d.depositAmount, 0);
  const lockedDeposits = deposits
    .filter((d) => d.status === 'pending' || d.status === 'confirmed')
    .reduce((sum, d) => sum + d.depositAmount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full font-semibold text-yellow-700 text-sm">
            <FaHourglass /> En attente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full font-semibold text-blue-700 text-sm">
            <FaLock /> Bloqué
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full font-semibold text-green-700 text-sm">
            <FaCheckCircle /> Remboursé
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full font-semibold text-red-700 text-sm">
            <FaTimesCircle /> Annulé
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 text-lg">Veuillez vous connecter pour voir vos dépôts</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-900 text-2xl">Dépôts de Garantie</h2>
      </div>

      {/* Stats */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="bg-white shadow-md p-6 border-primary-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-600 text-sm">Total Dépôts</p>
              <p className="mt-2 font-bold text-primary-600 text-3xl">
                {PRICE_SYMBOL}
                {totalDeposits.toFixed(2)}
              </p>
            </div>
            <FaDollarSign className="text-primary-200 text-5xl" />
          </div>
        </div>

        <div className="bg-white shadow-md p-6 border-yellow-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-600 text-sm">Dépôts Bloqués</p>
              <p className="mt-2 font-bold text-yellow-600 text-3xl">
                {PRICE_SYMBOL}
                {lockedDeposits.toFixed(2)}
              </p>
            </div>
            <FaLock className="text-yellow-200 text-5xl" />
          </div>
        </div>

        <div className="bg-white shadow-md p-6 border-green-500 border-l-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-600 text-sm">Remboursés</p>
              <p className="mt-2 font-bold text-green-600 text-3xl">
                {PRICE_SYMBOL}
                {deposits
                  .filter((d) => d.status === 'completed')
                  .reduce((sum, d) => sum + d.depositAmount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <FaCheckCircle className="text-green-200 text-5xl" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {(['all', 'pending', 'confirmed', 'refunded'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {filterType === 'all' && 'Tous'}
            {filterType === 'pending' && 'En attente'}
            {filterType === 'confirmed' && 'Bloqués'}
            {filterType === 'refunded' && 'Remboursés'}
          </button>
        ))}
      </div>

      {/* Deposits Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-slate-200 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">Propriété</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">Dates</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">Montant</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">Statut</th>
                <th className="px-6 py-4 font-bold text-slate-700 text-sm text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {deposit.property?.title || 'Propriété'}
                      </p>
                      <div className="flex items-center gap-1 text-slate-600 text-sm">
                        <FaMapMarkerAlt className="text-primary-500" />
                        {deposit.property?.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaCalendarAlt className="text-primary-500" />
                      <span>
                        {new Date(deposit.checkIn).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(deposit.checkOut).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary-600 text-sm">
                    {PRICE_SYMBOL}
                    {deposit.depositAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(deposit.status)}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/client/reservations`}
                      className="font-semibold text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDeposits.length === 0 && (
        <div className="bg-white py-12 rounded-xl text-center">
          <FaLock className="mx-auto mb-4 text-slate-300 text-6xl" />
          <p className="font-semibold text-slate-600 text-xl">Aucun dépôt</p>
          <p className="mb-6 text-slate-500">Vous n'avez pas encore de dépôt de garantie</p>
        </div>
      )}
    </div>
  );
}
