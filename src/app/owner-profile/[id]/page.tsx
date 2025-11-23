'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaHome,
  FaStar,
  FaCheckCircle,
  FaArrowLeft,
} from 'react-icons/fa';
import Link from 'next/link';
import { PropertyCard, Loading } from '@/components';
import { usePropertyStore, useAuthStore } from '@/store';
import type { Property, User } from '@/types';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function OwnerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { properties, subscribeToProperties, unsubscribeFromProperties } = usePropertyStore();
  const { user: currentUser } = useAuthStore();
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load owner data
    const loadOwner = async () => {
      try {
        const ownerDoc = await getDoc(doc(db, 'users', params.id));
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data() as User;
          setOwner({ ...ownerData, id: ownerDoc.id });
        }
      } catch (error) {
        console.error('Error loading owner:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOwner();
    subscribeToProperties(params.id); // Load properties for this owner

    return () => {
      unsubscribeFromProperties();
    };
  }, [params.id, subscribeToProperties, unsubscribeFromProperties]);

  if (loading) {
    return <Loading />;
  }

  if (!owner) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <FaUser className="mb-4 text-slate-300 text-6xl" />
        <h2 className="mb-2 font-bold text-slate-900 text-2xl">Propriétaire introuvable</h2>
        <p className="mb-6 text-slate-600">Ce propriétaire n'existe pas ou a été supprimé.</p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 bg-gradient-fluid hover:shadow-lg px-6 py-3 rounded-lg text-white transition"
        >
          <FaArrowLeft /> Retour aux annonces
        </Link>
      </div>
    );
  }

  const ownerProperties = properties.filter((p) => p.ownerId === params.id && p.isAvailable);
  
  // Fix memberSince to handle Firestore Timestamp
  const getMemberSince = () => {
    if (!owner.createdAt) return new Date().getFullYear();
    
    // Handle Firestore Timestamp
    if (typeof owner.createdAt === 'object' && 'seconds' in owner.createdAt) {
      return new Date((owner.createdAt as any).seconds * 1000).getFullYear();
    }
    
    // Handle Date object or string
    return new Date(owner.createdAt).getFullYear();
  };
  
  const memberSince = getMemberSince();

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
      {/* Back Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:bg-slate-100 px-4 py-2 rounded-lg text-slate-600 transition"
        >
          <FaArrowLeft /> Retour
        </button>
      </motion.div>

      {/* Owner Profile Card */}
      <motion.div
        className="bg-gradient-to-br from-white to-slate-50 shadow-xl mb-12 p-8 border border-slate-200 rounded-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex md:flex-row flex-col gap-8 items-start">
          {/* Avatar */}
          <motion.div
            className="flex justify-center items-center bg-gradient-fluid shadow-lg rounded-full w-32 h-32 text-white text-5xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FaUser />
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <motion.div
              className="flex md:flex-row flex-col justify-between items-start gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div>
                <h1 className="mb-2 font-bold text-slate-900 text-3xl">
                  {owner.firstName} {owner.lastName}
                </h1>
                <div className="flex items-center gap-2 mb-2 text-slate-600">
                  <FaCheckCircle className="text-green-500" />
                  <span>Propriétaire vérifié</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FaCalendar className="text-primary-500" />
                  <span>Membre depuis {memberSince}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="bg-primary-50 p-4 border-primary-200 border rounded-xl text-center">
                  <div className="font-bold text-primary-600 text-2xl">
                    {ownerProperties.length}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {ownerProperties.length === 1 ? 'Annonce' : 'Annonces'}
                  </div>
                </div>
                <div className="bg-amber-50 p-4 border-amber-200 border rounded-xl text-center">
                  <div className="flex items-center gap-1 font-bold text-amber-600 text-2xl">
                    <FaStar /> 4.8
                  </div>
                  <div className="text-slate-600 text-sm">Note moyenne</div>
                </div>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="gap-6 grid grid-cols-1 md:grid-cols-2 bg-slate-50 p-6 border border-slate-200 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-primary-100 rounded-full w-10 h-10 text-primary-600">
                  <FaEnvelope />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Email</div>
                  <div className="text-slate-600 text-sm">{owner.email}</div>
                </div>
              </div>

              {owner.phone && (
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-green-100 rounded-full w-10 h-10 text-green-600">
                    <FaPhone />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Téléphone</div>
                    <div className="text-slate-600 text-sm">{owner.phone}</div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Bio (if available) */}
            {owner.bio && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="mb-2 font-semibold text-slate-900">À propos</h3>
                <p className="text-slate-600">{owner.bio}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Owner Properties */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-slate-900 text-2xl">
            Annonces de {owner.firstName} ({ownerProperties.length})
          </h2>
        </div>

        {ownerProperties.length > 0 ? (
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {ownerProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <PropertyCard property={property} index={index} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white py-12 rounded-xl text-center">
            <FaHome className="mx-auto mb-4 text-slate-300 text-6xl" />
            <p className="font-semibold text-slate-600 text-xl">Aucune annonce disponible</p>
            <p className="text-slate-500">
              Ce propriétaire n'a pas encore publié d'annonces actives.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
