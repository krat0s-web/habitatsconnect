# Firebase Migration for Owner Dashboard

## Overview

This document describes the migration from localStorage to Firebase Firestore for owner dashboard data management (properties, reservations, transactions).

## Changes Made

### 1. Updated Store: `propertyStore.ts`

Migrated property management from localStorage to Firebase:

- **Collection**: `properties`
- **Features**:
  - Real-time subscription to properties
  - CRUD operations (Create, Read, Update, Delete)
  - Filter by owner ID
  - Automatic timestamps

### 2. Updated Store: `transactionStore.ts`

Migrated transaction management from localStorage to Firebase:

- **Collection**: `transactions`
- **Features**:
  - Real-time subscription to transactions
  - CRUD operations
  - Filter by owner ID
  - Automatic date conversion

### 3. Updated Store: `reservationStore.ts`

Enhanced reservation store with owner-specific features:

- **Collection**: `reservations`
- **Features**:
  - Subscribe to all reservations (filter by property owner client-side)
  - Update reservation status (confirm/reject)
  - Real-time synchronization

### 4. Updated Pages

#### `/dashboard/owner/properties`

- ✅ Replaced localStorage with `usePropertyStore`
- ✅ Real-time updates when properties change
- ✅ Delete and update operations through Firebase
- ✅ Multi-device synchronization

#### `/dashboard/owner/reservations`

- ✅ Uses `useReservationStore` with real-time subscriptions
- ✅ Filter reservations by property ownership
- ✅ Confirm/reject through Firebase updates
- ✅ Real-time status changes

#### `/dashboard/owner/treasury`

- ✅ Uses `useTransactionStore` with real-time subscriptions
- ✅ Filters transactions by owner ID
- ✅ Automatic calculations (income, expenses, balance)
- ✅ Real-time synchronization

### 5. Updated Firestore Rules

Enhanced security rules:

```javascript
// Properties collection
match /properties/{propertyId} {
  allow read: if true; // Public read
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
  allow delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
}

// Reservations collection
match /reservations/{reservationId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if isAuthenticated();
  allow delete: if isAuthenticated();
}

// Transactions collection
match /transactions/{transactionId} {
  allow read: if isAuthenticated() && (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
  allow create: if isAuthenticated();
  allow update: if false; // Immutable
  allow delete: if false;
}
```

## Benefits

### 1. **Real-time Synchronization**

- Properties, reservations, and transactions update instantly
- No manual refresh needed
- Changes reflected across all devices

### 2. **Data Persistence**

- Cloud storage instead of browser localStorage
- Access data from any device
- No data loss on browser cache clear

### 3. **Better Security**

- Firestore security rules protect owner data
- Only owners can modify their properties
- Transactions are immutable

### 4. **Scalability**

- No localStorage size limits
- Better performance for large datasets
- Efficient querying

### 5. **Multi-device Support**

- Manage properties on desktop, view on tablet
- Consistent experience across devices

## Data Structure

### Properties Collection

```
properties/{propertyId}
  - id: string (auto-generated)
  - title: string
  - description: string
  - location: string
  - price: number
  - bedrooms: number
  - bathrooms: number
  - isAvailable: boolean
  - ownerId: string
  - images: array
  - amenities: array
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Transactions Collection

```
transactions/{transactionId}
  - id: string (auto-generated)
  - ownerId: string
  - type: 'income' | 'expense'
  - amount: number
  - description: string
  - status: 'pending' | 'completed' | 'cancelled'
  - date: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Reservations Collection

```
reservations/{reservationId}
  - id: string (auto-generated)
  - clientId: string
  - propertyId: string
  - ownerId: string
  - checkIn: timestamp
  - checkOut: timestamp
  - guests: number
  - totalPrice: number
  - depositAmount: number
  - status: 'pending' | 'confirmed' | 'rejected' | 'completed'
  - property: object (denormalized)
  - client: object (denormalized)
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Usage Examples

### Creating a Property

```typescript
import { usePropertyStore } from '@/store';

const { addProperty } = usePropertyStore();

await addProperty({
  title: 'Beautiful Villa',
  location: 'Paris',
  price: 150,
  ownerId: user.id,
  // ... other fields
});
```

### Subscribing to Properties

```typescript
useEffect(() => {
  if (user?.id) {
    subscribeToProperties(user.id);
  }
  return () => {
    unsubscribeFromProperties();
  };
}, [user?.id]);
```

### Updating Property Status

```typescript
await updateProperty(propertyId, { isAvailable: true });
```

### Confirming a Reservation

```typescript
const { confirmReservation } = useReservationStore();
await confirmReservation(reservationId);
```

### Subscribing to Transactions

```typescript
useEffect(() => {
  if (user?.id) {
    subscribeToTransactions(user.id);
  }
  return () => {
    unsubscribeFromTransactions();
  };
}, [user?.id]);
```

## Migration Notes

### For Existing Owners

- Old localStorage data will not be automatically migrated
- Owners will need to re-create properties
- Previous transactions in localStorage will not appear

### To Implement Data Migration (Optional)

```typescript
// Migration script for owner data
const migrateOwnerData = async (ownerId: string) => {
  // Migrate properties
  const storedProperties = localStorage.getItem('habitatsconnect_properties');
  if (storedProperties) {
    const properties = JSON.parse(storedProperties).filter((p) => p.ownerId === ownerId);
    for (const property of properties) {
      await addProperty(property);
    }
    localStorage.removeItem('habitatsconnect_properties');
  }

  // Migrate transactions
  const storedTransactions = localStorage.getItem('habitatsconnect_transactions');
  if (storedTransactions) {
    const transactions = JSON.parse(storedTransactions).filter((t) => t.ownerId === ownerId);
    for (const transaction of transactions) {
      await addTransaction(transaction);
    }
    localStorage.removeItem('habitatsconnect_transactions');
  }
};
```

## Testing Checklist

- [ ] Test creating/editing/deleting properties
- [ ] Test property status toggle (available/unavailable)
- [ ] Test properties sync across tabs
- [ ] Test reservation confirmation/rejection
- [ ] Test reservations real-time updates
- [ ] Test transaction loading and filtering
- [ ] Test transactions sync across devices
- [ ] Test offline behavior
- [ ] Test authentication edge cases
- [ ] Verify Firestore rules
- [ ] Deploy updated rules: `firebase deploy --only firestore:rules`

## Deployment Steps

1. **Deploy Firestore Rules**

   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Application**

   ```bash
   npm run build
   npm run deploy
   ```

3. **Monitor Firestore Usage**
   - Check Firebase Console for read/write operations
   - Monitor quota usage
   - Set up billing alerts

## Performance Considerations

### Indexes

You may need to create composite indexes for complex queries:

```
properties:
  - ownerId (ASC), createdAt (DESC)
  - ownerId (ASC), isAvailable (ASC)

transactions:
  - ownerId (ASC), type (ASC), status (ASC)
  - ownerId (ASC), date (DESC)

reservations:
  - property.ownerId (ASC), status (ASC)
  - clientId (ASC), status (ASC)
```

Firebase will prompt you to create these indexes when needed.

### Optimization Tips

1. **Unsubscribe**: Always clean up subscriptions on unmount
2. **Filtering**: Do complex filtering client-side when possible
3. **Pagination**: Implement pagination for large datasets
4. **Caching**: Use React Query or similar for better caching

## Next Steps

Consider implementing:

1. **Optimistic Updates**: Update UI immediately, sync in background
2. **Offline Support**: Cache data for offline access with Firestore offline persistence
3. **Batch Operations**: Use Firestore batch writes for multiple updates
4. **Analytics**: Track property views, booking rates
5. **Performance Monitoring**: Monitor query performance and optimization opportunities
6. **Image Upload**: Integrate Firebase Storage for property images
7. **Search**: Implement Algolia or similar for advanced property search

## Troubleshooting

### Common Issues

**Issue**: "Missing or insufficient permissions"

- **Solution**: Check Firestore rules, ensure user is authenticated

**Issue**: Properties not showing up

- **Solution**: Verify ownerId matches user.id, check console for errors

**Issue**: Real-time updates not working

- **Solution**: Ensure subscription is active, check unsubscribe logic

**Issue**: Slow performance

- **Solution**: Create necessary indexes, optimize queries, implement pagination

## Support

For issues or questions:

1. Check Firebase Console logs
2. Review Firestore rules
3. Test authentication flow
4. Verify network connectivity
5. Check browser console for errors
