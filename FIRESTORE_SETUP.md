# 🔧 Guide Configuration Firebase - Activation API Firestore

## Problème
```
Error: 7 PERMISSION_DENIED: Cloud Firestore API has not been used in project habitats-connect before or it is disabled.
```

## Solution : Activer Firestore API

### ✅ Étapes à suivre

1. **Allez sur Google Cloud Console**
   - Ouvrez : https://console.cloud.google.com

2. **Sélectionnez le projet `habitats-connect`**
   - Cliquez sur le sélecteur de projet en haut

3. **Activez Firestore API**
   - Cliquez sur le lien fourni dans l'erreur :
   - https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=habitats-connect
   - OU
   - Allez à "APIs & Services" → "Enabled APIs & services"
   - Cliquez sur "+ ENABLE APIS AND SERVICES"
   - Recherchez "Firestore"
   - Cliquez sur "Cloud Firestore API"
   - Cliquez sur le bouton "ENABLE"

4. **Attendez 1-2 minutes**
   - L'API peut prendre du temps à se propager

5. **Redémarrez le serveur local**
   ```bash
   npm run dev
   ```

---

## Alternative : Configuration via Firebase Console

1. Allez sur https://console.firebase.google.com
2. Sélectionnez le projet "habitats-connect"
3. Allez à "Build" → "Firestore Database"
4. Cliquez sur "Create database"
5. Choisissez le mode de sécurité (développement ou production)
6. Sélectionnez la région
7. Cliquez "Create"

---

## Vérification

Une fois activé, vous devriez voir :
```json
{
  "status": 200,
  "message": "Transactions loaded",
  "transactions": []
}
```

Au lieu de l'erreur PERMISSION_DENIED.

---

## Règles Firestore de sécurité (Important!)

Pour développement local (RISQUÉ - à ne pas utiliser en production):
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture et l'écriture à tous (DEV ONLY!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Pour production, utilisez plutôt:
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Properties owned by users
    match /properties/{propertyId} {
      allow read: if true;  // Everyone can read
      allow write: if request.auth.uid == resource.data.ownerId;
    }
    
    // Reservations
    match /reservations/{reservationId} {
      allow read: if request.auth.uid == resource.data.clientId || 
                     request.auth.uid == resource.data.ownerId;
      allow write: if request.auth.uid == resource.data.clientId;
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth.uid == resource.data.ownerId;
    }
  }
}
```

---

## Collections Firestore à créer

Après activation, créez les collections suivantes via Firebase Console:

### 1. **users**
```json
{
  "id": "firebaseUserId",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "client" | "owner",
  "phone": "",
  "avatar": "",
  "bio": "",
  "createdAt": "2025-11-22T...",
  "updatedAt": "2025-11-22T..."
}
```

### 2. **properties**
```json
{
  "title": "Bel appartement",
  "description": "...",
  "type": "apartment",
  "price": 100,
  "location": "Paris",
  "address": "123 Rue...",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 75,
  "amenities": ["WiFi", "TV"],
  "images": [],
  "ownerId": "userId",
  "isAvailable": true,
  "createdAt": "2025-11-22T...",
  "updatedAt": "2025-11-22T..."
}
```

### 3. **reservations**
```json
{
  "propertyId": "propertyId",
  "clientId": "clientId",
  "checkIn": "2025-12-01T...",
  "checkOut": "2025-12-07T...",
  "guests": 2,
  "totalPrice": 600,
  "depositAmount": 100,
  "status": "pending" | "confirmed" | "cancelled",
  "createdAt": "2025-11-22T...",
  "updatedAt": "2025-11-22T..."
}
```

### 4. **transactions**
```json
{
  "ownerId": "ownerId",
  "senderId": "senderId",
  "reservationId": "reservationId",
  "amount": 500,
  "type": "revenue" | "refund",
  "status": "pending" | "completed",
  "description": "Payment for reservation",
  "metadata": {},
  "createdAt": "2025-11-22T...",
  "updatedAt": "2025-11-22T..."
}
```

---

## Troubleshooting

### Si ça ne marche toujours pas après activation :

1. **Vérifiez la clé de service**
   - Allez à Project Settings → Service Accounts
   - Générez une nouvelle clé
   - Mettez à jour `FIREBASE_SERVICE_ACCOUNT_KEY` dans `.env.local`

2. **Videz le cache**
   ```bash
   npm run build
   npm run dev
   ```

3. **Redémarrez Node**
   - Arrêtez `npm run dev`
   - Attendez 5 secondes
   - Relancez `npm run dev`

