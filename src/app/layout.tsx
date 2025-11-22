import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components';
import { TransactionManager } from '@/components/TransactionManager';
import AuthInitializer from '@/components/AuthInitializer';
import './globals.css';

export const metadata: Metadata = {
  title: 'HabitatsConnect - Plateforme Immobilière',
  description:
    'Découvrez et réservez des propriétés uniques avec HabitatsConnect',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-slate-50 to-slate-100">
        <AuthInitializer />
        <TransactionManager />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
