import { create } from 'zustand';
import type { Transaction } from '@/types';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  getTransactionsByOwnerId: (ownerId: string) => Transaction[];
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  loadTransactions: () => void;
  saveTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  addTransaction: (transaction) => {
    set((state) => {
      const newTransactions = [...state.transactions, transaction];
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'habitatsconnect_transactions',
          JSON.stringify(newTransactions)
        );
      }
      return { transactions: newTransactions };
    });
  },

  getTransactionsByOwnerId: (ownerId) => {
    const { transactions } = get();
    return transactions.filter((t) => t.ownerId === ownerId);
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const newTransactions = state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'habitatsconnect_transactions',
          JSON.stringify(newTransactions)
        );
      }
      return { transactions: newTransactions };
    });
  },

  deleteTransaction: (id) => {
    set((state) => {
      const newTransactions = state.transactions.filter((t) => t.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'habitatsconnect_transactions',
          JSON.stringify(newTransactions)
        );
      }
      return { transactions: newTransactions };
    });
  },

  loadTransactions: async () => {
    try {
      const authStore = localStorage.getItem('auth-storage');
      let currentUserId = '';
      
      if (authStore) {
        try {
          const { state } = JSON.parse(authStore);
          currentUserId = state.user?.id || '';
        } catch (e) {
          console.error('Error parsing auth store:', e);
        }
      }

      if (!currentUserId) {
        console.warn('No user ID found for loading transactions');
        return;
      }

      const response = await fetch(`/api/transactions?ownerId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        const transactions = (data.transactions || []).map((t: any) => ({
          ...t,
          id: t._id || t.id,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        set({ transactions });
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('habitatsconnect_transactions');
        if (stored) {
          try {
            const transactions = JSON.parse(stored).map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt),
            }));
            set({ transactions });
          } catch (e) {
            console.error('Fallback error:', e);
          }
        }
      }
    }
  },

  saveTransactions: () => {
    const { transactions } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'habitatsconnect_transactions',
        JSON.stringify(transactions)
      );
    }
  },
}));
