# 📋 Description complète du site .blancherenaudin

## 🎯 Vue d'ensemble

Site e-commerce de mode contemporaine haut de gamme avec une identité visuelle minimaliste inspirée de Jacquemus. Architecture moderne full-stack basée sur **Next.js 15**, **Supabase**, **Sanity CMS** et **Tailwind CSS**.

---

## ✅ Fonctionnalités implémentées

### 🎨 **Frontend & Design**

- ✅ Design system minimaliste avec typographie Archivo (Black + Narrow)
- ✅ Animation d'entrée interactive avec lettres flottantes
- ✅ Header unifié avec navigation adaptative
- ✅ Footer minimaliste avec liens essentiels
- ✅ Grille produits style Jacquemus (pattern 1-2-1)
- ✅ Responsive design complet
- ✅ Dark mode pour l'admin

### 🛍️ **E-commerce Core**

- ✅ Catalogue produits avec variantes (tailles, couleurs)
- ✅ Gestion du stock par variante
- ✅ Système de panier (Zustand + localStorage)
- ✅ Page produit détaillée avec galerie lightbox
- ✅ Collections et catégories
- ✅ Wishlist utilisateur
- ✅ Recherche produits avec filtres avancés
- ✅ Checkout (interface uniquement, paiement à implémenter)

### 🖼️ **Gestion des images**

- ✅ Upload multiple vers Supabase Storage
- ✅ Génération automatique de variantes (sm/md/lg/xl)
- ✅ Formats multiples (AVIF, WebP, JPEG)
- ✅ Ã‰diteur d'image avec recadrage (React Cropper)
- ✅ Drag & drop pour réorganiser
- ✅ URLs signées pour la sécurité

### 👤 **Authentification & Comptes**

- ✅ Auth Supabase (signup/login/logout)
- ✅ Profils utilisateurs avec rôles (customer/admin)
- ✅ Espace compte client (commandes, favoris, adresses)
- ✅ Système d'adresses multiples

### 📦 **Administration**

- ✅ Dashboard admin complet
- ✅ CRUD produits avec variantes
- ✅ Gestion du stock avec historique des mouvements
- ✅ Gestion des commandes avec statuts
- ✅ Gestion des clients avec notes internes
- ✅ Gestion des catégories
- ✅ Gestion des collections
- ✅ Médiathèque centralisée
- ✅ Breadcrumb dynamique
- ✅ Toast notifications

### 📝 **CMS & Contenu**

- ✅ Sanity Studio intégré (`/studio`)
- ✅ Homepage éditable
- ✅ Collections éditoriales
- ✅ Lookbooks
- ✅ Pages statiques (À propos, Impact, Contact)
- ✅ Rich text editor pour le contenu

### 🔧 **Infrastructure**

- ✅ Next.js 15 avec App Router
- ✅ Server Components pour les perfs
- ✅ API Routes pour les opérations admin
- ✅ Supabase (auth, DB, storage)
- ✅ TypeScript strict
- ✅ Zod pour la validation
- ✅ Architecture store Zustand

---

## ⚠️ Fonctionnalités à compléter

### 🔴 **CRITIQUES**

#### 💳 **Système de paiement**

```typescript
// ❌ Non implémenté
- Intégration Stripe Checkout
- Webhooks de confirmation
- Gestion des paiements échoués
- Remboursements

// 📁 Fichiers concernés
src/app/checkout/page.tsx        // ❌ Interface OK, logique manquante
src/app/api/webhooks/stripe/route.ts  // ❌ Stub uniquement
src/lib/stripe.ts                // ✅ Client initialisé
```

#### 📧 **Emails transactionnels**

```typescript
// ❌ Non implémenté
- Confirmation de commande
- Notification d'expédition
- Réinitialisation mot de passe

// 📁 Fichiers concernés
src/lib/email/send.ts            // ❌ TODO avec Resend/SendGrid
src/lib/email/order-confirmation.tsx  // ✅ Template HTML prêt
```

#### 🚚 **Livraison**

```typescript
// ⚠️ Partiellement implémenté
- Calcul des frais de port dynamique
- Intégration transporteurs (Colissimo, Mondial Relay)
- Tracking des colis

// 📁 Fichiers concernés
src/app/checkout/page.tsx        // ⚠️ Tarifs en dur
Database: shipping_rates         // ✅ Table créée
```

---

### 🟡 **IMPORTANTES**

#### 🔍 **SEO & Performance**

```typescript
// ⚠️ À améliorer
- Métadonnées dynamiques par produit
- Sitemap XML
- Schema.org product markup
- OpenGraph images
- Lazy loading images

// 📁 Actions nécessaires
- Ajouter generateMetadata() dans product/[id]/page.tsx
- Créer app/sitemap.ts
- Implémenter schema.org dans ProductDetailClient
```

#### 📊 **Analytics**

```typescript
// ❌ Non implémenté
- Google Analytics / Plausible
- Tracking conversions
- Événements e-commerce

// 📁 À ajouter
- Provider Analytics dans layout.tsx
- Événements add_to_cart, purchase, etc.
```

#### 🔐 **Sécurité**

```typescript
// ⚠️ À renforcer
- Rate limiting sur les API
- CAPTCHA sur les formulaires
- Validation côté serveur stricte
- CSP (Content Security Policy)

// 📁 Fichiers concernés
middleware.ts                    // ❌ À créer
src/lib/validation/*             // ✅ Zod en place
```

---

### 🟢 **AMÉLIORATIONS SOUHAITABLES**

#### 🎯 **UX/UI**

```typescript
// Suggestions d'amélioration
- [] Loading skeletons plus nombreux
- [] Animations de transition entre pages
- [] Toast notifications plus stylées
- [] Filtre de recherche avec suggestions
- [] Comparateur de produits
- [] Vue rapide produit (quick view modal)
- [] Zoom produit avancé
```

#### 📱 **Mobile**

```typescript
// À optimiser
- [] Menu hamburger plus fluide
- [] Swipe gestures dans les galeries
- [] Bottom navigation pour le compte
- [] PWA (Progressive Web App)
```

#### 📄 **Fonctionnalités supplémentaires**

```typescript
// Nice to have
- [] Système de reviews/avis clients
- [] Programme de fidélité
- [] Codes promo avancés (% sur catégories)
- [] Recommandations produits (AI)
- [] Historique de navigation
- [] Liste de souhaits partageable
- [] Notification de retour en stock
- [] Chat support client
```

#### 🌍 **Internationalisation**

```typescript
// ❌ Non implémenté
- [] Support multi-langues (EN, FR)
- [] Multi-devises (EUR, USD, GBP)
- [] Détection automatique de la région

// 📁 À utiliser
- next-intl ou react-i18next
```

---

## 🗂️ Structure des dossiers complète

```
src/
├── app/                         ✅ Routes Next.js 15
│   ├── (auth)/                  ✅ Groupes de routes
│   ├── about/                   ✅ Page À propos
│   ├── account/                 ✅ Espace client complet
│   ├── admin/                   ✅ Dashboard admin complet
│   │   ├── categories/          ✅ CRUD catégories
│   │   ├── customers/           ✅ Gestion clients + notes
│   │   ├── media/               ✅ Médiathèque
│   │   ├── orders/              ✅ Commandes avec détails
│   │   └── products/            ✅ Produits + variantes + stock
│   ├── api/                     ✅ API Routes
│   │   ├── admin/               ✅ Endpoints admin protégés
│   │   ├── auth/                ✅ Auth endpoints
│   │   ├── collections/         ✅ API collections
│   │   ├── products/            ✅ API produits
│   │   └── wishlist/            ✅ API wishlist
│   ├── cart/                    ✅ Page panier
│   ├── checkout/                ⚠️ Interface OK, paiement manquant
│   ├── collections/             ✅ Collections produits
│   ├── collections-editoriales/ ✅ Collections Sanity
│   ├── contact/                 ✅ Formulaire contact
│   ├── impact/                  ✅ Page Sanity
│   ├── lookbooks/               ✅ Lookbooks Sanity
│   ├── product/[id]/            ✅ Détail produit
│   ├── products/                ✅ Catalogue par catégorie
│   ├── search/                  ✅ Recherche avancée
│   ├── silhouettes/             ✅ Alias lookbooks
│   └── studio/                  ✅ Sanity Studio
│
├── components/                  ✅ Architecture complète (108 composants)
│   ├── account/                 ✅ Composants espace client (1)
│   │   └── AccountSidebar       ✅ Navigation compte avec déconnexion
│   │
│   ├── admin/                   ✅ Composants admin (8)
│   │   ├── AdminNav             ✅ Navigation admin
│   │   ├── AdminProductImage    ✅ Image produit avec signed URLs
│   │   ├── Breadcrumb           ✅ Fil d'Ariane dynamique intelligent
│   │   ├── ImageEditorModal     ✅ Éditeur complet (crop + rotation + zoom)
│   │   ├── QuickActions         ✅ Actions rapides contextuelles
│   │   ├── ThemeProvider        ✅ Dark mode admin (Context)
│   │   ├── ThemeToggle          ✅ Toggle dark/light
│   │   └── Toast                ⚠️ Notifications custom (doublon avec Sonner)
│   │
│   ├── auth/                    ✅ Authentification (1)
│   │   └── AuthModal            ✅ Modal login/signup avec tabs
│   │
│   ├── common/                  ✅ Composants communs (2)
│   │   ├── LazyImage            ✅ Lazy loading avec blur
│   │   └── RichTextRenderer     ✅ Rendu contenu Sanity
│   │
│   ├── editorial/               ✅ Contenu éditorial (1)
│   │   └── EditorialProductSection ✅ Showcase produits Sanity
│   │
│   ├── layout/                  ✅ Structure du site (6)
│   │   ├── FooterMinimal        ✅ Footer style Jacquemus
│   │   ├── Header               ⚠️ Header classique (legacy)
│   │   ├── HeaderMinimal        ✅ Header minimaliste (actif)
│   │   ├── Homepage             ✅ Homepage avec grille asymétrique
│   │   ├── InteractiveEntry     ✅ Animation lettres flottantes
│   │   └── UnifiedHeader        ⚠️ Non utilisé (backup)
│   │
│   ├── products/                ✅ Affichage produits (6)
│   │   ├── ProductCardJacquemus ✅ Card style minimaliste
│   │   ├── ProductCardMinimal   ✅ Card avec hover effects
│   │   ├── ProductGridJacquemus ✅ Grille sans gap
│   │   ├── ProductGridMinimal   ✅ Grille avec espacement
│   │   ├── ProductImage         ⭐ Image optimisée multi-formats
│   │   └── WishlistButton       ✅ Bouton favoris avec sync
│   │
│   ├── search/                  ✅ Recherche (2)
│   │   ├── SearchDebug          🐛 Debug DB (à retirer en prod)
│   │   └── SearchModal          ✅ Modal recherche full-screen
│   │
│   └── ui/                      ✅ Shadcn/UI (87 composants)
│       ├── accordion            ✅ Accordéons Radix
│       ├── alert-dialog         ✅ Dialogs de confirmation
│       ├── avatar               ✅ Avatars
│       ├── badge                ✅ Badges
│       ├── button               ✅ Boutons avec variantes
│       ├── calendar             ✅ Calendriers
│       ├── card                 ✅ Cards avec sections
│       ├── carousel             ✅ Carrousels Embla
│       ├── chart                ✅ Charts Recharts
│       ├── checkbox             ✅ Cases à cocher
│       ├── dialog               ✅ Modals
│       ├── dropdown-menu        ✅ Dropdowns
│       ├── form                 ✅ Forms avec react-hook-form
│       ├── input                ✅ Inputs stylisés
│       ├── select               ✅ Selects custom
│       ├── sheet                ✅ Drawers latéraux
│       ├── tabs                 ✅ Onglets
│       ├── toast                ✅ Toasts Radix
│       ├── sonner               ✅ Toasts Sonner (utilisé)
│       └── ... (+ 65 autres)    ✅ Design system complet
│
├── hooks/                       ✅ Custom hooks (3)
│   ├── use-mobile.ts            ✅ Breakpoint responsive
│   ├── use-toast.ts             ✅ Toast Sonner wrapper
│   └── useSupabaseAuth.ts       ✅ Hook auth Supabase
│
├── lib/                         ✅ Utilitaires & config
│   ├── auth/                    ✅ requireAdmin helper
│   ├── email/                   ⚠️ Templates prêts, envoi à faire
│   ├── services/                ✅ customerService
│   ├── validation/              ✅ Schémas Zod
│   ├── database.types.ts        ✅ Types Supabase auto-générés
│   ├── images.ts                ✅ Helpers images optimisées
│   ├── queries.ts               ✅ Queries Sanity GROQ
│   ├── sanity.client.ts         ✅ Client Sanity configuré
│   ├── sanity.image.ts          ✅ urlFor helper
│   ├── stripe.ts                ✅ Client Stripe initialisé
│   ├── supabase-admin.ts        ✅ Client admin (service role)
│   ├── supabase-browser.ts      ✅ Client browser
│   ├── supabase-server.ts       ✅ Client server
│   ├── types.ts                 ✅ Types métier custom
│   └── utils.ts                 ✅ Helpers (cn, formatters)
│
├── store/                       ✅ Zustand stores (5)
│   ├── useAuthStore.ts          ✅ Authentification
│   ├── useCartStore.ts          ✅ Panier avec localStorage
│   ├── useCollectionStore.ts    ✅ Collections
│   ├── useProductStore.ts       ✅ Produits
│   └── useWishListStore.ts      ✅ Wishlist
│
└── sanity/                      ✅ Configuration Sanity
    ├── sanity.config.ts         ✅ Config studio
    ├── structure.ts             ✅ Structure personnalisée
    └── schemas/                 ✅ Schémas de contenu (7)
        ├── index.ts             ✅ Export des schémas
        └── types/
            ├── homepage         ✅ Schéma homepage
            ├── page             ✅ Pages génériques
            ├── lookbook         ✅ Lookbooks
            ├── collectionEditoriale ✅ Collections éditoriales
            ├── impactPage       ✅ Page impact/sustainability
            ├── blockContent     ✅ Rich text
            └── seo              ✅ Métadonnées SEO
```

---

## 📊 Analyse détaillée du dossier `components/`

### 🏆 Composants clés à connaître

#### ⭐⭐⭐⭐⭐ **ProductImage.tsx** - Le plus important

**Deux variantes** :

1. `ProductImage` : Image simple avec taille choisie
2. `ResponsiveProductImage` : Picture avec tous les formats

**Fonctionnalités** :

- ✅ Signed URLs depuis Supabase Storage (sécurité)
- ✅ Multi-formats avec détection browser :
  ```
  AVIF > WebP > JPEG (fallback)
  ```
- ✅ Multi-tailles (sm/md/lg/xl)
- ✅ Cache-buster automatique avec timestamp
- ✅ Loading skeleton animé élégant
- ✅ Error handling avec retry
- ✅ Support `priority` pour optimiser LCP

**Code exemple** :

```tsx
// Simple
<ProductImage
  productId="uuid"
  imageId="uuid"
  alt="Robe noire"
  size="lg"
  priority={true}
/>

// Responsive (toutes les tailles)
<ResponsiveProductImage
  productId="uuid"
  imageId="uuid"
  alt="Robe noire"
/>
```

**Helpers internes** :

- `detectBestFormat()` : Teste AVIF > WebP > JPEG
- `supportsFormat()` : Test avec data URLs

---

#### ⭐⭐⭐⭐⭐ **ImageEditorModal.tsx** - L'éditeur

**Fonctionnalités** :

- Crop avec ratios prédéfinis :
  - Libre (0)
  - Carré (1:1)
  - Portrait (4:5)
  - Paysage (16:9)
- Rotation : +90°, -90°, Reset
- Zoom : 1x à 3x
- Preview temps réel avec indicateur "obsolète"
- Sauvegarde des transformations

**Workflow** :

1. Utilisateur ajuste crop/rotation/zoom
2. Click "Aperçu" → génère preview
3. Si changement → indicateur "obsolète"
4. Click "Enregistrer" → applique transformations

**Intégration** :

- Utilise `react-easy-crop` pour le crop
- Canvas API pour la génération preview
- POST `/api/admin/product-images/edit`

---

#### ⭐⭐⭐⭐ **Homepage.tsx** - La page d'accueil complexe

**Architecture** :

```tsx
<Homepage data={homepageData}>
  <Header />

  {/* Hero full-screen avec overlay */}
  <HeroSection>
    <Image avec hotspot />
    <TitreGrand />
    <Sous-titre />
    <CTA />
    <ScrollIndicator />
  </HeroSection>

  {/* Grille asymétrique style Jacquemus */}
  <GridSection>
    <CategoryCard size="large" /> {/* Hauts */}
    <CategoryCard size="small" /> {/* Bas */}
    <CategoryCard size="small" /> {/* Accessoires */}
    <CategoryCard size="medium" /> {/* Lookbooks */}
    <CategoryCard size="medium" /> {/* Sustainability */}
  </GridSection>

  <Footer />
</Homepage>
```

**Features** :

- Support **hotspot Sanity** pour positionner les images
- Hover reveal des titres (opacity 0 → 100)
- Heights fixes pour alignement horizontal
- Overlay noir progressif au hover

**Helpers** :

```tsx
getImageUrl(image, width?, height?, fallback)
// → Génère URL optimisée avec urlFor()

getHotspotStyle(image)
// → Calcule objectPosition CSS depuis hotspot Sanity
```

---

#### ⭐⭐⭐⭐ **HeaderMinimal.tsx** - Le header actif

**Structure** :

```tsx
<header className="sticky top-0">
  <Logo SVG />

  {/* Nav desktop */}
  <nav className="hidden lg:flex">
    .tops | .bottoms | .accessories | .silhouettes |
    .impact | .essence | .contact
  </nav>

  {/* Actions */}
  <Search icon />
  <User icon />
  <Cart icon + badge />
  <Menu hamburger (mobile) />
</header>

{/* Mobile drawer */}
<Drawer>
  <Navigation verticale />
  <Account link />
</Drawer>
```

**Features** :

- Sticky avec backdrop-blur
- Border apparaît au scroll
- Highlight de la route active
- Badge quantité sur le panier
- Drawer mobile avec overlay
- Lock scroll quand drawer ouvert

---

#### ⭐⭐⭐ **SearchModal.tsx** - Recherche full-screen

**Layout** :

```tsx
<Modal fullscreen>
  {/* Header */}
  <SearchBar>
    <SearchIcon />
    <Input placeholder="search..." />
    <CloseButton />
  </SearchBar>

  {/* Content scrollable */}
  <Content>
    {/* Quick access */}
    <Grid>
      <QuickLink>.tops</QuickLink>
      <QuickLink>.bottoms</QuickLink>
      ...
    </Grid>

    {/* Popular searches */}
    <PopularSearches>
      <Tag>bag</Tag>
      <Tag>dress</Tag>
      ...
    </PopularSearches>
  </Content>
</Modal>
```

**Interactions** :

- Submit avec `Enter`
- Close avec `ESC`
- Click overlay → ferme
- Suggestions cliquables

---

### 💡 Points forts de l'architecture

#### ✅ **Bien fait**

1. **Séparation des responsabilités** :
   - `account/` → Client
   - `admin/` → Admin
   - `auth/` → Authentification
   - `products/` → Affichage produits
   - `ui/` → Design system

2. **Composants atomiques** réutilisables (ui/)
3. **Performance** :
   - Lazy loading images
   - Signed URLs sécurisées
   - Multi-formats (AVIF/WebP/JPEG)
   - Cache-busting

4. **Accessibilité** :
   - Radix UI (ARIA, keyboard nav)
   - Focus management
   - Screen reader support

5. **Developer Experience** :
   - Types stricts TypeScript
   - Helpers bien nommés
   - Props documentées

6. **Design System** complet avec Shadcn/UI
7. **Responsive** Mobile-first

---

#### ⚠️ **Points d'amélioration**

1. **Doublon Toast** :

   ```
   admin/Toast.tsx (custom)
   ui/sonner.tsx (utilisé partout)
   → Unifier sur Sonner
   ```

2. **Headers multiples** :

   ```
   Header.tsx (legacy)
   HeaderMinimal.tsx (actif) ✅
   UnifiedHeader.tsx (backup)
   → Nettoyer les 2 autres
   ```

3. **ProductCard doublon** :

   ```
   ProductCardJacquemus
   ProductCardMinimal
   → Fusionner avec prop variant="jacquemus|minimal"
   ```

4. **SearchDebug.tsx** :

   ```
   → Retirer en production
   ou mettre dans if (process.env.NODE_ENV === 'development')
   ```

5. **InteractiveEntry.tsx** :

   ```
   Animation complexe, peut impacter FCP
   → Lazy load avec dynamic import
   ```

---

## 🎨 Guide de style & conventions

### Typographie

```css
/* Fonts */
font-family:
  - Headers: 'Archivo Black'
  - Body: 'Archivo Narrow'

/* Sizes */
text-hero: 72px / 96px       /* Homepage hero */
text-section: 48px / 56px    /* Section titles */
text-product: 13px           /* Product names */
text-body: 15px              /* Body text */

/* Casing */
uppercase: Titres courts, catégories
lowercase: Navigation, boutons

/* Tracking */
tracking-[0.05em]: Serré (base)
tracking-[0.15em]: Large (emphase)
```

### Couleurs

```css
/* Couleur principale */
--violet: hsl(271 74% 37%) /* Niveaux de gris */ --black: #000000
  --grey-dark: hsl(0 0% 20%) --grey-medium: hsl(0 0% 50%)
  --grey-light: hsl(0 0% 95%) --white: #ffffff /* Usage */ Texte
  principal: text-black Texte secondaire: text-grey-medium
  Backgrounds: bg-grey-light Hover/Active: text-violet ou bg-violet;
```

### Animations

```css
/* Durées */
duration-200: Micro-interactions (hover)
duration-300: Transitions standard
duration-500: Animations importantes
duration-700: Transitions lentes (images)

/* Easing */
ease-out: Default (naturel)
ease-in-out: Aller-retour
ease-linear: Progressif constant

/* Effects courants */
scale(1.05): Zoom subtle au hover
opacity transition: Fades
translate: Slides
```

### Layout & Spacing

```css
/* Conteneurs */
max-w-7xl mx-auto: Container standard
max-w-[1920px]: Container large (homepage)

/* Padding sections */
py-16 px-8: Mobile
py-24 px-16: Desktop

/* Gaps */
gap-4: Petite (16px)
gap-8: Moyenne (32px)
gap-12: Large (48px)

/* Aspect ratios */
aspect-[3/4]: Product cards
aspect-video: Videos/hero
aspect-square: Icônes/avatars
```

---

## 🔧 Variables d'environnement requises

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123
NEXT_PUBLIC_SANITY_DATASET=production

# Stripe
STRIPE_SECRET_KEY=sk_test_...           # ⚠️ À configurer
STRIPE_WEBHOOK_SECRET=whsec_...         # ⚠️ À configurer
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_... # ⚠️ À configurer

# Email (choisir)
RESEND_API_KEY=re_...                   # ❌ Non configuré
# OU
SENDGRID_API_KEY=SG...                  # ❌ Non configuré

# Optionnel
NEXT_PUBLIC_BASE_URL=https://votredomaine.com
NEXT_PUBLIC_DEBUG_COLLECTIONS=true
```

---

## 📈 Prochaines étapes recommandées

### Phase 1 : Mise en production MVP ⚡ (Priorité absolue)

1. **💳 Stripe** - Intégrer le paiement complet

   ```
   - Implémenter Checkout Session
   - Webhooks /api/webhooks/stripe
   - Gestion des erreurs
   - Tests en mode test
   ```

2. **📧 Emails** - Configurer Resend/SendGrid

   ```
   - Setup compte Resend
   - Implémenter src/lib/email/send.ts
   - Tester confirmation commande
   - Tester notification expédition
   ```

3. **🔍 SEO** - Métadonnées + sitemap

   ```
   - generateMetadata() pour /product/[id]
   - Créer app/sitemap.ts
   - Schema.org Product markup
   - OpenGraph images
   ```

4. **🔐 Sécurité** - Rate limiting + validation

   ```
   - Créer middleware.ts avec rate limiting
   - CAPTCHA sur formulaires sensibles
   - Valider tous les inputs côté serveur
   - Configurer CSP headers
   ```

### Phase 2 : Optimisations 🚀 (Important)

5. **⚡ Performance** - Lazy loading + ISR

   ```
   - Lazy load InteractiveEntry
   - ISR pour pages produits
   - Optimize images (déjà fait ✅)
   - Audit Lighthouse
   ```

6. **📊 Analytics** - Google Analytics / Plausible

   ```
   - Setup compte
   - Créer Provider
   - Événements e-commerce
   - Tracking conversions
   ```

7. **📱 Mobile** - PWA + optimisations

   ```
   - Manifest.json
   - Service worker
   - Optimiser menu mobile
   - Bottom navigation account
   ```

8. **🧪 Tests** - Tests E2E critiques

   ```
   - Playwright setup
   - Test checkout flow
   - Test admin CRUD
   - Test auth flow
   ```

### Phase 3 : Fonctionnalités avancées 🎯 (Nice to have)

9. **⭐ Reviews** - Système d'avis clients
10. **🤖 Recommandations** - AI suggestions
11. **🌍 i18n** - Multi-langues (FR/EN)
12. **🎁 Fidélité** - Programme points

---

## 💡 Tips & Best Practices

### Performance

```typescript
// ✅ BIEN : Lazy load des composants lourds
const InteractiveEntry = dynamic(() => import('./InteractiveEntry'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

// ✅ BIEN : ISR pour pages produits
export const revalidate = 3600 // 1 heure

// ❌ ÉVITER : Fetch dans composant client
const ProductCard = () => {
  const [data, setData] = useState()
  useEffect(() => { fetch(...) }, []) // ❌ Non
}

// ✅ BIEN : Server Component avec fetch
async function ProductCard({ id }) {
  const data = await fetchProduct(id) // ✅ Oui
  return <Card {...data} />
}
```

### Images

```typescript
// ✅ BIEN : ProductImage avec signed URLs
<ProductImage
  productId={id}
  imageId={imageId}
  size="lg"
  priority={isAboveFold}
/>

// ❌ ÉVITER : URL directe non sécurisée
<img src={`https://supabase.co/storage/${path}`} />

// ✅ BIEN : Sanity image avec urlFor
<img src={urlFor(image).width(800).height(600).url()} />
```

### State Management

```typescript
// ✅ BIEN : Zustand pour état global
const { items, addItem } = useCartStore()

// ✅ BIEN : useState pour état local
const [isOpen, setIsOpen] = useState(false)

// ❌ ÉVITER : Zustand pour état local temporaire
const setModalOpen = useModalStore((s) => s.setOpen) // Overkill
```

### Styles

```typescript
// ✅ BIEN : Tailwind utility classes
<div className="px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors">

// ✅ BIEN : cn() pour conditions
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "large" && "large-classes"
)}>

// ❌ ÉVITER : CSS-in-JS inline complexe
<div style={{
  backgroundColor: isActive ? 'violet' : 'gray',
  padding: isMobile ? '8px' : '16px'
}}>
```

---

## 📦 Dépendances principales

### Frontend

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0"
}
```

### UI Components

```json
{
  "@radix-ui/*": "Primitives UI",
  "lucide-react": "Icônes",
  "sonner": "Toasts",
  "embla-carousel-react": "Carrousels",
  "react-easy-crop": "Image cropping",
  "class-variance-authority": "Variants CSS"
}
```

### Backend & Data

```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "@sanity/client": "^6.10.0",
  "@sanity/image-url": "^1.0.2",
  "stripe": "^14.9.0",
  "zod": "^3.22.0"
}
```

### State & Utils

```json
{
  "zustand": "^4.4.0",
  "date-fns": "Dates",
  "clsx": "Class names",
  "sharp": "Images (auto par Next.js)"
}
```

---

## 🎓 Ressources & Documentation

### Docs officielles

- **Next.js 15** : https://nextjs.org/docs
- **Supabase** : https://supabase.com/docs
- **Sanity** : https://www.sanity.io/docs
- **Shadcn/UI** : https://ui.shadcn.com
- **Tailwind CSS** : https://tailwindcss.com/docs

### Patterns utilisés

- **Server Components** : Fetch data côté serveur
- **Client Components** : Interactivité avec `"use client"`
- **API Routes** : Endpoints REST dans `/api`
- **Parallel Routes** : Groupes `(auth)`, `(shop)`
- **Server Actions** : Mutations serveur (peu utilisé)

---

**Document à jour au 9 octobre 2025** 📅
**Version complète avec analyse `components/`** ✅
