'use client';

import { useState, useEffect } from 'react';
import {
  FaHome,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
  userRole?: 'client' | 'owner' | 'admin';
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Utilise les données du store ou les props
  const displayName = user?.firstName || userName || 'Utilisateur';
  const displayRole = user?.role || userRole;
  const isAuth = user ? true : isAuthenticated;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-fluid rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-white rounded-lg p-2">
                <FaHome className="text-2xl text-primary-600" />
              </div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              HabitatsConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 hover:bg-slate-200 transition">
              <FaSearch className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent outline-none text-sm w-40"
              />
            </div>

            {isAuth ? (
              <>
                {displayRole === 'owner' && (
                  <Link
                    href="/dashboard/owner/properties/create"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-fluid rounded-full text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition"
                  >
                    <FaPlus /> Créer annonce
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">{displayName}</span>
                  <Link
                    href={displayRole === 'owner' ? '/dashboard/owner/profile' : '/dashboard/client/profile'}
                    className="p-2 hover:bg-slate-100 rounded-full transition"
                  >
                    <FaUser className="text-primary-600" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-slate-100 rounded-full transition"
                  >
                    <FaSignOutAlt className="text-secondary-600" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-6 py-2 text-primary-600 font-semibold hover:bg-primary-50 rounded-full transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 bg-gradient-fluid text-white rounded-full font-semibold hover:shadow-lg transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-slate-100 rounded-full transition"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-3 animate-fade-in">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2">
              <FaSearch className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
            {isAuth ? (
              <>
                {displayRole === 'owner' && (
                  <Link
                    href="/dashboard/owner/properties/create"
                    className="block px-4 py-2 bg-gradient-fluid rounded-full text-white font-semibold"
                  >
                    Créer annonce
                  </Link>
                )}
                <Link
                  href={displayRole === 'owner' ? '/dashboard/owner/profile' : '/dashboard/client/profile'}
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-primary-600 font-semibold"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 bg-gradient-fluid text-white rounded-full font-semibold"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
