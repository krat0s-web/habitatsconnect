# Migration MongoDB → Firebase ✅

## Changements effectués

### 1. **Suppression de MongoDB**
- ❌ Supprimé : `src/lib/mongodb.ts`
- ❌ Supprimé : `src/models/User.ts` (mongoose model)
- ❌ Supprimé : `next-auth` du package.json

### 2. **Authentification avec Firebase**
- ✅ Créé : `src/app/api/auth/register/route.ts` - Utilise Firebase Auth + Firestore
- ✅ Créé : `src/app/api/auth/login/route.ts` - Authentification avec vérification des rôles
- ✅ Utilisé : `src/store/authStore.ts` - Zustand + Firebase Auth

### 3. **Base de données**
- **Avant** : MongoDB Atlas (Mongoose)
- **Après** : Firebase Firestore (NoSQL)

### 4. **Variables d'environnement (.env.local)**
Les variables Firebase nécessaires sont déjà configurées :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDOE_fEzY8p-1DahRkTo0H3RMY9cp802UU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=habitats-connect.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=habitats-connect
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=habitats-connect.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=552695193026
NEXT_PUBLIC_FIREBASE_APP_ID=1:552695193026:web:30d471302aff20cdefca5b
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## Comment fonctionne l'authentification

### Enregistrement (Register)
1. L'utilisateur soumet email, mot de passe, firstName, lastName, phone (optionnel)
2. **API Backend** (`/api/auth/register`) :
   - Crée l'utilisateur dans **Firebase Auth** (gère le mot de passe avec hachage sécurisé)
   - Crée le profil utilisateur dans **Firestore** (collection `users`)
   - Retourne un token personnalisé
3. **Frontend** : Stocke le token et l'utilisateur dans Zustand + localStorage

### Connexion (Login)
1. L'utilisateur soumet email, mot de passe, rôle (client/owner)
2. **API Backend** (`/api/auth/login`) :
   - Recherche l'utilisateur dans Firestore
   - Vérifie que le rôle correspond
   - Génère un token personnalisé
3. **Frontend** : Authentifie le client avec le token

## Structure Firestore

### Collection `users`
```json
{
  "id": "firebaseUserId",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33...",
  "role": "client" | "owner",
  "avatar": "url",
  "bio": "...",
  "createdAt": "2025-11-22T...",
  "updatedAt": "2025-11-22T..."
}
```

## Résolution des erreurs courantes

### ❌ "User profile not found"
**Cause** : L'utilisateur existe dans Firebase Auth mais pas dans Firestore
**Solution** :
```typescript
// Accédez à Firebase Console → Firestore → Créer collection "users"
// Et ajoutez le document avec l'ID de l'utilisateur
```

### ❌ "Invalid role for this user"
**Cause** : Le rôle (client/owner) ne correspond pas lors du login
**Solution** : Assurez-vous d'utiliser le bon rôle lors de l'inscription et de la connexion

### ❌ "FIREBASE_SERVICE_ACCOUNT_KEY is missing"
**Cause** : Les variables d'environnement du serveur ne sont pas chargées
**Solution** : Vérifiez que `.env.local` contient `FIREBASE_SERVICE_ACCOUNT_KEY`

### ❌ "Firebase: Error (auth/invalid-api-key)"
**Cause** : La clé API est mal configurée
**Solution** : Vérifiez dans Firebase Console que les restrictions d'API sont correctes

## Dépendances Firebase utilisées

- **firebase** (^12.6.0) : Client SDK pour le frontend
- **firebase-admin** (^13.6.0) : Admin SDK pour le backend (Node.js)

## Test local

1. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Aller à** : `http://localhost:3000/auth/register`

3. **Créer un compte** :
   - Email : `test@example.com`
   - Password : `password123`
   - FirstName : `John`
   - LastName : `Doe`
   - Role : `client`

4. **Vérifier dans Firebase Console** :
   - Authentication → Utilisateurs (doit voir le nouvel utilisateur)
   - Firestore → Collection `users` (doit voir le profil)

5. **Se connecter** : Allez à `http://localhost:3000/auth/login`

## Configuration Firebase Console

1. Allez sur https://console.firebase.google.com
2. Sélectionnez le projet `habitats-connect`
3. Vérifiez :
   - **Authentication** : Activé
   - **Firestore Database** : Activé
   - **Storage** : Activé (optionnel)

## Déploiement sur Vercel

1. Poussez les changements vers GitHub
2. Vercel reconstruira automatiquement
3. Ajoutez les variables d'environnement :
   - Toutes les `NEXT_PUBLIC_*` sont publiques
   - `FIREBASE_SERVICE_ACCOUNT_KEY` est secrète (variable d'environnement)

## Ressources

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
