'use client';

import { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { FaHome, FaBars, FaTimes, FaUser, FaSignOutAlt, FaPlus, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
  userRole?: 'client' | 'owner' | 'admin';
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isHydrated = useHydration();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Utilise les données du store ou les props
  const displayName = user?.firstName || userName || 'Utilisateur';
  const displayRole = user?.role || userRole;
  const isAuth = isHydrated && (user ? true : isAuthenticated);
  
  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };
  
  // Ne rien afficher pendant l'hydration pour éviter les erreurs
  if (!isHydrated) {
    return (
      <nav className="top-0 z-50 sticky bg-white/95 shadow-lg backdrop-blur-md border-slate-200 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="group flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-fluid opacity-75 group-hover:opacity-100 rounded-xl transition blur"></div>
                <div className="relative bg-white p-2 rounded-xl">
                  <FaHome className="text-primary-600 text-2xl" />
                </div>
              </div>
              <span className="bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 font-bold text-transparent text-xl">
                HabitatsConnect
              </span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="top-0 z-50 sticky bg-white/95 shadow-lg backdrop-blur-md border-slate-200 border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-fluid opacity-75 group-hover:opacity-100 rounded-xl transition blur"></div>
              <div className="relative bg-white p-2 rounded-xl">
                <FaHome className="text-primary-600 text-2xl" />
              </div>
            </div>
            <span className="bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 font-bold text-transparent text-xl">
              HabitatsConnect
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition">
              <FaSearch className="mr-2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent outline-none border-0 w-40 h-6 text-sm"
              />
            </div>
            
            {/* Navigation Links */}
            <Link
              href="/properties"
              className="text-slate-700 hover:text-primary-600 font-medium transition"
            >
              Propriétés
            </Link>
            <Link
              href="/about"
              className="text-slate-700 hover:text-primary-600 font-medium transition"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="text-slate-700 hover:text-primary-600 font-medium transition"
            >
              Contact
            </Link>
            
            {isAuth ? (
              <>
                {displayRole === 'owner' && (
                  <Link 
                    href="/dashboard/owner/properties/create"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-6 py-2 rounded-full font-semibold text-white transition"
                  >
                    <FaPlus /> Créer annonce
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 text-sm">{displayName}</span>
                  <Link
                    href={
                      displayRole === 'owner'
                        ? '/dashboard/owner/profile'
                        : '/dashboard/client/profile'
                    }
                    className="p-2 rounded-full hover:bg-slate-100 transition"
                  >
                    <FaUser className="text-primary-600" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-slate-100 transition"
                  >
                    <FaSignOutAlt className="text-secondary-600" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="px-6 py-2 rounded-full font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/register"
                  className="inline-flex items-center bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-6 py-2 rounded-full font-semibold text-white transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 transition"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden space-y-3 pb-6">
            <div className="flex items-center bg-slate-100 px-4 py-2 rounded-full">
              <FaSearch className="mr-2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="flex-1 bg-transparent outline-none border-0 h-6 text-sm"
              />
            </div>
            
            {/* Navigation Links - Mobile */}
            <div className="space-y-2">
              <Link
                href="/properties"
                className="block px-6 py-3 rounded-lg text-left hover:bg-slate-100 transition font-medium"
                onClick={() => setIsOpen(false)}
              >
                Propriétés
              </Link>
              <Link
                href="/about"
                className="block px-6 py-3 rounded-lg text-left hover:bg-slate-100 transition font-medium"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="block px-6 py-3 rounded-lg text-left hover:bg-slate-100 transition font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>
            
            <div className="border-t border-slate-200 pt-3"></div>
            
            {isAuth ? (
              <>
                {displayRole === 'owner' && (
                  <Link 
                    href="/dashboard/owner/properties/create"
                    className="block bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-6 py-3 rounded-full w-full font-semibold text-center text-white transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Créer annonce
                  </Link>
                )}
                <Link
                  href={
                    displayRole === 'owner'
                      ? '/dashboard/owner/profile'
                      : '/dashboard/client/profile'
                  }
                  className="block px-6 py-3 rounded-lg w-full text-left hover:bg-slate-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Profil
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block px-6 py-3 rounded-lg w-full text-left hover:bg-slate-100 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="block px-6 py-3 rounded-lg w-full text-center hover:bg-slate-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/register"
                  className="block bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-6 py-3 rounded-full w-full font-semibold text-center text-white transition"
                  onClick={() => setIsOpen(false)}
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
