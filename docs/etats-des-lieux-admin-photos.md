# État des lieux - Interface Admin & Gestion des Images

**Projet:** .blancherenaudin

**Date:** 03/10/2025

**Version:** 1.0

---

## 📊 Vue d'ensemble

L'interface d'administration Supabase pour la gestion des produits et images est **opérationnelle** . Le système de gestion d'images fonctionne avec un bucket privé, génération automatique de variantes, et URLs signées.

---

## ✅ Fonctionnalités Implémentées

### 🎯 Gestion des Produits

#### `/admin/products` - Liste des produits

- ✅ Affichage de tous les produits avec pagination
- ✅ Compteur total de produits
- ✅ Statut visuel (Actif/Inactif)
- ✅ Prix affiché
- ✅ Bouton "Nouveau produit"
- ✅ Navigation vers le détail produit

#### `/admin/products/new` - Création de produit

- ✅ Formulaire de création complet
- ✅ Champs : nom, slug, prix, SKU, descriptions
- ✅ Toggles : actif, à la une
- ✅ Validation via Zod
- ✅ Redirection automatique vers le détail après création

#### `/admin/products/[id]` - Détail produit

- ✅ Informations produit éditables
- ✅ Badges de statut (Actif, À la une)
- ✅ Indicateur de stock avec code couleur
- ✅ Lien vers gestion des images
- ✅ Section variantes complète
- ✅ Toast notifications pour feedback utilisateur

#### Gestion des Variantes

- ✅ Affichage de toutes les variantes (couleur, taille, etc.)
- ✅ Création de variantes (attribut + valeur + SKU + modificateur prix)
- ✅ Ajustement de stock par variante avec raison
- ✅ Suppression de variantes
- ✅ Recalcul automatique du stock produit via RPC
- ✅ États visuels (stock bas/épuisé)

### 📸 Gestion des Images

#### `/admin/media` - Interface de gestion d'images

**Upload**

- ✅ Upload multi-fichiers (JPEG, PNG, WebP)
- ✅ Drag & drop style Tailwind
- ✅ Validation taille max 10MB
- ✅ Génération automatique de 12 variantes par image :
  - 4 tailles : xl (2048px), lg (1280px), md (768px), sm (384px)
  - 3 formats : AVIF (qualité 50), WebP (qualité 78), JPEG (qualité 85)
- ✅ Lecture automatique des dimensions (width/height)
- ✅ Stockage dans bucket privé `product-images`
- ✅ Structure de fichiers :

```
  products/{productId}/
    original/{imageId}.jpg
    xl/{imageId}.avif|webp|jpg
    lg/{imageId}.avif|webp|jpg
    md/{imageId}.avif|webp|jpg
    sm/{imageId}.avif|webp|jpg
```

**Affichage et Gestion**

- ✅ Grid responsive des images (1-4 colonnes selon écran)
- ✅ Aperçu des images via URLs signées (TTL 10min)
- ✅ Badge "★ Principale" sur l'image principale
- ✅ Affichage des dimensions (width × height)
- ✅ Édition du texte alternatif (onBlur)
- ✅ Réordonnancement avec boutons ↑/↓
- ✅ Définition de l'image principale (transaction atomique)
- ✅ Suppression d'image (avec confirmation)
- ✅ Suppression en cascade : DB + tous les fichiers du bucket
- ✅ Messages de succès/erreur avec auto-hide 3s
- ✅ Thème clair/sombre

**Sécurité**

- ✅ Bucket privé (pas d'accès public direct)
- ✅ URLs signées temporaires (600s par défaut)
- ✅ RLS strict : admins uniquement
- ✅ Vérification du rôle dans `profiles.role`
- ✅ Service role key côté serveur uniquement

**Performance**

- ✅ Génération de variantes avec Sharp (optimisé)
- ✅ Formats modernes (AVIF > WebP > JPEG)
- ✅ Détection automatique du meilleur format supporté
- ✅ Pas de localStorage (composants purs)

### 🔐 Authentification & Sécurité

- ✅ Middleware admin sur `/admin/*`
- ✅ Vérification JWT + role check
- ✅ Redirection vers `/auth/login` si non connecté
- ✅ Message "Accès refusé" si non-admin
- ✅ Helper `requireAdmin()` pour routes API

### 🎨 UX/UI

- ✅ Design system cohérent (Tailwind + shadcn/ui)
- ✅ Thème clair/sombre avec toggle
- ✅ Transitions et animations fluides
- ✅ États de chargement (disabled, spinner)
- ✅ Messages de feedback (toasts)
- ✅ Formulaires avec validation Zod
- ✅ Responsive design

---

## ❌ Limitations Actuelles

### Images

- ❌ Pas d'éditeur visuel (crop/rotate)
- ❌ Pas de prévisualisation avant upload
- ❌ Pas de gestion par lot (bulk actions)
- ❌ Pas d'historique des modifications
- ❌ Pas de watermark automatique
- ❌ Pas de compression paramétrable

### Produits

- ❌ Pas de gestion des catégories dans l'admin
- ❌ Pas de recherche/filtres avancés
- ❌ Pas d'import/export CSV
- ❌ Pas de duplication de produit
- ❌ Pas de gestion des collections
- ❌ Pas de prévisualisation front

### Général

- ❌ Pas de logs d'activité (audit trail)
- ❌ Pas de corbeille (soft delete seulement)
- ❌ Pas de statistiques/analytics
- ❌ Pas de gestion des utilisateurs
- ❌ Pas de dashboard avec KPIs

---

## 🚀 Fonctionnalités Prioritaires à Ajouter

### 1. Éditeur d'images ⭐⭐⭐

**Impact : Élevé | Effort : Moyen**

typescript

```typescript
// Composant avec react-easy-crop
<ImageEditor
  imageId={img.id}
  productId={productId}
  onSave={handleSave}
/>
```

**Fonctionnalités :**

- Crop avec ratios prédéfinis (1:1, 4:5, 3:4, 16:9)
- Rotation (90°, 180°, 270°)
- Zoom/pan
- Sauvegarde dans `storage_master`
- Régénération automatique des variantes

**Route API :**

typescript

```typescript
POST/api/admin/product-images/edit
{ imageId, crop:{x, y, width, height}, rotate:number}
```

### 2. Sélecteur de produit amélioré ⭐⭐⭐

**Impact : Moyen | Effort : Faible**

Au lieu de passer par l'URL, ajouter un dropdown :

typescript

```typescript
<ProductSelector
  value={selectedProduct}
  onChange={setSelectedProduct}
  products={allProducts}
/>
```

### 3. Drag & Drop pour réordonnancement ⭐⭐

**Impact : Moyen | Effort : Moyen**

Remplacer les boutons ↑/↓ par du drag & drop visuel avec `@dnd-kit/core`.

### 4. Prévisualisation avant upload ⭐⭐

**Impact : Moyen | Effort : Faible**

Afficher les images sélectionnées avant confirmation :

typescript

```typescript
{files &&(
<div className="grid grid-cols-4 gap-2">
{Array.from(files).map((f, i)=>(
<img key={i} src={URL.createObjectURL(f)}/>
))}
</div>
)}
```

### 5. Gestion des catégories ⭐⭐

**Impact : Élevé | Effort : Moyen**

Page `/admin/categories` pour CRUD des catégories :

- Arborescence (parent/enfant)
- Drag & drop pour réorganiser
- Assignment aux produits

---

## 🌟 Fonctionnalités Nice-to-Have

### Images Avancées

- **Point focal** : Alternative au crop manuel
- **Watermark** : Ajout automatique de logo
- **Filtres** : Noir & blanc, vintage, etc.
- **Compression manuelle** : Slider de qualité
- **Import depuis URL** : Fetch d'images externes
- **Tags/couleurs** : Métadonnées pour filtrer

### Produits Avancés

- **Import CSV/Excel** : Upload de catalogue
- **Duplication** : Cloner un produit
- **Historique prix** : Tracker les changements
- **Stock alerts** : Notifications stock bas
- **SEO fields** : Meta title/description
- **Variants matrix** : UI pour croiser taille×couleur

### Workflow

- **Preview mode** : Voir le rendu front sans publier
- **Scheduled publishing** : Date de publication future
- **Bulk actions** : Édition par lot
- **Undo/Redo** : Annuler les actions
- **Corbeille** : Restaurer les suppressions

### Analytics

- **Dashboard** : Ventes, stock, produits populaires
- **Activity log** : Qui a modifié quoi et quand
- **Rapports** : Export PDF/Excel
- **Alertes** : Stock bas, erreurs, etc.

---

## 📋 Checklist de Migration

Pour passer complètement au nouveau système d'images :

- [ ] Télécharger toutes les images Unsplash actuelles
- [ ] Uploader via l'interface admin pour chaque produit
- [ ] Définir les images principales
- [ ] Vérifier l'affichage sur le site
- [ ] Supprimer la colonne `image_url` de `products`
- [ ] Nettoyer les références Unsplash dans le code

---

## 🛠️ Stack Technique Actuelle

**Frontend**

- Next.js 15.5.3 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod (validation)

**Backend**

- Supabase (Postgres + Storage + Auth)
- Sharp (traitement d'images)
- Next.js API Routes

**Déploiement**

- Bucket privé `product-images`
- RLS activé
- Service role key pour admin

---

## 📝 Notes de Maintenance

### Régénérer les variantes manuellement

Si besoin de recréer toutes les variantes d'une image :

typescript

```typescript
POST / api / admin / product - images / generate - variants
{
  imageId: 'uuid'
}
```

### Nettoyer les fichiers orphelins

Script SQL pour trouver les images sans produit :

sql

```sql
SELECT*FROM product_images
WHERE product_id NOTIN(SELECT id FROM products);
```

### Augmenter la durée des URLs signées

Modifier `IMAGE_SIGN_TTL` dans `.env.local` (défaut : 600s).

---

## 🎯 Roadmap Suggérée

### Phase 1 (Court terme - 1-2 semaines)

1. Éditeur d'images basique (crop + rotate)
2. Sélecteur de produit amélioré
3. Prévisualisation avant upload

### Phase 2 (Moyen terme - 1 mois)

4. Gestion des catégories
5. Drag & drop réordonnancement
6. Dashboard basique

### Phase 3 (Long terme - 2-3 mois)

7. Import/Export CSV
8. Bulk actions
9. Analytics avancées
10. Point focal intelligent

---

**Document généré le 03/10/2025**

**Version : 1.0**

**Statut : ✅ Système opérationnel et fonctionnel**
