# Déploiement des Règles Firestore et Index

## Commandes importantes

### 1. Déployer les règles Firestore uniquement
```bash
firebase deploy --only firestore:rules
```

### 2. Déployer les index Firestore uniquement
```bash
firebase deploy --only firestore:indexes
```

### 3. Déployer les règles ET les index
```bash
firebase deploy --only firestore
```

### 4. Voir le statut Firebase
```bash
firebase projects:list
```

## Notes importantes

- Les règles dans `firestore.rules` ont été mises à jour pour supporter les **reviews** (avis)
- Un index composite a été ajouté dans `firestore.indexes.json` pour optimiser les requêtes d'avis

## Nouvelles règles ajoutées

### Reviews Collection
```
match /reviews/{reviewId} {
  allow read: if true; // Public read access
  allow create: if isAuthenticated(); 
  allow update: if isAuthenticated() && resource.data.clientId == request.auth.uid;
  allow delete: if isAuthenticated() && resource.data.clientId == request.auth.uid;
}
```

**Permissions:**
- ✅ Lecture publique (tout le monde peut voir les avis)
- ✅ Création (utilisateurs authentifiés seulement)
- ✅ Modification (uniquement l'auteur de l'avis)
- ✅ Suppression (uniquement l'auteur de l'avis)

## Index créé

**Collection:** reviews  
**Champs:**
- `propertyId` (ASCENDING)
- `createdAt` (DESCENDING)

Cet index permet de récupérer rapidement tous les avis d'une propriété, triés par date décroissante.
