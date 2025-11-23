'use client';

import PageTransition from '@/components/PageTransition';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <PageTransition>{children}</PageTransition>;
}
