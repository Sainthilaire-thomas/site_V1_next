# 🚀 Guide de mise en œuvre Stripe

## Configuration des environnements Test & Live

---

## 📋 Vue d'ensemble

### Architecture des environnements

```
┌─────────────────┐
│     LOCAL       │  🔵 Stripe Test Mode
│  localhost:3000 │  Cartes 4242... uniquement
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│    STAGING      │  🟡 Stripe Test Mode
│  staging.xxx.com│  Cartes 4242... uniquement
└────────┬────────┘
         │ validation
         ▼
┌─────────────────┐
│   PRODUCTION    │  🟢 Stripe Live Mode
│  www.xxx.com    │  Vraies cartes bancaires
└─────────────────┘
```

---

## 🔑 ÉTAPE 1 : Récupérer les clés Stripe

### 1.1 Clés Test Mode

1. Va sur https://dashboard.stripe.com
2. Assure-toi d'être en **"Test Mode"** (coin supérieur droit)
3. Clique sur **"Developers" → "API keys"**
4. Copie les clés suivantes :

```bash
# Clés Test (commencent par "test")
STRIPE_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY_TEST=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

### 1.2 Clés Live Mode

1. Bascule en **"Live Mode"** (coin supérieur droit)
2. Va dans **"Developers" → "API keys"**
3. Copie les clés suivantes :

```bash
# Clés Live (commencent par "live")
STRIPE_SECRET_KEY_LIVE=sk_live_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY_LIVE=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT** : Ne commite JAMAIS ces clés dans Git !

---

## 🌐 ÉTAPE 2 : Configuration des Webhooks

### 2.1 Webhook Test Mode

1. Dashboard Stripe → **Test Mode**
2. **"Developers" → "Webhooks"**
3. Clique **"Add endpoint"**
4. Configure :

   ```
   URL: https://staging.blancherenaudin.com/api/webhooks/stripe

   Événements à écouter:
   ✅ checkout.session.completed
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ```

5. Copie le **"Signing secret"** :
   ```bash
   STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### 2.2 Webhook Live Mode

1. Dashboard Stripe → **Live Mode**
2. **"Developers" → "Webhooks"**
3. Clique **"Add endpoint"**
4. Configure :

   ```
   URL: https://blancherenaudin.com/api/webhooks/stripe

   Mêmes événements que Test Mode
   ```

5. Copie le **"Signing secret"** :
   ```bash
   STRIPE_WEBHOOK_SECRET_LIVE=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### 2.3 Webhook Local (développement)

Pour tester les webhooks en local, utilise Stripe CLI :

```bash
# Installation
brew install stripe/stripe-cli/stripe  # macOS
# ou télécharge sur https://stripe.com/docs/stripe-cli

# Login
stripe login

# Redirection des webhooks vers localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copie le webhook secret affiché
# whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## ⚙️ ÉTAPE 3 : Configuration des fichiers .env

### 3.1 Créer `.env.local` (développement local)

```bash
# .env.local
# ⚠️ Ajouter ce fichier dans .gitignore

# Environnement
NEXT_PUBLIC_APP_ENV=development

# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Supabase (existant)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Sanity (existant)
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3.2 Créer `.env.example` (template public)

```bash
# .env.example
# ✅ Ce fichier peut être committé (pas de secrets)

# Environnement
NEXT_PUBLIC_APP_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3.3 Vérifier `.gitignore`

```bash
# .gitignore
.env
.env.local
.env*.local
.env.production
.env.staging
```

---

## 🔧 ÉTAPE 4 : Modifier le code

### 4.1 Mettre à jour `src/lib/stripe.ts`

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

// Détection de l'environnement
const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production'

// Sélection des clés selon l'environnement
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

// Client Stripe
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Clé publique (utilisée côté client)
export const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!

if (!stripePublicKey) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable')
}

// Webhook secret
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

if (!stripeWebhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
}

// Helper pour savoir si on est en mode test
export const isStripeTestMode = stripeSecretKey.includes('_test_')

// Log du mode actif (uniquement en dev)
if (process.env.NODE_ENV === 'development') {
  console.log(`
🔧 Stripe Configuration:
   Mode: ${isStripeTestMode ? '🧪 TEST' : '💰 LIVE'}
   Env: ${process.env.NEXT_PUBLIC_APP_ENV}
   Public Key: ${stripePublicKey.slice(0, 20)}...
  `)
}
```

### 4.2 Créer un badge "Test Mode"

```typescript
// src/components/stripe/StripeModeBadge.tsx
'use client'

export function StripeModeBadge() {
  const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.includes('_test_')

  if (!isTestMode) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg font-bold text-sm">
      ⚠️ STRIPE TEST MODE
    </div>
  )
}
```

### 4.3 Intégrer le badge dans le layout

```typescript
// src/app/layout.tsx
import { StripeModeBadge } from '@/components/stripe/StripeModeBadge'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <StripeModeBadge />
      </body>
    </html>
  )
}
```

---

## 🚀 ÉTAPE 5 : Configuration Vercel avec Preview Deployments

### 5.0 Comprendre les environnements Vercel

Vercel gère **automatiquement 3 environnements** dans un seul projet :

```
┌─────────────────────────────────────────┐
│     PROJET VERCEL UNIQUE                │
│     "site-v1-next"                      │
├─────────────────────────────────────────┤
│                                         │
│  🔵 Development                         │
│     Variables pour le dev local         │
│                                         │
│  🟡 Preview (= Staging)                 │
│     Toutes les branches sauf "main"     │
│     URLs auto: xxx-git-branch.vercel.app│
│     → Utilise Stripe Test Mode          │
│                                         │
│  🟢 Production                          │
│     Branch "main" uniquement            │
│     → www.blancherenaudin.com           │
│     → Utilise Stripe Live Mode          │
│                                         │
└─────────────────────────────────────────┘
```

### 5.1 Activer les Preview Deployments

1. **Vercel Dashboard** → Ton projet **"site-v1-next"**
2. **Settings** → **Git**
3. Vérifie que ces options sont activées :

```
✅ Production Branch: main
✅ Preview Deployments: Enabled
✅ Automatic Deployments for Git Pushes: Enabled
```

**Ce que ça signifie** :

- Chaque push sur `main` → déploiement Production
- Chaque push sur une autre branche → déploiement Preview (staging)

### 5.2 Configurer les variables d'environnement

#### A. Variables pour Preview (Staging - Stripe Test)

1. **Settings → Environment Variables**
2. Clique **"Add New"**
3. Pour chaque variable Stripe Test, configure :

**Variable 1 : NEXT_PUBLIC_APP_ENV**

```
Name: NEXT_PUBLIC_APP_ENV
Value: staging
Environments: ☑ Preview (cocher uniquement Preview)
```

**Variable 2 : STRIPE_SECRET_KEY (Test)**

```
Name: STRIPE_SECRET_KEY
Value: sk_test_xxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Preview
```

**Variable 3 : NEXT_PUBLIC_STRIPE_PUBLIC_KEY (Test)**

```
Name: NEXT_PUBLIC_STRIPE_PUBLIC_KEY
Value: pk_test_xxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Preview
```

**Variable 4 : STRIPE_WEBHOOK_SECRET (Test)**

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_test_xxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Preview
```

#### B. Variables pour Production (Stripe Live)

Pour chaque variable Stripe Live :

**Variable 1 : NEXT_PUBLIC_APP_ENV**

```
Name: NEXT_PUBLIC_APP_ENV
Value: production
Environments: ☑ Production (cocher uniquement Production)
```

**Variable 2 : STRIPE_SECRET_KEY (Live)**

```
Name: STRIPE_SECRET_KEY
Value: sk_live_xxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production
```

**Variable 3 : NEXT_PUBLIC_STRIPE_PUBLIC_KEY (Live)**

```
Name: NEXT_PUBLIC_STRIPE_PUBLIC_KEY
Value: pk_live_xxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production
```

**Variable 4 : STRIPE_WEBHOOK_SECRET (Live)**

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_live_xxxxxxxxxxxxxxxxxxxxx
Environments: ☑ Production
```

#### C. Variables communes (tous les environnements)

Ces variables sont identiques pour Preview et Production :

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxx.supabase.co
Environments: ☑ Production ☑ Preview

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc...
Environments: ☑ Production ☑ Preview

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc...
Environments: ☑ Production ☑ Preview

Name: NEXT_PUBLIC_SANITY_PROJECT_ID
Value: abc123
Environments: ☑ Production ☑ Preview

Name: NEXT_PUBLIC_SANITY_DATASET
Value: production
Environments: ☑ Production ☑ Preview
```

### 5.3 Tableau récapitulatif des variables

| Variable                        | Preview (Test)   | Production (Live) |
| ------------------------------- | ---------------- | ----------------- |
| `NEXT_PUBLIC_APP_ENV`           | `staging`        | `production`      |
| `STRIPE_SECRET_KEY`             | `sk_test_xxx`    | `sk_live_xxx`     |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | `pk_test_xxx`    | `pk_live_xxx`     |
| `STRIPE_WEBHOOK_SECRET`         | `whsec_test_xxx` | `whsec_live_xxx`  |
| `NEXT_PUBLIC_SUPABASE_URL`      | Identique        | Identique         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Identique        | Identique         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Identique        | Identique         |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Identique        | Identique         |
| `NEXT_PUBLIC_SANITY_DATASET`    | Identique        | Identique         |

### 5.4 Tester la configuration

#### Test 1 : Créer une Preview Deployment

```bash
# Créer une branche de test
git checkout -b test-stripe-preview
git push origin test-stripe-preview
```

**Résultat attendu** :

1. Vercel déploie automatiquement
2. Tu reçois une notification avec l'URL Preview
3. Format URL : `site-v1-next-git-test-stripe-preview-xxx.vercel.app`

#### Test 2 : Vérifier le mode Stripe

1. Ouvre l'URL Preview dans ton navigateur
2. Ouvre la console développeur (F12)
3. Tu devrais voir :
   ```
   🔧 Stripe Configuration:
      Mode: 🧪 TEST
      Env: staging
   ```
4. Le badge "⚠️ STRIPE TEST MODE" devrait apparaître en bas à droite

#### Test 3 : Tester un paiement

1. Va sur `/checkout` de ton URL Preview
2. Utilise la carte `4242 4242 4242 4242`
3. Le paiement doit passer en Test Mode

#### Test 4 : Vérifier Production

1. Push sur `main` :
   ```bash
   git checkout main
   git merge test-stripe-preview
   git push origin main
   ```
2. Ouvre `www.blancherenaudin.com`
3. Console devrait afficher :
   ```
   🔧 Stripe Configuration:
      Mode: 💰 LIVE
      Env: production
   ```
4. Le badge Test Mode ne devrait PAS apparaître

### 5.5 Configuration optionnelle : Protection des Previews

Pour éviter que n'importe qui accède à tes URLs de Preview :

1. **Settings → Deployment Protection**
2. Active **"Vercel Authentication"**
3. Seuls les membres de ton équipe Vercel pourront voir les Previews

Alternative : **Password Protection**

```
Settings → Deployment Protection
→ Password Protection
→ Set Password: ton_mot_de_passe
```

### 5.6 Configuration optionnelle : Domaine Staging permanent

Si tu veux une URL staging fixe (au lieu d'URLs variables par branche) :

1. Crée une branche `staging` :

   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Settings → Domains**
3. Ajoute : `staging.blancherenaudin.com`
4. Associe-le à la branche `staging`

**Avantages** :

- URL fixe et mémorisable
- Webhook Stripe configuré une seule fois
- Environnement de QA permanent

**Workflow avec staging permanent** :

```bash
# Développer
feature → staging (Preview) → main (Production)
```

---

## ✅ ÉTAPE 6 : Checklist avant activation Live Mode

### 6.1 Vérifications Stripe Dashboard (Live Mode)

- [ ] **Compte Stripe activé** (vérification d'identité complétée)
- [ ] **Informations bancaires configurées** (IBAN pour recevoir les fonds)
- [ ] **Email de contact** vérifié
- [ ] **Nom de la société** renseigné
- [ ] **URL du site** configurée
- [ ] **Logo** uploadé (affiché sur les reçus)
- [ ] **3D Secure activé** (obligatoire en Europe)
- [ ] **Emails Stripe configurés** (reçus clients)

### 6.2 Tests obligatoires en Staging

- [ ] Checkout complet avec carte test `4242 4242 4242 4242`
- [ ] Webhooks reçus correctement (vérifier logs Stripe)
- [ ] Email de confirmation envoyé
- [ ] Commande créée dans Supabase
- [ ] Stock décrémenté correctement
- [ ] Test carte déclinée `4000 0000 0000 0002`
- [ ] Test 3D Secure `4000 0027 6000 3184`

### 6.3 Premier test en Production

⚠️ **Teste d'abord avec ta propre carte** :

1. Passe une vraie commande de 1€
2. Vérifie le webhook
3. Vérifie l'email
4. Vérifie la commande dans Supabase
5. **Rembourse-toi** via Stripe Dashboard

---

## 🧪 ÉTAPE 7 : Workflow de développement

### Cas d'usage 1 : Nouvelle feature checkout

```bash
# 1. Développer en local
npm run dev
# → Tester avec 4242 4242 4242 4242

# 2. Push sur Git
git add .
git commit -m "feat: nouvelle feature checkout"
git push origin main

# 3. Vercel déploie automatiquement sur staging
# → URL: https://site-xxx-preview.vercel.app
# → Tester avec 4242 4242 4242 4242

# 4. Validation OK → Merge en production
git checkout production
git merge main
git push origin production

# 5. Production déployée
# → URL: https://blancherenaudin.com
# → Mode Live activé automatiquement
```

### Cas d'usage 2 : Bug en production

```bash
# 1. Reproduire le bug en staging (Test Mode)
# → Cartes de test OK

# 2. Fix le code

# 3. Tester en staging

# 4. Hotfix en prod
git push origin production
```

---

## 🔍 ÉTAPE 8 : Monitoring & Logs

### 8.1 Vérifier le mode actif

Ajoute des logs dans `src/app/checkout/page.tsx` :

```typescript
console.log('💳 Stripe Environment:', {
  mode: process.env.NEXT_PUBLIC_APP_ENV,
  isTestMode: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.includes('_test_'),
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.slice(0, 20) + '...',
})
```

### 8.2 Dashboard Stripe

- **Test Mode** : https://dashboard.stripe.com/test/payments
- **Live Mode** : https://dashboard.stripe.com/payments

### 8.3 Logs Vercel

- Vercel Dashboard → Ton projet → Logs
- Filtre par environnement (Production / Preview)

---

## 🆘 Dépannage

### Problème : Webhooks non reçus

```bash
# Vérifier la configuration
Stripe Dashboard → Webhooks → Ton endpoint
→ Vérifier l'URL
→ Vérifier les événements
→ Tester avec "Send test webhook"
```

### Problème : Carte déclinée en Test Mode

```bash
# Utilise les bonnes cartes de test
✅ 4242 4242 4242 4242 (succès)
✅ 4000 0000 0000 0002 (décliné)
✅ 4000 0027 6000 3184 (3D Secure)

# Liste complète :
https://stripe.com/docs/testing
```

### Problème : Variables d'environnement non prises en compte

```bash
# Vercel : Redéployer après changement
vercel env pull .env.local  # Récupérer les vars
vercel --prod  # Redéployer

# Local : Redémarrer Next.js
npm run dev
```

---

## 📊 Résumé des environnements

| Environnement  | URL             | Stripe Mode | Cartes  | Argent   |
| -------------- | --------------- | ----------- | ------- | -------- |
| **Local**      | localhost:3000  | Test        | 4242... | Fictif   |
| **Staging**    | staging.xxx.com | Test        | 4242... | Fictif   |
| **Production** | www.xxx.com     | **Live**    | Réelles | **Réel** |

---

## 🎯 Prochaines étapes

Après la mise en production :

1. **Surveiller les premières transactions** (Dashboard Stripe)
2. **Vérifier les webhooks** (100% de succès attendu)
3. **Tester les remboursements** (Dashboard → Payments → Refund)
4. **Configurer les alertes** (Stripe → Settings → Notifications)
5. **Analyser les conversions** (Stripe → Analytics)

---

## 📞 Support

- **Documentation Stripe** : https://stripe.com/docs
- **Support Stripe** : https://support.stripe.com
- **Cartes de test** : https://stripe.com/docs/testing

---

**Document créé le 20 octobre 2025**
**Version 1.0**
