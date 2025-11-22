# 🚀 HabitatsConnect - Guide Complet de Déploiement

## Données de test pour démarrer

**Client:**
- Email: `client@example.com`
- Mot de passe: `password123`

**Propriétaire:**
- Email: `owner@example.com`
- Mot de passe: `password123`

---

## ✅ Solution 1: Vercel + MongoDB Atlas (RECOMMANDÉ - Gratuit)

### Étape 1: Créer un compte MongoDB Atlas
1. Allez sur https://www.mongodb.com/cloud/atlas
2. Créez un compte gratuit
3. Créez un cluster gratuit (M0)
4. Allez dans "Connect" → "Connect your application"
5. Copiez votre connection string (ex: `mongodb+srv://user:pass@cluster.mongodb.net/habitats-connect`)

### Étape 2: Créer un compte Vercel
1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Importez le repo HabitatsConnect

### Étape 3: Ajouter les variables d'environnement
Dans Vercel (Settings → Environment Variables):
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/habitats-connect
DATABASE_NAME=habitats-connect
NODE_ENV=production
```

### Étape 4: Déployer
```bash
git push  # Vercel se déclenche automatiquement
```

**Avantages:**
- ✅ Gratuit (jusqu'à certain usage)
- ✅ Auto-scaling
- ✅ HTTPS inclus
- ✅ CDN inclus
- ✅ Déploiement automatique avec Git

---

## ✅ Solution 2: Railway + PostgreSQL (Alternative - Gratuit)

### Étape 1: Créer un compte Railway
1. Allez sur https://railway.app
2. Connectez-vous avec GitHub

### Étape 2: Créer un projet
1. New Project → GitHub Repo
2. Sélectionnez HabitatsConnect

### Étape 3: Ajouter PostgreSQL
1. Add → Database → PostgreSQL
2. Railway crée automatiquement DATABASE_URL

### Étape 4: Variables d'environnement
```
DATABASE_URL=postgresql://...  (fourni par Railway)
NODE_ENV=production
```

### Étape 5: Déployer
Le déploiement se fait automatiquement!

**Avantages:**
- ✅ Gratuit
- ✅ PostreSQL inclus
- ✅ Très simple

---

## ✅ Solution 3: Netlify + Supabase (Alternative)

### Étape 1: Créer Supabase (PostgreSQL)
1. Allez sur https://supabase.com
2. Créez un projet gratuit
3. Copiez votre DATABASE_URL

### Étape 2: Déployer sur Netlify
1. Allez sur https://netlify.com
2. Connect GitHub
3. Sélectionnez HabitatsConnect
4. Ajouter variables d'environnement
5. Deploy!

---

## 🏠 Solution 4: Auto-hébergement (VPS)

### Sur DigitalOcean (5$/mois)
1. Créer un Droplet (Ubuntu 22.04)
2. SSH dans le serveur
3. Installer Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Installer PM2:
```bash
sudo npm install -g pm2
```

5. Cloner et déployer:
```bash
git clone your-repo.git
cd HabitatsConnect
npm install
npm run build
pm2 start npm -- run start
pm2 startup
pm2 save
```

6. Configurer Nginx (reverse proxy):
```bash
sudo apt install nginx
# Configurer le fichier de config Nginx
```

7. SSL avec Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d votredomaine.com
```

---

## 🔄 Architecture recommandée

```
Frontend (Next.js) → Vercel
      ↓
API Routes → Vercel Serverless
      ↓
Base de données → MongoDB Atlas
```

---

## 📋 Checklist avant de mettre en ligne

- [ ] Vérifier les variables d'environnement
- [ ] Activer HTTPS
- [ ] Configurer CORS correctement
- [ ] Hasher les mots de passe (bcrypt)
- [ ] Ajouter JWT pour les tokens
- [ ] Tester sur tous les navigateurs
- [ ] Configurer les backups de BD
- [ ] Ajouter monitoring (Sentry)
- [ ] Configurer les emails (SendGrid/Nodemailer)
- [ ] Ajouter rate limiting

---

## 🔐 Sécurité - À faire avant production

1. **Hasher les mots de passe:**
```bash
npm install bcryptjs
```

2. **Utiliser JWT:**
```bash
npm install jsonwebtoken
```

3. **CORS sécurisé:**
```javascript
// Dans les routes API
headers: {
  'Access-Control-Allow-Origin': 'https://votredomaine.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
}
```

4. **Rate limiting:**
```bash
npm install express-rate-limit
```

---

## 📊 Coûts estimés (par mois)

| Solution | Coût | Avantages |
|----------|------|-----------|
| Vercel + MongoDB | $0-9 | Très facile, auto-scaling |
| Railway | $0-5 | Très simple |
| Netlify + Supabase | $0 | Gratuit longtemps |
| DigitalOcean VPS | $5-12 | Contrôle complet |

---

## 🆘 Troubleshooting

**Les données ne persistent pas:**
- Vérifier que la BD est configurée
- Vérifier les logs en production

**CORS error:**
- Ajouter le domaine dans les headers CORS

**502 Bad Gateway:**
- Vérifier les logs du serveur
- Redémarrer le processus Node

---

## 📞 Support

Pour des questions, consultez:
- https://vercel.com/docs
- https://docs.mongodb.com
- https://docs.railway.app

