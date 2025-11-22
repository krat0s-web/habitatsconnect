import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Property } from '@/types';

interface PropertyStore {
  properties: Property[];
  loading: boolean;
  error: string | null;
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getPropertyById: (id: string) => Property | undefined;
  loadProperties: () => Promise<Property[]>;
}

export const usePropertyStore = create<PropertyStore>()(persist(
  (set, get) => ({
    properties: [],
    loading: false,
    error: null,

    setProperties: (properties) => set({ properties }),

    addProperty: (property) =>
      set((state) => {
        const updated = [...state.properties, property];
        if (typeof window !== 'undefined') {
          localStorage.setItem('habitatsconnect_properties', JSON.stringify(updated));
        }
        return { properties: updated };
      }),

    updateProperty: (id, updatedData) =>
      set((state) => {
        const updated = state.properties.map((p) =>
          p.id === id ? { ...p, ...updatedData } : p
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('habitatsconnect_properties', JSON.stringify(updated));
        }
        return { properties: updated };
      }),

    deleteProperty: (id) =>
      set((state) => {
        const updated = state.properties.filter((p) => p.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('habitatsconnect_properties', JSON.stringify(updated));
        }
        return { properties: updated };
      }),

    getPropertyById: (id) => {
      return get().properties.find((p) => p.id === id);
    },

    loadProperties: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          set({ properties: data.properties || [], loading: false });
          return data.properties || [];
        } else {
          throw new Error('Failed to load properties');
        }
      } catch (error: any) {
        console.error('Error loading properties:', error);
        set({ error: error.message, loading: false });
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('habitatsconnect_properties');
            if (stored) {
              const properties = JSON.parse(stored);
              set({ properties });
              return properties;
            }
          } catch (e) {
            console.error('Fallback error:', e);
          }
        }
        return [];
      }
    },
  }),
  {
    name: 'property-storage',
    skipHydration: false,
  }
));
