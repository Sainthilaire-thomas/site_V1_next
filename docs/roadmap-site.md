# Documentation du projet .blancherenaudin

## Vue d'ensemble

**Projet** : Site e-commerce pour la marque de mode française .blancherenaudin

**Technologies** : Next.js 14, TypeScript, Tailwind CSS, Zustand

**Style** : Mode contemporaine, design épuré et élégant

## Architecture du projet

```
src/
├── app/                    # App Router Next.js 14
│   ├── about/             # Page "À propos"
│   ├── cart/              # Panier d'achat
│   ├── collections/       # Collections de produits
│   ├── contact/           # Page de contact
│   ├── products/          # Catalogue produits
│   ├── globals.css        # Styles globaux avec animations
│   ├── layout.tsx         # Layout racine
│   └── page.tsx           # Page d'accueil interactive
├── components/
│   ├── common/            # Composants réutilisables
│   ├── layout/            # Composants de mise en page
│   └── ui/                # Bibliothèque de composants UI
├── hooks/                 # Hooks personnalisés
├── lib/                   # Utilitaires et configuration
│   ├── types.ts           # Types TypeScript
│   ├── mock-data.ts       # Données de démonstration
│   └── utils.ts           # Fonctions utilitaires
└── store/                 # État global avec Zustand
```

## Fonctionnalités actuelles

### ✅ Implémenté

1. **Page d'accueil interactive**
   - Animation d'entrée avec lettres dispersées
   - Navigation fluide vers les différentes sections
   - Design immersif avec hover effects
2. **Navigation**
   - Header responsive avec menu hamburger mobile
   - Liens vers toutes les pages principales
   - Compteur de panier en temps réel
3. **Catalogue produits**
   - Grille de produits avec filtres par catégorie
   - Pages de détail produit complètes
   - Galerie d'images, sélection tailles/couleurs
   - Système de favoris et partage
4. **Collections**
   - Vue d'ensemble des collections
   - Pages détaillées par collection
   - Organisation thématique des produits
5. **Panier d'achat**
   - Gestion d'état avec Zustand et persistence
   - Ajout/suppression/modification quantités
   - Calculs automatiques des totaux
   - Codes promo (simulation)
6. **Pages statiques**
   - Page "À propos" avec histoire de la marque
   - Formulaire de contact fonctionnel
   - Design cohérent et responsive

### 🎨 Design et UX

- **Palette de couleurs** : Violet/Purple (`<span class="inline-block w-3 h-3 border-[0.5px] border-border-200 rounded flex-shrink-0 shadow-sm mr-1 align-middle"></span>#8b5cf6`) comme couleur principale
- **Typographie** : Geist Sans pour une lisibilité optimale
- **Animations** : Transitions fluides, hover effects, micro-interactions
- **Responsive** : Design adapté mobile/tablet/desktop
- **Accessibilité** : Structure sémantique, contrastes respectés

## État des données

### Données actuelles (Mock)

Les données sont actuellement stockées dans `/src/lib/mock-data.ts` :

typescript

```typescript
// 4 produits de démonstration
exportconst mockProducts:Product[]=[...]

// 2 collections de démonstration
exportconst mockCollections:Collection[]=[...]
```

### Types définis

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

## Étapes à venir

### 🗄️ 1. Implémentation de la base de données (Priorité 1)

#### a) Choix de la stack base de données

**Recommandation** : PostgreSQL + Prisma ORM

**Alternatives possibles** :

- MongoDB + Mongoose (NoSQL)
- Supabase (PostgreSQL managed)
- PlanetScale (MySQL managed)

#### b) Schéma de base de données

sql

```sql
-- Catégories de produits
CREATETABLE categories (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  name VARCHAR(100)NOTNULL,
  slug VARCHAR(100)NOTNULLUNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGERDEFAULT0,
  is_active BOOLEANDEFAULTtrue,
  created_at TIMESTAMPDEFAULTNOW(),
  updated_at TIMESTAMPDEFAULTNOW()
);

-- Produits
CREATETABLE products (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  name VARCHAR(200)NOTNULL,
  slug VARCHAR(200)NOTNULLUNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10,2)NOTNULL,
  sale_price DECIMAL(10,2),
  sku VARCHAR(100)UNIQUE,
  stock_quantity INTEGERDEFAULT0,
  is_featured BOOLEANDEFAULTfalse,
  is_active BOOLEANDEFAULTtrue,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPDEFAULTNOW(),
  updated_at TIMESTAMPDEFAULTNOW()
);

-- Images produits
CREATETABLE product_images (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id)ONDELETECASCADE,
  url VARCHAR(500)NOTNULL,
  alt_text VARCHAR(200),
  sort_order INTEGERDEFAULT0,
  is_primary BOOLEANDEFAULTfalse
);

-- Variantes (tailles, couleurs)
CREATETABLE product_variants (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id)ONDELETECASCADE,
  name VARCHAR(100)NOTNULL,-- "Taille", "Couleur"
valueVARCHAR(100)NOTNULL,-- "L", "Rouge"
  stock_quantity INTEGERDEFAULT0,
  price_modifier DECIMAL(8,2)DEFAULT0,
  sku VARCHAR(100),
  is_active BOOLEANDEFAULTtrue
);

-- Collections
CREATETABLE collections (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  name VARCHAR(200)NOTNULL,
  slug VARCHAR(200)NOTNULLUNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  is_featured BOOLEANDEFAULTfalse,
  is_active BOOLEANDEFAULTtrue,
  sort_order INTEGERDEFAULT0,
  created_at TIMESTAMPDEFAULTNOW(),
  updated_at TIMESTAMPDEFAULTNOW()
);

-- Relation produits-collections (many-to-many)
CREATETABLE collection_products (
  collection_id UUID REFERENCES collections(id)ONDELETECASCADE,
  product_id UUID REFERENCES products(id)ONDELETECASCADE,
  sort_order INTEGERDEFAULT0,
PRIMARYKEY(collection_id, product_id)
);

-- Utilisateurs
CREATETABLE users (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  email VARCHAR(255)NOTNULLUNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20)DEFAULT'customer',-- 'admin', 'customer'
  is_active BOOLEANDEFAULTtrue,
  email_verified BOOLEANDEFAULTfalse,
  created_at TIMESTAMPDEFAULTNOW(),
  updated_at TIMESTAMPDEFAULTNOW()
);

-- Adresses
CREATETABLE addresses (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id)ONDELETECASCADE,
typeVARCHAR(20)DEFAULT'shipping',-- 'billing', 'shipping'
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(100),
  address_line_1 VARCHAR(200),
  address_line_2 VARCHAR(200),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2)DEFAULT'FR',
  is_default BOOLEANDEFAULTfalse
);

-- Commandes
CREATETABLE orders (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50)NOTNULLUNIQUE,
statusVARCHAR(20)DEFAULT'pending',-- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  total_amount DECIMAL(10,2)NOTNULL,
  shipping_amount DECIMAL(8,2)DEFAULT0,
  tax_amount DECIMAL(8,2)DEFAULT0,
  discount_amount DECIMAL(8,2)DEFAULT0,
  payment_status VARCHAR(20)DEFAULT'pending',
  shipping_address_id UUID REFERENCES addresses(id),
  billing_address_id UUID REFERENCES addresses(id),
  notes TEXT,
  created_at TIMESTAMPDEFAULTNOW(),
  updated_at TIMESTAMPDEFAULTNOW()
);

-- Lignes de commande
CREATETABLE order_items (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id)ONDELETECASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGERNOTNULL,
  unit_price DECIMAL(10,2)NOTNULL,
  total_price DECIMAL(10,2)NOTNULL,
  product_name VARCHAR(200),-- Snapshot au moment de la commande
  variant_name VARCHAR(200)
);

-- Codes promo
CREATETABLE coupons (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  code VARCHAR(50)NOTNULLUNIQUE,
typeVARCHAR(20)DEFAULT'percentage',-- 'percentage', 'fixed'
valueDECIMAL(8,2)NOTNULL,
  minimum_amount DECIMAL(8,2),
  usage_limit INTEGER,
  used_count INTEGERDEFAULT0,
  is_active BOOLEANDEFAULTtrue,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMPDEFAULTNOW()
);
```

#### c) Configuration Prisma

bash

```bash
npminstall prisma @prisma/client
npx prisma init
```

**prisma/schema.prisma** :

prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?   @map("image_url")
  parentId    String?   @map("parent_id")
  sortOrder   Int       @default(0) @map("sort_order")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]

  @@map("categories")
}

// ... autres modèles
```

#### d) Migration des données existantes

1. **Script de migration** :

typescript

```typescript
// scripts/migrate-mock-data.ts
import{PrismaClient}from'@prisma/client'
import{ mockProducts, mockCollections }from'../src/lib/mock-data'

const prisma =newPrismaClient()

asyncfunctionmain(){
// Migration des catégories
const categories =['Vestes','Robes','Chemises']
for(const categoryName of categories){
await prisma.category.create({
      data:{
        name: categoryName,
        slug: categoryName.toLowerCase(),
}
})
}

// Migration des produits
for(const product of mockProducts){
const category =await prisma.category.findFirst({
      where:{ name: product.category}
})

await prisma.product.create({
      data:{
        name: product.name,
        slug: product.id,
        description: product.description,
        price: product.price,
        stockQuantity: product.inStock?10:0,
        isFeatured: product.featured||false,
        categoryId: category?.id,
        images:{
          create: product.images.map((url, index)=>({
            url,
            sortOrder: index,
            isPrimary: index ===0
}))
}
}
})
}
}
```

### 🔐 2. Authentification et gestion utilisateurs (Priorité 2)

#### Options recommandées :

- **NextAuth.js** (Auth.js v5) - Solution complète
- **Clerk** - Service managé avec UI
- **Supabase Auth** - Si base Supabase choisie

#### Fonctionnalités à implémenter :

- Inscription/Connexion
- Profil utilisateur
- Historique des commandes
- Adresses de livraison
- Liste de souhaits

### 💳 3. Système de paiement (Priorité 3)

#### Options :

- **Stripe** - Leader mondial, excellent developer experience
- **PayPal** - Alternative populaire
- **Payement local** - CB via banques françaises

#### Fonctionnalités :

- Tunnel d'achat sécurisé
- Gestion des moyens de paiement
- Webhooks pour confirmations
- Remboursements

### 📦 4. Gestion des commandes et stock (Priorité 4)

- Interface d'administration
- Suivi des stocks en temps réel
- Notifications de stock faible
- Gestion des commandes
- Export/import de données

### 🚀 5. Optimisations et fonctionnalités avancées (Priorité 5)

- **SEO** : Métadonnées, sitemap, rich snippets
- **Performance** : Cache, CDN, optimisation images
- **Analytics** : Google Analytics, tracking e-commerce
- **Marketing** : Newsletter, codes promo, recommandations
- **Recherche** : Algolia ou Elasticsearch pour recherche avancée
- **Mobile** : PWA, notifications push
- **Internationalisation** : Multi-langue/devise
- **Tests** : Jest, Cypress pour tests E2E

### 🛠️ 6. Déploiement et DevOps

- **Hébergement** : Vercel, Netlify, ou VPS
- **Base de données** : Hosting managé (Supabase, PlanetScale, Railway)
- **CI/CD** : GitHub Actions
- **Monitoring** : Sentry pour error tracking
- **Backup** : Stratégie de sauvegarde BDD

## Prochaines étapes immédiates

1. **[Cette semaine]** Configurer la base de données locale avec Prisma + PostgreSQL
2. **[Semaine suivante]** Migrer les données mock vers la vraie BDD
3. **[Dans 2 semaines]** Implémenter les API routes Next.js pour CRUD produits
4. **[Dans 3 semaines]** Commencer l'authentification avec NextAuth.js

## Technologies et dépendances

json

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "zustand": "^4.4.0",
    "next-auth": "^4.24.0",
    "stripe": "^14.0.0"
  }
}
```

Cette roadmap assure une progression logique du MVP actuel vers une plateforme e-commerce complète et professionnelle. La priorité sur la base de données permettra de poser des fondations solides pour toutes les fonctionnalités suivantes.
