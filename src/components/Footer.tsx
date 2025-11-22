'use client';

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              HabitatsConnect
            </h3>
            <p className="text-slate-300 mb-4">
              Plateforme moderne de gestion immobilière et de réservation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-400 transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Accès rapide</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/" className="hover:text-primary-400 transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-primary-400 transition">
                  Annonces
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="font-bold text-lg mb-4">Pour les propriétaires</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/owner" className="hover:text-primary-400 transition">
                  Devenir propriétaire
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary-400 transition">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary-400 transition">
                  Aide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary-400" />
                <span>123 Rue de la Paix, Paris</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-primary-400" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-primary-400" />
                <span>info@habitatsconnect.fr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400">
            <p>&copy; 2025 HabitatsConnect. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-primary-400 transition">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="hover:text-primary-400 transition">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
