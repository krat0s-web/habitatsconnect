'use client';

import { FaUsers, FaShieldAlt, FaHeart, FaGlobe, FaCheckCircle, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Footer } from '@/components';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="top-10 left-10 absolute bg-primary-400 blur-3xl rounded-full w-96 h-96 animate-pulse" />
          <div className="bottom-10 right-10 absolute bg-secondary-500 blur-3xl rounded-full w-96 h-96 animate-pulse" />
        </div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <motion.h1
            className="mb-6 font-bold text-white text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            À Propos de HabitatsConnect
          </motion.h1>
          <motion.p
            className="text-primary-100 text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Révolutionner la location de propriétés avec confiance et simplicité
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-bold text-slate-900 text-4xl">Notre Mission</h2>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              Chez HabitatsConnect, nous croyons que trouver le logement idéal devrait être aussi simple
              que de réserver un vol. Notre plateforme connecte propriétaires et voyageurs avec transparence
              et sécurité.
            </p>
          </motion.div>

          <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
            {[
              {
                icon: FaUsers,
                title: 'Communauté',
                description: 'Plus de 10,000 utilisateurs actifs qui font confiance à notre plateforme',
                color: 'text-blue-500',
              },
              {
                icon: FaShieldAlt,
                title: 'Sécurité',
                description: 'Vérification stricte de toutes les propriétés et utilisateurs',
                color: 'text-green-500',
              },
              {
                icon: FaHeart,
                title: 'Confiance',
                description: 'Avis authentiques et système de notation transparent',
                color: 'text-red-500',
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-white shadow-lg p-8 rounded-2xl text-center hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                >
                  <Icon className={`text-5xl ${value.color} mb-4 mx-auto`} />
                  <h3 className="mb-4 font-bold text-slate-900 text-2xl">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="gap-12 items-center grid grid-cols-1 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6 font-bold text-slate-900 text-4xl">Notre Histoire</h2>
              <p className="mb-4 text-slate-600 text-lg">
                Fondée en 2024, HabitatsConnect est née de la frustration de trouver des locations
                de qualité sans les complications habituelles. Nos fondateurs, passionnés par
                l'immobilier et la technologie, ont décidé de créer une plateforme qui met
                l'accent sur la confiance et la simplicité.
              </p>
              <p className="text-slate-600 text-lg">
                Aujourd'hui, nous sommes fiers de connecter des milliers de voyageurs avec des
                propriétaires de confiance partout en France, offrant une expérience de location
                exceptionnelle.
              </p>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-8 rounded-3xl">
                <div className="gap-4 grid grid-cols-2">
                  <div className="text-center">
                    <div className="mb-2 font-bold text-3xl text-primary-600">10K+</div>
                    <div className="text-slate-600">Utilisateurs</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 font-bold text-3xl text-secondary-600">5K+</div>
                    <div className="text-slate-600">Propriétés</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 font-bold text-3xl text-primary-600">50K+</div>
                    <div className="text-slate-600">Réservations</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 font-bold text-3xl text-secondary-600">4.8/5</div>
                    <div className="text-slate-600">Note moyenne</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-bold text-slate-900 text-4xl">Pourquoi nous choisir</h2>
            <p className="text-slate-600 text-lg">
              Découvrez ce qui fait la différence HabitatsConnect
            </p>
          </motion.div>

          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            {[
              {
                icon: FaCheckCircle,
                title: 'Vérification Rigoureuse',
                description: 'Toutes les propriétés sont inspectées et vérifiées par notre équipe avant publication.',
              },
              {
                icon: FaShieldAlt,
                title: 'Paiements Sécurisés',
                description: 'Vos transactions sont protégées par des systèmes de sécurité bancaires de pointe.',
              },
              {
                icon: FaStar,
                title: 'Avis Authentiques',
                description: 'Seuls les voyageurs ayant séjourné peuvent laisser des avis détaillés.',
              },
              {
                icon: FaGlobe,
                title: 'Support 24/7',
                description: 'Notre équipe est disponible pour vous aider à tout moment, partout.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-white shadow-lg p-6 rounded-xl hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="text-primary-500 text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="mb-2 font-semibold text-slate-900 text-xl">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <motion.h2
            className="mb-6 font-bold text-white text-4xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Rejoignez notre communauté
          </motion.h2>
          <motion.p
            className="mb-8 text-primary-100 text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Commencez dès aujourd'hui et découvrez pourquoi des milliers d'utilisateurs nous font confiance
          </motion.p>
          <motion.div
            className="flex sm:flex-row flex-col justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/auth/register"
              className="bg-white hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-primary-600 transition"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              href="/properties"
              className="hover:bg-white/10 px-8 py-4 border-2 border-white rounded-full font-bold text-white transition"
            >
              Explorer les propriétés
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}