'use client';

import { useState, useEffect } from 'react';
import {
  FaHome,
  FaBars,
  FaTimes,
  FaBuilding,
  FaUser,
  FaWallet,
  FaComments,
  FaSignOutAlt,
  FaHeart,
  FaLock,
  FaCalendarAlt,
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Menu pour les propriétaires
  const ownerMenuItems = [
    { href: '/dashboard/owner/properties', label: 'Mes Annonces', icon: FaBuilding },
    { href: '/dashboard/owner/reservations', label: 'Réservations', icon: FaCalendarAlt },
    { href: '/dashboard/owner/profile', label: 'Mon Profil', icon: FaUser },
    { href: '/dashboard/owner/treasury', label: 'Trésorerie', icon: FaWallet },
    { href: '/dashboard/owner/chat', label: 'Chat', icon: FaComments },
  ];

  // Menu pour les clients
  const clientMenuItems = [
    { href: '/dashboard/client/reservations', label: 'Mes Réservations', icon: FaCalendarAlt },
    { href: '/dashboard/client/favorites', label: 'Annonces Favoris', icon: FaHeart },
    { href: '/dashboard/client/deposits', label: 'Dépôts de Garantie', icon: FaLock },
    { href: '/dashboard/client/profile', label: 'Mon Profil', icon: FaUser },
    { href: '/dashboard/client/chat', label: 'Messages', icon: FaComments },
  ];

  const menuItems = user?.role === 'owner' ? ownerMenuItems : clientMenuItems;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
  const dashboardTitle = user?.role === 'owner' ? 'Dashboard Propriétaire' : 'Mon Dashboard';

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-900 to-primary-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-primary-700 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-white/20 p-2 rounded-lg">
              <FaHome className="text-xl" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg">HabitatsConnect</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-white/20 border-l-4 border-accent-400'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="text-lg flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-primary-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition text-red-300"
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-4 top-24 bg-primary-700 p-2 rounded-full hover:bg-primary-600 transition"
        >
          {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm sticky top-0 z-40">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">
              {dashboardTitle}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{displayName}</span>
              <div className="w-10 h-10 bg-gradient-fluid rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
