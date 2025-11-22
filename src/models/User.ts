// User model has been migrated to Firebase Authentication + Firestore
// This file is kept for backwards compatibility but is no longer used

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'owner';
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default User;
