# Configuration pour la Base de Données

## Variables d'environnement requises

```bash
# .env.local (pour développement)
# .env.production (pour production)

# MongoDB (Recommandé)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitats-connect
DATABASE_NAME=habitats-connect

# Ou PostgreSQL (Railway/Supabase)
DATABASE_URL=postgresql://user:password@host:port/database

# API
API_URL=http://localhost:3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-key-change-in-production

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (optionnel, pour les images)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=habitats-connect-images
```

## Installation des dépendances pour MongoDB

```bash
npm install mongoose
npm install bcryptjs jsonwebtoken
```

## Installation pour PostgreSQL

```bash
npm install pg prisma @prisma/client
npx prisma init
```

## Installation pour Supabase

```bash
npm install @supabase/supabase-js
```

## Vérifier la configuration

Après avoir configuré les variables, testez avec:

```bash
npm run build
npm run start
```

Vérifiez que:
- ✅ La base de données se connecte
- ✅ Les API routes répondent
- ✅ Les données sont persistantes après rechargement
