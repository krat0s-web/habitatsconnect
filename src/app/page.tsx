'use client';
import { useState, useEffect } from 'react';
import {
  FaSearch,
  FaCheckCircle,
  FaShieldAlt,
  FaStar,
  FaArrowRight,
  FaHome,
  FaKey,
  FaDoorOpen,
  FaSquare,
} from 'react-icons/fa';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PropertyCard, Footer } from '@/components';
import { Property } from '@/types';
// Mock data
const mockProperties: Property[] = [];
export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  // Animation controls for scroll-triggered animations
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);
  useEffect(() => {
    // Charger les propriétés depuis localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitatsconnect_properties');
      if (stored) {
        try {
          setProperties(JSON.parse(stored));
        } catch (error) {
          console.error('Erreur lors du chargement des propriétés:', error);
        }
      }
    }
  }, []);
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-sage-700 h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="top-20 left-10 absolute bg-terracotta-400 blur-3xl rounded-full w-72 h-72 animate-pulse mix-blend-multiply filter" />
          <div className="top-40 right-10 absolute bg-sage-500 blur-3xl rounded-full w-72 h-72 animate-pulse mix-blend-multiply filter" />
          <div className="-bottom-8 left-20 absolute bg-terracotta-300 blur-3xl rounded-full w-72 h-72 animate-pulse mix-blend-multiply filter" />
        </div>
        {/* Content */}
        <div className="z-10 relative flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 h-full text-center">
          <motion.h1
            className="drop-shadow-lg mb-6 font-bold text-white text-5xl sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Trouvez Votre Habitat Idéal
          </motion.h1>
          <motion.p
            className="drop-shadow-md mb-12 max-w-2xl text-cream text-xl sm:text-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Explorez des milliers de propriétés uniques et réservez vos prochaines vacances en
            quelques clics
          </motion.p>
          {/* Search Card */}
          <motion.form
            className="bg-white/95 shadow-2xl backdrop-blur-md p-6 sm:p-8 rounded-3xl w-full max-w-5xl"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            <motion.div
              className="hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/properties"
                className="flex justify-center items-center gap-2 bg-sage-600 hover:bg-sage-700 hover:shadow-lg hover:shadow-sage-500/50 py-3 rounded-xl w-full font-bold text-white transition"
              >
                <FaSearch /> Commencer la recherche
              </Link>
            </motion.div>
          </motion.form>
        </div>
      </section>
      {/* Property Types Section */}
      <section className="bg-white py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-bold text-slate-900 text-4xl">Types de Propriétés</h2>
            <p className="text-slate-600 text-lg">Explorez notre variété de propriétés</p>
          </motion.div>
          <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FaHome,
                title: 'Villas',
                description: 'Propriétés luxueuses avec jardin',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: FaKey,
                title: 'Appartements',
                description: 'Élégants et modernes en centre-ville',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: FaSquare,
                title: 'Studios',
                description: 'Parfait pour les voyageurs solo',
                color: 'from-pink-500 to-pink-600',
              },
              {
                icon: FaDoorOpen,
                title: 'Garages',
                description: 'Espaces de stockage securisés',
                color: 'from-gray-500 to-gray-600',
              },
            ].map((type, idx) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={idx}
                  className="group bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-xl p-8 rounded-3xl text-left hover:scale-105 transition-all hover:-translate-y-2 duration-300"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-4 transition-transform group-hover:rotate-12 group-hover:scale-110`}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon size={32} />
                  </motion.div>
                  <motion.h3
                    className="mb-2 font-bold text-slate-900 text-xl"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 + 0.2 }}
                  >
                    {type.title}
                  </motion.h3>
                  <motion.p
                    className="text-slate-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 + 0.3 }}
                  >
                    {type.description}
                  </motion.p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
      {/* Featured Properties */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="flex justify-between items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <motion.h2
                className="mb-2 font-bold text-slate-900 text-4xl"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Propriétés en Vedette
              </motion.h2>
              <motion.p
                className="text-slate-600 text-lg"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Découvrez nos meilleures offres du moment
              </motion.p>
            </div>
            <motion.div
              className="hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/properties"
                className="hidden sm:flex items-center gap-2 bg-sage-600 hover:bg-sage-700 hover:shadow-lg px-6 py-3 rounded-full font-semibold text-white transition"
              >
                Voir tout <FaArrowRight />
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            ref={ref}
            initial="hidden"
            animate={controls}
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
            {properties.length > 0 ? (
              properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ y: -8 }}
                >
                  <PropertyCard key={property.id} property={property} index={index} />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full py-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-slate-600 text-lg">
                  Aucune propriété disponible pour le moment.
                </p>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            className="sm:hidden flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/properties"
                className="bg-sage-600 hover:bg-sage-700 px-6 py-3 rounded-full font-semibold text-white"
              >
                Voir tout
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-bold text-slate-900 text-4xl">Pourquoi nous choisir?</h2>
            <p className="text-slate-600 text-lg">Découvrez les avantages de HabitatsConnect</p>
          </motion.div>
          <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FaCheckCircle,
                title: 'Vérification Stricte',
                description: 'Toutes les propriétés sont vérifiées et certifiées',
                color: 'text-green-500',
              },
              {
                icon: FaShieldAlt,
                title: 'Sécurité Garantie',
                description: 'Vos données et paiements sont protégés',
                color: 'text-blue-500',
              },
              {
                icon: FaStar,
                title: 'Avis Authentiques',
                description: 'Les avis proviennent de clients réels',
                color: 'text-yellow-500',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-slate-50 hover:shadow-lg p-8 rounded-3xl hover:scale-105 transition-all hover:-translate-y-2"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className="hover:rotate-12 hover:scale-110 transition-transform"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`text-4xl ${feature.color} mb-4`} />
                  </motion.div>
                  <motion.h3
                    className="mb-2 font-bold text-slate-900 text-xl"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.2 + 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="text-slate-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.2 + 0.4 }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-sage-600 via-sage-700 to-terracotta-600 py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <motion.h2
            className="drop-shadow-lg mb-6 font-bold text-white text-4xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Prêt à commencer?
          </motion.h2>
          <motion.p
            className="drop-shadow-md mb-8 text-cream text-white text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Rejoignez des milliers de voyageurs satisfaits et de propriétaires heureux
          </motion.p>
          <motion.div
            className="flex sm:flex-row flex-col justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/register"
                className="bg-white hover:bg-cream hover:shadow-lg px-8 py-4 rounded-full font-bold text-sage-700 transition"
              >
                S'inscrire gratuitement
              </Link>
            </motion.div>
            <motion.div
              className="hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/properties"
                className="hover:bg-white/10 px-8 py-4 border-2 border-white rounded-full font-bold text-white transition"
              >
                Parcourir les annonces
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
