# TODO - Modernisation et Préparation du Code

## 🚨 Problèmes critiques à résoudre

### 1. Conflits de dépendances majeurs

```bash
# URGENT : Résoudre les incompatibilités
❌ React Router utilisé dans Header.tsx mais non installé
❌ useCart hook référencé mais non implémenté
❌ react-day-picker dans Calendar.tsx mais absent du package.json
❌ cmdk, vaul, input-otp et autres dépendances manquantes
```

### 2. Imports cassés

```tsx
// Dans Header.tsx - imports inexistants
import { Link } from "react-router-dom"; // ❌ Pas installé
import { useCart } from "../hooks/CartContext"; // ❌ Fichier n'existe pas

// Dans Calendar.tsx
import { DayPicker } from "react-day-picker"; // ❌ Pas dans package.json
```

## 🔧 Tâches de refactoring prioritaires

### 1. Restructuration de l'architecture

#### A. Créer la structure manquante

```
src/
├── lib/
│   ├── utils.ts          # ❌ Manquant - référencé partout
│   ├── types.ts          # À créer pour les types globaux
│   └── constants.ts      # Pour les constantes
├── hooks/
│   ├── use-mobile.ts     # ❌ Manquant - référencé dans sidebar
│   ├── use-toast.ts      # ❌ Manquant - référencé dans toaster
│   └── CartContext.tsx   # À créer ou supprimer les références
├── contexts/
│   └── ThemeProvider.tsx # Pour le dark mode
└── store/
    └── index.ts          # État global avec Zustand
```

#### B. Fichier utils.ts manquant

```typescript
// src/lib/utils.ts - URGENT à créer
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. Gestion d'état et routing

#### A. Choisir une stratégie de navigation

```tsx
// Option 1: Supprimer React Router (recommandé pour Next.js)
// Remplacer Link par next/link dans Header.tsx

// Option 2: Si routing complexe nécessaire
npm install react-router-dom @types/react-router-dom
```

#### B. Implémenter la gestion d'état

```tsx
// Créer src/store/useCartStore.ts avec Zustand
import { create } from "zustand";

interface CartState {
  items: CartItem[];
  totalItems: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalItems: 0,
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      totalItems: state.totalItems + 1,
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      totalItems: state.totalItems - 1,
    })),
}));
```

## 📦 Dépendances à installer/corriger

### 1. Dépendances critiques manquantes

```bash
# UI Components essentiels
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-slot
npm install @radix-ui/react-toast @radix-ui/react-tooltip
npm install @radix-ui/react-accordion @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox
npm install @radix-ui/react-collapsible @radix-ui/react-context-menu
npm install @radix-ui/react-hover-card @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover
npm install @radix-ui/react-progress @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider
npm install @radix-ui/react-switch @radix-ui/react-tabs
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group

# Dépendances utilitaires
npm install cmdk vaul input-otp react-day-picker
npm install react-hook-form react-resizable-panels
npm install embla-carousel-react recharts
npm install sonner next-themes

# État global
npm install zustand
```

### 2. Mise à jour des types

```bash
npm install -D @types/react-router-dom
```

## 🎯 Modernisation du code

### 1. Conversion vers App Router Next.js 15

#### A. Structure actuelle vs recommandée

```
❌ Actuel (mélange de patterns):
src/app/page.tsx - OK
src/app/components/ - ❌ Devrait être dans src/components/

✅ Structure recommandée:
src/
├── app/
│   ├── (routes)/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
├── lib/
├── hooks/
└── types/
```

#### B. Utiliser les Server Components

```tsx
// src/components/Homepage.tsx - À convertir
"use server"; // Pour les parties statiques

// Séparer client/server
// src/components/HomepageClient.tsx pour les interactions
"use client";
```

### 2. Système de design à standardiser

#### A. Tokens de design

```typescript
// src/lib/design-tokens.ts
export const tokens = {
  colors: {
    brand: {
      violet: "hsl(271, 76%, 53%)",
      "violet-soft": "hsl(271, 76%, 60%)",
      "violet-subtle": "hsl(271, 40%, 85%)",
    },
  },
  fonts: {
    brand: "var(--font-geist-sans)",
    body: "var(--font-geist-sans)",
  },
  spacing: {
    // Définir les espacements cohérents
  },
};
```

#### B. Composants à consolider

```tsx
// Beaucoup de composants UI dupliqués/incomplets
// Audit nécessaire pour:
- Supprimer les composants non utilisés
- Standardiser les APIs des composants
- Ajouter la documentation JSDoc
- Implémenter les tests unitaires
```

## 🔍 Audit de qualité nécessaire

### 1. Performance

```bash
# À implémenter
- Bundle analyzer pour identifier les gros imports
- Lazy loading des composants lourds
- Image optimization audit
- Core Web Vitals monitoring
```

### 2. Accessibilité

```tsx
// Homepage.tsx - Problèmes détectés:
❌ Pas de landmarks sémantiques
❌ Images décoratives sans alt=""
❌ Animations sans respect des préférences utilisateur
❌ Contrastes à vérifier

// À implémenter:
- Audit avec axe-core
- Tests avec screen readers
- Support keyboard navigation complet
```

### 3. SEO et metadata

```tsx
// layout.tsx - Metadata génériques à personnaliser
export const metadata: Metadata = {
  title: "Blanche Renaudin - Mode Contemporaine", // ❌ À changer
  description: "Collection de mode d'exception...", // ❌ À écrire
  // + Open Graph, Twitter Cards, etc.
};
```

## 🚀 Préparation pour l'extension

### 1. Architecture modulaire

```typescript
// src/types/global.ts - Types à définir
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface Collection {
  id: string;
  name: string;
  products: Product[];
}
```

### 2. API Layer

```typescript
// src/lib/api.ts - À créer
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getCollections(): Promise<Collection[]> {
    // Implementation
  }

  async getProducts(collectionId: string): Promise<Product[]> {
    // Implementation
  }
}
```

### 3. Configuration d'environnement

```bash
# .env.local - À créer
NEXT_PUBLIC_API_URL=
DATABASE_URL=
STRIPE_SECRET_KEY=
UPLOADTHING_SECRET=
```

## 📋 Plan de migration étape par étape

### Phase 1 - Correction des erreurs (1-2 jours)

1. ✅ Installer toutes les dépendances manquantes
2. ✅ Créer src/lib/utils.ts
3. ✅ Corriger tous les imports cassés
4. ✅ Supprimer ou implémenter useCart

### Phase 2 - Restructuration (2-3 jours)

1. Déplacer les composants vers src/components/
2. Créer la structure de dossiers recommandée
3. Implémenter la gestion d'état avec Zustand
4. Standardiser les composants UI

### Phase 3 - Optimisation (3-5 jours)

1. Audit performance et bundle
2. Implémentation lazy loading
3. Audit accessibilité et corrections
4. Tests unitaires des composants critiques

### Phase 4 - Préparation extension (2-3 jours)

1. API layer et types
2. Configuration d'environnement
3. Documentation développeur
4. CI/CD setup

## 🔒 Sécurité et bonnes pratiques

### À implémenter

```typescript
// Validation des données
npm install zod

// Schema de validation
import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
})
```

## 📊 Monitoring et analytics

### Outils à intégrer

- Sentry pour error tracking
- Analytics (Google/Plausible)
- Performance monitoring (Vercel Analytics)
- User feedback tools

---

**⏰ Estimation totale: 8-13 jours de développement**

Cette refonte préparera le code pour des extensions futures comme :

- E-commerce complet
- Gestion utilisateurs
- CMS intégré
- Paiements en ligne
- Dashboard admin
