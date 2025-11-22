# 💰 Système de Paiement - HabitatsConnect

## 📊 Flux de Paiement

### Avant: ❌ Problème
Vous receviez tout l'argent immédiatement quand vous confirmiez la réservation.

### Maintenant: ✅ Correct

```
1. Client fait une réservation
   ↓
2. Vous confirmez la réservation
   ↓
3. IMMÉDIATEMENT: Dépôt de garantie (30%) → Reçu ✓
   ↓
4. Client fait son séjour
   ↓
5. APRÈS CHECKOUT: Solde (70%) → Reçu ✓
```

## 💳 Détails des Transactions

### Transaction 1: Dépôt de Garantie
- **Montant**: 30% du prix total
- **Statut**: `completed` (reçu immédiatement)
- **Date**: Date de confirmation
- **Description**: "Dépôt de garantie - [Nom de la propriété]"

### Transaction 2: Solde
- **Montant**: 70% du prix total
- **Statut**: `pending` (en attente)
- **Date**: Date de checkout du client
- **Description**: "Solde - [Nom de la propriété] (après séjour)"

## 🤖 Gestion Automatique

Le composant `TransactionManager` :
- ✅ Vérifie automatiquement les transactions chaque minute
- ✅ Convertit les transactions "pending" en "completed" quand la date est passée
- ✅ Fonctionne en arrière-plan sans action manuelle

## 📈 Exemple Concret

### Réservation
- **Durée**: 21/11/2025 au 23/11/2025
- **Prix total**: $140.00
- **Dépôt (30%)**: $42.00
- **Solde (70%)**: $98.00

### Transactions créées

#### Transaction 1 (Immédiate)
```
Date: 21/11/2025 (confirmation)
Statut: ✓ Complété
Montant: +$42.00
Description: Dépôt de garantie - Apart
```

#### Transaction 2 (Future)
```
Date: 23/11/2025 (checkout)
Statut: ⏳ En attente
Montant: +$98.00
Description: Solde - Apart (après séjour)
```

Le 23/11 au soir, la transaction 2 devient automatiquement "Complétée".

## 🔍 Voir dans la Trésorerie

### Aujourd'hui
- Revenus reçus: $42.00 ✓
- En attente: $98.00 ⏳
- Solde net: $42.00

### Après le checkout
- Revenus reçus: $140.00 ✓
- En attente: $0.00
- Solde net: $140.00

## ⚙️ Configuration

Si vous voulez modifier les pourcentages:

1. **Taux de dépôt**: Modifiez dans `PropertyDetail.tsx`
   ```typescript
   const depositAmount = totalPrice * 0.3; // 30% actuellement
   ```

2. **Fréquence de vérification**: Modifiez dans `TransactionManager.tsx`
   ```typescript
   }, 60000); // 60000ms = 1 minute
   ```

## 🛡️ Sécurité

Actuellement, c'est une simulation. En production, vous devriez:
- Intégrer Stripe ou PayPal
- Vérifier les paiements côté serveur
- Garder l'historique dans la base de données
- Implémenter des remboursements

## 📝 Notes

- Le dépôt de garantie est un engagement du client
- Le solde est l'argent principal pour la location
- Après le checkout, le dépôt peut être libéré ou conservé selon vos conditions
- Vous pouvez ajouter des frais de nettoyage ou d'autres déductions
