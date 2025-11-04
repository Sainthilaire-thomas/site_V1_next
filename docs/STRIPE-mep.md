# 🎯 Documentation complète : Mise en place de Stripe

Parfait ! Ton code est compatible. Voici la doc complète de mise en place.

---

## 📋 Sommaire

1. [Configuration Stripe Dashboard](#1-configuration-stripe-dashboard)
2. [Variables d&#39;environnement](#2-variables-denvironnement)
3. [Mise à jour de la base de données](#3-mise-%C3%A0-jour-de-la-base-de-donn%C3%A9es)
4. [Installation du code](#4-installation-du-code)
5. [Tests locaux](#5-tests-locaux)
6. [Déploiement en production](#6-d%C3%A9ploiement-en-production)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Configuration Stripe Dashboard

### 1.1 Créer un compte Stripe

1. Va sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Remplis tes informations (email, mot de passe)
3. **Active le mode Test** (toggle en haut à droite du dashboard)

### 1.2 Récupérer les clés API

Dans **Developers > API keys** :

bash

```bash
# Clés TEST (pour développement)
Publishable key: pk_test_51...
Secret key: sk_test_51...

# Clés LIVE (pour production - ne les configure PAS maintenant)
Publishable key: pk_live_51...
Secret key: sk_live_51...
```

### 1.3 Configurer les webhooks (on le fera plus tard)

Pour l'instant, ne configure rien. On utilisera Stripe CLI pour les webhooks en local.

---

## 2. Variables d'environnement

### 2.1 Ajouter dans `.env.local`

bash

```bash
# Stripe (mode TEST)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=# On le remplira après avec stripe listen

# URL de base (pour les redirections)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2.2 Vérifier que `.env.local` est dans `.gitignore`

bash

```bash
# .gitignore
.env.local
.env*.local
```

⚠️ **CRITIQUE** : Ne JAMAIS commit les clés Stripe sur Git !

---

## 3. Mise à jour de la base de données

### 3.1 Vérifier la structure de la table `orders`

Ta table `orders` doit avoir ces colonnes pour Stripe :

sql

```sql
-- Vérifier dans Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name ='orders'
AND column_name IN(
'payment_intent_id',
'order_number'
);
```

**Résultat attendu** :

- ✅ `payment_intent_id` existe (type `text`)
- ✅ `order_number` existe (type `text`)

### 3.2 Ajouter les colonnes manquantes si nécessaire

Si elles n'existent pas, ajoute-les :

sql

```sql
-- Ajouter payment_intent_id si manquant
ALTERTABLE orders
ADDCOLUMNIFNOTEXISTS payment_intent_id TEXT;

-- Créer un index pour améliorer les performances
CREATEINDEXIFNOTEXISTS idx_orders_payment_intent
ON orders(payment_intent_id);
```

### 3.3 Vérifier la fonction `generate_order_number()`

Ta DB a déjà cette fonction (je l'ai vu dans `database.types.ts`). Vérifie qu'elle fonctionne :

sql

```sql
-- Tester la génération de numéro
SELECT generate_order_number();

-- Résultat attendu : quelque chose comme "ORD-20251010-0001"
```

Si elle n'existe pas, crée-la :

sql

```sql
CREATEORREPLACEFUNCTION generate_order_number()
RETURNSTEXTAS $$
DECLARE
  date_part TEXT;
  sequence_part TEXT;
  next_number INTEGER;
BEGIN
-- Format: ORD-YYYYMMDD-XXXX
  date_part := TO_CHAR(CURRENT_DATE,'YYYYMMDD');

-- Compter les commandes du jour
SELECTCOUNT(*)+1INTO next_number
FROM orders
WHEREDATE(created_at)=CURRENT_DATE;

-- Formater avec padding de zéros
  sequence_part := LPAD(next_number::TEXT,4,'0');

RETURN'ORD-'|| date_part ||'-'|| sequence_part;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Installation du code

### 4.1 Installer Stripe CLI

Installation Stripe CLI

Document

# Installation Stripe CLI

## macOS

```bash
brew install stripe/stripe-cli/stripe
```

## Windows (avec Scoop)

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

## Linux

````bash
# Télécharger





### 4.2 Mettre à jour `src/lib/stripe.ts`


Ton fichier actuel ne passe pas l'`apiVersion`. Remplace-le par :



src/lib/stripe.ts (mise à jour)

Code



// src/lib/stripe.ts
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY at runtime.')
  }

  i





### 4.3 Créer l'API Route pour le Checkout


Crée le fichier `src/app/api/checkout/route.ts` :



src/app/api/checkout/route.ts

Code



// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSupabase } from '@/lib/supabase-server'
import type { CartItem } from '@/lib/types'

export async functio





### 4.4 Créer le Webhook Handler


Crée le fichier `src/app/api/webhooks/stripe/route.ts` :



src/app/api/webhooks/stripe/route.ts

Code



// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Client





### 4.5 Mettre à jour la page Checkout


Remplace `src/app/checkout/page.tsx` par le code que j'ai donné précédemment (avec le bandeau bleu "Mode Test Stripe").


### 4.6 Créer la page de succès


Crée `src/app/checkout/success/page.tsx` avec le code que j'ai donné précédemment.


---


## 5. Tests locaux


### 5.1 Démarrer le serveur Next.js







bash

```bash
npm run dev
````

### 5.2 Démarrer Stripe CLI pour écouter les webhooks

Dans un **nouveau terminal** :

bash

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Tu vas voir un message comme** :

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copie ce secret** et ajoute-le dans `.env.local` :

bash

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Redémarre Next.js** pour prendre en compte la nouvelle variable.

### 5.3 Parcours complet de test

Checklist de test Stripe

Document

# ✅ Checklist de test Stripe

## Préparation

- [ ] `npm run dev` tourne sur localhost:3000
- [ ] `stripe listen` tourne dans un autre terminal
- [ ] `.env.local` contient les 3 clés Stripe
- [ ] Tu as vidé ton panier avant de commencer

## Test 1 : A

### 5.4 Cartes de test Stripe

Cartes de test Stripe

Document

# 💳 Cartes de test Stripe

## Paiement réussi

```
Numéro : 4242 4242 4242 4242
Date : N'importe quelle date future (ex: 12/34)
CVC : N'importe quel 3 chiffres (ex: 123)
```

## Authentification 3D Secure requise

````
Numéro : 4000 0027 6000 3184
Date





---


## 6. Déploiement en production


### 6.1 Configurer le webhook dans Stripe Dashboard


Une fois que tu es prêt pour la production :


1. Va sur [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
1. Clique sur **"Add endpoint"**
1. **Endpoint URL** : `https://ton-domaine.com/api/webhooks/stripe`
1. **Events to send** : Sélectionne :
   * `checkout.session.completed`
   * `payment_intent.succeeded`
   * `payment_intent.payment_failed`
1. Clique sur **"Add endpoint"**
1. Copie le **Signing secret** (commence par `whsec_`)


### 6.2 Variables d'environnement en production


Sur Vercel/Netlify/etc, ajoute :







bash

```bash
# Stripe LIVE (ATTENTION : clés différentes !)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_... (celui du dashboard)

# URL de base
NEXT_PUBLIC_BASE_URL=https://ton-domaine.com
````

### 6.3 Activer le mode Live

Dans le dashboard Stripe, **désactive le mode Test** (toggle en haut à droite).

⚠️ **ATTENTION** : En mode Live, les vraies cartes bancaires seront chargées !

---

## 7. Troubleshooting

### Erreur : "No such API key"

bash

```bash
# Vérifie que ta clé commence par sk_test_
echo$STRIPE_SECRET_KEY

# Redémarre Next.js après avoir modifié .env.local
```

### Erreur : "Invalid signature"

bash

```bash
# Vérifie que STRIPE_WEBHOOK_SECRET est bien celui de `stripe listen`
stripe listen --print-secret

# Copie le secret et colle-le dans .env.local
# Redémarre Next.js
```

### Le webhook ne se déclenche pas

bash

```bash
# Vérifie que stripe listen tourne
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Vérifie les logs dans ce terminal
```

### La commande ne se crée pas

bash

```bash
# Vérifie les logs du webhook
# Regarde dans le terminal de `stripe listen`

# Vérifie que SUPABASE_SERVICE_ROLE_KEY est configuré
echo$SUPABASE_SERVICE_ROLE_KEY
```

### Le panier ne se vide pas

javascript

```javascript
// Vérifie la console browser (F12)
// Tu devrais voir un appel à clearCart()

// Si ce n'est pas le cas, vérifie que useCartStore est bien importé
// dans src/app/checkout/success/page.tsx
```

### Erreur : "order_number must not be null"

sql

```sql
-- Vérifie que la fonction generate_order_number existe
SELECT generate_order_number();

-- Si elle n'existe pas, crée-la (voir section 3.3)
```

---

## 📚 Ressources utiles

- **Documentation Stripe Checkout** : [https://stripe.com/docs/payments/checkout](https://stripe.com/docs/payments/checkout)
- **Webhooks Stripe** : [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Cartes de test** : [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe CLI** : [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

---

## 🎉 Tu es prêt !

Suis les étapes dans l'ordre, et tu auras un système de paiement Stripe fonctionnel.

**Besoin d'aide ?** Montre-moi les logs de ton terminal ou les erreurs que tu rencontres ! 🚀
