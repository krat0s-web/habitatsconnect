'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaStar, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, useFavoriteStore } from '@/store';
import type { Property } from '@/types';
import { motion } from 'framer-motion';
import { PRICE_SYMBOL } from '@/lib/static';

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const { favorites, loading, removeFavorite, subscribeToFavorites, unsubscribeFromFavorites } =
    useFavoriteStore();

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time favorites
      subscribeToFavorites(user.id);
    }

    return () => {
      unsubscribeFromFavorites();
    };
  }, [user?.id, subscribeToFavorites, unsubscribeFromFavorites]);

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!user?.id) return;

    try {
      await removeFavorite(user.id, propertyId);
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      alert('Erreur lors de la suppression du favori');
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 text-lg">Veuillez vous connecter pour voir vos favoris</p>
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
        <h2 className="font-bold text-slate-900 text-2xl">Annonces Favoris</h2>
        <motion.span
          className="bg-primary-100 px-4 py-2 rounded-lg font-semibold text-primary-700"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {favorites.length} favoris
        </motion.span>
      </motion.div>

      {/* Favorites Grid */}
      <motion.div
        className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
        {favorites.map((property, index) => (
          <motion.div
            key={property.id}
            className="group bg-white shadow-md hover:shadow-xl rounded-xl overflow-hidden transition"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Image */}
            <div className="relative bg-slate-200 h-48 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition"
                style={{
                  backgroundImage: `url(${
                    property.images && property.images.length > 0
                      ? property.images[0].url
                      : 'https://via.placeholder.com/500x300?text=No+Image'
                  })`,
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.button
                onClick={() => handleRemoveFavorite(property.id)}
                className="top-4 right-4 absolute bg-red-500 hover:bg-red-600 shadow-lg p-2 rounded-full text-white transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <FaHeart size={18} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-5">
              <motion.h3
                className="mb-2 font-bold text-slate-900 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {property.title}
              </motion.h3>

              <motion.div
                className="flex items-center gap-2 mb-3 text-slate-600 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <FaMapMarkerAlt className="text-primary-500" />
                {property.location}
              </motion.div>

              {/* Details Grid */}
              <motion.div
                className="gap-3 grid grid-cols-3 mb-4 pb-4 border-slate-200 border-b text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div>
                  <div className="flex justify-center items-center gap-1 text-slate-600">
                    <FaBed /> {property.bedrooms}
                  </div>
                  <div className="text-slate-500 text-xs">Chambres</div>
                </div>
                <div>
                  <div className="flex justify-center items-center gap-1 text-slate-600">
                    <FaBath /> {property.bathrooms}
                  </div>
                  <div className="text-slate-500 text-xs">Salle(s)</div>
                </div>
                <div>
                  <div className="flex justify-center items-center gap-1 text-amber-500">
                    <FaStar /> 0
                  </div>
                  <div className="text-slate-500 text-xs">(0)</div>
                </div>
              </motion.div>

              {/* Price */}
              <motion.div
                className="mb-4 font-bold text-primary-600 text-2xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
              >
                {PRICE_SYMBOL}
                {property.price}
                <span className="text-slate-600 text-sm">/nuit</span>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={`/properties/${property.id}`}
                    className="block bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg w-full font-semibold text-primary-600 text-sm text-center transition"
                  >
                    Voir l'annonce
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {favorites.length === 0 && (
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
            <FaHome className="mx-auto mb-4 text-slate-300 text-6xl" />
          </motion.div>
          <motion.p
            className="font-semibold text-slate-600 text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Aucun favoris
          </motion.p>
          <motion.p
            className="mb-6 text-slate-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Vous n'avez pas encore ajouté d'annonce aux favoris
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
