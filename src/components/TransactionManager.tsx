'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { usePropertyStore } from '@/store/propertyStore';
import { useReservationStore } from '@/store/reservationStore';
import type { TransactionStatus } from '@/types';

/**
 * Composant qui gère automatiquement :
 * 1. Le chargement des transactions pour les propriétaires
 * 2. La conversion des transactions "pending" en "completed"
 * 3. Le chargement des propriétés et réservations
 */
export const TransactionManager: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const transactions = useTransactionStore((state) => state.transactions);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const loadTransactions = useTransactionStore((state) => state.loadTransactions);
  const loadProperties = usePropertyStore((state) => state.loadProperties);
  const loadReservations = useReservationStore((state) => state.loadReservations);
  const [mounted, setMounted] = useState(false);

  // Chargement initial une fois le composant monté
  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger les transactions pour le propriétaire connecté
  useEffect(() => {
    if (!mounted || !user?.id) return;

    if (user.role === 'owner') {
      loadTransactions(user.id).catch((error) => {
        console.error('Failed to load transactions:', error);
      });
    }
  }, [mounted, user?.id, user?.role, loadTransactions]);

  // Charger les propriétés et réservations
  useEffect(() => {
    if (!mounted) return;

    loadProperties().catch((error) => {
      console.error('Failed to load properties:', error);
    });

    loadReservations().catch((error) => {
      console.error('Failed to load reservations:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Vérifier et mettre à jour les transactions pending
  useEffect(() => {
    if (!mounted || transactions.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();

      transactions.forEach((transaction) => {
        if (
          transaction.status === 'pending' &&
          transaction.date &&
          new Date(transaction.date) <= now
        ) {
          updateTransaction(transaction.id, { 
            status: 'completed' as TransactionStatus 
          });
        }
      });
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [mounted, transactions, updateTransaction]);

  return null;
};

