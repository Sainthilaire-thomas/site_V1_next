# 📋 Session : Finalisation checkout-test PayPal

**Date** : 7 novembre 2025  
**Objectif** : Finaliser `/checkout-test` (Sandbox) avant de le copier vers `/checkout` (Live)  
**Branche** : `feature/paypal-integration`

---

## 🎯 État actuel

### ✅ Ce qui fonctionne
- [x] Formulaire d'adresse complet
- [x] Boutons PayPal s'affichent
- [x] Paiement Sandbox fonctionne
- [x] Commande créée dans Supabase
- [x] Order items créés
- [x] Email de confirmation envoyé
- [x] Données enregistrées (payment_method, paypal_order_id, etc.)

### ⚠️ À améliorer
- [ ] Titre de la page (actuellement "CHECKOUT TEST - PAYPAL")
- [ ] Texte du bouton (actuellement "Continuer vers le paiement")
- [ ] Message mode Sandbox trop visible
- [ ] Pas de gestion du panier vide
- [ ] Pas de décrémentation du stock
- [ ] Design pourrait être plus cohérent avec le reste du site

---

## 📝 Modifications à effectuer

### 1️⃣ Améliorer le titre et le sous-titre

**Fichier** : `src/app/checkout-test/page.tsx`

**Ligne ~17-22** - Remplacer :
```typescript
<h1 className="text-3xl font-bold mb-2 font-['Archivo_Black'] uppercase tracking-[0.05em]">
  Checkout Test - PayPal
</h1>
<p className="text-sm text-gray-500 mb-8">
  Page de test pour l'intégration PayPal (mode Sandbox)
</p>
```

**Par** :
```typescript
<h1 className="text-3xl font-bold mb-2 font-['Archivo_Black'] uppercase tracking-[0.05em]">
  Finaliser votre commande
</h1>
<p className="text-sm text-gray-500 mb-8">
  Paiement sécurisé par PayPal
</p>
```

---

### 2️⃣ Améliorer le message mode test

**Ligne ~225-229** - Remplacer :
```typescript
<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
  <p className="text-sm text-blue-800">
    🧪 <strong>Mode Test (Sandbox)</strong> - Utilisez un compte PayPal de test
  </p>
</div>
```

**Par** :
```typescript
{process.env.NEXT_PUBLIC_PAYPAL_MODE === 'sandbox' && (
  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 text-xs">
    <p className="text-amber-800">
      ⚠️ Mode test : Utilisez un compte PayPal Sandbox pour tester
    </p>
  </div>
)}
```

---

### 3️⃣ Changer le texte du bouton

**Ligne ~196** - Remplacer :
```typescript
Continuer vers le paiement
```

**Par** :
```typescript
Valider et payer
```

---

### 4️⃣ Ajouter une vérification du panier vide au chargement

**Après les imports, ajouter** :
```typescript
// Redirect si panier vide
useEffect(() => {
  if (items.length === 0) {
    toast.error('Votre panier est vide')
    router.push('/cart')
  }
}, [items, router])
```

---

### 5️⃣ Ajouter la décrémentation du stock

**Fichier** : `src/app/api/paypal/capture-order/route.ts`

**Ligne ~110** - Remplacer :
```typescript
// TODO: Décrémenter le stock
```

**Par** :
```typescript
// ✅ Décrémentation du stock
try {
  console.log('📦 Decrementing stock for order:', order.id)
  const { decrementStockForOrder } = await import('@/lib/stock/decrement-stock')
  const stockResult = await decrementStockForOrder(order.id)
  
  if (stockResult.success) {
    console.log(`✅ Stock decremented: ${stockResult.decremented} items`)
    if (stockResult.errors && stockResult.errors.length > 0) {
      console.warn('⚠️ Some stock errors:', stockResult.errors)
    }
  } else {
    console.error('❌ Stock decrement failed:', stockResult.errors)
  }
} catch (stockError) {
  console.error('❌ Stock decrement exception:', stockError)
  // Ne pas faire échouer la commande si le stock échoue
}
```

---

### 6️⃣ Améliorer le design du résumé de commande

**Ligne ~134-160** - Améliorer les styles :

**Remplacer** :
```typescript
<div className="bg-gray-50 p-6 rounded-lg mb-8 border">
```

**Par** :
```typescript
<div className="bg-white border-2 border-gray-200 p-6 rounded-lg mb-8 shadow-sm">
```

---

### 7️⃣ Améliorer le message de paiement sécurisé

**Ligne ~245-249** - Remplacer :
```typescript
<p className="text-xs text-gray-500 text-center mt-4">
  🔒 Paiement sécurisé par PayPal. Environnement de test (Sandbox).
</p>
```

**Par** :
```typescript
<div className="text-xs text-gray-500 text-center mt-6 space-y-1">
  <p>🔒 Paiement 100% sécurisé</p>
  <p className="text-gray-400">
    Vos informations bancaires ne sont jamais stockées sur nos serveurs
  </p>
</div>
```

---

## 🧪 Tests à effectuer après modifications

### Test 1 : Affichage
- [ ] Titre "Finaliser votre commande" visible
- [ ] Sous-titre sobre et professionnel
- [ ] Message Sandbox discret (ou caché en production)
- [ ] Design cohérent avec le reste du site

### Test 2 : Panier vide
- [ ] Aller sur `/checkout-test` sans produit
- [ ] Doit rediriger vers `/cart`
- [ ] Toast "Votre panier est vide" affiché

### Test 3 : Paiement complet
- [ ] Ajouter 2 unités d'un produit au panier
- [ ] Noter le stock avant paiement
- [ ] Remplir le formulaire
- [ ] Cliquer sur "Valider et payer"
- [ ] Payer avec PayPal Sandbox
- [ ] Vérifier redirection vers `/checkout-test/success`
- [ ] Vérifier email de confirmation reçu
- [ ] Vérifier stock décrémenté de 2

### Test 4 : Vérification base de données

```sql
-- Dernière commande
SELECT 
  order_number,
  payment_method,
  payment_status,
  total_amount,
  customer_email
FROM orders
WHERE payment_method = 'paypal'
ORDER BY created_at DESC
LIMIT 1;

-- Order items
SELECT 
  product_name,
  variant_name,
  quantity,
  unit_price,
  total_price
FROM order_items
WHERE order_id = (
  SELECT id FROM orders 
  WHERE payment_method = 'paypal' 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Stock movements
SELECT 
  pv.id,
  p.name,
  pv.size,
  pv.stock_quantity as current_stock,
  sm.quantity_change,
  sm.reason,
  sm.created_at
FROM stock_movements sm
JOIN product_variants pv ON pv.id = sm.variant_id
JOIN products p ON p.id = pv.product_id
ORDER BY sm.created_at DESC
LIMIT 5;
```

---

## 📦 Commandes Git

```powershell
# Vérifier la branche
git branch

# Ajouter les modifications
git add src/app/checkout-test/page.tsx
git add src/app/api/paypal/capture-order/route.ts

# Commit
git commit -m "feat(checkout-test): finalize UI and add stock decrement"

# Push
git push origin feature/paypal-integration
```

---

## 🎯 Prochaines étapes (après validation)

### Étape 1 : Créer l'application PayPal Live
1. Aller sur PayPal Developer Dashboard
2. Apps & Credentials → Live
3. Create App
4. Récupérer Client ID Live
5. Récupérer Secret Live

### Étape 2 : Configurer les variables d'environnement

**Sur Vercel** :
```bash
# Sandbox (existant)
NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX=Ac...
PAYPAL_CLIENT_SECRET_SANDBOX=...

# Live (nouveau)
NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE=Ac...
PAYPAL_CLIENT_SECRET_LIVE=...
PAYPAL_MODE=live
```

### Étape 3 : Copier checkout-test vers checkout

**Créer nouvelle branche** :
```powershell
git checkout -b feature/checkout-paypal-live
```

**Copier et adapter** :
```powershell
# Copier la structure
cp -r src/app/checkout-test/* src/app/checkout/

# Modifier pour utiliser les clés Live
# Adapter le titre (enlever "test")
# Supprimer le message Sandbox
```

### Étape 4 : Ajouter choix Stripe/PayPal dans checkout

Option 1 : Tabs
```
[Carte bancaire] [PayPal]
```

Option 2 : Radio buttons
```
○ Payer par carte (Stripe)
○ Payer avec PayPal
```

---

## 📊 Checklist finale avant migration vers checkout

- [ ] Tous les tests passent
- [ ] Stock se décrémente correctement
- [ ] Emails envoyés
- [ ] Design finalisé et approuvé
- [ ] Clés Live PayPal obtenues
- [ ] Variables d'environnement configurées
- [ ] Documentation à jour

---

## 💡 Notes importantes

### Différences Sandbox vs Live

| Aspect | Sandbox | Live |
|--------|---------|------|
| Argent | Fictif | Réel |
| Comptes | Tests | Vrais clients |
| Variables | `_SANDBOX` | `_LIVE` |
| Mode | `sandbox` | `live` |
| Logs | Verbeux | Optimisés |

### Frais PayPal en production

- **France** : 2,9% + 0,35€ par transaction
- **Exemple** : Vente 100€ → Vous recevez 97,25€

---

**Document créé le** : 7 novembre 2025  
**Dernière mise à jour** : En cours  
**Auteur** : Thomas (avec Claude)
