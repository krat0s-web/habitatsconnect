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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* About */}
          <div>
            <h3 className="bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-4 font-bold text-transparent text-xl">
              HabitatsConnect
            </h3>
            <p className="mb-4 text-slate-300">
              Plateforme moderne de gestion immobilière et de réservation.
            </p>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary-400"
                asChild
              >
                <a href="#">
                  <FaFacebook size={20} />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary-400"
                asChild
              >
                <a href="#">
                  <FaTwitter size={20} />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary-400"
                asChild
              >
                <a href="#">
                  <FaInstagram size={20} />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary-400"
                asChild
              >
                <a href="#">
                  <FaLinkedin size={20} />
                </a>
              </Button>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-bold text-lg">Accès rapide</h4>
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
            <h4 className="mb-4 font-bold text-lg">Pour les propriétaires</h4>
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
            <h4 className="mb-4 font-bold text-lg">Contact</h4>
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
        <Separator className="bg-slate-700 mb-8" />
        {/* Bottom */}
        <div className="flex md:flex-row flex-col justify-between items-center text-slate-400">
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
    </footer>
  );
};
