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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { properties: storeProperties, loadProperties } = usePropertyStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    loadProperties();
  }, [mounted, loadProperties]);

  useEffect(() => {
    if (user && storeProperties.length > 0) {
      const userProperties = storeProperties.filter((p) => p.ownerId === user.id);
      setProperties(userProperties);
    } else if (user && typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_properties');
      if (stored) {
        try {
          const allProperties = JSON.parse(stored);
          const userProperties = allProperties.filter(
            (p: any) => p.ownerId === user.id
          );
          setProperties(userProperties);
        } catch (error) {
          console.error('Erreur lors du chargement des propriétés:', error);
        }
      }
    }
  }, [user, storeProperties]);

  const handleDelete = (id: string) => {
    const updatedProperties = properties.filter((p) => p.id !== id);
    setProperties(updatedProperties);
    
    // Mettre à jour localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_properties');
      if (stored) {
        const allProperties = JSON.parse(stored);
        const filtered = allProperties.filter((p: any) => p.id !== id);
        localStorage.setItem('habitatsconnect_properties', JSON.stringify(filtered));
      }
    }
    setShowDeleteConfirm(null);
  };

  const toggleStatus = (id: string) => {
    const updated = properties.map((p) =>
      p.id === id
        ? { ...p, isAvailable: !p.isAvailable }
        : p
    );
    setProperties(updated);
    
    // Mettre à jour localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_properties');
      if (stored) {
        const allProperties = JSON.parse(stored);
        const updatedAll = allProperties.map((p: any) =>
          p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
        );
        localStorage.setItem('habitatsconnect_properties', JSON.stringify(updatedAll));
      }
    }
  };

  const activeCount = properties.filter((p) => p.isAvailable).length;
  
  const revenue = properties
    .filter((p) => p.isAvailable)
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
          <div className="text-sm text-slate-600 font-semibold">Total Annonces</div>
          <div className="text-3xl font-bold text-primary-600 mt-2">
            {properties.length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-accent-500">
          <div className="text-sm text-slate-600 font-semibold">Annonces Actives</div>
          <div className="text-3xl font-bold text-accent-600 mt-2">
            {activeCount}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-secondary-500">
          <div className="text-sm text-slate-600 font-semibold">Revenus (Tarif/Nuit)</div>
          <div className="text-3xl font-bold text-secondary-600 mt-2">
            {revenue.toLocaleString()}€
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Mes Annonces</h2>
        <Link
          href="/dashboard/owner/properties/create"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-fluid text-white rounded-lg hover:shadow-lg transition"
        >
          <FaPlus /> Créer Annonce
        </Link>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
          >
            {/* Image */}
            <div className="relative h-48 bg-slate-200 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition"
                style={{
                  backgroundImage: `url(${
                    property.images && property.images.length > 0
                      ? property.images[0].url
                      : 'https://via.placeholder.com/500x300?text=No+Image'
                  })`,
                }}
              />
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  property.isAvailable ? 'bg-green-500' : 'bg-orange-500'
                }`}
              >
                {property.isAvailable ? 'Actif' : 'Inactif'}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {property.title}
              </h3>

              <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                <FaMapMarkerAlt className="text-primary-500" />
                {property.location}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-200 text-center text-sm">
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-600">
                    <FaBed /> {property.bedrooms}
                  </div>
                  <div className="text-xs text-slate-500">Chambres</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-600">
                    <FaBath /> {property.bathrooms}
                  </div>
                  <div className="text-xs text-slate-500">Salle(s)</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    <FaStar /> 0
                  </div>
                  <div className="text-xs text-slate-500">(0)</div>
                </div>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-primary-600 mb-4">
                {property.price}€<span className="text-sm text-slate-600">/nuit</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/properties/${property.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition font-semibold text-sm"
                >
                  <FaEye /> Voir
                </Link>
                <Link
                  href={`/dashboard/owner/properties/${property.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold text-sm"
                >
                  <FaEdit /> Modifier
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(property.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold text-sm"
                >
                  <FaTrash /> Supprimer
                </button>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === property.id && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 font-semibold mb-3">
                    Êtes-vous sûr de vouloir supprimer cette annonce?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 px-3 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition font-semibold text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <FaHome className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">Aucune annonce</p>
          <p className="text-slate-500 mb-6">Créez votre première annonce pour commencer</p>
          <Link
            href="/dashboard/owner/properties/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-fluid text-white rounded-lg hover:shadow-lg transition"
          >
            <FaPlus /> Créer Annonce
          </Link>
        </div>
      )}
    </div>
  );
}
