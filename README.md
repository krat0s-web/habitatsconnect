# HabitatsConnect - Plateforme Immobilière Moderne

Une plateforme complète de gestion immobilière type Airbnb avec une architecture moderne et une interface utilisateur fluide.

## 🌟 Caractéristiques

### Pour les Clients

- ✅ Recherche avancée de propriétés
- ✅ Filtrage par type, prix, localisation
- ✅ Réservation facile et sécurisée
- ✅ Système d'avis et commentaires
- ✅ Gestion des favoris
- ✅ Historique des réservations

### Pour les Propriétaires

- ✅ Création d'annonces avec photos
- ✅ Gestion des propriétés
- ✅ Calendrier de disponibilité
- ✅ Gestion des réservations
- ✅ Dashboard analytique
- ✅ Historique des revenus

### Fonctionnalités Générales

- ✅ Authentification sécurisée
- ✅ Profil utilisateur personnalisé
- ✅ Notifications en temps réel
- ✅ Design moderne et responsive
- ✅ Thème fluide avec gradients dynamiques
- ✅ Icônes animées
- ✅ Performance optimisée

## 🛠 Stack Technique

**Frontend:**

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- **shadcn/ui** - Modern UI component library
- React Icons
- Lucide React (icons)
- Zustand (State Management)
- Radix UI (Accessible primitives)

**Backend:**

- Firebase / Firestore
- Firebase Admin SDK
- Next.js API Routes
- JWT Authentication
- File Upload support

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/habitats-connect.git

# Installer les dépendances
npm install

# Configuration d'environnement
cp .env.example .env.local

# Développement
npm run dev

# Build production
npm run build
npm start
```

## 🎨 UI Library - shadcn/ui

Ce projet utilise **shadcn/ui**, une bibliothèque de composants React moderne et accessible.

**Avantages:**

- ✅ Composants accessibles (Radix UI)
- ✅ Personnalisables (pas de dépendance npm)
- ✅ Type-safe avec TypeScript
- ✅ Compatible Tailwind CSS
- ✅ Production-ready

**Composants disponibles:**

- Button (avec variante gradient custom)
- Input / Textarea
- Card / Badge
- Label / Separator
- Select / Avatar
- Et plus...

📖 **Guide complet:** [SHADCN_MIGRATION.md](./SHADCN_MIGRATION.md)

**Usage rapide:**

```tsx
import { Button } from '@/components/ui/button';

<Button variant="gradient">Get Started</Button>;
```

## 🚀 Déploiement

### Solution Rapide (Recommandée)

Pour mettre le site en ligne facilement:

1. **Vercel + MongoDB Atlas** (Gratuit)

   ```bash
   # Voir DEPLOYMENT_GUIDE.md pour les étapes détaillées
   ```

2. **Données persistantes**
   - Les données sont maintenant sauvegardées côté serveur
   - Les API routes Next.js sont configurées
   - Compatible avec MongoDB, PostgreSQL, Supabase

3. **Voir le guide complet:**
   - 📖 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guide complet de déploiement
   - 📖 [DATABASE_CONFIG.md](./DATABASE_CONFIG.md) - Configuration de la base de données

## 🔐 Données de test

```
Client:
- Email: client@example.com
- Mot de passe: password123

Propriétaire:
- Email: owner@example.com
- Mot de passe: password123
```

## ⚠️ Important avant production

- [ ] Activer une vraie base de données (MongoDB, PostgreSQL, etc.)
- [ ] Hasher les mots de passe avec bcrypt
- [ ] Configurer JWT pour les tokens
- [ ] Activer HTTPS/SSL
- [ ] Configurer CORS correctement
- [ ] Ajouter la validation côté serveur
- [ ] Configurer les backups
- [ ] Ajouter le monitoring (Sentry, DataDog)

## 📂 Structure du Projet

```
habitats-connect/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── properties/
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── Footer.tsx
│   │   └── Loading.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── propertyStore.ts
│   │   └── reservationStore.ts
│   └── types/
│       └── index.ts
├── public/
├── tailwind.config.ts
└── package.json
```

## 🎨 Design System

### Couleurs

- **Primary:** Bleu Ciel (#0ea5e9)
- **Secondary:** Rose Bonbon (#ec4899)
- **Accent:** Ambre Doré (#f59e0b)
- **Gradient Fluide:** Combination de tous les trois

### Animations

- Float: Mouvement flottant doux
- Pulse Glow: Effet luminescent pulsé
- Slide In: Entrée depuis le côté
- Fade In: Fondu d'apparition

## 🚀 Prochaines Étapes

- [ ] Intégration API Backend
- [ ] Système de paiement
- [ ] Chat en temps réel
- [ ] Notifications Push
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Internationalisation (i18n)
- [ ] Dark Mode
- [ ] Mobile App

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez consulter CONTRIBUTING.md

## 📄 Licence

MIT License - Voir LICENSE pour plus de détails

## 📞 Support

Pour toute question ou support, contactez: support@habitatsconnect.fr

---

**Construit avec ❤️ par l'équipe HabitatsConnect**
