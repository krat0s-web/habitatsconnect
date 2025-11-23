'use client';

import { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaStar,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaHome,
} from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore, usePropertyStore } from '@/store';
import type { Property } from '@/types';
import { PRICE_SYMBOL } from '@/lib/static';
import { motion } from 'framer-motion';

export default function PropertiesPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { user } = useAuthStore();
  const {
    properties,
    deleteProperty,
    updateProperty,
    subscribeToProperties,
    unsubscribeFromProperties,
  } = usePropertyStore();

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time properties for this owner
      subscribeToProperties(user.id);
    }

    return () => {
      unsubscribeFromProperties();
    };
  }, [user?.id, subscribeToProperties, unsubscribeFromProperties]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la propriété');
    }
  };

  const toggleStatus = async (id: string) => {
    const property = properties.find((p) => p.id === id);
    if (!property) return;

    try {
      await updateProperty(id, { isAvailable: !property.isAvailable });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const activeCount = properties.filter((p) => p.isAvailable).length;

  const revenue = properties.filter((p) => p.isAvailable).reduce((sum, p) => sum + p.price, 0);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Stats */}
      <motion.div
        className="gap-6 grid grid-cols-1 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <motion.div
          className="bg-white shadow-md p-6 border-primary-500 border-l-4 rounded-xl"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-semibold text-slate-600 text-sm">Total Annonces</div>
          <motion.div
            className="mt-2 font-bold text-primary-600 text-3xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {properties.length}
          </motion.div>
        </motion.div>
        <motion.div
          className="bg-white shadow-md p-6 border-accent-500 border-l-4 rounded-xl"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-semibold text-slate-600 text-sm">Annonces Actives</div>
          <motion.div
            className="mt-2 font-bold text-3xl text-accent-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            {activeCount}
          </motion.div>
        </motion.div>
        <motion.div
          className="bg-white shadow-md p-6 border-secondary-500 border-l-4 rounded-xl"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-semibold text-slate-600 text-sm">Revenus (Tarif/Nuit)</div>
          <motion.div
            className="mt-2 font-bold text-secondary-600 text-3xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          >
            {revenue.toLocaleString()}
            {PRICE_SYMBOL}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-bold text-slate-900 text-2xl">Mes Annonces</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/dashboard/owner/properties/create"
            className="flex items-center gap-2 bg-gradient-fluid hover:shadow-lg px-6 py-3 rounded-lg text-white transition"
          >
            <FaPlus /> Créer Annonce
          </Link>
        </motion.div>
      </motion.div>

      {/* Properties Grid */}
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
        {properties.map((property, index) => (
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
              <motion.div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  property.isAvailable ? 'bg-green-500' : 'bg-orange-500'
                }`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {property.isAvailable ? 'Actif' : 'Inactif'}
              </motion.div>
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
                {property.price}
                {PRICE_SYMBOL}
                <span className="text-slate-600 text-sm">/nuit</span>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-1"
                >
                  <Link
                    href={`/properties/${property.id}`}
                    className="flex flex-1 justify-center items-center gap-2 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg font-semibold text-primary-600 text-sm transition"
                  >
                    <FaEye /> Voir
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-1"
                >
                  <Link
                    href={`/dashboard/owner/properties/${property.id}/edit`}
                    className="flex flex-1 justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg font-semibold text-blue-600 text-sm transition"
                  >
                    <FaEdit /> Modifier
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-1"
                >
                  <button
                    onClick={() => setShowDeleteConfirm(property.id)}
                    className="flex flex-1 justify-center items-center gap-2 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg font-semibold text-red-600 text-sm transition"
                  >
                    <FaTrash /> Supprimer
                  </button>
                </motion.div>
              </motion.div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === property.id && (
                <motion.div
                  className="bg-red-50 mt-4 p-4 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="mb-3 font-semibold text-red-800 text-sm">
                    Êtes-vous sûr de vouloir supprimer cette annonce?
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleDelete(property.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg font-semibold text-white text-sm transition"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Supprimer
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-slate-300 hover:bg-slate-400 px-3 py-2 rounded-lg font-semibold text-slate-700 text-sm transition"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Annuler
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {properties.length === 0 && (
        <motion.div
          className="py-12 text-center"
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
            Aucune annonce
          </motion.p>
          <motion.p
            className="mb-6 text-slate-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Créez votre première annonce pour commencer
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/dashboard/owner/properties/create"
              className="inline-flex items-center gap-2 bg-gradient-fluid hover:shadow-lg px-6 py-3 rounded-lg text-white transition"
            >
              <FaPlus /> Créer Annonce
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
