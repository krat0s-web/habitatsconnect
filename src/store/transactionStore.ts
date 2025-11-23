import { create } from 'zustand';
import type { Transaction } from '@/types';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;
  addTransaction: (transaction: Transaction) => Promise<void>;
  getTransactionsByOwnerId: (ownerId: string) => Transaction[];
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: (ownerId: string) => Promise<void>;
  subscribeToTransactions: (ownerId: string) => void;
  unsubscribeFromTransactions: () => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  unsubscribe: null,

  addTransaction: async (transaction) => {
    try {
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        ...transaction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Removed local add to prevent duplicates - subscription will update
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      set({ error: error.message });
      throw error;
    }
  },

  getTransactionsByOwnerId: (ownerId) => {
    const { transactions } = get();
    return transactions.filter((t) => t.ownerId === ownerId);
  },

  updateTransaction: async (id, updates) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await deleteDoc(transactionRef);

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      set({ error: error.message });
      throw error;
    }
  },

  loadTransactions: async (ownerId: string) => {
    if (!ownerId) {
      console.warn('No owner ID provided for loading transactions');
      return;
    }

    set({ loading: true, error: null });
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);

      const transactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : (data.date instanceof Date ? data.date : new Date(data.date)),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt)),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)),
        } as Transaction);
      });

      set({ transactions, loading: false });
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      set({ error: error.message, loading: false });
    }
  },

  subscribeToTransactions: (ownerId: string) => {
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('ownerId', '==', ownerId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const transactions: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          transactions.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : (data.date instanceof Date ? data.date : new Date(data.date)),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt)),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)),
          } as Transaction);
        });
        set({ transactions, loading: false });
      },
      (error) => {
        console.error('Error in transactions subscription:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  unsubscribeFromTransactions: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  clearError: () => set({ error: null }),
}));
