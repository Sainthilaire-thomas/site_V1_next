# generate-base-context.ps1
# Script de génération du contexte de base pour collaboration IA
# Projet: Blanche Renaudin - site_v1_next
# Usage: .\generate-base-context.ps1

param(
    [string]$ProjectPath = "C:\Users\thoma\OneDrive\SONEAR_2025\site_v1_next",
    [string]$OutputPath = ".\docs\ai-context\base-context.md"
)

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📦 Génération du Contexte de Base - Blanche Renaudin" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le projet existe
if (-Not (Test-Path $ProjectPath)) {
    Write-Host "❌ Projet introuvable: $ProjectPath" -ForegroundColor Red
    exit 1
}

Set-Location $ProjectPath

# Date de génération
$GeneratedDate = Get-Date -Format "yyyy-MM-dd HH:mm"

# Initialiser le contenu
$content = @"
# Blanche Renaudin - Contexte de Base Projet

*Généré le $GeneratedDate*

---

## 🎯 Vue d'ensemble

**Projet:** Site e-commerce de mode contemporaine haut de gamme  
**Marque:** Blanche Renaudin  
**URL Production:** https://blancherenaudin.com  
**Repository:** site_v1_next

### Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 15.x (App Router) |
| UI | React | 19.x |
| Styling | Tailwind CSS | 3.4.x |
| CMS | Sanity | v3 |
| Base de données | Supabase (Postgres) | - |
| Auth | Supabase Auth | - |
| Paiement | Stripe | - |
| Email | Resend | - |
| Déploiement | Vercel | - |
| Language | TypeScript | 5.x (strict) |

### Architecture globale

``````
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js 15 (App Router) + React 19 + Tailwind CSS         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Sanity    │  │  Supabase   │  │       Stripe        │ │
│  │    CMS      │  │  Database   │  │      Payments       │ │
│  │             │  │  + Auth     │  │                     │ │
│  │ - Homepage  │  │  + Storage  │  │ - Checkout Session  │ │
│  │ - Lookbooks │  │             │  │ - Webhooks          │ │
│  │ - Pages     │  │ - Products  │  │                     │ │
│  │ - Blog (*)  │  │ - Orders    │  └─────────────────────┘ │
│  │             │  │ - Customers │                          │
│  └─────────────┘  │ - Newsletter│  ┌─────────────────────┐ │
│                   │ - Analytics │  │       Resend        │ │
│                   └─────────────┘  │       Emails        │ │
│                                    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

(*) Blog = .edition room (à implémenter)
``````

---

## 📁 Structure des dossiers

``````
"@

# Générer l'arborescence
Write-Host "📁 Génération de l'arborescence..." -ForegroundColor Yellow

$treeContent = @"
site_v1_next/
├── public/                     # Assets statiques
├── sanity/                     # Configuration Sanity CMS
│   ├── schemas/
│   │   ├── types/
│   │   │   ├── blockContent.ts      # Rich text
│   │   │   ├── collectionEditoriale.ts  # → À renommer blogPost.ts
│   │   │   ├── homepage.ts
│   │   │   ├── impactPage.ts
│   │   │   ├── lookbook.ts
│   │   │   ├── page.ts
│   │   │   └── seo.ts
│   │   └── index.ts
│   ├── sanity.config.ts
│   └── structure.ts
├── src/
│   ├── app/                    # Routes Next.js 15
│   │   ├── (auth)/
│   │   ├── about/
│   │   ├── account/
│   │   ├── admin/              # Dashboard admin (Supabase)
│   │   │   ├── categories/
│   │   │   ├── customers/
│   │   │   ├── media/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── collections/
│   │   │   ├── products/
│   │   │   ├── webhooks/stripe/
│   │   │   └── wishlist/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── collections/
│   │   ├── collections-editoriales/  # → À renommer /edition-room
│   │   ├── contact/
│   │   ├── impact/
│   │   ├── lookbooks/
│   │   ├── product/[id]/
│   │   ├── products/
│   │   ├── search/
│   │   ├── silhouettes/
│   │   ├── studio/[[...index]]/      # Sanity Studio
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── editorial/
│   │   ├── layout/
│   │   │   ├── FooterMinimal.tsx
│   │   │   ├── HeaderMinimal.tsx
│   │   │   ├── Homepage.tsx
│   │   │   └── InteractiveEntry.tsx
│   │   ├── products/
│   │   ├── search/
│   │   └── ui/                 # Shadcn/UI components
│   ├── hooks/
│   ├── lib/
│   │   ├── auth/
│   │   ├── email/
│   │   ├── services/
│   │   ├── validation/
│   │   ├── database.types.ts   # Types Supabase auto-générés
│   │   ├── queries.ts          # Queries GROQ Sanity
│   │   ├── sanity.client.ts
│   │   ├── sanity.image.ts
│   │   ├── stripe.ts
│   │   ├── supabase-admin.ts
│   │   ├── supabase-browser.ts
│   │   ├── supabase-server.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── store/                  # Zustand stores
│       ├── useAuthStore.ts
│       ├── useCartStore.ts
│       └── useWishListStore.ts
├── docs/
│   └── ai-context/             # Contextes IA
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
``````

---

## 🎨 Design System

### Typographie

| Usage | Font | Exemple |
|-------|------|---------|
| Headers, Titres | Archivo Black | `.edition room` |
| Body, Navigation | Archivo Narrow | Navigation, texte |

### Couleurs

| Nom | Valeur | Usage |
|-----|--------|-------|
| Violet (primary) | `hsl(271 74% 37%)` | Accents, hover |
| Black | `#000000` | Texte principal |
| Grey Dark | `hsl(0 0% 20%)` | Texte secondaire |
| Grey Medium | `hsl(0 0% 50%)` | Meta, placeholders |
| Grey Light | `hsl(0 0% 95%)` | Backgrounds |
| White | `#ffffff` | Fond principal |

### Conventions de nommage

- Navigation : préfixe `.` (ex: `.tops`, `.edition room`)
- Tout en minuscules
- Tracking large pour emphase
- Style minimaliste inspiré Jacquemus

---

"@

$content += $treeContent

# Extraire les types Sanity
Write-Host "📝 Extraction des schémas Sanity..." -ForegroundColor Yellow

$content += @"

## 📋 Schémas Sanity existants

### blockContent.ts (Rich Text)
``````typescript
"@

$blockContentPath = Join-Path $ProjectPath "sanity\schemas\types\blockContent.ts"
if (Test-Path $blockContentPath) {
    $blockContent = Get-Content $blockContentPath -Raw -ErrorAction SilentlyContinue
    if ($blockContent) {
        $content += $blockContent
    } else {
        $content += "// Fichier non lisible"
    }
} else {
    $content += "// Fichier non trouvé"
}

$content += @"

``````

### collectionEditoriale.ts (Legacy - à transformer en blogPost)
``````typescript
"@

$collectionEditorialePath = Join-Path $ProjectPath "sanity\schemas\types\collectionEditoriale.ts"
if (Test-Path $collectionEditorialePath) {
    $collectionEditoriale = Get-Content $collectionEditorialePath -Raw -ErrorAction SilentlyContinue
    if ($collectionEditoriale) {
        $content += $collectionEditoriale
    } else {
        $content += "// Fichier non lisible"
    }
} else {
    $content += "// Fichier non trouvé"
}

$content += @"

``````

### seo.ts
``````typescript
"@

$seoPath = Join-Path $ProjectPath "sanity\schemas\types\seo.ts"
if (Test-Path $seoPath) {
    $seo = Get-Content $seoPath -Raw -ErrorAction SilentlyContinue
    if ($seo) {
        $content += $seo
    } else {
        $content += "// Fichier non lisible"
    }
} else {
    $content += "// Fichier non trouvé"
}

$content += @"

``````

### schemas/index.ts
``````typescript
"@

$indexPath = Join-Path $ProjectPath "sanity\schemas\index.ts"
if (Test-Path $indexPath) {
    $index = Get-Content $indexPath -Raw -ErrorAction SilentlyContinue
    if ($index) {
        $content += $index
    } else {
        $content += "// Fichier non lisible"
    }
} else {
    $content += "// Fichier non trouvé"
}

$content += @"

``````

---

## 🔍 Queries GROQ existantes

``````typescript
"@

$queriesPath = Join-Path $ProjectPath "src\lib\queries.ts"
if (Test-Path $queriesPath) {
    $queries = Get-Content $queriesPath -Raw -ErrorAction SilentlyContinue
    if ($queries) {
        $content += $queries
    } else {
        $content += "// Fichier non lisible"
    }
} else {
    $content += "// Fichier non trouvé"
}

$content += @"

``````

---

## ⚙️ Configuration

### package.json (dépendances principales)
``````json
"@

$packagePath = Join-Path $ProjectPath "package.json"
if (Test-Path $packagePath) {
    $package = Get-Content $packagePath -Raw -ErrorAction SilentlyContinue
    if ($package) {
        # Extraire seulement dependencies et devDependencies
        try {
            $packageJson = $package | ConvertFrom-Json
            $deps = @{
                dependencies = $packageJson.dependencies
                devDependencies = $packageJson.devDependencies
            } | ConvertTo-Json -Depth 3
            $content += $deps
        } catch {
            $content += $package
        }
    }
} else {
    $content += "// Fichier non trouvé"
}

$content += @"

``````

### Variables d'environnement requises
``````bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_BASE_URL=https://blancherenaudin.com
``````

---

## 📌 Notes importantes

### Conventions de code

1. **Server Components par défaut** - `"use client"` uniquement si nécessaire
2. **TypeScript strict** - Pas de `any`, types explicites
3. **Tailwind CSS** - Utility-first, pas de CSS custom sauf exceptions
4. **Zustand** - État global (panier, auth, wishlist)
5. **ISR** - `revalidate = 3600` pour les pages de contenu

### Points d'attention

- **Sanity** = Contenu éditorial (homepage, lookbooks, pages, blog)
- **Supabase** = Données transactionnelles (produits, commandes, clients)
- **Distinction claire** entre les deux systèmes

### Routes Sanity Studio

- `/studio` → Sanity Studio intégré
- Accessible pour Blanche pour éditer le contenu

---

*Ce fichier doit être régénéré quand l'architecture ou les types fondamentaux changent.*
"@

# Créer le dossier de sortie si nécessaire
$outputDir = Split-Path $OutputPath -Parent
if (-Not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Écrire le fichier
$content | Out-File -FilePath $OutputPath -Encoding UTF8

Write-Host ""
Write-Host "✅ Contexte de base généré: $OutputPath" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Statistiques:" -ForegroundColor Cyan
$lines = (Get-Content $OutputPath).Count
$chars = (Get-Content $OutputPath -Raw).Length
Write-Host "   • Lignes: $lines" -ForegroundColor White
Write-Host "   • Caractères: $chars" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Prochaine étape:" -ForegroundColor Yellow
Write-Host "   Uploader ce fichier au début de chaque session IA" -ForegroundColor White
