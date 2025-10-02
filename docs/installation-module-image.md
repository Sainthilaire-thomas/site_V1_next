# Installation du module de gestion des images

## 1. Installation des dépendances

```bash
npm install sharp react-easy-crop zod
npm install -D @types/react-easy-crop
```

## 2. Configuration Supabase

### 2.1 Créer le bucket Storage

Dans le dashboard Supabase :

1. Aller dans **Storage**
2. Créer un nouveau bucket nommé `product-images`
3. Le configurer comme **privé** (pas d'accès public)
4. Activer le CDN si disponible

### 2.2 Exécuter le SQL

Exécuter le script SQL fourni dans l'artifact "SQL - Table product_images" pour créer :

- La table `product_images`
- Les index
- Les politiques RLS
- Les triggers

## 3. Variables d'environnement

Ajouter dans `.env.local` :

```env
# Déjà présentes normalement
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optionnelles (valeurs par défaut)
IMAGE_SIGN_TTL=600
IMAGE_SIZES=2048,1280,768,384
```

## 4. Structure des fichiers

Créer les fichiers suivants dans votre projet :

### Helpers & Validation

- `src/lib/images.ts` - Helpers pour les images
- `src/lib/validation/adminImages.ts` - Schémas Zod

### Routes API

- `src/app/api/admin/product-images/upload/route.ts`
- `src/app/api/admin/product-images/edit/route.ts`
- `src/app/api/admin/product-images/generate-variants/route.ts`
- `src/app/api/admin/product-images/signed-url/route.ts`
- `src/app/api/admin/product-images/[id]/route.ts`
- `src/app/api/products/[id]/images/route.ts`
- `src/app/api/products/[id]/images/set-primary/route.ts`

### UI Admin

- `src/app/admin/media/page.tsx`
- `src/app/admin/media/MediaGridClient.tsx`
- `src/app/admin/media/ImageCard.tsx`
- `src/app/admin/media/ImageEditor.tsx`

### Composants Front

- `src/components/ProductImage.tsx`

## 5. Workflow d'utilisation

### Pour l'administrateur

1. **Accéder à la gestion des images**
   - Aller sur `/admin/media`
   - Sélectionner un produit dans le menu déroulant
2. **Uploader des images**
   - Cliquer sur "Uploader des images"
   - Sélectionner une ou plusieurs images (JPEG, PNG, WebP)
   - Les images sont automatiquement uploadées
3. **Éditer une image**
   - Cliquer sur "Éditer" sur une image
   - Choisir un ratio d'aspect (1:1, 4:5, 16:9, etc.)
   - Ajuster le zoom et la rotation
   - Cliquer sur "Enregistrer et générer variantes"
   - Les variantes (xl/lg/md/sm en AVIF/WebP/JPEG) sont générées automatiquement
4. **Définir l'image principale**
   - Cliquer sur "Définir principale" sur l'image souhaitée
   - Une seule image peut être principale par produit
5. **Ajouter un texte alternatif**
   - Cliquer sur le texte alt (ou "+ Ajouter alt text")
   - Saisir le texte
   - Cliquer sur "Sauver"
6. **Générer les variantes manuellement**
   - Cliquer sur "Variantes" pour régénérer les tailles
7. **Supprimer une image**
   - Cliquer sur "Supprimer"
   - Confirmer la suppression

### Pour le développeur front

Utiliser les composants dans les pages produit :

```tsx
import { ProductImage, ResponsiveProductImage } from '@/components/ProductImage'

// Version simple (une seule taille)
<ProductImage
  productId={product.id}
  imageId={primaryImage.id}
  alt={primaryImage.alt ?? product.name}
  size="lg"
  className="w-full h-auto"
/>

// Version responsive (toutes les tailles avec media queries)
<ResponsiveProductImage
  productId={product.id}
  imageId={primaryImage.id}
  alt={primaryImage.alt ?? product.name}
  className="w-full h-auto"
/>
```

## 6. Architecture du stockage

```
product-images/
  products/
    <productId>/
      original/
        <imageId>.jpg        # Source originale
      edited/
        <imageId>.jpg        # Master éditée (après crop/rotate)
      xl/
        <imageId>.avif|webp|jpg  # 2048px
      lg/
        <imageId>.avif|webp|jpg  # 1280px
      md/
        <imageId>.avif|webp|jpg  # 768px
      sm/
        <imageId>.avif|webp|jpg  # 384px
```

## 7. Sécurité

- **Bucket privé** : Aucun accès public direct
- **URLs signées** : Toutes les images sont servies via des URLs signées temporaires (10 min par défaut)
- **RLS** : Seuls les admins peuvent créer/modifier/supprimer
- **Validation** : Types de fichiers limités (JPEG, PNG, WebP) et taille max 10MB

## 8. Optimisations

### Formats modernes

- **AVIF** : Meilleure compression (qualité 50)
- **WebP** : Bonne compression (qualité 78)
- **JPEG** : Fallback universel (qualité 85)

### Tailles responsives

- **xl** (2048px) : Écrans très larges, impression
- **lg** (1280px) : Desktop standard
- **md** (768px) : Tablettes
- **sm** (384px) : Mobile

### CDN

- Activer le CDN Supabase pour une distribution mondiale rapide
- Les variantes sont immuables (cache agressif possible)

## 9. Intégration avec le module produits

Le lien "Gérer les images" est déjà présent dans la page produit (`/admin/products/[id]`) et pointe vers `/admin/media?product_id=...`

## 10. Migration des images existantes

Si vous avez déjà des images :

```sql
-- Script de migration à adapter selon votre structure actuelle
INSERT INTO public.product_images (product_id, storage_original, alt, is_primary)
SELECT
  id as product_id,
  image_url as storage_original,
  name as alt,
  true as is_primary
FROM public.products
WHERE image_url IS NOT NULL;
```

## 11. Troubleshooting

### Les URLs signées expirent trop vite

Augmenter `IMAGE_SIGN_TTL` dans `.env.local`

### Les images ne s'affichent pas

- Vérifier que le bucket `product-images` existe et est privé
- Vérifier les politiques RLS
- Vérifier les logs de la route `/api/admin/product-images/signed-url`

### Erreur lors de la génération des variantes

- Vérifier que `sharp` est bien installé
- Sur Vercel/production, `sharp` est automatiquement optimisé

### Performances lentes

- Activer le CDN Supabase
- Augmenter la durée des URLs signées
- Utiliser un système de cache (Redis) pour les URLs signées

## 12. Extensions futures

Faciles à ajouter selon la spec :

- **Point focal** au lieu du crop manuel
- **Watermark** sur certaines tailles
- **Tags/couleurs** pour filtrer les images
- **Audit trail** (qui a modifié quand)
- **Traitement asynchrone** via Edge Functions
