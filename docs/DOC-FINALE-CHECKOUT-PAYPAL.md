# 📋 Documentation Finale : Checkout PayPal - Site v1 Next

**Date** : 7 novembre 2025  
**Status** : ✅ **100% Fonctionnel en Sandbox**  
**Prêt pour** : Migration vers production

---

## 🎯 Vue d'ensemble

Système de paiement PayPal complet avec :
- Création de commande en base de données
- Paiement sécurisé via PayPal Sandbox
- Décrémentation automatique du stock par variante
- Envoi d'email de confirmation
- Pages de succès/annulation stylées
- Tracking complet dans `stock_movements`

---

## ✅ Ce qui a été implémenté

### 1️⃣ **Formulaire de checkout** (`/checkout-test`)
- ✅ Formulaire d'adresse complet
- ✅ Calcul des frais de port (5.90€ FR, 12.90€ EU)
- ✅ Affichage du récapitulatif de commande
- ✅ Intégration PayPal Buttons

### 2️⃣ **Création de commande** (`/api/paypal/create-order`)
- ✅ Création dans la table `orders` avec toutes les données
- ✅ Stockage des items dans `metadata` (format JSON)
- ✅ Génération d'un `order_number` unique
- ✅ Liaison avec PayPal via `paypal_order_id`

### 3️⃣ **Capture du paiement** (`/api/paypal/capture-order`)
- ✅ Vérification du paiement PayPal
- ✅ Mise à jour du statut de la commande
- ✅ Création des `order_items` depuis metadata
- ✅ **Décrémentation du stock par variante**
- ✅ Envoi de l'email de confirmation

### 4️⃣ **Gestion du stock**
- ✅ Fonction `decrementStockForOrder()` opérationnelle
- ✅ Support des produits avec variantes (Size, Color)
- ✅ Support des produits sans variantes
- ✅ Historique dans `stock_movements` pour les variantes
- ✅ Mise à jour de `product_variants.stock_quantity`

### 5️⃣ **Panier avec variantId** (FIX MAJEUR)
- ✅ Fonction `getSelectedVariantId()` ajoutée dans `ProductDetailClient.tsx`
- ✅ Le `variantId` est correctement stocké dans le panier
- ✅ Le `variantId` est transmis aux `order_items`
- ✅ Le stock est décrémenté sur la bonne variante

### 6️⃣ **Pages de confirmation**
- ✅ `/checkout-test/success` : Page minimaliste avec résumé
- ✅ `/checkout-test/cancel` : Page d'annulation élégante
- ✅ Design cohérent avec le site (Archivo fonts, style noir/blanc)
- ✅ Redirection automatique vers la homepage après 10s

---

## 🔧 Fichiers modifiés

### Fichiers principaux

```
src/app/api/paypal/
├── create-order/route.ts          ✅ Création commande + PayPal order
└── capture-order/route.ts         ✅ Capture + stock + email (MODIFIÉ)

src/app/checkout-test/
├── page.tsx                        ✅ Formulaire checkout
├── success/page.tsx                ✅ Page succès (MODIFIÉ)
└── cancel/page.tsx                 ✅ Page annulation (MODIFIÉ)

src/app/product/[id]/
└── ProductDetailClient.tsx         ✅ Ajout getSelectedVariantId() (MODIFIÉ)

src/components/checkout/
└── PayPalButtons.tsx               ✅ Redirection fixée (MODIFIÉ)

src/lib/stock/
└── decrement-stock.ts              ✅ Fonction de décrémentation
```

### Corrections appliquées aujourd'hui

#### 1. **capture-order/route.ts** (ligne 106-121)
```typescript
// ✅ AJOUTÉ : Décrémentation du stock
try {
  console.log('📦 Decrementing stock for order:', order.id)
  const stockResult = await decrementStockForOrder(order.id)

  if (stockResult.success) {
    console.log(`✅ Stock decremented: ${stockResult.decremented} items`)
  } else {
    console.error('❌ Stock decrement failed:', stockResult.errors)
  }
} catch (stockError) {
  console.error('❌ Stock decrement exception:', stockError)
}
```

#### 2. **ProductDetailClient.tsx** (ligne 233-261)
```typescript
// ✅ AJOUTÉ : Fonction pour récupérer le variantId
const getSelectedVariantId = (): string | null => {
  if (!product.variants || product.variants.length === 0) return null
  
  if (selectedSize && !selectedColor) {
    const sizeVariant = product.variants.find(v => 
      isSizeKey(v.name) && v.value === selectedSize
    )
    return sizeVariant?.id || null
  }
  
  // Autres cas (couleur+taille, couleur seule)...
  
  return null
}
```

#### 3. **ProductDetailClient.tsx** (ligne 269-278)
```typescript
// ✅ AJOUTÉ : Récupération et passage du variantId
const variantId = getSelectedVariantId()

addItem({
  id: `${product.id}...`,
  productId: product.id,
  variantId: variantId,  // ✅ AJOUTÉ
  // ... autres champs
})
```

#### 4. **PayPalButtons.tsx** (ligne 123-132)
```typescript
// ✅ MODIFIÉ : Redirection vers success page
onApprove={async (data, actions) => {
  const result = await captureOrder(data.orderID)
  if (result.success) {
    onSuccess?.()
    router.push('/checkout-test/success')  // ✅ FIXED
  }
}}
```

---

## 🧪 Tests effectués

### Test 1 : Paiement complet avec variante
```
✅ Produit : .white glade skirt
✅ Variante : Size S
✅ Quantité : 1
✅ Prix : 165€ + 5.90€ shipping = 170.90€
✅ Paiement : Réussi via PayPal Sandbox
✅ Stock : Décrémenté de 34 → 33 pour variant S
✅ stock_movements : Nouvelle ligne créée
✅ Email : Envoyé avec succès
✅ Redirection : /checkout-test/success affichée
```

### Test 2 : Vérification base de données
```sql
-- Vérification stock_movements
SELECT 
  sm.delta,
  sm.reason,
  pv.value as size,
  p.name as product
FROM stock_movements sm
JOIN product_variants pv ON pv.id = sm.variant_id
JOIN products p ON p.id = pv.product_id
ORDER BY sm.created_at DESC
LIMIT 1;

-- Résultat ✅
delta: -1
reason: "Order item: .white glade skirt - S - S"
size: "S"
product: ".white glade skirt"
```

---

## 🔑 Variables d'environnement

### Actuellement configurées (Sandbox)
```bash
# PayPal Sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AVkw8wAs...  # Sandbox Client ID
PAYPAL_CLIENT_SECRET=ENAhSy...             # Sandbox Secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lnkxfyfkwnfvxvaxnbah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email (Resend)
RESEND_API_KEY=re_...                      # ✅ Configuré

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Sandbox
```

### À configurer pour la production
```bash
# PayPal Live (à obtenir)
NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE=xxx      # ⚠️ À obtenir
PAYPAL_CLIENT_SECRET_LIVE=xxx              # ⚠️ À obtenir

# Base URL production
NEXT_PUBLIC_BASE_URL=https://blancherenaudin.com
```

---

## 🚀 Migration vers production

### Étape 1 : Obtenir les clés PayPal Live
1. Aller sur https://developer.paypal.com/
2. Passer en mode **Live** (pas Sandbox)
3. Créer une application Live
4. Récupérer :
   - Client ID Live
   - Secret Live

### Étape 2 : Copier checkout-test vers checkout
```powershell
# Créer une branche
git checkout -b feature/paypal-live

# Copier les fichiers
Copy-Item src\app\checkout-test\* src\app\checkout\ -Recurse -Force

# Modifier les URLs dans le code
# - Remplacer /checkout-test par /checkout
# - Vérifier les variables d'environnement
```

### Étape 3 : Configurer Vercel
1. Aller sur Vercel Dashboard
2. Settings → Environment Variables
3. Ajouter :
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE=xxx
   PAYPAL_CLIENT_SECRET_LIVE=xxx
   NEXT_PUBLIC_BASE_URL=https://blancherenaudin.com
   ```
4. Redéployer

### Étape 4 : Test en production
1. Faire un paiement test de 1€
2. Vérifier tout le flow
3. Vérifier l'email reçu
4. Vérifier la commande dans Supabase
5. Vérifier le stock décrémenté

---

## 📊 Schéma de flux

```
User adds product to cart (with variantId ✅)
          ↓
User goes to /checkout-test
          ↓
Fills shipping form
          ↓
Clicks PayPal button
          ↓
[API] POST /api/paypal/create-order
  - Creates order in Supabase
  - Stores items in metadata
  - Creates PayPal order
          ↓
User completes payment on PayPal
          ↓
[API] POST /api/paypal/capture-order
  - Captures payment
  - Updates order status → 'paid'
  - Creates order_items from metadata
  - ✅ Decrements stock (variants)
  - ✅ Creates stock_movements
  - Sends confirmation email
          ↓
Redirect to /checkout-test/success
          ↓
User sees confirmation page
```

---

## 🐛 Bugs corrigés

### Bug 1 : Redirection après paiement ne fonctionnait pas
**Symptôme** : Après paiement, restait sur la page de checkout  
**Cause** : `router.push()` appelé avant `onSuccess()`  
**Solution** : Inverser l'ordre des appels dans `PayPalButtons.tsx`

### Bug 2 : Stock décrémenté sur products au lieu de product_variants
**Symptôme** : Le stock global diminuait, pas le stock de la taille  
**Cause** : `variantId` n'était jamais passé au panier  
**Solution** : Ajouter `getSelectedVariantId()` dans `ProductDetailClient.tsx`

### Bug 3 : Stock non décrémenté du tout
**Symptôme** : Aucun mouvement de stock après paiement  
**Cause** : `decrementStockForOrder()` importé mais jamais appelé  
**Solution** : Ajouter l'appel dans `capture-order/route.ts`

---

## 📈 Statistiques

| Métrique | Valeur |
|----------|--------|
| Fichiers modifiés | 5 |
| Lignes de code ajoutées | ~150 |
| Bugs corrigés | 3 majeurs |
| Tests réussis | 100% |
| Temps de développement | ~3h |
| Temps de debug | ~2h |

---

## ✅ Checklist finale

### Sandbox (checkout-test)
- [x] Formulaire de checkout fonctionnel
- [x] PayPal Buttons intégré
- [x] Paiement Sandbox fonctionnel
- [x] Création de commande en DB
- [x] variantId dans le panier
- [x] Création des order_items
- [x] Décrémentation du stock
- [x] Historique stock_movements
- [x] Email de confirmation
- [x] Page success stylée
- [x] Page cancel stylée
- [x] Redirection après paiement

### Production (à faire)
- [ ] Obtenir clés PayPal Live
- [ ] Copier vers /checkout
- [ ] Configurer variables Vercel
- [ ] Test paiement réel 1€
- [ ] Vérifier email production
- [ ] Vérifier stock production
- [ ] Documentation utilisateur

---

## 🎓 Leçons apprises

1. **Toujours vérifier le panier en premier** : Le bug du `variantId` aurait pu être détecté plus tôt en inspectant localStorage.

2. **Les imports ne suffisent pas** : Une fonction importée mais non appelée ne sert à rien (cas de `decrementStockForOrder`).

3. **Tester avec de vraies données** : Les produits avec variantes exposent des bugs invisibles sur des produits simples.

4. **Logger abondamment** : Les console.log dans les APIs PayPal ont été essentiels pour debugger.

5. **PowerShell et fichiers [id]** : Les crochets dans les noms de dossiers nécessitent des échappements avec backticks.

---

## 📞 Support

### En cas de problème

1. **Vérifier les logs serveur** : `npm run dev` dans le terminal
2. **Vérifier la console navigateur** : F12 → Console
3. **Vérifier Supabase** : Dashboard → Table Editor
4. **Vérifier PayPal** : https://www.sandbox.paypal.com/

### Contacts
- **PayPal Support** : https://developer.paypal.com/support/
- **Supabase Support** : https://supabase.com/support
- **Resend Support** : https://resend.com/docs

---

## 📝 Notes techniques

### Format des metadata dans orders
```json
{
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",  // ✅ IMPORTANT
      "name": "Product name - Size",
      "price": 165,
      "quantity": 1,
      "variant_name": "S",
      "image": "url"
    }
  ]
}
```

### Structure stock_movements
```sql
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY,
  variant_id uuid REFERENCES product_variants(id),
  delta integer,  -- Négatif = décrémentation
  reason text,
  created_at timestamp,
  created_by uuid
);
```

---

**Document généré le 7 novembre 2025**  
**Auteur** : Thomas & Claude  
**Version** : 1.0 - Production Ready (Sandbox)

🎉 **Félicitations pour avoir complété ce système de paiement complexe !** 🎉
