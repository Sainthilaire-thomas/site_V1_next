# cumentation Projet .blancherenaudin

## Vue d'ensemble

.blancherenaudin est une application e-commerce moderne développée avec Next.js, présentant une marque de mode contemporaine française. Le projet met l'accent sur l'élégance, le savoir-faire artisanal et une expérience utilisateur premium.

## 🛠 Stack Technique

### Framework et Libraries

- **Next.js 15** - Framework React avec App Router
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Zustand** - Gestion d'état globale
- **Radix UI** - Composants UI accessibles
- **Lucide React** - Icônes
- **Sonner** - Notifications toast

### Outils de développement

- **ESLint** - Linting
- **PostCSS** - Transformation CSS
- **Geist Font** - Typographie

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── about/             # Page À Propos
│   ├── cart/              # Page Panier
│   ├── collections/       # Pages Collections
│   ├── contact/           # Page Contact
│   ├── products/          # Pages Produits
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout racine
│   └── page.tsx           # Page d'accueil avec animation d'entrée
├── components/            # Composants réutilisables
│   ├── common/           # Composants communs (LazyImage)
│   ├── layout/           # Composants de mise en page
│   │   ├── Header.tsx    # Navigation principale
│   │   ├── Homepage.tsx  # Page d'accueil principale
│   │   └── InteractiveEntry.tsx # Animation d'entrée
│   └── ui/               # Composants UI (Radix + shadcn/ui)
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires et configuration
│   ├── api.ts           # Client API
│   ├── mock-data.ts     # Données de démonstration
│   ├── types.ts         # Types TypeScript
│   └── utils.ts         # Fonctions utilitaires
└── store/               # Gestion d'état Zustand
    └── useCartStore.ts  # Store du panier
```

## 🎨 Design System

### Couleurs

- **Violet principal** : `hsl(271, 76%, 53%)`
- **Violet doux** : `hsl(271, 76%, 60%)`
- **Violet subtil** : `hsl(271, 40%, 85%)`
- **Neutre** : Gamme de gris pour le contenu

### Typographie

- **Font principale** : Geist Sans
- **Poids** : Light (300) pour les titres, Regular (400) pour le contenu

### Animations

- **Entrée interactive** : Lettres dispersées avec effet de répulsion
- **Transitions** : Smooth hover effects, scale transforms
- **Easter eggs** : Animation "BLANCHE" sur clic logo

## 🏗 Architecture

### Pages Principales

#### 1. Page d'Accueil (`/`)

- **InteractiveEntry** : Animation d'entrée avec lettres dispersées
- **Homepage** : Grille asymétrique de produits et collections
- Navigation vers collections, produits, à propos

#### 2. Collections (`/collections`)

- Liste des collections avec images hero
- Pages détail collection (`/collections/[id]`)
- Filtrage et navigation vers produits

#### 3. Produits (`/products`)

- Grille de produits avec filtres par catégorie
- Pages détail produit (`/products/[id]`)
- Ajout au panier avec variantes (taille, couleur)

#### 4. Panier (`/cart`)

- Gestion des quantités
- Codes promo
- Récapitulatif et checkout

#### 5. Pages Statiques

- **À Propos** (`/about`) : Histoire, philosophie, savoir-faire
- **Contact** (`/contact`) : Formulaire de contact, coordonnées

### Gestion d'État

#### CartStore (Zustand + Persist)

typescript

```typescript
interfaceCartState{
  items:CartItem[];
  totalItems:number;
  totalPrice:number;
addItem:(item)=>void;
removeItem:(id)=>void;
updateQuantity:(id, quantity)=>void;
clearCart:()=>void;
}
```

- **Persistance** : Données sauvegardées dans localStorage
- **Calculs automatiques** : Total articles et prix
- **Gestion des variantes** : Taille, couleur par item

### Types Principaux

typescript

```typescript
interfaceProduct{
  id:string;
  name:string;
  description:string;
  price:number;
  images:string[];
  category:string;
  inStock:boolean;
  featured?:boolean;
  sizes?:string[];
  colors?:string[];
}

interfaceCollection{
  id:string;
  name:string;
  description:string;
  image:string;
  products:Product[];
  featured?:boolean;
}

interfaceCartItem{
  id:string;
  name:string;
  price:number;
  quantity:number;
  image?:string;
  size?:string;
  color?:string;
}
```

## 🎭 Composants Clés

### Header

- Navigation responsive avec menu mobile
- Indicateur panier avec badge
- Transitions smooth et backdrop blur

### InteractiveEntry

- Lettres dispersées aléatoirement
- Effet de répulsion au survol souris
- Animation de convergence vers le centre
- Transition vers la homepage

### LazyImage

- Chargement progressif des images
- Skeleton loader pendant le chargement
- Optimisation des performances

## 🎨 Styling et Animations

### Classes Tailwind Personnalisées

css

```css
.animate-float
  #
  Flottement
  vertical
  .animate-fade-in-up
  #
  Apparition
  avec
  translation
  .animate-glow-pulse
  #
  Pulsation
  lumineuse
  .animate-hover-lift
  #
  Élévation
  au
  survol;
```

### Variables CSS Personnalisées

css

```css
--violet: #8b5cf6;
--violet-soft: #a78bfa;
--violet-subtle: #c4b5fd;
```

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Adaptations

- Menu hamburger sur mobile
- Grilles responsives (1 → 2 → 3 → 4 colonnes)
- Images adaptatives avec aspect ratios

## 🔧 Configuration

### Next.js (next.config.js)

javascript

```javascript
/** @type{import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
};
```

### Tailwind (tailwind.config.ts)

javascript

```javascript
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          600: "#8b5cf6",
          // ...
        },
      },
    },
  },
};
```

## 🚀 Scripts de Développement

json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 📦 Installation et Démarrage

bash

```bash
# Installation des dépendances
npminstall

# Développement
npm run dev

# Build production
npm run build
npm run start
```

## 🎯 Fonctionnalités Principales

### ✅ Implémentées

- [x] Navigation fluide entre pages
- [x] Animation d'entrée interactive
- [x] Gestion du panier avec persistance
- [x] Responsive design complet
- [x] Filtrage des produits
- [x] Pages collections et produits
- [x] Formulaire de contact
- [x] Easter eggs et animations

### 🔄 En Développement

- [ ] Système de paiement (Stripe)
- [ ] Authentification utilisateur
- [ ] Backend API réel
- [ ] Gestion des commandes
- [ ] Système de reviews
- [ ] Newsletter integration

### 🎨 Améliorations UX

- [ ] Wishlist/Favoris
- [ ] Recommandations produits
- [ ] Recherche avancée
- [ ] Comparateur de produits
- [ ] Mode sombre

## 🛡 Sécurité et Performance

### Performance

- **Images** : Lazy loading avec Next.js Image
- **Fonts** : Optimisation avec `next/font`
- **CSS** : Purge automatique avec Tailwind
- **State** : Optimisation avec Zustand

### Sécurité

- **CSR** : Sanitisation des entrées utilisateur
- **API** : Validation des données avec TypeScript
- **Storage** : Persistance sécurisée avec Zustand persist

## 🎨 Guide de Style

### Nomenclature

- **Composants** : PascalCase (`ProductCard`)
- **Hooks** : camelCase avec préfixe `use` (`useCart`)
- **Types** : PascalCase (`CartItem`)
- **Fichiers** : kebab-case (`use-cart-store.ts`)

### Structure des Composants

typescript

```typescript
interfaceProps{
// Types des props
}

exportdefaultfunctionComponent({...props }:Props){
// Hooks
// État local
// Handlers
// Render
}
```

## 📈 Évolution Future

### Phase 2 - Backend

- API REST avec Express/Fastify
- Base de données PostgreSQL
- Authentification JWT
- Upload d'images (Cloudinary)

### Phase 3 - Avancé

- PWA (Progressive Web App)
- Notifications push
- Analytics avancés
- A/B testing
- Internationalisation (i18n)

### Phase 4 - Scaling

- Microservices architecture
- CDN global
- Cache Redis
- Monitoring (Sentry, Analytics)

---

**Version** : 1.0.0

**Dernière mise à jour** : Janvier 2025

**Auteur** : Équipe .blancherenaudin
