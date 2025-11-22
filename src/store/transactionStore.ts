import { create } from 'zustand';
import type { Transaction } from '@/types';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (transaction: Transaction) => void;
  getTransactionsByOwnerId: (ownerId: string) => Transaction[];
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  loadTransactions: (ownerId: string) => Promise<void>;
  saveTransactions: () => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

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

  loadTransactions: async (ownerId: string) => {
    if (!ownerId) {
      console.warn('No owner ID provided for loading transactions');
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/transactions?ownerId=${ownerId}`);
      
      if (response.ok) {
        const data = await response.json();
        const transactions = (data.transactions || []).map((t: any) => ({
          ...t,
          id: t.id || t._id,
          createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
        }));
        set({ transactions, loading: false });
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      set({ error: error.message || 'Failed to load transactions', loading: false });
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('habitatsconnect_transactions');
          if (stored) {
            const transactions = JSON.parse(stored).map((t: any) => ({
              ...t,
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
            }));
            set({ transactions, loading: false });
          }
        } catch (e) {
          console.error('Fallback error:', e);
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

  clearError: () => set({ error: null }),
}));
