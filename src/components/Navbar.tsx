'use client';
import { useState } from 'react';
import { FaHome, FaBars, FaTimes, FaUser, FaSignOutAlt, FaPlus, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface NavbarProps {
  userRole?: 'client' | 'owner' | 'admin';
  userName?: string;
}
export const Navbar: React.FC<NavbarProps> = ({ userRole, userName }) => {
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
              <Input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent shadow-none px-0 border-0 focus-visible:ring-0 w-40 h-6"
              />
            </div>
            {isAuth ? (
              <>
                {displayRole === 'owner' && (
                  <Button variant="gradient" size="default" className="rounded-full" asChild>
                    <Link href="/dashboard/owner/properties/create">
                      <FaPlus className="mr-2" /> Créer annonce
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 text-sm">{displayName}</span>
                  <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link
                      href={
                        displayRole === 'owner'
                          ? '/dashboard/owner/profile'
                          : '/dashboard/client/profile'
                      }
                    >
                      <FaUser className="text-primary-600" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="text-secondary-600" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="default" className="rounded-full" asChild>
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button variant="gradient" size="default" className="rounded-full" asChild>
                  <Link href="/auth/register">Inscription</Link>
                </Button>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={toggleMenu}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </Button>
        </div>
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden space-y-3 pb-6">
            <div className="flex items-center bg-slate-100 px-4 py-2 rounded-full">
              <FaSearch className="mr-2 text-slate-500" />
              <Input
                type="text"
                placeholder="Rechercher..."
                className="flex-1 bg-transparent shadow-none px-0 border-0 focus-visible:ring-0 h-6"
              />
            </div>
            {isAuth ? (
              <>
                {displayRole === 'owner' && (
                  <Button variant="gradient" className="rounded-full w-full" asChild>
                    <Link href="/dashboard/owner/properties/create">Créer annonce</Link>
                  </Button>
                )}
                <Button variant="ghost" className="justify-start w-full" asChild>
                  <Link
                    href={
                      displayRole === 'owner'
                        ? '/dashboard/owner/profile'
                        : '/dashboard/client/profile'
                    }
                  >
                    Profil
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button variant="gradient" className="rounded-full w-full" asChild>
                  <Link href="/auth/register">Inscription</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
