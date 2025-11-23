'use client';
import { useState, useEffect } from 'react';
import {
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
  FaChartLine,
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  useEffect(() => {
    setMounted(true);
  }, []);
  // Menu pour les propriétaires
  const ownerMenuItems = [
    { href: '/dashboard/owner/analytics', label: 'Analyses', icon: FaChartLine },
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
    return (
      <div className="flex justify-center items-center bg-slate-50 h-screen">
        <div className="text-center">
          <div className="border-primary-600 mx-auto mb-4 border-4 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-stretch bg-slate-50 h-full overflow-hidden" suppressHydrationWarning>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          key={sidebarOpen ? 'open' : 'closed'}
          initial={{ width: sidebarOpen ? 256 : 80 }}
          animate={{ width: sidebarOpen ? 256 : 80 }}
          exit={{ width: sidebarOpen ? 256 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex flex-col bg-gradient-to-b from-primary-900 to-primary-800 shadow-xl rounded-r-2xl h-full overflow-hidden text-white"
        >
          {/* Logo */}
          <motion.div
            className="flex justify-between items-center p-4 border-primary-700 border-b rounded-tr-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <motion.div
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition cursor-pointer"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </motion.div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    className="font-bold text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    HabitatsConnect
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          {/* Menu */}
          <nav className="flex-1 space-y-2 p-4 h-full overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 border-l-4 border-accent-400 shadow-lg'
                        : 'hover:bg-white/10 hover:shadow-md'
                    }`}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                      <Icon className="flex-shrink-0 text-lg" />
                    </motion.div>
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          className="font-medium"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
          {/* Logout */}
          <motion.div
            className="p-4 border-primary-700 border-t rounded-br-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-3 hover:bg-red-500/20 hover:shadow-md px-4 py-3 rounded-xl w-full text-red-300 hover:text-red-200 transition-all duration-200"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSignOutAlt className="flex-shrink-0 text-lg" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    className="font-medium"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Déconnexion
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.aside>
      </AnimatePresence>
      {/* Main Content */}
      <main className="flex flex-col flex-1">
        {/* Top Bar */}
        <motion.div
          className="top-0 z-40 sticky bg-white shadow-lg px-8 py-4 border-slate-200 border-b rounded-tl-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <motion.h1
              className="font-bold text-slate-900 text-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {dashboardTitle}
            </motion.h1>
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <span className="text-slate-600 text-sm">{displayName}</span>
            </motion.div>
          </div>
        </motion.div>
        {/* Content */}
        <motion.div
          className="bg-slate-50 p-8 rounded-bl-2xl h-full overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
