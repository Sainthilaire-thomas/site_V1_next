# 📘 Guide de Migration : Architecture Modulaire (Version complète)

## Projet site_v1_next → blancherenaudin-monorepo

---

## 🎯 Vue d'ensemble

**Projet source :** site_v1_next (476 éléments)

**Durée estimée :** 2-3 semaines

**Type :** Migration complète vers architecture modulaire

**Dev :** Solo

### État actuel analysé

```
site_v1_next/
├── src/
│   ├── app/
│   │   ├── about/, account/, auth/, cart/, checkout/, etc.     # Front public
│   │   └── admin/
│   │       ├── (auth)/login/                                   # Auth admin
│   │       └── (protected)/                                    # 8 modules admin
│   │           ├── analytics/          # Module 1
│   │           ├── categories/         # Module 2
│   │           ├── customers/          # Module 3
│   │           ├── media/              # Module 4
│   │           ├── newsletter/         # Module 5
│   │           ├── orders/             # Module 6
│   │           ├── products/           # Module 7
│   │           └── social/             # Module 8
│   │
│   ├── components/                     # 108 composants
│   ├── lib/                            # Utils, Supabase, Stripe, etc.
│   └── store/                          # 6 stores Zustand
```

### État cible

```
blancherenaudin-monorepo/
├── apps/
│   ├── storefront/              # App Next.js publique
│   └── admin/                   # Shell admin minimal
│
├── modules/                     # 8 modules admin isolés
│   ├── analytics/
│   ├── categories/
│   ├── customers/
│   ├── media/
│   ├── newsletter/
│   ├── orders/
│   ├── products/
│   └── social/
│
└── packages/                    # Code partagé
    ├── ui/                      # Design system
    ├── database/                # Supabase + types
    ├── email/                   # Templates emails
    ├── auth/                    # Auth helpers
    ├── admin-shell/             # Infrastructure modulaire
    └── config/                  # Configs partagées (Tailwind, ESLint, TS)
```

---

## 🏗️ Principes architecturaux

### Principe 1 : Séparation en 3 couches

```
┌─────────────────────────────────────────────────────────────┐
│  APPS (Applications Next.js)                                │
│  - Route handlers Next.js minces                            │
│  - Pages et layouts                                         │
│  - Configuration Next.js                                    │
└─────────────────────────────────────────────────────────────┘
                        ↓ utilise
┌─────────────────────────────────────────────────────────────┐
│  MODULES (Fonctionnalités métier isolées)                   │
│  - Logique métier pure                                      │
│  - Handlers d'API "purs" (fonctions)                        │
│  - Composants client                                        │
│  - Services métier                                          │
└─────────────────────────────────────────────────────────────┘
                        ↓ utilise
┌─────────────────────────────────────────────────────────────┐
│  PACKAGES (Code partagé réutilisable)                       │
│  - Design system (RSC compatible)                           │
│  - Services infrastructure (DB, email, auth)                │
│  - Types partagés                                           │
│  - Configuration (Tailwind, TypeScript)                     │
└─────────────────────────────────────────────────────────────┘
```

### Principe 2 : Séparation routes Next.js vs logique métier

**⚠️ Point critique : Les route handlers Next.js ne peuvent pas vivre dans les packages**

Next.js utilise le filesystem routing (`app/api/...`), donc les routes doivent vivre dans une app Next.js.

**Pattern recommandé :**

typescript

```typescript
// ❌ NE MARCHE PAS : route handler dans un module
// modules/products/src/api/list/route.ts
exportasyncfunctionGET(){...}// Next.js ne le verra pas

// ✅ SOLUTION : Logique pure dans le module
// modules/products/src/api/list.ts
exportasyncfunctionlistProducts(filters:ProductFilters){
const supabase =createAdminClient()
const{ data }=await supabase.from('products').select('*')
return data
}

// ✅ Route handler mince dans l'app qui appelle la logique
// apps/admin/app/api/products/route.ts
import{ listProducts }from'@modules/products/api/list'

exportasyncfunctionGET(request:Request){
const url =newURL(request.url)
const filters =parseFilters(url.searchParams)

const products =awaitlistProducts(filters)

returnResponse.json(products)
}
```

**Avantages :**

- ✅ Tests unitaires faciles (pas besoin de mocker Request/Response)
- ✅ Logique réutilisable (peut être appelée depuis Server Actions)
- ✅ Pas de dépendance aux conventions Next.js dans les modules
- ✅ Module peut être testé en isolation

### Principe 3 : React Server Components (RSC) et "use client"

**⚠️ Attention aux imports croisés et au contexte d'exécution**

**Règles pour les packages :**

typescript

```typescript
// packages/ui doit être RSC-compatible par défaut

// ✅ Composant serveur (pas de 'use client')
// packages/ui/src/card.tsx
exportfunctionCard({ children }:{ children:React.ReactNode}){
return<div className="rounded-lg border">{children}</div>
}

// ✅ Composant client (avec 'use client')
// packages/ui/src/button.tsx
'use client'
exportfunctionButton({ onClick, children }:ButtonProps){
return<button onClick={onClick}>{children}</button>
}
```

json

```json
// packages/ui/package.json
{
  "sideEffects": false, // Permet le tree-shaking
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server/index.ts", // Composants serveur
    "./client": "./src/client/index.ts" // Composants client
  }
}
```

**Règles pour les modules admin :**

typescript

```typescript
// modules/newsletter/src/index.tsx
'use client'// ✅ Les modules chargés par ModuleLoader sont des client components

exportdefaultfunctionNewsletterModule({ subPath, services }:ModuleProps){
// Logique client
}
```

**Services serveur restent dans les packages :**

typescript

```typescript
// ❌ N'appelle PAS createAdminClient() dans un client component
'use client'
functionMyComponent(){
const supabase =createAdminClient()// ERREUR : serveur uniquement
}

// ✅ Appelle depuis un Server Action ou Route Handler
// apps/admin/app/api/data/route.ts
import{ createAdminClient }from'@repo/database'
exportasyncfunctionGET(){
const supabase =createAdminClient()// OK : côté serveur
}
```

### Principe 4 : Contract de services entre Shell et Modules

**⚠️ Éviter les imports horizontaux entre modules**

Au lieu de faire :

typescript

```typescript
// ❌ Module A importe du module B (couplage)
import { showToast } from '@modules/common/toast'
```

Injecter les services via props :

typescript

```typescript
// packages/admin-shell/src/types.ts
exportinterfaceModuleServices{
  notify:(msg:string, type?:'success'|'error'|'info')=>void
confirm:(msg:string)=>Promise<boolean>
navigate:(path:string[])=>void
hasPermission:(perm:string)=>boolean
}

exportinterfaceModuleProps{
  subPath:string[]
  services:ModuleServices
}
```

typescript

```typescript
// packages/admin-shell/src/ModuleLoader.tsx
'use client'
import{ toast }from'@repo/ui'
import{ useRouter }from'next/navigation'

exportfunctionModuleLoader({ moduleConfig, subPath }:ModuleLoaderProps){
const router =useRouter()

const services:ModuleServices={
    notify:(msg, type ='info')=>{
      toast[type](msg)
},
confirm:async(msg)=>{
returnwindow.confirm(msg)
},
navigate:(path)=>{
      router.push(`/admin/${moduleConfig.id}/${path.join('/')}`)
},
hasPermission:(perm)=>{
// Logique de permissions
returntrue
},
}

return<Module subPath={subPath} services={services}/>
}
```

typescript

```typescript
// modules/newsletter/src/pages/CampaignList.tsx
'use client'
exportfunctionCampaignList({ services }:{ services:ModuleServices}){
consthandleDelete=async(id:string)=>{
const confirmed =await services.confirm('Supprimer cette campagne ?')
if(confirmed){
awaitdeleteCampaign(id)
      services.notify('Campagne supprimée','success')
}
}

return<div>...</div>
}
```

**Avantages :**

- ✅ Modules complètement isolés (zéro import horizontal)
- ✅ Services mockables pour les tests
- ✅ Changement de provider trivial (toast → notification custom)

---

## 📋 Inventaire des tâches principales

### 1. Setup initial du monorepo

**Objectif :** Créer la structure de base avec Turborepo

**Tâches :**

- [ ] Créer la structure de dossiers
- [ ] Configurer `package.json` avec workspaces
- [ ] Configurer `turbo.json` avec pipelines optimisés
- [ ] Configurer `pnpm-workspace.yaml`
- [ ] Configurer TypeScript avec **Project References**
- [ ] Configurer **Changesets** pour versioning
- [ ] Créer `.gitignore` et backup Git

#### Configuration TypeScript avec Project References

**⚡ Point d'optimisation : TypeScript Composite Projects**

json

```json
// tsconfig.base.json (racine)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "composite": true, // ✅ Active les project references
    "declaration": true, // ✅ Génère les .d.ts
    "declarationMap": true // ✅ Pour le debugging
  }
}
```

json

```json
// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true, // ✅ Ce package est "composable"
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

json

```json
// apps/admin/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    // ✅ Déclare les dépendances
    { "path": "../../packages/ui" },
    { "path": "../../packages/database" },
    { "path": "../../packages/admin-shell" }
  ],
  "include": ["src/**/*", "app/**/*"]
}
```

**Gain : Build TypeScript incrémental ultra-rapide**

#### Configuration Turborepo optimisée

json

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", ".env", "tsconfig.json"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // Dépend des builds des dépendances
      "outputs": [".next/**", "!.next/cache/**", "dist/**", ".turbo/**"],
      "env": [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
      ]
    },
    "type-check": {
      "dependsOn": ["^build"], // Attend que les deps soient buildées
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^type-check"], // Lint après type-check
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build", "type-check"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  },
  "remoteCache": {
    "enabled": false // Activer si tu veux un cache distant (Vercel)
  }
}
```

#### Configuration Changesets

bash

```bash
# Installer Changesets
pnpmadd -D @changesets/cli

# Initialiser
pnpm changeset init
```

json

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@modules/*" // Les modules n'ont pas besoin de versions
  ]
}
```

**Workflow Changesets :**

bash

```bash
# Quand tu changes @repo/ui
pnpm changeset
# → Select package: @repo/ui
# → Select type: minor
# → Describe: "Add new Card variant"

# Bump versions
pnpm changeset version

# Publish (si nécessaire)
pnpm changeset publish
```

---

### 2. Extraction du package UI (Design System)

**Objectif :** Isoler les 48 composants shadcn/ui avec configuration Tailwind partagée

**Tâches principales :**

- [ ] Créer `packages/ui/` avec sa propre configuration
- [ ] Copier tous les composants shadcn/ui (48 fichiers)
- [ ] Créer le **Tailwind Preset** partagé
- [ ] Configurer les exports RSC-compatible
- [ ] Marquer `"sideEffects": false`

#### Configuration Tailwind Preset

**⚠️ Point critique : Éviter la duplication de config Tailwind**

typescript

```typescript
// packages/ui/tailwind.preset.js
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type{import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [], // Sera étendu par chaque app
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        violet: 'hsl(271 74% 37%)',
        // ... toutes les couleurs shadcn
      },
      fontFamily: {
        sans: ['Archivo Narrow', ...fontFamily.sans],
        display: ['Archivo Black', ...fontFamily.sans],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

javascript

```javascript
// apps/storefront/tailwind.config.js
const baseConfig = require('@repo/ui/tailwind.preset')

/** @type{import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // ✅ CRITIQUE : Scanner les packages pour ne pas purger les classes
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
}
```

javascript

```javascript
// apps/admin/tailwind.config.js
const baseConfig = require('@repo/ui/tailwind.preset')

/** @type{import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // ✅ Scanner les packages ET modules
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/admin-shell/src/**/*.{js,ts,jsx,tsx}',
    '../../modules/*/src/**/*.{js,ts,jsx,tsx}',
  ],
}
```

#### Configuration package.json pour RSC

json

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false, // ✅ Permet tree-shaking
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./tailwind.preset": "./tailwind.preset.js",
    "./utils": "./src/utils.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

### 3. Extraction du package Database (Supabase)

**Objectif :** Centraliser l'accès Supabase avec génération automatique des types

**Tâches :**

- [ ] Créer `packages/database/`
- [ ] Copier les fichiers Supabase
- [ ] Ajouter script **`generate:types`** automatique
- [ ] Configurer les exports

#### Script de génération des types

json

```json
// packages/database/package.json
{
  "name": "@repo/database",
  "scripts": {
    "generate:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types.ts",
    "generate:types:local": "supabase gen types typescript --local > src/types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.1.0"
  }
}
```

**Ajouter à la CI :**

yaml

```yaml
# .github/workflows/ci.yml
-name: Generate Supabase Types
run: pnpm --filter @repo/database generate:types

-name: Check for type changes
run: git diff --exit-code packages/database/src/types.ts
```

---

### 4. Configuration Next.js pour transpiler les packages

**⚠️ Point critique : Next.js doit transpiler les packages locaux**

typescript

```typescript
// apps/storefront/next.config.ts
importtype{NextConfig}from'next'

const nextConfig:NextConfig={
// ✅ Transpile les packages du monorepo
  transpilePackages:[
'@repo/ui',
'@repo/database',
'@repo/email',
'@repo/auth',
'@repo/analytics',
'@repo/shipping',
],

  experimental:{
// ✅ Optimise les imports
    optimizePackageImports:['@repo/ui','lucide-react'],
},
}

exportdefault nextConfig
```

typescript

```typescript
// apps/admin/next.config.ts
importtype{NextConfig}from'next'

const nextConfig:NextConfig={
  transpilePackages:[
'@repo/ui',
'@repo/database',
'@repo/email',
'@repo/auth',
'@repo/admin-shell',
// ✅ IMPORTANT : Transpiler aussi les modules
'@modules/products',
'@modules/orders',
'@modules/customers',
'@modules/newsletter',
'@modules/analytics',
'@modules/social',
'@modules/categories',
'@modules/media',
],

  experimental:{
    optimizePackageImports:['@repo/ui','lucide-react'],
},

// ✅ Si un package utilise Node.js APIs
  serverExternalPackages:['sharp'],
}

exportdefault nextConfig
```

---

### 5. Structure d'un module (pattern complet)

**Pattern recommandé avec séparation route handlers / logique**

```
modules/newsletter/
├── src/
│   ├── api/                    # ✅ Logique métier pure(fonctions)
│   │   ├── campaigns.ts
│   │   │   └── exportasyncfunctionlistCampaigns()
│   │   │   └── exportasyncfunctioncreateCampaign()
│   │   │   └── exportasyncfunctionupdateCampaign()
│   │   │   └── exportasyncfunctiondeleteCampaign()
│   │   ├── subscribers.ts
│   │   └── stats.ts
│   │
│   ├── pages/                  # Composants de pages
│   │   ├── CampaignList.tsx
│   │   ├── CampaignEditor.tsx
│   │   ├── SubscriberTable.tsx
│   │   └── index.ts
│   │
│   ├── components/             # Composants internes
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignFilters.tsx
│   │   └── StatsWidget.tsx
│   │
│   ├── hooks/                  # Hooks spécifiques
│   │   ├── useCampaigns.ts
│   │   └── useSubscribers.ts
│   │
│   ├── types.ts                # Types du module
│   └── index.tsx               # Point d'entrée principal
│
├── __tests__/                  # Tests unitaires
│   ├── api/
│   │   └── campaigns.test.ts
│   └── components/
│       └── CampaignCard.test.ts
│
├── package.json
└── tsconfig.json
```

#### Logique pure dans le module

typescript

```typescript
// modules/newsletter/src/api/campaigns.ts
import{ createAdminClient }from'@repo/database'
importtype{Campaign,CampaignFilters}from'../types'

/**
 * Liste les campagnes (logique pure, testable)
 */
exportasyncfunctionlistCampaigns(filters?:CampaignFilters){
const supabase =createAdminClient()

let query = supabase
.from('newsletter_campaigns')
.select('*')

if(filters?.status){
    query = query.eq('status', filters.status)
}

if(filters?.search){
    query = query.ilike('name',`%${filters.search}%`)
}

const{ data, error }=await query.order('created_at',{ ascending:false})

if(error)throw error
return data asCampaign[]
}

/**
 * Crée une campagne
 */
exportasyncfunctioncreateCampaign(campaign:Partial<Campaign>){
const supabase =createAdminClient()

const{ data, error }=await supabase
.from('newsletter_campaigns')
.insert(campaign)
.select()
.single()

if(error)throw error
return data asCampaign
}
```

#### Route handler mince dans l'app

typescript

```typescript
// apps/admin/app/api/newsletter/campaigns/route.ts
import{NextRequest}from'next/server'
import{ listCampaigns }from'@modules/newsletter/api/campaigns'

exportasyncfunctionGET(request:NextRequest){
try{
const url =newURL(request.url)
const filters ={
      status: url.searchParams.get('status')||undefined,
      search: url.searchParams.get('search')||undefined,
}

// ✅ Appel de la logique pure du module
const campaigns =awaitlistCampaigns(filters)

returnResponse.json(campaigns)
}catch(error){
console.error('Error listing campaigns:', error)
returnResponse.json(
{ error:'Failed to list campaigns'},
{ status:500}
)
}
}
```

**Avantages de ce pattern :**

- ✅ Tests unitaires simples (pas besoin de mocker Request/Response)
- ✅ Logique réutilisable (Server Actions, Route Handlers, Scripts)
- ✅ Module indépendant de Next.js

#### Tests unitaires faciles

typescript

```typescript
// modules/newsletter/src/api/__tests__/campaigns.test.ts
import { describe, it, expect, vi } from 'vitest'
import { listCampaigns, createCampaign } from '../campaigns'

// Mock Supabase
vi.mock('@repo/database', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Test Campaign' }],
          error: null,
        }),
      }),
    }),
  }),
}))

describe('listCampaigns', () => {
  it('should return campaigns', async () => {
    const campaigns = awaitlistCampaigns()
    expect(campaigns).toHaveLength(1)
    expect(campaigns[0].name).toBe('Test Campaign')
  })

  it('should filter by status', async () => {
    const campaigns = awaitlistCampaigns({ status: 'draft' })
    expect(campaigns).toBeDefined()
  })
})
```

---

### 6. Déploiement Vercel : deux apps, un repo

**⚠️ Configuration spécifique pour monorepo**

#### Projet Vercel 1 : Storefront

json

```json
// vercel.json (à la racine)
{
  "name": "blancherenaudin-storefront",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=storefront",
  "outputDirectory": "apps/storefront/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./apps/storefront"
}
```

**Dashboard Vercel :**

- Root Directory: `apps/storefront`
- Build Command: `cd ../.. && pnpm turbo run build --filter=storefront`
- Install Command: `pnpm install`

**Variables d'environnement (Storefront) :**

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=...
RESEND_API_KEY=...
```

#### Projet Vercel 2 : Admin

json

```json
// vercel.json (à la racine)
{
  "name": "blancherenaudin-admin",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=admin",
  "outputDirectory": "apps/admin/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./apps/admin ./modules"
}
```

**Dashboard Vercel :**

- Root Directory: `apps/admin`
- Build Command: `cd ../.. && pnpm turbo run build --filter=admin`
- Install Command: `pnpm install`

**Variables d'environnement (Admin) :**

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
RESEND_API_KEY=...
```

**⚠️ Runtime Node.js si nécessaire :**

typescript

```typescript
// Si un package utilise sharp, canvas, ou autre API Node
// apps/admin/app/api/newsletter/upload/route.ts
exportconst runtime ='nodejs'// Au lieu de 'edge'
```

---

### 7. Sécurité et permissions dans les modules

**Pattern complet avec vérification avant lazy loading**

typescript

```typescript
// packages/admin-shell/src/ModuleRegistry.ts
exportconst moduleRegistry:ModuleConfig[]=[
{
    id:'newsletter',
    name:'Newsletter',
    icon:Mail,
    path:'/admin/newsletter',
loader:()=>import('@modules/newsletter'),
    permissions:['newsletter.manage','newsletter.view'],// Au moins une permission requise
    minRole:'admin',// Rôle minimum requis
},
]
```

typescript

```typescript
// apps/admin/app/[module]/[[...path]]/page.tsx
import{ notFound, redirect }from'next/navigation'
import{ createServerClient }from'@repo/database'
import{ModuleLoader, getModule }from'@repo/admin-shell'

interfaceModulePageProps{
  params:{
    module:string
    path?:string[]
}
}

exportdefaultasyncfunctionModulePage({ params }:ModulePageProps){
const{ module: moduleId, path =[]}= params

// 1. Récupérer la config du module
const moduleConfig =getModule(moduleId)
if(!moduleConfig){
notFound()
}

// 2. Vérifier l'authentification
const supabase =awaitcreateServerClient()
const{ data:{ user }}=await supabase.auth.getUser()

if(!user){
redirect('/admin/login')
}

// 3. Récupérer le profil avec rôle et permissions
const{ data: profile }=await supabase
.from('profiles')
.select('role, permissions')
.eq('id', user.id)
.single()

if(!profile){
redirect('/admin/login')
}

// 4. Vérifier le rôle minimum
if(moduleConfig.minRole&& profile.role!== moduleConfig.minRole){
return(
<div className="p-8">
<h2 className="text-2xl font-bold text-red-600">Accès refusé</h2>
<p className="mt-2">Vous n'avez pas les permissions nécessaires.</p>
</div>
)
}

// 5. Vérifier les permissions (au moins une requise)
if(moduleConfig.permissions){
const hasPermission = moduleConfig.permissions.some(perm =>
      profile.permissions?.includes(perm)
)

if(!hasPermission){
return(
<div className="p-8">
<h2 className="text-2xl font-bold text-red-600">Accès refusé</h2>
<p className="mt-2">Permissions requises :{moduleConfig.permissions.join(', ')}</p>
</div>
)
}
}

// 6. ✅ Charger le module seulement si autorisé
return(
<ModuleLoader
      moduleConfig={moduleConfig}
      subPath={path}
      userPermissions={profile.permissions||[]}
/>
)
}
```

**Avantages :**

- ✅ Bundle du module jamais téléchargé si pas autorisé
- ✅ Sécurité côté serveur (pas contournable)
- ✅ UX claire avec message d'erreur explicite

---

### 8. Gestion des erreurs par module

**Error Boundary globale + par module**

typescript

```typescript
// packages/admin-shell/src/ModuleErrorBoundary.tsx
'use client'

import{Component,ReactNode}from'react'
import{AlertCircle}from'lucide-react'
import{Button}from'@repo/ui'

interfaceProps{
  children:ReactNode
  moduleName:string
}

interfaceState{
  hasError:boolean
  error?:Error
}

exportclassModuleErrorBoundaryextendsComponent<Props,State>{
constructor(props:Props){
super(props)
this.state={ hasError:false}
}

staticgetDerivedStateFromError(error:Error):State{
return{ hasError:true, error }
}

componentDidCatch(error:Error, errorInfo:any){
console.error(`Error in module ${this.props.moduleName}:`, error, errorInfo)

// ✅ Envoyer à Sentry / Monitoring
if(typeofwindow!=='undefined'&&window.Sentry){
window.Sentry.captureException(error,{
        tags:{
          module:this.props.moduleName,
},
})
}
}

render(){
if(this.state.hasError){
return(
<div className="flex items-center justify-center min-h-[400px]">
<div className="text-center space-y-4">
<AlertCircle className="h-16 w-16 text-red-500 mx-auto"/>
<h2 className="text-2xl font-bold">Erreur dans le module{this.props.moduleName}</h2>
<p className="text-gray-600">{this.state.error?.message}</p>
<Button onClick={()=>window.location.reload()}>
Recharger la page
</Button>
</div>
</div>
)
}

returnthis.props.children
}
}
```

typescript

```typescript
// packages/admin-shell/src/ModuleLoader.tsx
'use client'
import{ModuleErrorBoundary}from'./ModuleErrorBoundary'

exportfunctionModuleLoader({ moduleConfig, subPath, userPermissions }:ModuleLoaderProps){
const[Module, setModule]=useState<React.ComponentType|null>(null)

useEffect(()=>{
    moduleConfig.loader()
.then(mod =>setModule(()=> mod.default))
.catch(err =>console.error(`Failed to load ${moduleConfig.id}:`, err))
},[moduleConfig])

if(!Module){
return<ModuleSkeleton/>
}

// ✅ Wrap dans ErrorBoundary
return(
<ModuleErrorBoundary moduleName={moduleConfig.name}>
<Suspense fallback={<ModuleSkeleton/>}>
<Module subPath={subPath} services={services}/>
</Suspense>
</ModuleErrorBoundary>
)
}
```

---

### 9. Optimisations des imports et tree-shaking

**⚠️ Point critique : Icônes et tree-shaking**

typescript

```typescript
// ❌ Mauvais : importe TOUS les icônes (100+ KB)
import*asIconsfrom'lucide-react'
<Icons.Mail/>

// ✅ Bon : import nominatif (tree-shake correctement)
import{Mail,Package,Users}from'lucide-react'
<Mail/>
```

**Configuration Next.js pour optimiser :**

typescript

```typescript
// apps/admin/next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    // ✅ Optimise automatiquement les imports
    optimizePackageImports: ['@repo/ui', 'lucide-react', 'date-fns', 'lodash'],
  },
}
```

---

### 10. Budgets de performance

**Définir des seuils à ne pas dépasser**

json

```json
// apps/admin/.budgets.json
{
  "bundles": [
    {
      "name": "Initial Admin Shell",
      "limit": "250KB",
      "path": "/_next/static/chunks/pages/_app-*.js"
    },
    {
      "name": "Module Newsletter",
      "limit": "150KB",
      "path": "/_next/static/chunks/modules-newsletter-*.js"
    },
    {
      "name": "Module Products",
      "limit": "200KB",
      "path": "/_next/static/chunks/modules-products-*.js"
    }
  ],
  "performance": {
    "LCP": "2.5s",
    "FID": "100ms",
    "CLS": "0.1"
  }
}
```

**Script de vérification :**

bash

```bash
# scripts/check-budgets.sh
#!/bin/bash

# Analyse du bundle
pnpm --filter admin build
pnpm --filter admin analyze

# Vérifier les tailles
SIZE=$(du -sh apps/admin/.next/static |cut -f1)
echo"Bundle size: $SIZE"

# Fail si > 5MB
if[$(du -s apps/admin/.next/static |cut -f1) -gt 5000];then
echo"❌ Bundle too large!"
exit1
fi
```

---

### 11. Tests : Structure recommandée

```
# Tests unitaires dans chaque package/module
packages/database/src/__tests__/
modules/newsletter/src/api/__tests__/

# Tests d'intégration
apps/admin/__tests__/integration/

# Tests E2E avec Playwright
tests/e2e/
├── storefront/
│   ├── checkout.spec.ts
│   └── product-detail.spec.ts
└── admin/
    ├── newsletter-campaigns.spec.ts
    ├── products-crud.spec.ts
    └── orders-management.spec.ts
```

**Configuration Playwright :**

typescript

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

exportdefaultdefineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  projects: [
    {
      name: 'storefront',
      testMatch: /.*storefront.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'admin',
      testMatch: /.*admin.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3001',
      },
    },
  ],
})
```

**Test E2E d'un module :**

typescript

```typescript
// tests/e2e/admin/newsletter-campaigns.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Newsletter Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login admin
    await page.goto('/admin/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    awaitexpect(page).toHaveURL('/admin')
  })

  test('should load newsletter module', async ({ page }) => {
    // Cliquer sur Newsletter dans AdminNav
    await page.click('a[href="/admin/newsletter"]')

    // Vérifier que le module charge
    awaitexpect(page).toHaveURL('/admin/newsletter')
    awaitexpect(page.locator('h1')).toContainText('Newsletter')
  })

  test('should create a campaign', async ({ page }) => {
    await page.goto('/admin/newsletter')

    // Cliquer sur "New Campaign"
    await page.click('text=New Campaign')

    // Remplir le formulaire
    await page.fill('[name="name"]', 'Test Campaign')
    await page.fill('[name="subject"]', 'Test Subject')

    // Sauvegarder
    await page.click('button:has-text("Save")')

    // Vérifier la notification
    awaitexpect(page.locator('.sonner')).toContainText('Campaign created')
  })
})
```

---

## 🎯 Stratégie de migration recommandée

### Phase 1 : Fondations (Semaine 1)

**Objectif : Packages de base stables**

1. ✅ Setup monorepo (Turborepo + TypeScript composite)
2. ✅ Package `@repo/ui` avec Tailwind preset
3. ✅ Package `@repo/database` avec génération types
4. ✅ Packages utilitaires (`@repo/email`, `@repo/auth`)
5. ✅ Configuration Changesets

**Validation :** Tous les packages compilent, tests passent

### Phase 2 : App Storefront (Semaine 1-2)

**Objectif : Site public fonctionnel et déployé**

1. ✅ Extraction routes publiques
2. ✅ Extraction composants front
3. ✅ Migration stores Zustand
4. ✅ Test checkout end-to-end
5. ✅ Déploiement Vercel

**Validation :** Site public fonctionne en production

### Phase 3 : Infrastructure Admin (Semaine 2)

**Objectif : Shell admin + 1 module test**

1. ✅ Package `@repo/admin-shell` (registre + loader)
2. ✅ App admin (layout + route dynamique)
3. ✅ Migration module simple (Categories ou Newsletter)
4. ✅ Validation pattern (lazy loading, services)

**Validation :** 1 module fonctionne avec le shell

### Phase 4 : Migration modules (Semaine 2-3)

**Objectif : Tous les modules migrés**

**Ordre recommandé :**

1. ✅ Newsletter (simple, peu d'APIs)
2. ✅ Categories (CRUD basique)
3. ✅ Analytics (lecture seule)
4. ✅ Social (complexe, validation pattern)
5. ✅ Products (APIs complexes, images)
6. ✅ Orders (workflow critique)
7. ✅ Customers (relations complexes)
8. ✅ Media (intégration images)

**Pattern par module :**

- [ ] Extraire logique API → `src/api/`
- [ ] Créer route handlers minces dans app
- [ ] Extraire pages → `src/pages/`
- [ ] Créer routing interne → `src/index.tsx`
- [ ] Tests unitaires → `__tests__/`
- [ ] Test E2E smoke

### Phase 5 : Durcissement (Semaine 3)

**Objectif : Production-ready**

1. ✅ Tests E2E complets
2. ✅ Budgets de performance
3. ✅ Error monitoring (Sentry)
4. ✅ Documentation
5. ✅ CI/CD optimisée
6. ✅ Déploiement admin production

---

## ✅ Checklist de validation finale

### Build & Performance

- [ ] `pnpm build` fonctionne sans erreur (< 3 min)
- [ ] Build incrémental fonctionne (module modifié : < 10s)
- [ ] Hot reload rapide (< 1s)
- [ ] Bundle admin initial < 250KB
- [ ] Bundle storefront < 600KB
- [ ] Tous les modules lazy-loadent correctement
- [ ] TypeScript compile sans erreur
- [ ] Pas de dépendances circulaires

### Fonctionnel

- [ ] Storefront : toutes les routes publiques fonctionnent
- [ ] Storefront : checkout end-to-end fonctionne
- [ ] Storefront : webhooks Stripe fonctionnent
- [ ] Admin : login fonctionne
- [ ] Admin : tous les modules accessibles via AdminNav
- [ ] Admin : permissions respectées
- [ ] Admin : CRUD fonctionne dans chaque module
- [ ] Admin : upload d'images fonctionne

### Qualité

- [ ] Tests unitaires passent (packages + modules)
- [ ] Tests E2E passent (smoke tests par module)
- [ ] Pas de warnings ESLint critiques
- [ ] Types générés Supabase à jour
- [ ] Documentation à jour

### Déploiement

- [ ] Storefront déployé et accessible
- [ ] Admin déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] Monitoring actif (Sentry, analytics)
- [ ] Budgets de performance respectés

---

## 🎁 Ressources et outils

### Documentation officielle

- **Turborepo :** [https://turbo.build/repo/docs](https://turbo.build/repo/docs)
- **TypeScript Project References :** [https://www.typescriptlang.org/docs/handbook/project-references.html](https://www.typescriptlang.org/docs/handbook/project-references.html)
- **Next.js Monorepo :** [https://nextjs.org/docs/architecture/monorepo](https://nextjs.org/docs/architecture/monorepo)
- **Changesets :** [https://github.com/changesets/changesets](https://github.com/changesets/changesets)

### Outils recommandés

bash

```bash
# Analyse du bundle
pnpmadd -D @next/bundle-analyzer

# Tests
pnpmadd -D vitest @playwright/test

# Monitoring
pnpmadd @sentry/nextjs

# Linting
pnpmadd -D eslint-config-turbo
```

### Templates de référence

- **Vercel Turborepo starter :** [https://github.com/vercel/turbo/tree/main/examples/basic](https://github.com/vercel/turbo/tree/main/examples/basic)
- **shadcn/ui monorepo :** [https://github.com/shadcn-ui/ui/tree/main/apps](https://github.com/shadcn-ui/ui/tree/main/apps)

# 📋 Checklist Migration - Architecture Modulaire

## 🚀 Phase 1 : Setup Monorepo (Jour 1-2)

### Backup & Initialisation

- [x] Créer branche backup `backup-before-modular-migration`
- [x] Créer tag Git `v1.0-monolith`
- [x] Backup local du projet complet
- [x] Créer dossier `blancherenaudin-monorepo`
- [x] Initialiser Git dans le nouveau dossier

### Structure de base

- [x] Créer structure complète des dossiers
  - [x] `apps/storefront/`
  - [x] `apps/admin/`
  - [x] `modules/{analytics,categories,customers,media,newsletter,orders,products,social}/`
  - [x] `packages/{ui,database,email,auth,analytics,newsletter,shipping,admin-shell,config}/`
  - [x] `shared/{sanity,docs,scripts}/`

### Configuration racine

- [x] Créer `package.json` racine avec workspaces
- [x] Créer `pnpm-workspace.yaml`
- [x] Créer `turbo.json` avec pipelines
- [x] Créer `tsconfig.base.json` avec composite
- [x] Créer `.gitignore`
- [x] Créer `.env.example`
- [x] Créer `README.md`

### Outils

- [x] Installer pnpm globalement
- [x] Installer Turborepo globalement
- [x] Initialiser Changesets (`pnpm changeset init`)
- [x] Premier `pnpm install`
- [x] Vérifier `turbo --version`

### Commit

- [x] `git add .`
- [x] `git commit -m "chore: setup monorepo structure"`

---

## 📦 Phase 2 : Package UI (Jour 2-3)

### Structure

- [x] Créer `packages/ui/` avec structure
- [x] Créer `package.json`
- [x] Créer `tsconfig.json` avec composite
- [x] Configurer `"sideEffects": false`

### Migration composants

- [x] Copier les 48 composants shadcn/ui depuis `src/components/ui/`
- [x] Copier le helper `cn()` depuis `src/lib/utils.ts`
- [x] Créer `src/utils.ts` avec `cn()`
- [x] Créer `src/index.ts` avec tous les exports

### Tailwind Preset

- [x] Créer `tailwind.preset.js`
- [x] Configurer les couleurs (violet, shadcn)
- [x] Configurer les fonts (Archivo Black, Archivo Narrow)
- [x] Configurer les plugins

### Tests & Build

- [x] `pnpm install` dans le package
- [x] `pnpm type-check`
- [x] Vérifier aucune erreur TypeScript

### Commit

- [x] `git add packages/ui`
- [x] `git commit -m "feat(packages): add @repo/ui design system"`

---

## 🗄️ Phase 3 : Package Database (Jour 3)

### Structure

- [ ] Créer `packages/database/` avec structure
- [ ] Créer `package.json`
- [ ] Créer `tsconfig.json`
- [ ] Ajouter script `generate:types`

### Migration fichiers

- [ ] Copier `src/lib/database.types.ts` → `src/types.ts`
- [ ] Copier `src/lib/supabase-browser.ts` → `src/client-browser.ts`
- [ ] Copier `src/lib/supabase-server.ts` → `src/client-server.ts`
- [ ] Copier `src/lib/supabase-admin.ts` → `src/client-admin.ts`

### Configuration

- [ ] Créer `src/index.ts` avec exports
- [ ] Configurer les dépendances Supabase
- [ ] Ajuster les imports dans les clients

### Tests

- [ ] `pnpm install`
- [ ] `pnpm type-check`
- [ ] Tester `generate:types` (si Supabase local)

### Commit

- [ ] `git add packages/database`
- [ ] `git commit -m "feat(packages): add @repo/database"`

---

## 📧 Phase 4 : Packages Utilitaires (Jour 4)

### Package Email

- [ ] Créer `packages/email/` avec structure
- [ ] Copier `src/lib/email/` → `src/`
- [ ] Organiser en `templates/`, `utils/`, `config/`
- [ ] Créer `src/index.ts`
- [ ] `pnpm install` + `pnpm type-check`

### Package Auth

- [ ] Créer `packages/auth/`
- [ ] Copier `src/lib/auth/requireAdmin.ts`
- [ ] Créer `src/index.ts`
- [ ] `pnpm install` + `pnpm type-check`

### Package Analytics

- [ ] Créer `packages/analytics/`
- [ ] Copier `src/lib/analytics/`
- [ ] Copier `src/components/analytics/AnalyticsTracker.tsx`
- [ ] Créer `src/index.ts`
- [ ] `pnpm install` + `pnpm type-check`

### Package Newsletter

- [ ] Créer `packages/newsletter/`
- [ ] Copier `src/lib/newsletter/`
- [ ] Créer `src/index.ts`
- [ ] `pnpm install` + `pnpm type-check`

### Package Shipping

- [ ] Créer `packages/shipping/`
- [ ] Copier `src/lib/shipping/`
- [ ] Créer `src/index.ts`
- [ ] `pnpm install` + `pnpm type-check`

### Commit

- [ ] `git add packages/{email,auth,analytics,newsletter,shipping}`
- [ ] `git commit -m "feat(packages): add utility packages"`

---

## 🏪 Phase 5 : App Storefront (Jour 5-6)

### Structure Next.js

- [ ] Créer `apps/storefront/` avec structure Next.js 15
- [ ] Créer `package.json`
- [ ] Créer `next.config.ts` avec `transpilePackages`
- [ ] Créer `tailwind.config.js` utilisant le preset
- [ ] Créer `tsconfig.json` avec references

### Migration routes publiques

- [ ] Copier `src/app/page.tsx` (homepage)
- [ ] Copier `src/app/about/`
- [ ] Copier `src/app/account/`
- [ ] Copier `src/app/cart/`
- [ ] Copier `src/app/checkout/`
- [ ] Copier `src/app/collections/`
- [ ] Copier `src/app/collections-editoriales/`
- [ ] Copier `src/app/contact/`
- [ ] Copier `src/app/impact/`
- [ ] Copier `src/app/legal-notice/`
- [ ] Copier `src/app/privacy/`
- [ ] Copier `src/app/product/`
- [ ] Copier `src/app/products/`
- [ ] Copier `src/app/returns/`
- [ ] Copier `src/app/search/`
- [ ] Copier `src/app/shipping/`
- [ ] Copier `src/app/silhouettes/`
- [ ] Copier `src/app/newsletter/confirmed/`

### Migration composants

- [ ] Copier `src/components/account/`
- [ ] Copier `src/components/auth/AuthModal.tsx`
- [ ] Copier `src/components/common/`
- [ ] Copier `src/components/editorial/`
- [ ] Copier `src/components/layout/` (FooterMinimal, HeaderMinimal, Homepage, InteractiveEntry)
- [ ] Copier `src/components/newsletter/NewsletterSubscribe.tsx`
- [ ] Copier `src/components/products/`
- [ ] Copier `src/components/search/`

### Migration APIs publiques

- [ ] Copier `src/app/api/auth/`
- [ ] Copier `src/app/api/checkout/`
- [ ] Copier `src/app/api/collections/`
- [ ] Copier `src/app/api/launch-notifications/`
- [ ] Copier `src/app/api/newsletter/` (public)
- [ ] Copier `src/app/api/orders/by-session/`
- [ ] Copier `src/app/api/products/`
- [ ] Copier `src/app/api/webhooks/stripe/`
- [ ] Copier `src/app/api/wishlist/`

### Migration stores

- [ ] Copier `src/store/` → `apps/storefront/store/`

### Ajustement imports

- [ ] Remplacer imports UI : `@/components/ui` → `@repo/ui`
- [ ] Remplacer imports Database : `@/lib/supabase-*` → `@repo/database`
- [ ] Remplacer imports Email : `@/lib/email` → `@repo/email`
- [ ] Remplacer imports Auth : `@/lib/auth` → `@repo/auth`
- [ ] Remplacer imports Analytics : `@/lib/analytics` → `@repo/analytics`
- [ ] Remplacer imports Shipping : `@/lib/shipping` → `@repo/shipping`

### Configuration

- [ ] Copier `.env` variables storefront
- [ ] Configurer Sanity Studio (`/studio`)
- [ ] Copier `public/` assets

### Tests

- [ ] `pnpm dev --filter storefront`
- [ ] Tester homepage
- [ ] Tester catalogue produits
- [ ] Tester panier
- [ ] Tester checkout (mode test)
- [ ] Vérifier webhooks Stripe

### Commit

- [ ] `git add apps/storefront`
- [ ] `git commit -m "feat(apps): add storefront application"`

---

## 🔧 Phase 6 : Package Admin Shell (Jour 6-7)

### Structure

- [ ] Créer `packages/admin-shell/`
- [ ] Créer `package.json`
- [ ] Créer `tsconfig.json`

### Fichiers core

- [ ] Créer `src/types.ts` (ModuleProps, ModuleServices, ModuleConfig)
- [ ] Créer `src/ModuleRegistry.ts` avec les 8 modules
- [ ] Créer `src/ModuleLoader.tsx`
- [ ] Créer `src/ModuleErrorBoundary.tsx`
- [ ] Créer `src/index.ts` avec exports

### Tests

- [ ] `pnpm install`
- [ ] `pnpm type-check`

### Commit

- [ ] `git add packages/admin-shell`
- [ ] `git commit -m "feat(packages): add @repo/admin-shell"`

---

## 👨‍💼 Phase 7 : App Admin Shell (Jour 7-8)

### Structure Next.js

- [ ] Créer `apps/admin/` avec structure Next.js 15
- [ ] Créer `package.json`
- [ ] Créer `next.config.ts` avec `transpilePackages` (packages + modules)
- [ ] Créer `tailwind.config.js` (scanner packages + modules)
- [ ] Créer `tsconfig.json` avec references

### Layout admin

- [ ] Créer `app/layout.tsx` racine
- [ ] Créer `app/page.tsx` (dashboard)
- [ ] Créer `app/(auth)/layout.tsx`
- [ ] Créer `app/(auth)/login/page.tsx`
- [ ] Copier `src/app/admin/(auth)/login/page.tsx`

### Composants layout

- [ ] Créer `components/Layout/AdminHeader.tsx`
- [ ] Créer `components/Layout/AdminNav.tsx` (dynamique depuis registre)
- [ ] Créer `components/Layout/Sidebar.tsx`
- [ ] Copier composants admin nécessaires

### Route dynamique

- [ ] Créer `app/[module]/[[...path]]/page.tsx`
- [ ] Implémenter vérification auth
- [ ] Implémenter vérification permissions
- [ ] Implémenter chargement module via ModuleLoader

### Configuration

- [ ] Copier `.env` variables admin
- [ ] Configurer runtime si nécessaire

### Tests

- [ ] `pnpm dev --filter admin`
- [ ] Tester login admin
- [ ] Tester dashboard
- [ ] Tester navigation (sans modules encore)

### Commit

- [ ] `git add apps/admin`
- [ ] `git commit -m "feat(apps): add admin shell application"`

---

## 📰 Phase 8 : Module Newsletter (Jour 8-9)

### Structure

- [ ] Créer `modules/newsletter/` avec structure complète
- [ ] Créer `package.json`
- [ ] Créer `tsconfig.json`

### Migration logique API (pure functions)

- [ ] Créer `src/api/campaigns.ts` avec fonctions pures
- [ ] Créer `src/api/subscribers.ts`
- [ ] Créer `src/api/stats.ts`

### Migration pages

- [ ] Créer `src/pages/CampaignList.tsx`
- [ ] Créer `src/pages/CampaignEditor.tsx`
- [ ] Créer `src/pages/SubscriberTable.tsx`
- [ ] Créer `src/pages/index.ts`

### Migration composants

- [ ] Migrer composants internes vers `src/components/`

### Point d'entrée

- [ ] Créer `src/index.tsx` avec routing interne
- [ ] Implémenter ModuleProps
- [ ] Implémenter services injection

### Route handlers dans admin

- [ ] Créer `apps/admin/app/api/newsletter/campaigns/route.ts`
- [ ] Créer autres routes nécessaires
- [ ] Appeler les fonctions pures du module

### Tests

- [ ] Tests unitaires API : `src/api/__tests__/`
- [ ] `pnpm type-check`
- [ ] `pnpm dev` et tester le module

### Commit

- [ ] `git add modules/newsletter apps/admin/app/api/newsletter`
- [ ] `git commit -m "feat(modules): add newsletter module"`

---

## 📂 Phase 9 : Module Categories (Jour 9)

### Structure & Migration

- [ ] Créer `modules/categories/`
- [ ] Migration logique API → `src/api/`
- [ ] Migration pages → `src/pages/`
- [ ] Migration composants → `src/components/`
- [ ] Créer `src/index.tsx`

### Route handlers

- [ ] Créer `apps/admin/app/api/categories/route.ts`
- [ ] Créer `apps/admin/app/api/categories/[id]/route.ts`

### Tests

- [ ] Tests unitaires
- [ ] Test module dans l'admin

### Commit

- [ ] `git commit -m "feat(modules): add categories module"`

---

## 📊 Phase 10 : Module Analytics (Jour 10)

### Structure & Migration

- [ ] Créer `modules/analytics/`
- [ ] Migration logique API → `src/api/`
- [ ] Migration dashboard → `src/pages/`
- [ ] Migration composants (charts, metrics) → `src/components/`
- [ ] Créer `src/index.tsx`

### Route handlers

- [ ] Créer `apps/admin/app/api/analytics/custom/route.ts`
- [ ] Créer `apps/admin/app/api/analytics/vercel/route.ts`

### Tests

- [ ] Tests unitaires
- [ ] Test module dans l'admin

### Commit

- [ ] `git commit -m "feat(modules): add analytics module"`

---

## 📱 Phase 11 : Module Social (Jour 10-11)

### Structure & Migration

- [ ] Créer `modules/social/`
- [ ] Migration logique API → `src/api/` (posts, insights, stats)
- [ ] Migration pages → `src/pages/` (dashboard, posts, links, compare)
- [ ] Migration composants → `src/components/`
- [ ] Créer `src/index.tsx` avec routing complexe

### Route handlers

- [ ] Créer `apps/admin/app/api/social/posts/route.ts`
- [ ] Créer `apps/admin/app/api/social/posts/[id]/route.ts`
- [ ] Créer `apps/admin/app/api/social/insights/route.ts`
- [ ] Créer `apps/admin/app/api/social/posts/stats/route.ts`

### Tests

- [ ] Tests unitaires
- [ ] Test module dans l'admin

### Commit

- [ ] `git commit -m "feat(modules): add social module"`

---

## 📦 Phase 12 : Module Products (Jour 11-12)

### Structure & Migration

- [ ] Créer `modules/products/`
- [ ] Migration logique API → `src/api/` (list, create, update, delete, variants, stock)
- [ ] Migration pages → `src/pages/` (list, form, detail)
- [ ] Migration composants → `src/components/`
- [ ] Créer `src/index.tsx`

### Route handlers (complexe)

- [ ] Créer `apps/admin/app/api/products/route.ts`
- [ ] Créer `apps/admin/app/api/products/[id]/route.ts`
- [ ] Créer `apps/admin/app/api/products/[id]/variants/route.ts`
- [ ] Créer `apps/admin/app/api/products/[id]/stock-recompute/route.ts`
- [ ] Créer `apps/admin/app/api/product-images/` (tous les endpoints)

### Tests

- [ ] Tests unitaires API
- [ ] Test CRUD complet
- [ ] Test upload images

### Commit

- [ ] `git commit -m "feat(modules): add products module"`

---

## 🛒 Phase 13 : Module Orders (Jour 12-13)

### Structure & Migration

- [ ] Créer `modules/orders/`
- [ ] Migration logique API → `src/api/`
- [ ] Migration pages → `src/pages/`
- [ ] Migration composants → `src/components/` (SendTrackingModal)
- [ ] Créer `src/index.tsx`

### Route handlers

- [ ] Créer `apps/admin/app/api/orders/[id]/mark-delivered/route.ts`
- [ ] Créer `apps/admin/app/api/orders/[id]/resend-confirmation/route.ts`
- [ ] Créer `apps/admin/app/api/orders/[id]/send-tracking/route.ts`

### Tests

- [ ] Tests unitaires
- [ ] Test workflow complet
- [ ] Test envoi emails

### Commit

- [ ] `git commit -m "feat(modules): add orders module"`

---

## 👥 Phase 14 : Module Customers (Jour 13)

### Structure & Migration

- [ ] Créer `modules/customers/`
- [ ] Migration logique API → `src/api/`
- [ ] Migration pages → `src/pages/` (list, detail avec tabs)
- [ ] Migration composants tabs → `src/components/`
- [ ] Créer `src/index.tsx`

### Route handlers

- [ ] Créer `apps/admin/app/api/customers/route.ts`
- [ ] Créer `apps/admin/app/api/customers/[id]/route.ts`
- [ ] Créer `apps/admin/app/api/customers/[id]/addresses/route.ts`
- [ ] Créer `apps/admin/app/api/customers/[id]/notes/route.ts`
- [ ] Créer `apps/admin/app/api/customers/[id]/orders/route.ts`
- [ ] Créer `apps/admin/app/api/customers/stats/route.ts`

### Tests

- [ ] Tests unitaires
- [ ] Test CRUD + relations

### Commit

- [ ] `git commit -m "feat(modules): add customers module"`

---

## 🖼️ Phase 15 : Module Media (Jour 14)

### Structure & Migration

- [ ] Créer `modules/media/`
- [ ] Migration logique → `src/api/`
- [ ] Migration pages → `src/pages/`
- [ ] Migration composants → `src/components/` (ImageEditorModal, Breadcrumb, AdminProductImage)
- [ ] Créer `src/index.tsx`

### Tests

- [ ] Tests unitaires
- [ ] Test upload
- [ ] Test édition images

### Commit

- [ ] `git commit -m "feat(modules): add media module"`

---

## 🧹 Phase 16 : Nettoyage (Jour 14)

### Supprimer doublons

- [ ] Supprimer `src/components/layout/Header.tsx` (legacy)
- [ ] Supprimer `src/components/layout/UnifiedHeader.tsx` (backup)
- [ ] Supprimer `src/components/admin/Toast.tsx` (utiliser Sonner)

### Supprimer fichiers de test

- [ ] Supprimer `src/app/checkout-test/`
- [ ] Supprimer `src/app/test-emails/`
- [ ] Supprimer `src/app/test-search/`

### Migration Sanity

- [ ] Copier `sanity/` → `shared/sanity/`
- [ ] Configurer accès depuis storefront
- [ ] Tester `/studio`

### Migration Documentation

- [ ] Copier `docs/` → `shared/docs/`
- [ ] Mettre à jour les docs

### Migration Scripts

- [ ] Copier `scripts/` → `shared/scripts/`
- [ ] Adapter les paths

### Commit

- [ ] `git commit -m "chore: cleanup and organize shared resources"`

---

## ✅ Phase 17 : Tests End-to-End (Jour 15)

### Setup Playwright

- [ ] Installer Playwright
- [ ] Créer `playwright.config.ts`
- [ ] Configurer projets storefront + admin

### Tests Storefront

- [ ] Test E2E checkout complet
- [ ] Test E2E product detail
- [ ] Test E2E search
- [ ] Test E2E wishlist

### Tests Admin (smoke tests par module)

- [ ] Test login admin
- [ ] Test module Newsletter (liste → new → save)
- [ ] Test module Products (liste → edit → save)
- [ ] Test module Orders (liste → detail)
- [ ] Test module Customers (liste → detail → notes)
- [ ] Test module Categories (CRUD)
- [ ] Test module Analytics (dashboard load)
- [ ] Test module Social (dashboard load)
- [ ] Test module Media (liste)

### Run tests

- [ ] `pnpm test:e2e`
- [ ] Vérifier tous les tests passent

### Commit

- [ ] `git commit -m "test: add E2E tests with Playwright"`

---

## 📊 Phase 18 : Performance & Budgets (Jour 15)

### Analyse bundles

- [ ] Installer `@next/bundle-analyzer`
- [ ] Analyser bundle storefront
- [ ] Analyser bundle admin
- [ ] Analyser taille de chaque module

### Définir budgets

- [ ] Créer `.budgets.json` pour admin
- [ ] Définir seuils (admin shell < 250KB, modules < 200KB)
- [ ] Script de vérification

### Optimisations

- [ ] Vérifier tree-shaking des icônes (imports nominatifs)
- [ ] Configurer `optimizePackageImports` dans next.config
- [ ] Vérifier lazy loading des modules

### Tests

- [ ] `pnpm build:admin`
- [ ] `pnpm analyze`
- [ ] Vérifier budgets respectés

### Commit

- [ ] `git commit -m "perf: add bundle analysis and budgets"`

---

## 🚀 Phase 19 : Déploiement (Jour 16)

### Configuration Vercel - Storefront

- [ ] Créer projet Vercel "blancherenaudin-storefront"
- [ ] Configurer Root Directory: `apps/storefront`
- [ ] Configurer Build Command
- [ ] Configurer Install Command
- [ ] Configurer variables d'environnement
- [ ] Premier déploiement
- [ ] Tester en production

### Configuration Vercel - Admin

- [ ] Créer projet Vercel "blancherenaudin-admin"
- [ ] Configurer Root Directory: `apps/admin`
- [ ] Configurer Build Command
- [ ] Configurer Install Command
- [ ] Configurer variables d'environnement
- [ ] Premier déploiement
- [ ] Tester en production

### Configuration CI/CD

- [ ] Créer `.github/workflows/ci.yml`
- [ ] Pipeline: lint → type-check → build → test
- [ ] Générer types Supabase
- [ ] Vérifier budgets

### Tests production

- [ ] Tester storefront en production
- [ ] Tester checkout complet
- [ ] Tester webhooks Stripe
- [ ] Tester admin en production
- [ ] Tester tous les modules
- [ ] Vérifier lazy loading
- [ ] Vérifier permissions

### Commit

- [ ] `git commit -m "ci: configure CI/CD and Vercel deployments"`

---

## 📚 Phase 20 : Documentation (Jour 16)

### README principal

- [ ] Mettre à jour `README.md` racine
- [ ] Architecture overview
- [ ] Getting started
- [ ] Scripts disponibles
- [ ] Structure du projet

### Documentation packages

- [ ] README pour `@repo/ui`
- [ ] README pour `@repo/database`
- [ ] README pour `@repo/admin-shell`

### Documentation modules

- [ ] Guide création nouveau module
- [ ] Pattern API handlers
- [ ] Pattern routing interne
- [ ] Pattern tests

### Guide développement

- [ ] Workflow quotidien
- [ ] Comment ajouter un module
- [ ] Comment modifier un package
- [ ] Comment déployer

### Commit

- [ ] `git commit -m "docs: add comprehensive documentation"`

---

## 🎉 Phase 21 : Validation Finale

### Checklist Build

- [ ] `pnpm build` < 3 min
- [ ] Build incrémental module < 10s
- [ ] Hot reload < 1s
- [ ] TypeScript 0 erreur
- [ ] ESLint 0 warning critique
- [ ] Aucune dépendance circulaire

### Checklist Bundles

- [ ] Bundle storefront < 600KB
- [ ] Bundle admin shell < 250KB
- [ ] Chaque module < 200KB
- [ ] Lazy loading vérifié

### Checklist Fonctionnel

- [ ] Storefront : toutes routes OK
- [ ] Storefront : checkout end-to-end OK
- [ ] Storefront : webhooks Stripe OK
- [ ] Admin : login OK
- [ ] Admin : 8 modules accessibles
- [ ] Admin : CRUD OK partout
- [ ] Admin : permissions OK
- [ ] Admin : upload images OK

### Checklist Qualité

- [ ] Tests unitaires : pass
- [ ] Tests E2E : pass
- [ ] Types Supabase à jour
- [ ] Documentation complète

### Checklist Production

- [ ] Storefront déployé
- [ ] Admin déployé
- [ ] Monitoring actif
- [ ] Budgets respectés
- [ ] Performance OK (Lighthouse > 90)

### 🎊 MIGRATION TERMINÉE !

---

## 📌 Notes

**Estimation totale :** 15-20 jours

**Jours critiques :** Jour 5-6 (Storefront), Jour 11-13 (Modules Products/Orders/Customers)

**Points de validation :** Après chaque phase, commit Git

**Stratégie si bloqué :**

1. Revenir au dernier commit stable
2. Isoler le problème
3. Fix dans une branche séparée
4. Merge une fois validé

**Ordre de priorité si manque de temps :**

1. ✅ Packages fondations (ui, database)
2. ✅ Storefront (site public critique)
3. ✅ Admin shell + 2-3 modules essentiels (products, orders)
4. ⏸️ Reporter les autres modules
