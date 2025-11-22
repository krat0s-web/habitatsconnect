## 🚀 Guide d'Installation HabitatsConnect

### ⚙️ Prérequis
- **Node.js** 18+ ou 20+ (Télécharger depuis https://nodejs.org/)
- **Git** (optionnel mais recommandé)
- **npm** ou **yarn** (vient avec Node.js)

### 📥 Installation Rapide

#### 1. Télécharger Node.js
- Va sur https://nodejs.org/
- Télécharge la version **LTS** (Long Term Support)
- Installe-le avec les paramètres par défaut
- Redémarre PowerShell après l'installation

#### 2. Vérifier l'installation
```powershell
node --version
npm --version
```

#### 3. Installer les dépendances
```powershell
cd c:\xampp\htdocs\HabitatsConnect
npm install
```

Cela peut prendre 2-5 minutes selon ta connexion internet.

#### 4. Lancer le développement
```powershell
npm run dev
```

#### 5. Ouvrir l'application
- Ouvre ton navigateur
- Va à **http://localhost:3000**

### 📱 Structure du Projet

```
HabitatsConnect/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── auth/              # Pages d'authentification
│   │   ├── properties/        # Pages des propriétés
│   │   ├── dashboard/         # Dashboard (à développer)
│   │   ├── layout.tsx         # Layout racine
│   │   └── page.tsx           # Page d'accueil
│   ├── components/            # Composants réutilisables
│   │   ├── Navbar.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   ├── Footer.tsx
│   │   └── Loading.tsx
│   ├── store/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── propertyStore.ts
│   │   └── reservationStore.ts
│   └── types/                 # Type definitions
│       └── index.ts
├── public/                    # Fichiers statiques
├── tailwind.config.ts         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
├── package.json               # Dépendances
└── README.md
```

### 🎨 Pages Disponibles

1. **Accueil** (`/`)
   - Hero section
   - Types de propriétés
   - Annonces en vedette
   - Section CTA

2. **Connexion** (`/auth/login`)
   - Formulaire de connexion
   - Options Google/Facebook
   - Lien vers inscription

3. **Inscription** (`/auth/register`)
   - Formulaire complet
   - Sélection Client/Propriétaire
   - Conditions d'utilisation

4. **Propriétés** (`/properties`)
   - Liste avec filtres
   - Recherche avancée
   - Grille responsive

5. **Détail Propriété** (`/properties/[id]`)
   - Galerie d'images
   - Informations complètes
   - Formulaire de réservation

### 🔧 Commandes Disponibles

```powershell
# Développement
npm run dev

# Build production
npm run build

# Lancer la version production
npm start

# Linter
npm run lint

# Formatter le code
npm run format
```

### 🎯 Prochaines Étapes de Développement

1. **Backend API**
   - Node.js/Express ou Python/FastAPI
   - Base de données (MongoDB, PostgreSQL)
   - Authentification JWT

2. **Base de Données**
   - Schémas pour User, Property, Reservation
   - Relations et validations

3. **Système de Paiement**
   - Stripe ou PayPal
   - Gestion des transactions

4. **Notifications**
   - Emails
   - Push notifications
   - Système de messages

5. **Tests & Déploiement**
   - Tests unitaires (Jest)
   - Tests E2E (Cypress)
   - Déploiement sur Vercel/Netlify

### ⚠️ Troubleshooting

#### Erreur: "npm is not recognized"
- Télécharge et réinstalle Node.js
- Redémarre PowerShell
- Vérifie: `npm --version`

#### Erreur: "Port 3000 already in use"
- Un autre processus utilise le port 3000
- Utilise: `npm run dev -- -p 3001`

#### Erreur: "Module not found"
- Assure-toi que `npm install` s'est bien exécuté
- Supprime `node_modules` et `.next`
- Réexécute: `npm install`

### 📞 Support & Questions

Pour plus d'aide:
- Consulte la [documentation Next.js](https://nextjs.org/docs)
- Consulte la [documentation Tailwind](https://tailwindcss.com/docs)
- Consulte la [documentation React](https://react.dev)

### ✅ Checklist de Démarrage

- [ ] Node.js installé
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur de développement lancé (`npm run dev`)
- [ ] Application accessible sur http://localhost:3000
- [ ] Pages d'accueil, login, et listing fonctionnent
- [ ] Pas d'erreurs console (rouges)

---

**Bonne développement! 🚀**
