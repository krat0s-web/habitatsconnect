import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
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
                isAuthenticated: true
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
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Verify role and get user data from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error('User profile not found');
          }

          const userData = docSnap.data() as User;

          if (userData.role !== role) {
            await signOut(auth);
            throw new Error('Invalid role for this user');
          }

          const token = await firebaseUser.getIdToken();

          set({
            user: { ...userData, id: firebaseUser.uid },
            token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed';
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Email ou mot de passe incorrect.';
          } else if (error.code === 'auth/invalid-email') {
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
          if (!userData.email || !userData.password) {
            throw new Error('Email and password are required');
          }

          const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
          );
          const firebaseUser = userCredential.user;

          const newUser: User = {
            id: firebaseUser.uid,
            email: userData.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            role: userData.role || 'client',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save user profile to Firestore
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

          const token = await firebaseUser.getIdToken();

          set({
            user: newUser,
            token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Cet email est déjà utilisé.';
          } else if (error.code === 'auth/weak-password') {
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

