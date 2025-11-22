// User Types
export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  phone?: string;
  role: 'client' | 'owner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Property Types
export type PropertyType = 'villa' | 'apartment' | 'garage' | 'studio';

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: PropertyImage[];
  owner: User;
  ownerId: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Reservation Types
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  propertyId: string;
  property?: Property;
  clientId: string;
  client?: User;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  depositAmount: number; // Dépôt de garantie
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  propertyId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Transaction {
  id: string;
  ownerId: string;
  reservationId?: string;
  date: Date;
  description: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export type MessageSender = 'owner' | 'client';

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  senderIds: string;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  ownerId: string;
  clientId: string;
  clientName: string;
  ownerName?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

