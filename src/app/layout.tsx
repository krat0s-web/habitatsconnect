import type { Metadata } from 'next';
import { Navbar } from '@/components';
import { TransactionManager } from '@/components/TransactionManager';
import AuthInitializer from '@/components/AuthInitializer';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'HabitatsConnect - Plateforme Immobilière',
  description: 'Découvrez et réservez des propriétés uniques avec HabitatsConnect',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 h-screen overflow-hidden">
        <AuthInitializer />
        <TransactionManager />
        <Navbar />
        <main className="h-full overflow-y-auto">
          <ClientLayout>{children}</ClientLayout>
        </main>
      </body>
    </html>
  );
}
