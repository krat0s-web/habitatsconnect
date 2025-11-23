import type { Metadata } from 'next';
import { Navbar } from '@/components';
import { TransactionManager } from '@/components/TransactionManager';
import { ScrollToTop } from '@/components/ScrollToTop';
import AuthInitializer from '@/components/AuthInitializer';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'HabitatsConnect - Plateforme Immobilière',
  description: 'Découvrez et réservez des propriétés uniques avec HabitatsConnect',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#5a7a64',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HabitatsConnect',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        <AuthInitializer />
        <TransactionManager />
        <Navbar />
        <main className="flex-1">
          <ClientLayout>{children}</ClientLayout>
        </main>
        <ScrollToTop />
      </body>
    </html>
  );
}
