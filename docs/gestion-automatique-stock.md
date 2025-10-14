# 🔧 Gestion automatique du stock lors des commandes

**Date de création** : 12 octobre 2025

**Statut** : À implémenter

**Priorité** : Haute ⚠️

---

## 📋 Contexte

Actuellement, le site **blancherenaudin.com** ne gère **PAS automatiquement** le stock lors des commandes. Le stock doit être ajusté manuellement via l'interface admin.

### État actuel ✅

- ✅ Gestion manuelle du stock via `/admin/products`
- ✅ Système de `stock_movements` fonctionnel
- ✅ Triggers de calcul du stock en base de données
- ✅ Webhooks Stripe fonctionnels pour créer les commandes

### Ce qui manque ❌

- ❌ Déduction automatique du stock lors d'une commande payée
- ❌ Restauration du stock lors d'une annulation/remboursement
- ❌ Vérification de disponibilité avant le paiement
- ❌ Gestion des stocks insuffisants
- ❌ Notifications de stock bas

---

## 🎯 Objectifs

1. **Déduire automatiquement le stock** quand une commande est payée
2. **Restaurer le stock** quand une commande est annulée ou remboursée
3. **Vérifier la disponibilité** avant de créer la session Stripe
4. **Empêcher la survente** (vendre plus que le stock disponible)
5. **Logger tous les mouvements** pour traçabilité

---

## 🗂️ Structure de la base de données

### Tables concernées

```sql
-- Produits (stock global du produit)
products (
  id UUID,
  stock_quantity INTEGER,  -- Calculé automatiquement
  ...
)

-- Variantes (stock spécifique par taille/couleur)
product_variants (
  id UUID,
  product_id UUID,
  stock_quantity INTEGER,  -- Stock de cette variante
  ...
)

-- Mouvements de stock (historique)
stock_movements (
  id UUID,
  variant_id UUID,
  delta INTEGER,           -- Positif = ajout, Négatif = retrait
  reason TEXT,             -- 'order', 'order_cancelled', 'adjustment', etc.
  created_by UUID,         -- NULL = système
  created_at TIMESTAMP
)

-- Items de commande
order_items (
  id UUID,
  order_id UUID,
  product_id UUID,
  variant_id UUID,         -- NULL si pas de variante
  quantity INTEGER,
  ...
)
```

### Fonction PostgreSQL existante

```sql
-- Recalcule le stock d'un produit à partir de ses variantes
recompute_product_stock(p_product_id UUID)
```

---

## 📝 Plan d'implémentation

### Phase 1 : Déduction du stock à la commande

#### Fichier : `src/app/api/webhooks/stripe/route.ts`

**Localisation** : Ajouter après la fonction `handlePaymentIntentFailed`

```typescript
/**
 * Déduit le stock pour tous les items d'une commande
 * Appelée après la création des order_items
 */
async function decrementStock(orderItems: any[]) {
  console.log('📦 Step D: Decrementing stock...')

  const errors: any[] = []

  for (const item of orderItems) {
    const { product_id, variant_id, quantity, id } = item

    try {
      if (variant_id) {
        // ✅ CAS 1 : Produit avec variante (ex: T-shirt taille M)
        console.log(`   Decrementing variant ${variant_id} by ${quantity}`)

        const { error } = await supabaseAdmin.from('stock_movements').insert({
          variant_id: variant_id,
          delta: -quantity, // ← Négatif pour déduire
          reason: 'order',
          reference_id: id, // ID de l'order_item pour traçabilité
          created_by: null, // NULL = système
        })

        if (error) {
          console.error(
            `   ❌ Error decrementing variant ${variant_id}:`,
            error
          )
          errors.push({ item_id: id, variant_id, error: error.message })
        } else {
          console.log(
            `   ✅ Variant ${variant_id} stock decremented by ${quantity}`
          )
        }

        // Recalculer le stock global du produit
        await supabaseAdmin.rpc('recompute_product_stock', {
          p_product_id: product_id,
        })
      } else if (product_id) {
        // ✅ CAS 2 : Produit sans variante (stock global)
        console.log(`   Decrementing product ${product_id} by ${quantity}`)

        // Trouver la variante par défaut (ou créer un système de stock global)
        const { data: defaultVariant } = await supabaseAdmin
          .from('product_variants')
          .select('id')
          .eq('product_id', product_id)
          .limit(1)
          .single()

        if (defaultVariant) {
          const { error } = await supabaseAdmin.from('stock_movements').insert({
            variant_id: defaultVariant.id,
            delta: -quantity,
            reason: 'order',
            reference_id: id,
            created_by: null,
          })

          if (error) {
            console.error(
              `   ❌ Error decrementing product ${product_id}:`,
              error
            )
            errors.push({ item_id: id, product_id, error: error.message })
          } else {
            console.log(
              `   ✅ Product ${product_id} stock decremented by ${quantity}`
            )
          }

          // Recalculer le stock du produit
          await supabaseAdmin.rpc('recompute_product_stock', {
            p_product_id: product_id,
          })
        } else {
          console.error(`   ⚠️ No variant found for product ${product_id}`)
          errors.push({ item_id: id, product_id, error: 'No variant found' })
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Exception while decrementing stock:`, err)
      errors.push({ item_id: id, error: err.message })
    }
  }

  if (errors.length > 0) {
    console.error('⚠️ Some stock decrements failed:', errors)
    // ⚠️ IMPORTANT : Logger ces erreurs dans un système de monitoring
    // (ex: Sentry, LogSnag, etc.)
  } else {
    console.log('✅ Stock decremented successfully for all items')
  }

  return { ok: errors.length === 0, errors }
}
```

**Intégration dans `createOrderItemsFromSession`** :

```typescript
async function createOrderItemsFromSession(
  orderId: string,
  fullSession: any,
  paymentIntentId: string | any
) {
  try {
    // ... (code existant : mise à jour order, parsing items, insertion order_items)

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) {
      // ... (gestion d'erreur existante)
    }

    if (!insertedItems || insertedItems.length === 0) {
      console.error('⚠️ No items were inserted')
      return
    }

    console.log(`✅ Successfully created ${insertedItems.length} order items`)
    console.log('   IDs:', insertedItems.map((i) => i.id).join(', '))

    // ✅ NOUVEAU : Déduire le stock après création des items
    const stockResult = await decrementStock(insertedItems)

    if (!stockResult.ok) {
      console.error('⚠️ Stock decrement had errors, but order was created')
      // TODO: Envoyer une notification à l'admin
    }
  } catch (error) {
    console.error('❌ Error in createOrderItemsFromSession:', error)
  }
}
```

---

### Phase 2 : Restauration du stock (annulations/remboursements)

#### Ajouter un nouveau webhook handler

```typescript
/**
 * Restaure le stock lors d'une annulation ou d'un remboursement
 */
async function restoreStockForOrder(orderId: string, reason: string) {
  console.log(`🔄 Restoring stock for order ${orderId} (reason: ${reason})`)

  // Récupérer les items de la commande
  const { data: orderItems, error: fetchError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (fetchError || !orderItems || orderItems.length === 0) {
    console.error('❌ Error fetching order items:', fetchError)
    return { ok: false, error: fetchError?.message }
  }

  const errors: any[] = []

  for (const item of orderItems) {
    const { product_id, variant_id, quantity, id } = item

    try {
      if (variant_id) {
        const { error } = await supabaseAdmin.from('stock_movements').insert({
          variant_id: variant_id,
          delta: quantity, // ← Positif pour restaurer
          reason: reason,
          reference_id: id,
          created_by: null,
        })

        if (error) {
          console.error(`   ❌ Error restoring variant ${variant_id}:`, error)
          errors.push({ item_id: id, variant_id, error: error.message })
        } else {
          console.log(
            `   ✅ Variant ${variant_id} stock restored by ${quantity}`
          )
        }

        // Recalculer le stock du produit
        await supabaseAdmin.rpc('recompute_product_stock', {
          p_product_id: product_id,
        })
      } else if (product_id) {
        const { data: defaultVariant } = await supabaseAdmin
          .from('product_variants')
          .select('id')
          .eq('product_id', product_id)
          .limit(1)
          .single()

        if (defaultVariant) {
          const { error } = await supabaseAdmin.from('stock_movements').insert({
            variant_id: defaultVariant.id,
            delta: quantity,
            reason: reason,
            reference_id: id,
            created_by: null,
          })

          if (error) {
            console.error(`   ❌ Error restoring product ${product_id}:`, error)
            errors.push({ item_id: id, product_id, error: error.message })
          } else {
            console.log(
              `   ✅ Product ${product_id} stock restored by ${quantity}`
            )
          }

          await supabaseAdmin.rpc('recompute_product_stock', {
            p_product_id: product_id,
          })
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Exception while restoring stock:`, err)
      errors.push({ item_id: id, error: err.message })
    }
  }

  if (errors.length > 0) {
    console.error('⚠️ Some stock restorations failed:', errors)
  } else {
    console.log('✅ Stock restored successfully for all items')
  }

  return { ok: errors.length === 0, errors }
}
```

#### Ajouter les handlers Stripe pour les remboursements

Dans la fonction `POST` du webhook, ajouter ces cases :

```typescript
export async function POST(req: NextRequest) {
  // ... (code existant)

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object)
      break

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object)
      break

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object)
      break

    // ✅ NOUVEAUX HANDLERS
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object)
      break

    case 'payment_intent.canceled':
      await handlePaymentIntentCanceled(event.data.object)
      break

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

// Nouveau handler pour les remboursements
async function handleChargeRefunded(charge: any) {
  console.log('\n💰 Charge refunded:', charge.id)

  const paymentIntentId = charge.payment_intent

  // Trouver la commande
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, order_number')
    .eq('payment_intent_id', paymentIntentId)
    .single()

  if (!order) {
    console.error('❌ Order not found for refund')
    return
  }

  console.log(`📦 Restoring stock for order ${order.order_number}`)

  // Restaurer le stock
  await restoreStockForOrder(order.id, 'order_refunded')

  // Mettre à jour le statut de la commande
  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'refunded',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  console.log('✅ Order marked as refunded and stock restored')
}

// Nouveau handler pour les annulations
async function handlePaymentIntentCanceled(paymentIntent: any) {
  console.log('\n🚫 Payment intent canceled:', paymentIntent.id)

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, order_number')
    .eq('payment_intent_id', paymentIntent.id)
    .single()

  if (!order) {
    console.error('❌ Order not found for cancellation')
    return
  }

  console.log(`📦 Restoring stock for order ${order.order_number}`)

  // Restaurer le stock
  await restoreStockForOrder(order.id, 'payment_canceled')

  // Mettre à jour le statut
  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'canceled',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  console.log('✅ Order marked as canceled and stock restored')
}
```

---

### Phase 3 : Vérification du stock AVANT le paiement

#### Fichier : `src/app/api/checkout/route.ts`

**Ajouter avant la création de la session Stripe** :

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, email, ... } = body

    // Validation des données (existant)
    // ...

    // ✅ NOUVEAU : Vérifier la disponibilité du stock
    console.log('📦 Checking stock availability...')

    const stockErrors: any[] = []

    for (const item of items) {
      const { product_id, variant_id, quantity } = item

      if (variant_id) {
        // Vérifier le stock de la variante
        const { data: variant, error } = await supabaseAdmin
          .from('product_variants')
          .select('stock_quantity, product_id')
          .eq('id', variant_id)
          .single()

        if (error || !variant) {
          stockErrors.push({
            product_id,
            variant_id,
            error: 'Variant not found',
          })
          continue
        }

        if (variant.stock_quantity < quantity) {
          stockErrors.push({
            product_id,
            variant_id,
            requested: quantity,
            available: variant.stock_quantity,
            error: 'Insufficient stock',
          })
        }

      } else if (product_id) {
        // Vérifier le stock global du produit
        const { data: product, error } = await supabaseAdmin
          .from('products')
          .select('stock_quantity')
          .eq('id', product_id)
          .single()

        if (error || !product) {
          stockErrors.push({
            product_id,
            error: 'Product not found',
          })
          continue
        }

        if (product.stock_quantity < quantity) {
          stockErrors.push({
            product_id,
            requested: quantity,
            available: product.stock_quantity,
            error: 'Insufficient stock',
          })
        }
      }
    }

    // Si des erreurs de stock, refuser la commande
    if (stockErrors.length > 0) {
      console.error('❌ Stock check failed:', stockErrors)
      return NextResponse.json(
        {
          error: 'Stock insuffisant pour certains articles',
          details: stockErrors,
        },
        { status: 400 }
      )
    }

    console.log('✅ Stock check passed')

    // ... (continuer avec la création de la session Stripe)
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

### Phase 4 : Amélioration de la table `stock_movements`

#### Migration SQL à exécuter

```sql
-- Ajouter une colonne reference_id pour tracer l'origine du mouvement
ALTER TABLE stock_movements
ADD COLUMN IF NOT EXISTS reference_id UUID;

-- Ajouter un commentaire pour la colonne
COMMENT ON COLUMN stock_movements.reference_id IS 'ID de l''order_item ou autre entité liée';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference
ON stock_movements(reference_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_created
ON stock_movements(variant_id, created_at DESC);
```

---

## 🧪 Tests à effectuer

### Test 1 : Commande normale

```bash
# 1. Noter le stock initial d'un produit
SELECT stock_quantity FROM product_variants WHERE id = 'variant-uuid';

# 2. Passer une commande de 2 articles
# (via l'interface)

# 3. Vérifier que le stock a diminué
SELECT stock_quantity FROM product_variants WHERE id = 'variant-uuid';
# Devrait être : stock_initial - 2

# 4. Vérifier les mouvements de stock
SELECT * FROM stock_movements
WHERE variant_id = 'variant-uuid'
ORDER BY created_at DESC
LIMIT 1;
# Devrait montrer : delta = -2, reason = 'order'
```

### Test 2 : Remboursement

```bash
# 1. Faire un remboursement via Stripe Dashboard
# (Payments → Sélectionner le paiement → Refund)

# 2. Vérifier que le stock est restauré
SELECT stock_quantity FROM product_variants WHERE id = 'variant-uuid';
# Devrait être : stock après commande + 2

# 3. Vérifier les mouvements
SELECT * FROM stock_movements
WHERE variant_id = 'variant-uuid'
ORDER BY created_at DESC
LIMIT 2;
# Devrait montrer :
# - delta = +2, reason = 'order_refunded' (le plus récent)
# - delta = -2, reason = 'order' (précédent)
```

### Test 3 : Stock insuffisant

```bash
# 1. Mettre le stock à 1
UPDATE product_variants SET stock_quantity = 1 WHERE id = 'variant-uuid';

# 2. Essayer de commander 2 articles
# → Devrait être refusé avec erreur 400

# 3. Vérifier qu'aucun mouvement n'a été créé
SELECT COUNT(*) FROM stock_movements
WHERE variant_id = 'variant-uuid'
AND created_at > NOW() - INTERVAL '5 minutes';
# Devrait être 0
```

---

## 🚨 Points d'attention

### ⚠️ Race conditions

Si 2 clients commandent le dernier article en même temps :

**Solution actuelle** : Le premier qui paye obtient l'article, le second voit son paiement réussir mais le stock sera négatif.

**Solution optimale** (à implémenter plus tard) :

- Verrouiller temporairement le stock pendant le checkout
- Utiliser des transactions PostgreSQL avec `FOR UPDATE`
- Ajouter un système de réservation de stock (15 min max)

### 📊 Monitoring

Ajouter des alertes pour :

- Stock négatif (erreur critique)
- Échec de déduction de stock après paiement réussi
- Différence entre stock calculé et stock réel

### 🔄 Cohérence des données

Si un webhook échoue, le stock ne sera pas mis à jour. Solutions :

- **Job de réconciliation quotidien** : Comparer les commandes vs mouvements
- **Retry automatique** des webhooks (activé dans Stripe Dashboard)
- **Notifications admin** en cas d'incohérence

---

## 📋 Checklist d'implémentation

### Préparation

- [ ] Faire un backup de la base de données
- [ ] Tester en local avec Stripe CLI
- [ ] Ajouter la colonne `reference_id` à `stock_movements`

### Phase 1 - Déduction du stock

- [ ] Ajouter la fonction `decrementStock()`
- [ ] Intégrer dans `createOrderItemsFromSession()`
- [ ] Tester avec une commande de test
- [ ] Vérifier les logs dans Vercel Functions
- [ ] Vérifier les mouvements dans la DB

### Phase 2 - Restauration du stock

- [ ] Ajouter la fonction `restoreStockForOrder()`
- [ ] Ajouter les handlers `handleChargeRefunded()` et `handlePaymentIntentCanceled()`
- [ ] Ajouter les event types dans le switch
- [ ] Configurer les nouveaux webhooks dans Stripe Dashboard
- [ ] Tester un remboursement complet
- [ ] Tester un remboursement partiel (optionnel)

### Phase 3 - Vérification avant paiement

- [ ] Ajouter la vérification dans `/api/checkout`
- [ ] Tester avec un stock insuffisant
- [ ] Améliorer l'affichage côté frontend

### Phase 4 - Tests en production

- [ ] Passer une vraie commande de test
- [ ] Vérifier que le stock diminue
- [ ] Faire un remboursement de test
- [ ] Vérifier que le stock remonte
- [ ] Monitorer pendant 24h

---

## 🔗 Ressources

### Documentation Stripe

- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Refunds](https://stripe.com/docs/refunds)
- [Event Types](https://stripe.com/docs/api/events/types)

### Fichiers du projet concernés

- `src/app/api/webhooks/stripe/route.ts` - Webhooks Stripe
- `src/app/api/checkout/route.ts` - Création de commande
- `src/app/api/admin/variants/[variantId]/stock-adjust/route.ts` - Gestion manuelle stock

### SQL utiles pour le debugging

```sql
-- Voir tous les mouvements récents
SELECT
  sm.created_at,
  sm.delta,
  sm.reason,
  sm.reference_id,
  pv.stock_quantity as current_stock,
  p.name as product_name
FROM stock_movements sm
JOIN product_variants pv ON pv.id = sm.variant_id
JOIN products p ON p.id = pv.product_id
ORDER BY sm.created_at DESC
LIMIT 20;

-- Trouver les stocks négatifs (problème)
SELECT
  pv.id,
  p.name,
  pv.stock_quantity
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity < 0;

-- Réconcilier les commandes vs mouvements
SELECT
  o.order_number,
  o.payment_status,
  COUNT(oi.id) as items_count,
  COUNT(sm.id) as movements_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN stock_movements sm ON sm.reference_id = oi.id
WHERE o.payment_status = 'paid'
GROUP BY o.id, o.order_number, o.payment_status
HAVING COUNT(oi.id) != COUNT(sm.id);
```

---

## 📞 Support

En cas de problème lors de l'implémentation :

1. Vérifier les logs Vercel Functions
2. Vérifier les webhooks dans Stripe Dashboard
3. Consulter la table `stock_movements` en DB
4. Vérifier que les triggers PostgreSQL fonctionnent

---

**Fin de la documentation** ✅

Cette documentation complète peut être utilisée dans une future session Claude pour implémenter la gestion du stock sans avoir besoin de contexte supplémentaire.
