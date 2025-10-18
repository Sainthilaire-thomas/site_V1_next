# 🔐 Documentation : Accès Admin & Client

## 📋 Vue d'ensemble

### Système actuel

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTIFICATION                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   Supabase Auth        │
              │   (email + password)   │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │   Table: profiles      │
              │   Champ: role          │
              └────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
   role = 'admin'                        role = 'customer'
        ↓                                      ↓
   /admin/*                               /account/*
   (Dashboard admin)                      (Espace client)
```

---

## 🚨 Problèmes actuels détectés

### 1. **Bouton login ne répond pas toujours** ❌

**Cause probable** : Double-clic ou état de chargement non géré

### 2. **Redirection incorrecte** ❌

Tous les utilisateurs sont redirigés vers `/admin/products` après login, même les clients

### 3. **Pas de feedback visuel** ❌

L'utilisateur ne sait pas si le formulaire est en cours de traitement

---

## 🔧 Corrections à apporter

### ✅ Fichier 1 : `src/app/auth/login/page.tsx` - CORRIGÉ

typescript

```typescript
'use client'

import{ useState }from'react'
import{ useRouter }from'next/navigation'
import{ supabaseBrowser }from'@/lib/supabase-browser'

exportdefaultfunctionLoginPage(){
const[mode, setMode]=useState<'signin'|'signup'>('signin')
const[email, setEmail]=useState('')
const[password, setPassword]=useState('')
const[error, setError]=useState<string|null>(null)
const[isLoading, setIsLoading]=useState(false)// ✅ NOUVEAU
const router =useRouter()

asyncfunctiononSubmit(e:React.FormEvent){
    e.preventDefault()

// ✅ Empêcher les double-clics
if(isLoading)return

setError(null)
setIsLoading(true)// ✅ NOUVEAU

try{
if(mode ==='signup'){
// === INSCRIPTION ===
const{ error }=await supabaseBrowser.auth.signUp({
          email,
          password
})

if(error){
setError(error.message)
return
}

// Créer le profil
awaitfetch('/api/auth/ensure-profile',{ method:'POST'})

// ✅ Redirection client après inscription
        router.push('/account')
        router.refresh()
return
}

// === CONNEXION ===
const{ error: signInError }=await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
})

if(signInError){
setError(signInError.message)
return
}

// Créer le profil si absent
awaitfetch('/api/auth/ensure-profile',{ method:'POST'})

// ✅ NOUVEAU : Vérifier le rôle avant redirection
const{ data: profile }=await supabaseBrowser
.from('profiles')
.select('role')
.single()

// ✅ Redirection intelligente
if(profile?.role ==='admin'){
        router.push('/admin/products')
}else{
        router.push('/account')
}

      router.refresh()

}catch(err:any){
setError(err?.message ||'Une erreur est survenue')
}finally{
setIsLoading(false)// ✅ NOUVEAU
}
}

return(
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
<div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">

{/* Header */}
<div className="text-center">
<h1 className="text-3xl font-light tracking-tight">
.blancherenaudin
</h1>
<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
{mode ==='signin'?'Connexion à votre compte':'Créer un compte'}
</p>
</div>

{/* Formulaire */}
<form onSubmit={onSubmit} className="space-y-6">
<div>
<label htmlFor="email" className="block text-sm font-medium mb-2">
Email
</label>
<input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              disabled={isLoading}// ✅ NOUVEAU
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
/>
</div>

<div>
<label htmlFor="password" className="block text-sm font-medium mb-2">
Mot de passe
</label>
<input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              disabled={isLoading}// ✅ NOUVEAU
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
/>
</div>

{/* ✅ Affichage des erreurs */}
{error &&(
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              ❌ {error}
</div>
)}

{/* ✅ Bouton avec état de chargement */}
<button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet text-white py-3 rounded-lg hover:bg-violet/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
{isLoading ?(
<>
<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
<circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
/>
<path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
/>
</svg>
<span>
{mode ==='signin'?'Connexion...':'Inscription...'}
</span>
</>
):(
<span>
{mode ==='signin'?'Se connecter':"S'inscrire"}
</span>
)}
</button>
</form>

{/* Toggle mode */}
<div className="text-center">
<button
            type="button"
            onClick={()=>setMode((m)=>(m ==='signin'?'signup':'signin'))}
            disabled={isLoading}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet transition-colors disabled:opacity-50"
>
{mode ==='signin'
?"Pas encore de compte ? S'inscrire"
:'Déjà un compte ? Se connecter'}
</button>
</div>

</div>
</div>
)
}
```

---

### ✅ Fichier 2 : `src/app/admin/login/page.tsx` - NOUVEAU

Créer une page de login dédiée aux admins :

typescript

```typescript
'use client'

import{ useState }from'react'
import{ useRouter }from'next/navigation'
import{ supabaseBrowser }from'@/lib/supabase-browser'
importLinkfrom'next/link'

exportdefaultfunctionAdminLoginPage(){
const[email, setEmail]=useState('')
const[password, setPassword]=useState('')
const[error, setError]=useState<string|null>(null)
const[isLoading, setIsLoading]=useState(false)
const router =useRouter()

asyncfunctiononSubmit(e:React.FormEvent){
    e.preventDefault()

if(isLoading)return// Empêcher double-clic

setError(null)
setIsLoading(true)

try{
// 1. Connexion
const{ error: authError }=await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
})

if(authError){
setError(authError.message)
return
}

// 2. Vérifier le rôle admin
const{ data: profile }=await supabaseBrowser
.from('profiles')
.select('role')
.single()

if(profile?.role !=='admin'){
// Déconnecter l'utilisateur non-admin
await supabaseBrowser.auth.signOut()
setError('❌ Accès refusé : vous devez être administrateur')
return
}

// 3. Redirection admin
      router.push('/admin/products')
      router.refresh()

}catch(err:any){
setError(err?.message ||'Une erreur est survenue')
}finally{
setIsLoading(false)
}
}

return(
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
<div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-violet/20">

{/* Header avec badge admin */}
<div className="text-center space-y-2">
<div className="inline-block px-4 py-1 bg-violet/10 text-violet rounded-full text-sm font-medium">
            🔒 AccèsAdministrateur
</div>
<h1 className="text-3xl font-light tracking-tight">
.blancherenaudin
</h1>
<p className="text-sm text-gray-600 dark:text-gray-400">
Connexion réservée aux administrateurs
</p>
</div>

{/* Formulaire */}
<form onSubmit={onSubmit} className="space-y-6">
<div>
<label htmlFor="email" className="block text-sm font-medium mb-2">
Email administrateur
</label>
<input
              id="email"
              type="email"
              placeholder="admin@blancherenaudin.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
/>
</div>

<div>
<label htmlFor="password" className="block text-sm font-medium mb-2">
Mot de passe
</label>
<input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
/>
</div>

{/* Erreurs */}
{error &&(
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
{error}
</div>
)}

{/* Bouton */}
<button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet text-white py-3 rounded-lg hover:bg-violet/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
>
{isLoading ?(
<>
<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
<circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
/>
<path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
/>
</svg>
<span>Connexion...</span>
</>
):(
'Se connecter'
)}
</button>
</form>

{/* Lien client */}
<div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
<p className="text-sm text-gray-600 dark:text-gray-400">
Vous n'êtes pas administrateur ?{' '}
<Link
              href="/auth/login"
              className="text-violet hover:underline font-medium"
>
Connexion client
</Link>
</p>
</div>

</div>
</div>
)
}
```

---

### ✅ Fichier 3 : `src/app/admin/layout.tsx` - MODIFIER

Rediriger vers la page admin login :

typescript

```typescript
// src/app/admin/layout.tsx
importtype{ReactNode}from'react'
import{ createServerClient }from'@supabase/ssr'
import{ cookies }from'next/headers'
import{ redirect }from'next/navigation'
importtype{Database}from'@/lib/database.types'
// ... autres imports

exportdefaultasyncfunctionAdminLayout({
  children,
}:{
  children:ReactNode
}){
const cookieStore =awaitcookies()

const supabase =createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
      cookies:{get:(k)=> cookieStore.get(k)?.value,set(){},remove(){}},
}
)

const{
    data:{ user },
}=await supabase.auth.getUser()

// ✅ MODIFIER : Redirection vers /admin/login
if(!user)redirect('/admin/login')

const{ data: profile }=await supabase
.from('profiles')
.select('role')
.eq('id', user.id)
.single()

// ✅ AMÉLIORER : Meilleur message d'erreur + redirection
if(profile?.role !=='admin'){
return(
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
<div className="max-w-md text-center space-y-4 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
<div className="text-6xl mb-4">🔒</div>
<h1 className="text-2xl font-semibold">Accès refusé</h1>
<p className="text-gray-600 dark:text-gray-400">
Vous devez être administrateur pour accéder à cette section.
</p>
<div className="pt-4">
<a
              href="/auth/login"
              className="inline-block px-6 py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors"
>
Retour à l'accueil
</a>
</div>
</div>
</div>
)
}

return(
// ... reste du layout
)
}
```

---

## 📝 Instructions de mise en place

### Étape 1 : Créer le premier compte admin

bash

```bash
# 1. Aller sur /auth/login
# 2. Créer un compte normalement (mode signup)
# 3. Aller dans Supabase Dashboard → Authentication → Users
# 4. Cliquer sur votre utilisateur
# 5. Aller dans l'onglet "Raw User Meta Data" ou directement dans la table profiles
# 6. Modifier le champ role : 'customer' → 'admin'
```

**Alternative SQL directe** :

sql

```sql
-- Dans l'éditeur SQL de Supabase
UPDATE profiles
SET role ='admin'
WHERE email ='votre-email@example.com';
```

---

### Étape 2 : Tester les accès

#### Test Client

```
1. Créer un nouveau compte via /auth/login (signup)
2. → Devrait rediriger vers /account
3. Essayer d'accéder à /admin/products
4. → Devrait bloquer avec "Accès refusé"
```

#### Test Admin

```
1. Se connecter avec votre compte admin via /admin/login
2. → Devrait vérifier le rôle
3. → Devrait rediriger vers /admin/products
4. Tester les pages admin
```

---

## 🎯 Récapitulatif des chemins

<pre class="font-ui border-border-100/50 overflow-x-scroll w-full rounded border-[0.5px] shadow-[0_2px_12px_hsl(var(--always-black)/5%)]"><table class="bg-bg-100 min-w-full border-separate border-spacing-0 text-sm leading-[1.88888] whitespace-normal"><thead class="border-b-border-100/50 border-b-[0.5px] text-left"><tr class="[tbody>&]:odd:bg-bg-500/10"><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Type utilisateur</th><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Page de login</th><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Après login</th><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Accès autorisé</th></tr></thead><tbody><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Client</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/auth/login</code></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">→ <code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/account</code></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/account/*</code> uniquement</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Admin</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/admin/login</code></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">→ <code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/admin/products</code></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/admin/*</code> + <code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">/account/*</code></td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Non connecté</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">-</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">→ Redirect vers login</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Aucun</td></tr></tbody></table></pre>

---

## 🐛 Debugging : Problèmes courants

### Problème 1 : "Le bouton ne répond pas"

**Solutions appliquées** :

- ✅ État `isLoading` pour empêcher double-clic
- ✅ `disabled={isLoading}` sur le bouton
- ✅ Spinner visible pendant le chargement
- ✅ `if (isLoading) return` au début de `onSubmit`

### Problème 2 : "Redirection incorrecte"

**Solutions appliquées** :

- ✅ Vérification du rôle avant redirection
- ✅ Pages de login séparées (`/auth/login` et `/admin/login`)
- ✅ Déconnexion automatique si non-admin tente `/admin/login`

### Problème 3 : "Pas de feedback visuel"

**Solutions appliquées** :

- ✅ Messages d'erreur clairs
- ✅ Spinner de chargement
- ✅ Désactivation du formulaire pendant traitement
- ✅ Styles disabled sur les inputs

---

## 🔍 Comment vérifier que tout fonctionne

### Checklist de test

bash

```bash
✅ 1. Signup client → Redirige vers /account
✅ 2. Login client → Redirige vers /account
✅ 3. Client essaie /admin → "Accès refusé"
✅ 4. Login admin → Vérifie le rôle
✅ 5. Admin accède à /admin/products → OK
✅ 6. Bouton ne se clique pas 2 fois → OK (isLoading)
✅ 7. Erreur affichée si mauvais mot de passe → OK
✅ 8. Spinner visible pendant login → OK
```

---

## 🚀 Prochaines améliorations possibles

### Court terme

- [ ] Ajouter "Mot de passe oublié"
- [ ] Confirmer l'email après signup (Supabase email verification)
- [ ] Toast notifications au lieu des messages d'erreur inline

### Moyen terme

- [ ] 2FA pour les admins
- [ ] Logs d'accès admin
- [ ] Interface de gestion des utilisateurs dans l'admin
