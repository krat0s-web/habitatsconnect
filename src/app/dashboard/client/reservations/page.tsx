'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaCheck, FaHourglass, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, useReservationStore } from '@/store';
import type { Reservation } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';
import { motion } from 'framer-motion';

export default function ClientReservationsPage() {
  const { user } = useAuthStore();
  const { reservations, loading, subscribeToReservations, unsubscribeFromReservations } =
    useReservationStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time reservations for this client
      subscribeToReservations(user.id);
    }

    return () => {
      unsubscribeFromReservations();
    };
  }, [user?.id, subscribeToReservations, unsubscribeFromReservations]);

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full font-semibold text-green-700 text-sm">
            <FaCheck /> Confirmée
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full font-semibold text-green-700 text-sm">
            <FaCheck /> Confirmée
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
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-bold text-slate-900 text-2xl">Mes Réservations</h2>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((filterType, index) => (
          <motion.button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterType === 'all' && 'Toutes'}
            {filterType === 'pending' && 'En attente'}
            {filterType === 'confirmed' && 'Confirmées'}
            {filterType === 'completed' && 'Complétées'}
          </motion.button>
        ))}
      </motion.div>

      {/* Reservations List */}
      <motion.div
        className="gap-6 grid grid-cols-1"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {filteredReservations.map((reservation, index) => (
          <motion.div
            key={reservation.id}
            className="bg-white shadow-md hover:shadow-lg p-6 border-primary-500 border-l-4 rounded-xl transition"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
              {/* Property Info */}
              <div className="md:col-span-2">
                <motion.h3
                  className="mb-2 font-bold text-slate-900 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {reservation.property?.title || 'Propriété'}
                </motion.h3>
                <motion.div
                  className="flex items-center gap-2 mb-3 text-slate-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FaMapMarkerAlt className="text-primary-500" />
                  {reservation.property?.location || 'Non spécifiée'}
                </motion.div>

                {/* Dates */}
                <motion.div
                  className="space-y-2 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
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
                </motion.div>
              </div>

              {/* Pricing */}
              <motion.div
                className="bg-slate-50 p-4 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="mb-2 text-slate-600 text-sm">Total</p>
                <p className="mb-2 font-bold text-slate-900 text-2xl">
                  {PRICE_SYMBOL}
                  {reservation.totalPrice.toFixed(2)}
                </p>
                <p className="text-slate-600 text-xs">
                  Dépôt: {PRICE_SYMBOL}
                  {reservation.depositAmount.toFixed(2)}
                </p>
              </motion.div>

              {/* Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="mb-4">{getStatusBadge(reservation.status)}</div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={`/properties/${reservation.propertyId}`}
                    className="block bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg w-full font-semibold text-primary-600 text-sm text-center transition"
                  >
                    Voir l'annonce
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredReservations.length === 0 && (
        <motion.div
          className="bg-white py-12 rounded-xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FaCalendarAlt className="mx-auto mb-4 text-slate-300 text-6xl" />
          </motion.div>
          <motion.p
            className="font-semibold text-slate-600 text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Aucune réservation
          </motion.p>
          <motion.p
            className="mb-6 text-slate-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Vous n'avez pas encore de réservations
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-gradient-fluid hover:shadow-lg px-6 py-3 rounded-lg text-white transition"
            >
              Découvrir les propriétés
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
