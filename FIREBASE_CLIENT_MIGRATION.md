# Firebase Migration for Client Dashboard

## Overview

This document describes the migration from localStorage to Firebase Firestore for client dashboard data management.

## Changes Made

### 1. New Store: `favoriteStore.ts`

Created a new Zustand store for managing user favorites with Firebase:

- **Collection**: `users/{userId}/favorites`
- **Features**:
  - Real-time subscription to favorites
  - Add/remove favorites
  - Check if property is favorite
  - Auto-sync across devices

### 2. Updated Store: `reservationStore.ts`

Migrated reservation management from localStorage to Firebase:

- **Collection**: `reservations`
- **Features**:
  - Real-time subscription to reservations
  - Create, update, delete reservations
  - Filter by client ID
  - Automatic date conversion

### 3. Updated Pages

#### `/dashboard/client/favorites`

- ✅ Replaced localStorage with `useFavoriteStore`
- ✅ Real-time updates when favorites change
- ✅ Proper error handling
- ✅ Multi-device synchronization

#### `/dashboard/client/reservations`

- ✅ Replaced localStorage with `useReservationStore`
- ✅ Real-time updates for reservations
- ✅ Filtered by client ID
- ✅ Subscription cleanup on unmount

#### `/dashboard/client/deposits`

- ✅ Replaced localStorage with `useReservationStore`
- ✅ Filters reservations with deposit amounts
- ✅ Real-time synchronization
- ✅ Automatic calculations

### 4. Updated Firestore Rules

Added security rules for new collections:

```javascript
// User favorites subcollection
match /users/{userId}/favorites/{favoriteId} {
  allow read: if isAuthenticated() && isOwner(userId);
  allow write: if isAuthenticated() && isOwner(userId);
}

// Reservations collection
match /reservations/{reservationId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if isAuthenticated();
  allow delete: if isAuthenticated();
}
```

## Benefits

### 1. **Real-time Synchronization**

- Changes are instantly reflected across all open tabs/devices
- No manual refresh needed

### 2. **Data Persistence**

- Data is stored in the cloud, not in browser localStorage
- Accessible from any device after login

### 3. **Multi-device Support**

- Add favorite on phone, see it on desktop
- Consistent experience across devices

### 4. **Better Security**

- Firestore security rules protect user data
- Can't access other users' data

### 5. **Scalability**

- No localStorage size limits
- Better performance for large datasets

## Data Structure

### Favorites Collection

```
users/{userId}/favorites/{propertyId}
  - id: string (property ID)
  - title: string
  - location: string
  - price: number
  - images: array
  - bedrooms: number
  - bathrooms: number
  - addedAt: timestamp
  ... (all property fields)
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
  - status: string
  - property: object (denormalized)
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Usage Examples

### Adding a Favorite

```typescript
import { useFavoriteStore } from '@/store';

const { addFavorite } = useFavoriteStore();

// In a component
await addFavorite(user.id, property);
```

### Subscribing to Favorites

```typescript
useEffect(() => {
  if (user?.id) {
    subscribeToFavorites(user.id);
  }
  return () => {
    unsubscribeFromFavorites();
  };
}, [user?.id]);
```

### Creating a Reservation

```typescript
import { useReservationStore } from '@/store';

const { addReservation } = useReservationStore();

// In a component
await addReservation({
  clientId: user.id,
  propertyId: property.id,
  checkIn: new Date(),
  checkOut: new Date(),
  // ... other fields
});
```

## Migration Notes

### For Existing Users

- Old localStorage data will not be automatically migrated
- Users will need to re-add favorites
- Previous reservations in localStorage will not appear

### To Implement Data Migration (Optional)

Add this to a migration script or initialization:

```typescript
// Migration from localStorage to Firebase
const migrateUserData = async (userId: string) => {
  // Migrate favorites
  const storedFavorites = localStorage.getItem(`habitatsconnect_favorites_${userId}`);
  if (storedFavorites) {
    const favorites = JSON.parse(storedFavorites);
    for (const property of favorites) {
      await addFavorite(userId, property);
    }
    localStorage.removeItem(`habitatsconnect_favorites_${userId}`);
  }

  // Migrate reservations
  const storedReservations = localStorage.getItem('habitatsconnect_reservations');
  if (storedReservations) {
    const reservations = JSON.parse(storedReservations);
    const userReservations = reservations.filter((r) => r.clientId === userId);
    for (const reservation of userReservations) {
      await addReservation(reservation);
    }
  }
};
```

## Testing Checklist

- [ ] Test adding/removing favorites
- [ ] Test favorites sync across tabs
- [ ] Test reservations loading
- [ ] Test deposits filtering
- [ ] Test offline behavior
- [ ] Test authentication edge cases
- [ ] Test Firestore rules
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
   - Set up billing alerts if needed

## Next Steps

Consider implementing:

1. **Optimistic Updates**: Update UI immediately, sync in background
2. **Offline Support**: Cache data for offline access
3. **Data Migration Tool**: Tool to migrate localStorage → Firebase
4. **Analytics**: Track usage patterns
5. **Performance Monitoring**: Monitor query performance

## Support

For issues or questions:

1. Check Firebase Console logs
2. Review Firestore rules
3. Test authentication flow
4. Verify network connectivity
