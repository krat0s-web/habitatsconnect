import { create } from 'zustand';
import type { Reservation } from '@/types';
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
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ReservationStore {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => Promise<void>;
  updateReservation: (id: string, reservation: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  confirmReservation: (id: string) => Promise<Reservation | null>;
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByProperty: (propertyId: string) => Reservation[];
  getReservationsByClient: (clientId: string) => Reservation[];
  loadReservations: () => Promise<void>;
  loadClientReservations: (clientId: string) => Promise<void>;
  subscribeToReservations: (userId?: string) => void;
  unsubscribeFromReservations: () => void;
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservations: [],
  loading: false,
  error: null,
  unsubscribe: null,

  setReservations: (reservations) => set({ reservations }),

  addReservation: async (reservation) => {
    try {
      const reservationsRef = collection(db, 'reservations');
      const docRef = await addDoc(reservationsRef, {
        ...reservation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        reservations: [...state.reservations, { ...reservation, id: docRef.id }],
      }));
    } catch (error: any) {
      console.error('Error adding reservation:', error);
      set({ error: error.message });
      throw error;
    }
  },

  updateReservation: async (id, updatedData) => {
    try {
      const reservationRef = doc(db, 'reservations', id);
      await updateDoc(reservationRef, {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? { ...r, ...updatedData } : r)),
      }));
    } catch (error: any) {
      console.error('Error updating reservation:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteReservation: async (id) => {
    try {
      const reservationRef = doc(db, 'reservations', id);
      await deleteDoc(reservationRef);

      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      set({ error: error.message });
      throw error;
    }
  },

  getReservationById: (id) => {
    return get().reservations.find((r) => r.id === id);
  },

  getReservationsByProperty: (propertyId) => {
    return get().reservations.filter((r) => r.propertyId === propertyId);
  },

  getReservationsByClient: (clientId) => {
    return get().reservations.filter((r) => r.clientId === clientId);
  },

  confirmReservation: async (id) => {
    try {
      await get().updateReservation(id, { status: 'confirmed' });
      return get().getReservationById(id) || null;
    } catch (error) {
      console.error('Error confirming reservation:', error);
      return null;
    }
  },

  loadReservations: async () => {
    set({ loading: true, error: null });
    try {
      const reservationsRef = collection(db, 'reservations');
      const querySnapshot = await getDocs(reservationsRef);

      const reservations: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reservations.push({
          id: doc.id,
          ...data,
          checkIn: data.checkIn instanceof Date ? data.checkIn : new Date(data.checkIn),
          checkOut: data.checkOut instanceof Date ? data.checkOut : new Date(data.checkOut),
          createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
        } as Reservation);
      });

      set({ reservations, loading: false });
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      set({ error: error.message, loading: false });
    }
  },

  loadClientReservations: async (clientId: string) => {
    set({ loading: true, error: null });
    try {
      const reservationsRef = collection(db, 'reservations');
      const q = query(reservationsRef, where('clientId', '==', clientId));
      const querySnapshot = await getDocs(q);

      const reservations: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reservations.push({
          id: doc.id,
          ...data,
          checkIn: data.checkIn instanceof Date ? data.checkIn : new Date(data.checkIn),
          checkOut: data.checkOut instanceof Date ? data.checkOut : new Date(data.checkOut),
          createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
        } as Reservation);
      });

      set({ reservations, loading: false });
    } catch (error: any) {
      console.error('Error loading client reservations:', error);
      set({ error: error.message, loading: false });
    }
  },

  subscribeToReservations: (userId?: string) => {
    // Unsubscribe from previous subscription
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const reservationsRef = collection(db, 'reservations');
    const q = userId ? query(reservationsRef, where('clientId', '==', userId)) : reservationsRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservations: Reservation[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          reservations.push({
            id: doc.id,
            ...data,
            checkIn: data.checkIn instanceof Date ? data.checkIn : new Date(data.checkIn),
            checkOut: data.checkOut instanceof Date ? data.checkOut : new Date(data.checkOut),
            createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
          } as Reservation);
        });
        set({ reservations, loading: false });
      },
      (error) => {
        console.error('Error in reservations subscription:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  unsubscribeFromReservations: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
