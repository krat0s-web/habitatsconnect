# 🏗️ Architecture - HabitatsConnect

## 📊 Flux de données actuellement

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                    │
│  - React Components                                         │
│  - Zustand Stores (authStore, propertyStore, etc.)         │
│  - Tailwind CSS Styling                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  API Routes (/api)   │  ← NOUVEAU
        │  - /auth/login       │
        │  - /auth/register    │
        │  - /properties       │
        │  - /reservations     │
        │  - /messages         │
        │  - /transactions     │
        └──────────┬───────────┘
                   │
        ┌──────────┴───────────┐
        ↓                      ↓
    ┌─────────┐         ┌──────────────┐
    │localStorage│        │ In-Memory DB │ ← TEMPORAIRE
    │(Local)   │        │ (Serveur)    │
    └─────────┘         └──────────────┘
                              ↑
                   À remplacer par une vraie BD
                   (MongoDB, PostgreSQL, etc.)
```

## 🔄 Flux d'authentification

```
1. Utilisateur se connecte
   ↓
2. authStore.login() appelé
   ↓
3. D'abord: Essayer l'API (/api/auth/login)
   ↓
4. Si l'API échoue: Fallback à localStorage
   ↓
5. Utilisateur connecté → Token stocké
   ↓
6. Composants peuvent accéder à user via useAuthStore()
```

## 💾 Où sont les données?

### Actuellement:
- **localStorage**: Données du navigateur local (spécifique à chaque navigateur)
- **API In-Memory**: Données du serveur (perdues au redémarrage)

### À implémenter:
- **MongoDB Atlas**: Cloud database (recommandé)
- **PostgreSQL**: Base de données relationnelle
- **Supabase**: Backend as a Service

## 📝 Stores Zustand

### authStore
```typescript
- user: Utilisateur connecté
- token: JWT token
- isAuthenticated: État de connexion
- login(email, password, role): Connexion
- register(userData): Inscription
- logout(): Déconnexion
```

### propertyStore
```typescript
- properties: Liste des propriétés
- addProperty(property): Ajouter une propriété
- updateProperty(id, data): Modifier
- deleteProperty(id): Supprimer
- getPropertyById(id): Récupérer une
```

### reservationStore
```typescript
- reservations: Liste des réservations
- addReservation(reservation): Ajouter
- updateReservation(id, data): Modifier
- getReservationsByPropertyId(id): Filtre
```

### messageStore
```typescript
- conversations: Conversations
- messages: Messages par conversation
- addConversation(conversation): Ajouter
- addMessage(conversationId, message): Message
```

### transactionStore
```typescript
- transactions: Transactions
- addTransaction(transaction): Ajouter
- getTransactionsByOwnerId(id): Filtrer
```

## 🔗 API Routes (Nouvelles)

### POST /api/auth/login
```json
Request: { email, password, role }
Response: { user, token }
```

### POST /api/auth/register
```json
Request: { email, password, firstName, lastName, phone, role }
Response: { user, token }
```

### GET/POST /api/properties
```json
GET: Récupère les propriétés
POST: Crée une nouvelle propriété
```

### GET/PUT/DELETE /api/properties/[id]
```json
GET: Propriété spécifique
PUT: Mettre à jour
DELETE: Supprimer
```

### GET/POST /api/reservations
```json
GET: ?propertyId=xxx &clientId=xxx &ownerId=xxx
POST: Créer une réservation
```

### GET/POST /api/messages
```json
GET: Conversations filtrées
POST: Créer une conversation
```

### GET/POST /api/transactions
```json
GET: Transactions du propriétaire
POST: Ajouter une transaction
```

## 🔐 Authentification Flow

```
1. User clique "Connexion"
2. Form envoyé à POST /api/auth/login
3. API vérifie dans localStorage/BD
4. Si valide: Retourne user + token
5. Token stocké dans authStore
6. Utilisateur redirigé vers dashboard
7. Toutes les requêtes incluent le token
8. Token stocké en localStorage aussi (pour persistance)
```

## 🚨 Problèmes actuels

- ❌ Données en mémoire (API) perdues au redémarrage
- ❌ Pas de vraie base de données
- ❌ Pas de hachage de mots de passe
- ❌ Pas de JWT (tokens simples)
- ❌ Pas de validation côté serveur
- ❌ Pas de CORS configuré

## ✅ À faire pour production

### Étape 1: Base de données
```bash
npm install mongoose  # Pour MongoDB
# OU
npm install pg prisma  # Pour PostgreSQL
```

### Étape 2: Authentification sécurisée
```bash
npm install bcryptjs jsonwebtoken
```

Exemple avec bcrypt:
```typescript
import bcrypt from 'bcryptjs';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Étape 3: JWT Tokens
```typescript
import jwt from 'jsonwebtoken';

// Create token
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Étape 4: Middleware d'authentification
```typescript
export function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

## 📦 Variables d'environnement nécessaires

```
MONGODB_URI=         # Si MongoDB
DATABASE_URL=        # Si PostgreSQL
JWT_SECRET=          # Secret pour les tokens
API_URL=             # URL de l'API
NODE_ENV=            # development/production
```

## 🎯 Prochaines étapes

1. **Choisir une base de données** (MongoDB ou PostgreSQL)
2. **Configurer la connexion** via les variables d'env
3. **Migrer les stores** pour utiliser l'API
4. **Ajouter bcrypt** pour les mots de passe
5. **Ajouter JWT** pour les tokens
6. **Déployer** sur Vercel/Railway
7. **Tester** en production
