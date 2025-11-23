import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string, role: 'client' | 'owner') => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
  error: string | null;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),

      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

      initialize: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // Fetch user profile from Firestore
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const userData = docSnap.data() as User;
              set({
                user: { ...userData, id: firebaseUser.uid },
                token: await firebaseUser.getIdToken(),
                isAuthenticated: true,
              });
            }
          } else {
            set({ user: null, token: null, isAuthenticated: false });
          }
        });
      },

      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          // Use the API route instead of direct Firebase Auth
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Use the custom token to sign in with Firebase Auth
          const { getAuth, signInWithCustomToken } = await import('firebase/auth');
          const auth = getAuth();
          const userCredential = await signInWithCustomToken(auth, data.token);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed';
          if (
            error.message.includes('user-not-found') ||
            error.message.includes('wrong-password')
          ) {
            errorMessage = 'Email ou mot de passe incorrect.';
          } else if (error.message.includes('invalid-email')) {
            errorMessage = 'Email invalide.';
          } else {
            errorMessage = error.message || 'Une erreur est survenue.';
          }
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
            throw new Error('Tous les champs sont requis');
          }

          // Use the API route instead of direct Firebase Auth
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          // Use the custom token to sign in with Firebase Auth
          const { getAuth, signInWithCustomToken } = await import('firebase/auth');
          const auth = getAuth();
          await signInWithCustomToken(auth, data.token);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed';
          if (error.message.includes('email existe déjà')) {
            errorMessage = 'Cet email est déjà utilisé.';
          } else if (error.message.includes('mot de passe est trop faible')) {
            errorMessage = 'Le mot de passe est trop faible.';
          } else {
            errorMessage = error.message || 'Une erreur est survenue.';
          }
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('habitatsconnect_user');
          localStorage.removeItem('habitatsconnect_token');
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: false,
    }
  )
);
