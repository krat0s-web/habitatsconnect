import { create } from 'zustand';
import type { Property } from '@/types';
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

interface PropertyStore {
  properties: Property[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  loadProperties: () => Promise<Property[]>;
  loadOwnerProperties: (ownerId: string) => Promise<void>;
  subscribeToProperties: (ownerId?: string) => void;
  unsubscribeFromProperties: () => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  loading: false,
  error: null,
  unsubscribe: null,

  setProperties: (properties) => set({ properties }),

  addProperty: async (property) => {
    try {
      const propertiesRef = collection(db, 'properties');
      const docRef = await addDoc(propertiesRef, {
        ...property,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        properties: [...state.properties, { ...property, id: docRef.id }],
      }));
    } catch (error: any) {
      console.error('Error adding property:', error);
      set({ error: error.message });
      throw error;
    }
  },

  updateProperty: async (id, updatedData) => {
    try {
      const propertyRef = doc(db, 'properties', id);
      await updateDoc(propertyRef, {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        properties: state.properties.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
      }));
    } catch (error: any) {
      console.error('Error updating property:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteProperty: async (id) => {
    try {
      const propertyRef = doc(db, 'properties', id);
      await deleteDoc(propertyRef);

      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting property:', error);
      set({ error: error.message });
      throw error;
    }
  },

  getPropertyById: (id) => {
    return get().properties.find((p) => p.id === id);
  },

  loadProperties: async () => {
    set({ loading: true, error: null });
    try {
      const propertiesRef = collection(db, 'properties');
      const querySnapshot = await getDocs(propertiesRef);

      const properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() } as Property);
      });

      set({ properties, loading: false });
      return properties;
    } catch (error: any) {
      console.error('Error loading properties from Firebase, trying localStorage:', error);
      
      // Fallback to localStorage
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('properties');
          if (stored) {
            const properties = JSON.parse(stored);
            set({ properties, loading: false, error: null });
            return properties;
          }
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
      
      set({ error: error.message, loading: false, properties: [] });
      return [];
    }
  },

  loadOwnerProperties: async (ownerId: string) => {
    set({ loading: true, error: null });
    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);

      const properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() } as Property);
      });

      set({ properties, loading: false });
    } catch (error: any) {
      console.error('Error loading owner properties:', error);
      set({ error: error.message, loading: false });
    }
  },

  subscribeToProperties: (ownerId?: string) => {
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const propertiesRef = collection(db, 'properties');
    const q = ownerId ? query(propertiesRef, where('ownerId', '==', ownerId)) : propertiesRef;

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const properties: Property[] = [];
        
        // Load all properties with enriched owner data
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          
          // Fetch owner data
          let ownerData = null;
          if (data.ownerId) {
            try {
              const ownerDoc = await getDoc(doc(db, 'users', data.ownerId));
              if (ownerDoc.exists()) {
                const owner = ownerDoc.data();
                ownerData = {
                  id: ownerDoc.id,
                  email: owner.email,
                  firstName: owner.firstName,
                  lastName: owner.lastName,
                  role: owner.role,
                };
              }
            } catch (error) {
              console.error('Error fetching owner:', error);
            }
          }
          
          properties.push({
            id: docSnapshot.id,
            ...data,
            owner: ownerData,
          } as Property);
        }
        
        set({ properties, loading: false });
      },
      (error) => {
        console.error('Error in properties subscription:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  unsubscribeFromProperties: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
