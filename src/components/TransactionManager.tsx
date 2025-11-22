'use client';

import { useEffect } from 'react';
import { useTransactionStore } from '@/store';
import type { TransactionStatus } from '@/types';

/**
 * Composant qui gère automatiquement la conversion des transactions "pending" 
 * en "completed" après la date de checkout
 */
export const TransactionManager: React.FC = () => {
  const { transactions, updateTransaction, loadTransactions } = useTransactionStore();

  useEffect(() => {
    // Charger les transactions
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    // Vérifier toutes les transactions chaque minute
    const interval = setInterval(() => {
      const now = new Date();

      transactions.forEach((transaction) => {
        // Si la transaction est en attente et sa date est passée
        if (
          transaction.status === 'pending' &&
          new Date(transaction.date) <= now
        ) {
          // Convertir en "completed"
          updateTransaction(transaction.id, { 
            status: 'completed' as TransactionStatus 
          });
        }
      });
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [transactions, updateTransaction]);

  // Ce composant ne rend rien, il gère juste la logique
  return null;
};
