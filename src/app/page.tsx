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
import { PropertyCard } from '@/components';
import { Property } from '@/types';

// Mock data
const mockProperties: Property[] = [];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);

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
      <section className="relative h-screen bg-gradient-fluid overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl animate-float delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl animate-float delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Trouvez Votre Habitat Idéal
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-2xl animate-fade-in">
            Explorez des milliers de propriétés uniques et réservez vos prochaines
            vacances en quelques clics
          </p>

          {/* Search Card */}
          <form
            className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-in"
          >
            <Link
              href="/properties"
              className="w-full bg-gradient-fluid text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition flex items-center justify-center gap-2"
            >
              <FaSearch /> Commencer la recherche
            </Link>
          </form>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Types de Propriétés
            </h2>
            <p className="text-lg text-slate-600">
              Explorez notre variété de propriétés
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <button
                  key={idx}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-xl transition-all duration-300 text-left hover:-translate-y-2"
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-slate-600">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                Propriétés en Vedette
              </h2>
              <p className="text-lg text-slate-600">
                Découvrez nos meilleures offres du moment
              </p>
            </div>
            <Link
              href="/properties"
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-fluid text-white rounded-full font-semibold hover:shadow-lg transition"
            >
              Voir tout <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-slate-600">Aucune propriété disponible pour le moment.</p>
              </div>
            )}
          </div>

          <div className="sm:hidden flex justify-center mt-8">
            <Link
              href="/properties"
              className="px-6 py-3 bg-gradient-fluid text-white rounded-full font-semibold"
            >
              Voir tout
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Pourquoi nous choisir?
            </h2>
            <p className="text-lg text-slate-600">
              Découvrez les avantages de HabitatsConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div
                  key={idx}
                  className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-all"
                >
                  <Icon className={`text-4xl ${feature.color} mb-4`} />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-fluid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des milliers de voyageurs satisfaits et de propriétaires
            heureux
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary-600 font-bold rounded-full hover:shadow-lg transition"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              href="/properties"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition"
            >
              Parcourir les annonces
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
