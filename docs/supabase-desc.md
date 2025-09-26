# Base de données - .blancherenaudin

## Vue d'ensemble

Ce document décrit la structure de la base de données Supabase pour l'application e-commerce de mode `.blancherenaudin`. La base de données PostgreSQL est hébergée sur Supabase et gère un catalogue de produits de mode haut de gamme, les commandes clients, et l'administration du site.

## Architecture

- **Type** : PostgreSQL via Supabase
- **Authentification** : Supabase Auth (table `auth.users`)
- **Stockage** : Supabase Storage pour les images
- **API** : Auto-générée par Supabase

## Schéma de données détaillé

### 1. **profiles** - Profils utilisateurs

```sql
Table: profiles
├── id (UUID, PRIMARY KEY) → auth.users(id)
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── phone (VARCHAR)
├── avatar_url (VARCHAR)
├── role (VARCHAR, DEFAULT 'customer') -- 'customer', 'admin'
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Description** : Extension de `auth.users` avec des données de profil personnalisées.

### 2. **addresses** - Adresses de livraison/facturation

```sql
Table: addresses
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── user_id (UUID) → auth.users(id)
├── type (VARCHAR, DEFAULT 'shipping') -- 'shipping', 'billing'
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── company (VARCHAR)
├── address_line_1 (VARCHAR)
├── address_line_2 (VARCHAR)
├── city (VARCHAR)
├── postal_code (VARCHAR)
├── country (VARCHAR, DEFAULT 'FR')
├── is_default (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 3. **categories** - Hiérarchie des catégories

```sql
Table: categories
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── name (VARCHAR, NOT NULL)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT)
├── image_url (VARCHAR)
├── parent_id (UUID) → categories(id) -- Auto-référence pour hiérarchie
├── sort_order (INTEGER, DEFAULT 0)
├── is_active (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Exemple de hiérarchie** : Femme → Robes → Robes de soirée

### 4. **collections** - Collections saisonnières

```sql
Table: collections
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── name (VARCHAR, NOT NULL)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT)
├── image_url (VARCHAR)
├── is_featured (BOOLEAN, DEFAULT false)
├── is_active (BOOLEAN, DEFAULT true)
├── sort_order (INTEGER, DEFAULT 0)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 5. **products** - Catalogue produits

```sql
Table: products
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── name (VARCHAR, NOT NULL)
├── slug (VARCHAR, UNIQUE, NOT NULL)
├── description (TEXT)
├── short_description (VARCHAR)
├── price (NUMERIC, NOT NULL)
├── sale_price (NUMERIC) -- Prix promotionnel
├── sku (VARCHAR, UNIQUE) -- Code produit
├── stock_quantity (INTEGER, DEFAULT 0)
├── is_featured (BOOLEAN, DEFAULT false)
├── is_active (BOOLEAN, DEFAULT true)
├── category_id (UUID) → categories(id)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 6. **product_variants** - Variantes de produits

```sql
Table: product_variants
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── product_id (UUID) → products(id)
├── name (VARCHAR, NOT NULL) -- ex: "Taille", "Couleur"
├── value (VARCHAR, NOT NULL) -- ex: "M", "Rouge"
├── stock_quantity (INTEGER, DEFAULT 0)
├── price_modifier (NUMERIC, DEFAULT 0) -- Ajustement de prix
├── sku (VARCHAR) -- SKU spécifique à la variante
├── is_active (BOOLEAN, DEFAULT true)
└── created_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Exemple** :

- Produit "Robe Élégante" → Variantes: Taille S/M/L, Couleur Noir/Rouge

### 7. **product_images** - Images produits

```sql
Table: product_images
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── product_id (UUID) → products(id)
├── url (VARCHAR, NOT NULL) -- URL Supabase Storage
├── alt_text (VARCHAR)
├── sort_order (INTEGER, DEFAULT 0)
├── is_primary (BOOLEAN, DEFAULT false) -- Image principale
└── created_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 8. **collection_products** - Association collections/produits

```sql
Table: collection_products
├── collection_id (UUID) → collections(id)
├── product_id (UUID) → products(id)
├── sort_order (INTEGER, DEFAULT 0)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── PRIMARY KEY (collection_id, product_id)
```

### 9. **orders** - Commandes

```sql
Table: orders
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── user_id (UUID) → auth.users(id)
├── order_number (VARCHAR, UNIQUE, NOT NULL) -- ex: "BR-2024-001"
├── status (VARCHAR, DEFAULT 'pending') -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
├── total_amount (NUMERIC, NOT NULL)
├── shipping_amount (NUMERIC, DEFAULT 0)
├── tax_amount (NUMERIC, DEFAULT 0)
├── discount_amount (NUMERIC, DEFAULT 0)
├── payment_status (VARCHAR, DEFAULT 'pending') -- 'pending', 'paid', 'failed', 'refunded'
├── payment_intent_id (VARCHAR) -- Stripe Payment Intent ID
├── shipping_address (JSONB) -- Snapshot de l'adresse de livraison
├── billing_address (JSONB) -- Snapshot de l'adresse de facturation
├── notes (TEXT)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
└── updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 10. **order_items** - Articles de commande

```sql
Table: order_items
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── order_id (UUID) → orders(id)
├── product_id (UUID) → products(id)
├── variant_id (UUID) → product_variants(id)
├── quantity (INTEGER, NOT NULL)
├── unit_price (NUMERIC, NOT NULL) -- Prix au moment de la commande
├── total_price (NUMERIC, NOT NULL)
├── product_snapshot (JSONB) -- Snapshot du produit au moment de la commande
└── created_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 11. **coupons** - Codes de réduction

```sql
Table: coupons
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── code (VARCHAR, UNIQUE, NOT NULL) -- ex: "WELCOME10"
├── type (VARCHAR, DEFAULT 'percentage') -- 'percentage', 'fixed_amount'
├── value (NUMERIC, NOT NULL) -- 10 pour 10% ou 50 pour 50€
├── minimum_amount (NUMERIC) -- Montant minimum de commande
├── usage_limit (INTEGER) -- Limite d'utilisation
├── used_count (INTEGER, DEFAULT 0)
├── is_active (BOOLEAN, DEFAULT true)
├── valid_from (TIMESTAMPTZ)
├── valid_until (TIMESTAMPTZ)
└── created_at (TIMESTAMPTZ, DEFAULT NOW())
```

### 12. **wishlist_items** - Liste de souhaits

```sql
Table: wishlist_items
├── id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
├── user_id (UUID) → auth.users(id)
├── product_id (UUID) → products(id)
└── created_at (TIMESTAMPTZ, DEFAULT NOW())
```

## Relations principales

### Hiérarchie des données

```
auth.users (Supabase Auth)
├── profiles (1:1)
├── addresses (1:N)
├── orders (1:N)
└── wishlist_items (1:N)

categories (Auto-référence pour hiérarchie)
└── products (1:N)
    ├── product_variants (1:N)
    ├── product_images (1:N)
    └── collection_products (N:M avec collections)

orders
└── order_items (1:N)
    ├── → products
    └── → product_variants
```

## Fonctionnalités clés

### 1. **Gestion des stocks**

- Stock global par produit (`products.stock_quantity`)
- Stock par variante (`product_variants.stock_quantity`)
- Décrément automatique lors des commandes

### 2. **Pricing flexible**

- Prix de base (`products.price`)
- Prix promotionnel (`products.sale_price`)
- Modificateurs par variante (`product_variants.price_modifier`)

### 3. **Snapshots de commande**

- `order_items.product_snapshot` : Sauvegarde l'état du produit au moment de la commande
- `orders.shipping_address` / `billing_address` : Sauvegarde des adresses

### 4. **Multi-images**

- Plusieurs images par produit avec ordre et image principale
- URLs vers Supabase Storage

### 5. **Collections dynamiques**

- Association many-to-many entre produits et collections
- Tri personnalisé dans les collections

## Sécurité RLS (Row Level Security)

Supabase utilise des politiques RLS pour sécuriser l'accès aux données :

- **profiles** : Les utilisateurs ne peuvent voir/modifier que leur propre profil
- **addresses** : Idem, uniquement leurs adresses
- **orders** : Les clients ne voient que leurs commandes
- **wishlist_items** : Accès limité aux éléments de l'utilisateur
- **products, categories, collections** : Lecture publique, écriture admin uniquement

## Indexation recommandée

```sql
-- Optimisation des requêtes fréquentes
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
```

## Triggers et fonctions

### Génération automatique de `order_number`

```sql
-- Fonction pour générer des numéros de commande uniques
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'BR-' || EXTRACT(YEAR FROM NOW()) || '-' ||
                      LPAD(nextval('order_sequence')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Mise à jour automatique de `updated_at`

```sql
-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Types d'énumérations

### Statuts de commande

- `pending` : En attente
- `confirmed` : Confirmée
- `shipped` : Expédiée
- `delivered` : Livrée
- `cancelled` : Annulée

### Statuts de paiement

- `pending` : En attente
- `paid` : Payé
- `failed` : Échec
- `refunded` : Remboursé

### Types d'adresse

- `shipping` : Livraison
- `billing` : Facturation

### Rôles utilisateur

- `customer` : Client
- `admin` : Administrateur

## Migration et seeds

Pour initialiser la base de données avec des données de test, voir les fichiers :

- `supabase/migrations/` : Schéma de base
- `supabase/seeds/` : Données d'exemple (catégories, produits de démonstration)

## API générée

Supabase génère automatiquement une API REST et GraphQL basée sur ce schéma, accessible via le client JavaScript/TypeScript.

Exemple d'utilisation :

```typescript
// Récupérer les produits d'une catégorie
const { data: products } = await supabase
  .from("products")
  .select(
    `
    *,
    category:categories(*),
    images:product_images(*),
    variants:product_variants(*)
  `
  )
  .eq("category_id", categoryId)
  .eq("is_active", true);
```
