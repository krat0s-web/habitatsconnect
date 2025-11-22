import { create } from 'zustand';
import type { Reservation } from '@/types';

interface ReservationStore {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  confirmReservation: (id: string) => Promise<Reservation | null>;
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByProperty: (propertyId: string) => Reservation[];
  getReservationsByClient: (clientId: string) => Reservation[];
  loadReservations: () => Promise<void>;
  saveReservations: () => void;
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservations: [],
  loading: false,
  error: null,

  setReservations: (reservations) => set({ reservations }),

  addReservation: (reservation) =>
    set((state) => ({ reservations: [...state.reservations, reservation] })),

  updateReservation: (id, updatedData) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...updatedData } : r
      ),
    })),

  deleteReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),

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
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm reservation');
      }

      const data = await response.json();
      const reservation = {
        ...data.reservation,
        checkIn: new Date(data.reservation.checkIn),
        checkOut: new Date(data.reservation.checkOut),
        createdAt: new Date(data.reservation.createdAt),
        updatedAt: new Date(data.reservation.updatedAt),
      };

      // Update in state
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.id === id ? reservation : r
        ),
      }));

      return reservation;
    } catch (error) {
      console.error('Error confirming reservation:', error);
      return null;
    }
  },

  loadReservations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/reservations');
      if (response.ok) {
        const data = await response.json();
        const reservations = (data.reservations || []).map((r: any) => ({
          ...r,
          checkIn: new Date(r.checkIn),
          checkOut: new Date(r.checkOut),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
        set({ reservations, loading: false });
      } else {
        throw new Error('Failed to load reservations');
      }
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      set({ error: error.message, loading: false });
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('habitatsconnect_reservations');
        if (stored) {
          try {
            const reservations = JSON.parse(stored).map((r: any) => ({
              ...r,
              checkIn: new Date(r.checkIn),
              checkOut: new Date(r.checkOut),
              createdAt: new Date(r.createdAt),
              updatedAt: new Date(r.updatedAt),
            }));
            set({ reservations });
          } catch (e) {
            console.error('Fallback error:', e);
          }
        }
      }
    }
  },

  saveReservations: () => {
    const { reservations } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'habitatsconnect_reservations',
        JSON.stringify(reservations)
      );
    }
  },
}));
