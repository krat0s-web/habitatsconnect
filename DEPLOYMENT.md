# Guide de Déploiement - HabitatsConnect

## 🚀 Pour mettre le site en ligne

### Option 1: Avec MongoDB (Recommandé pour Production)

1. **Créer un compte MongoDB Atlas**
   - Allez sur https://www.mongodb.com/cloud/atlas
   - Créez un cluster gratuit
   - Obtenez votre URI de connexion

2. **Configurer les variables d'environnement**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitats-connect
   DATABASE_NAME=habitats-connect
   NODE_ENV=production
   ```

3. **Installer les dépendances**
   ```bash
   npm install mongoose
   ```

4. **Mettre à jour l'API** avec les routes MongoDB

### Option 2: Avec Vercel (Plus facile)

1. **Créer un compte Vercel**
   - Allez sur https://vercel.com
   - Connectez votre repo GitHub

2. **Déployer**
   ```bash
   npm run build
   vercel deploy
   ```

3. **Connecter MongoDB Atlas**
   - Ajouter MONGODB_URI dans les variables d'environnement Vercel

### Option 3: Auto-hébergement (VPS)

1. **Installer Node.js et npm**
2. **Cloner le projet**
3. **Configurer le serveur**
   ```bash
   npm install
   npm run build
   npm run start
   ```

4. **Utiliser PM2 pour la persistance**
   ```bash
   npm install -g pm2
   pm2 start npm -- run start
   pm2 startup
   pm2 save
   ```

## 📝 Problèmes actuels avec localStorage

- ❌ Les données sont perdues après chaque rechargement du serveur
- ❌ Différentes données par navigateur
- ❌ Pas de synchronisation entre utilisateurs
- ❌ Pas d'accès depuis d'autres appareils

## ✅ Solution implémentée

Les API routes Next.js ont été créées pour supporter :
- **Authentification**: /api/auth/login, /api/auth/register
- **Propriétés**: /api/properties (GET, POST, PUT, DELETE)

Les stores (Zustand) essaient d'abord l'API, puis fallback à localStorage.

## 🔄 Prochaines étapes

1. **Remplacer les données en mémoire par une vraie DB**
2. **Ajouter la sécurité** (JWT, CORS, etc.)
3. **Configurer HTTPS**
4. **Ajouter les autres routes API** (réservations, messages, transactions)

## 💾 Données actuellement persistantes

- ✅ API: Données en mémoire pendant la session
- ✅ localStorage: Données locales au navigateur

## 🔐 Sécurité

⚠️ **ATTENTION**: En production, vous DEVEZ:
- Hasher les mots de passe (bcrypt)
- Utiliser JWT pour les tokens
- Activer CORS correctement
- Valider les données côté serveur
- Utiliser HTTPS
