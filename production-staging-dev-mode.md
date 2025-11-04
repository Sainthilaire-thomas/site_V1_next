## 🌍 Les 3 environnements expliqués simplement

### 📍 Pense à ça comme 3 versions de ton site web :

```
┌─────────────────────────────────────────────────────┐
│  TON PROJET : site-v1-next                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔵 DÉVELOPPEMENT (Local)                          │
│  └─ Ton ordinateur                                 │
│     URL: http://localhost:3000                     │
│     Pour : Coder et tester en local                │
│                                                     │
│  🟡 STAGING (Preview)                              │
│  └─ Serveurs Vercel                                │
│     URL: site-v1-next-git-xxx.vercel.app           │
│     Pour : Tester avant de mettre en production    │
│                                                     │
│  🟢 PRODUCTION                                     │
│  └─ Serveurs Vercel                                │
│     URL: www.blancherenaudin.com                   │
│     Pour : Ton site public que les clients voient  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Comment ça marche concrètement ?

### Scénario 1 : Tu codes une nouvelle fonctionnalité

bash

```bash
# 1️⃣ Tu es sur ton ordinateur (Local)
localhost:3000
→ Tu codes une nouvelle page produit
→ Tu testes avec npm run dev
→ Tout fonctionne ! ✅

# 2️⃣ Tu veux tester sur internet avant de publier
git checkout -b nouvelle-page-produit
gitadd.
git commit -m "feat: nouvelle page produit"
git push origin nouvelle-page-produit

# 3️⃣ Vercel détecte automatiquement le push
→ Crée une Preview (Staging) automatiquement
→ URL générée : site-v1-next-git-nouvelle-page-produit-xxx.vercel.app
→ Tu peux tester sur cette URL
→ Tes collègues/clients peuvent voir cette URL
→ Mais ce n'est PAS encore sur le site public

# 4️⃣ Si tout est OK, tu merge en production
git checkout main
git merge nouvelle-page-produit
git push origin main

# 5️⃣ Vercel détecte le push sur "main"
→ Déploie automatiquement sur PRODUCTION
→ URL : www.blancherenaudin.com
→ Maintenant c'est public ! 🎉
```

---

## 🔗 Les URLs Vercel expliquées

### 1. URL de Production (fixe)

```
www.blancherenaudin.com
```

- **Toujours la même** URL
- Liée à la branche `main` de ton GitHub
- C'est ce que les **vrais clients** voient
- Change uniquement quand tu push sur `main`

### 2. URLs de Preview (variables)

Vercel génère **automatiquement** une URL unique pour **chaque branche** que tu push :

```
Format : site-v1-next-git-[nom-de-branche]-[hash].vercel.app

Exemples :
- Branch "test-stripe" → site-v1-next-git-test-stripe-abc123.vercel.app
- Branch "nouvelle-page" → site-v1-next-git-nouvelle-page-def456.vercel.app
- Branch "fix-bug" → site-v1-next-git-fix-bug-ghi789.vercel.app
```

**Pourquoi c'est utile ?**

- Chaque développeur peut avoir son URL de test
- Tu peux montrer ton travail avant de le publier
- Plusieurs features peuvent être testées en parallèle

---

## 🎨 Exemple concret avec ton projet e-commerce

### Situation actuelle

```
🟢 PRODUCTION (www.blancherenaudin.com)
   └─ Branch: main
   └─ État : Site en ligne avec Stripe Test Mode
   └─ Clients : Peuvent voir le site mais paiements en test

🟡 PREVIEW (aucune pour l'instant)
   └─ Tu n'as pas encore créé d'autres branches
```

### Situation recommandée

```
🟢 PRODUCTION (www.blancherenaudin.com)
   └─ Branch: main
   └─ Stripe: Mode Live (vraies cartes)
   └─ Variables : STRIPE_SECRET_KEY = sk_live_...

🟡 STAGING PERMANENT (staging.blancherenaudin.com)
   └─ Branch: staging (branche dédiée)
   └─ Stripe: Mode Test (carte 4242)
   └─ Variables : STRIPE_SECRET_KEY = sk_test_...
   └─ Pour : Tester les nouvelles features

🔵 PREVIEW TEMPORAIRES (site-v1-next-git-xxx.vercel.app)
   └─ Branches : feature-xyz, fix-abc, etc.
   └─ Stripe: Mode Test
   └─ Pour : Tester rapidement une branche
```

---

## 🤔 Les questions fréquentes

### Q1 : Pourquoi avoir un Staging ET des Previews ?

**Staging (permanent)** :

- URL fixe que tu peux partager avec ton équipe
- Environnement stable pour tester avant production
- Webhook Stripe configuré une fois pour toutes

**Preview (temporaires)** :

- Pour tester rapidement une branche
- URLs jetables (tu peux les supprimer après)
- Pratique pour montrer une feature en développement

### Q2 : Les données sont-elles séparées ?

**Non !** Par défaut, tous les environnements utilisent :

- La **même base de données** Supabase
- Le **même Sanity CMS**
- Les **mêmes variables d'environnement** selon ce que tu configures

C'est pourquoi on utilise **Stripe Test Mode** en staging (pour ne pas créer de vraies commandes).

### Q3 : Comment savoir sur quel environnement je suis ?

**Méthode 1: L'URL**

```
localhost:3000                        → Local
site-v1-next-git-xxx.vercel.app      → Preview/Staging
www.blancherenaudin.com              → Production
```

**Méthode 2 : La variable NEXT_PUBLIC_APP_ENV**

javascript

```javascript
// Dans la console du navigateur (F12)
console.log(process.env.NEXT_PUBLIC_APP_ENV)

// Résultat :
"development"  → Local
"staging"      → Preview/Staging
"production"   → Production
```

**Méthode 3 : Le badge Stripe** (qu'on va créer)

```
⚠️ STRIPETESTMODE  → Tu es en staging
(pas de badge)       → Tu es en production
```

---

## 📊 Tableau récapitulatif

| Caractéristique     | Local                | Preview/Staging      | Production               |
| ------------------- | -------------------- | -------------------- | ------------------------ |
| **Où ?**            | Ton PC               | Serveurs Vercel      | Serveurs Vercel          |
| **URL**             | localhost:3000       | xxx.vercel.app       | www.blancherenaudin.com  |
| **Branch Git**      | N'importe            | Toutes sauf main     | main uniquement          |
| **Qui peut voir ?** | Toi                  | Toi + liens partagés | Tout le monde            |
| **Stripe**          | Test Mode            | Test Mode            | Live Mode (à configurer) |
| **Base de données** | Supabase             | Supabase             | Supabase                 |
| **Déploiement**     | Manuel (npm run dev) | Auto (git push)      | Auto (git push main)     |

---

## 🎯 Workflow recommandé (simplifié)

```
1.Je code une nouvelle fonctionnalité
   └─ Sur mon ordinateur(Local)
   └─ npm run dev → localhost:3000

2.Je veux la tester sur internet
   └─ git push origin ma-branche
   └─ Vercel crée automatiquement une Preview
   └─ URL: site-v1-next-git-ma-branche-xxx.vercel.app

3.Je teste avec mes collègues sur Staging
   └─ git push origin staging
   └─ URLstable: staging.blancherenaudin.com

4.Tout est validé → Je mets en production
   └─ git push origin main
   └─ URLpublique: www.blancherenaudin.com
```

---

## 🚀 Ce que tu dois retenir (l'essentiel)

1. **Production = ton site public** ([www.blancherenaudin.com](http://www.blancherenaudin.com))
2. **Preview/Staging = versions de test** (xxx.vercel.app)
3. **Vercel crée automatiquement** une URL pour chaque branche que tu push
4. **Tu peux avoir plusieurs Previews** en même temps (une par branche)
5. **Seule la branche `main`** est déployée en Production

---

## ❓ Maintenant, dis-moi :

Est-ce que tu comprends mieux ? Tu veux que je t'explique :

- Comment créer une branche staging permanente ?
- Comment configurer un sous-domaine staging.blancherenaudin.com ?
- Comment séparer les clés Stripe Test/Live entre Preview et Production ?

Ou tu as d'autres questions ? 😊
