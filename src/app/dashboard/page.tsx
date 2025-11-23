'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    // Redirige selon le rôle de l'utilisateur
    if (user?.role === 'owner') {
      router.push('/dashboard/owner/properties');
    } else if (user?.role === 'client') {
      router.push('/dashboard/client/reservations');
    } else {
      router.push('/');
    }
  }, [user, isAuthenticated, router]);
  return <></>;
}
