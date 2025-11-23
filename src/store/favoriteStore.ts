import { create } from 'zustand';
import type { Property } from '@/types';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FavoriteStore {
  favorites: Property[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  loadFavorites: (userId: string) => Promise<void>;
  addFavorite: (userId: string, property: Property) => Promise<void>;
  removeFavorite: (userId: string, propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  subscribeToFavorites: (userId: string) => void;
  unsubscribeFromFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  unsubscribe: null,

  loadFavorites: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      const querySnapshot = await getDocs(favoritesRef);

      const favorites: Property[] = [];
      querySnapshot.forEach((doc) => {
        favorites.push({ id: doc.id, ...doc.data() } as Property);
      });

      set({ favorites, loading: false });
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      set({ error: error.message, loading: false });
    }
  },

  addFavorite: async (userId: string, property: Property) => {
    try {
      const favoriteRef = doc(db, 'users', userId, 'favorites', property.id);
      await setDoc(favoriteRef, {
        ...property,
        addedAt: new Date().toISOString(),
      });

      set((state) => ({
        favorites: [...state.favorites, property],
      }));
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      set({ error: error.message });
      throw error;
    }
  },

  removeFavorite: async (userId: string, propertyId: string) => {
    try {
      const favoriteRef = doc(db, 'users', userId, 'favorites', propertyId);
      await deleteDoc(favoriteRef);

      set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== propertyId),
      }));
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      set({ error: error.message });
      throw error;
    }
  },

  isFavorite: (propertyId: string) => {
    return get().favorites.some((f) => f.id === propertyId);
  },

  subscribeToFavorites: (userId: string) => {
    // Unsubscribe from previous subscription
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const unsubscribe = onSnapshot(
      favoritesRef,
      async (snapshot) => {
        const favorites: Property[] = [];
        
        // Load all favorites with enriched owner data
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          
          // Fetch owner data if not already present
          let ownerData = data.owner || null;
          if (!ownerData && data.ownerId) {
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
              console.error('Error fetching owner for favorite:', error);
            }
          }
          
          favorites.push({
            id: docSnapshot.id,
            ...data,
            owner: ownerData,
          } as Property);
        }
        
        set({ favorites, loading: false });
      },
      (error) => {
        console.error('Error in favorites subscription:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  unsubscribeFromFavorites: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
