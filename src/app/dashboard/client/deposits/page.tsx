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
import { useAuthStore } from '@/store';
import type { Reservation } from '@/types';

export default function DepositsPage() {
  const { user } = useAuthStore();
  const [deposits, setDeposits] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'refunded'>('all');

  useEffect(() => {
    // Charger les dépôts du client
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem('habitatsconnect_reservations');
      if (stored) {
        try {
          const allReservations = JSON.parse(stored);
          const clientDeposits = allReservations.filter(
            (r: any) => r.clientId === user.id && r.depositAmount > 0
          );
          setDeposits(clientDeposits);
        } catch (error) {
          console.error('Erreur lors du chargement des dépôts:', error);
        }
      }
    }
  }, [user]);

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
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            <FaHourglass /> En attente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <FaLock /> Bloqué
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <FaCheckCircle /> Remboursé
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            <FaTimesCircle /> Annulé
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
          Veuillez vous connecter pour voir vos dépôts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Dépôts de Garantie</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Total Dépôts</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                ${totalDeposits.toFixed(2)}
              </p>
            </div>
            <FaDollarSign className="text-5xl text-primary-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Dépôts Bloqués</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                ${lockedDeposits.toFixed(2)}
              </p>
            </div>
            <FaLock className="text-5xl text-yellow-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Remboursés</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${(
                  deposits
                    .filter((d) => d.status === 'completed')
                    .reduce((sum, d) => sum + d.depositAmount, 0)
                ).toFixed(2)}
              </p>
            </div>
            <FaCheckCircle className="text-5xl text-green-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Propriété
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                  Action
                </th>
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
                      <div className="flex items-center gap-1 text-sm text-slate-600">
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
                  <td className="px-6 py-4 text-sm font-bold text-primary-600">
                    ${deposit.depositAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(deposit.status)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/client/reservations`}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
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
        <div className="text-center py-12 bg-white rounded-xl">
          <FaLock className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">Aucun dépôt</p>
          <p className="text-slate-500 mb-6">Vous n'avez pas encore de dépôt de garantie</p>
        </div>
      )}
    </div>
  );
}
