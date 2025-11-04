
# 📊 Récapitulatif des Corrections - Site Blanche Renaudin

**Projet:** site_v1_next

**Branch de travail:** test-preview-deployment

**Dernière mise à jour:** 05 novembre 2025

**Avancement global:** ~45% des corrections

---

## ✅ Corrections Complétées

### 🎨 **Session 1 - 04 Novembre 2025**

#### Typographie

* ✅ **Footer** - Logo `.blancherenaudin` en Archivo Black (`font-brand`)
  * Fichier: `src/components/layout/FooterMinimal.tsx`
  * Changé `font-bold` → `font-brand`
* ✅ **Product Detail** - Titre du produit en Archivo Black
  * Fichier: `src/app/product/[id]/ProductDetailClient.tsx`
  * Ligne 321: Ajout `style={{ fontFamily: 'var(--font-archivo-black)' }}`

#### Navigation & Wording

* ✅ **Homepage** - Correction `.impact`
  * Fichier: `src/components/layout/Homepage.tsx`
  * Changé fallback `'impact'` → `'.impact'`
  * Titre mis à jour dans Sanity CMS
* ✅ **Catégorie "tops and jackets"**
  * Fichier: `src/app/products/[category]/page.tsx`
  * Ligne 23: `.tops&jackets` → `.tops and jackets`

**Commit:** `1a9c52f`

**Message:** "fix: update typography to Archivo Black (footer, product detail) and correct navigation labels"

---

### 🎨 **Session 2 - 05 Novembre 2025**

#### Typographie (suite)

* ✅ **ProductCardJacquemus** - Titres produits en Archivo Black
  * Fichier: `src/components/products/ProductCardJacquemus.tsx`
  * Ligne 73: Ajout `font-brand` à la classe du h3
  * **Solution:** Utilisation de `font-brand` au lieu du style inline
* ✅ **Product Detail** - Titres des sections en format `.composition`, `.care`, etc.
  * Fichier: `src/app/product/[id]/ProductDetailClient.tsx`
  * Titres modifiés:
    * `Composition` → `.composition`
    * `Care` → `.care`
    * `Impact` → `.impact`
    * `Artisanat` → `.artisanat`
  * Classe ajoutée: `font-brand` pour tous les titres de sections

#### Layout & Organisation

* ✅ **Product Detail** - Sections réorganisées
  * **Nouvel ordre:** Impact → Artisanat → Composition → Care
  * **Ancien ordre:** Composition → Care → Impact → Artisanat
* ✅ **Product Detail** - Référence produit supprimée
  * Section `BR-XXXXXXXX` complètement retirée
* ✅ **Product Detail** - Centrage du texte à gauche
  * Ajout de `max-w-2xl` sur le conteneur des détails produit
  * Amélioration de la lisibilité

#### Fonctionnalités

* ✅ **Product Detail** - Ordre des tailles constant
  * Fonction `sortSizes()` ajoutée
  * Ordre constant: XS, S, M, L, XL, XXL
  * Les tailles s'affichent toujours dans cet ordre, peu importe le stock
* ✅ **Product Detail** - "Notify me when available"
  * Remplace "Check availability and book an appointment"
  * Modal simple avec champ email (fonctionnel)
  * **Note:** À commenter/désactiver jusqu'à implémentation backend

#### Cart

* ✅ **Cart** - Ligne "shipping: free" retirée
  * Fichier: `src/app/cart/page.tsx`
  * Section shipping complètement supprimée du résumé

#### Mobile & Responsive

* ✅ **Homepage** - Centrage des textes sur mobile
  * Fichier: `src/components/layout/Homepage.tsx`
  * Hero: Texte centré sur mobile, aligné à droite sur desktop
  * Category cards: Même comportement responsive

#### Performance

* ✅ **Lightbox** - Transitions accélérées
  * Fichier: `src/app/product/[id]/ProductDetailClient.tsx`
  * `duration-700` → `duration-200` pour toutes les transitions
  * Ouverture/fermeture plus rapide

**Commit:** [À renseigner]

**Message:** "feat: apply Blanche's review corrections - typography, layout, and UX improvements"

---

## ⚠️ Corrections à Finaliser

### 🔧 **À Désactiver Temporairement**

#### "Notify me when available" Modal

**Action requise:** Commenter le code en attendant l'implémentation backend

**Fichier:** `src/app/product/[id]/ProductDetailClient.tsx`

**Sections à commenter:**

1. **State du modal** (ligne ~177):

```typescript
// const [showNotifyModal, setShowNotifyModal] = useState(false)
```

2. **Bouton d'ouverture** (ligne ~383):

```typescript
{/* TEMPORAIREMENT DÉSACTIVÉ - À réactiver avec backend
<p 
  onClick={() => setShowNotifyModal(true)}
  className="text-[11px] text-gray-400 leading-relaxed underline cursor-pointer hover:text-gray-900 text-right"
>
  Notify me when available
</p>
*/}

{/* PLACEHOLDER temporaire */}
<p className="text-[11px] text-gray-400 leading-relaxed text-right">
  Product availability: contact us
</p>
```

3. **Modal complet** (ligne ~520):

```typescript
{/* TEMPORAIREMENT DÉSACTIVÉ - À réactiver avec backend
{showNotifyModal && (
  <div
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    onClick={() => setShowNotifyModal(false)}
  >
    ... (tout le contenu du modal)
  </div>
)}
*/}
```

---

## 🔴 Corrections Prioritaires Restantes

### 1. **HeaderMinimal** - Logo en Archivo Black (version réduite desktop)

**Fichier:** `src/components/layout/HeaderMinimal.tsx`

**Ligne:** ~85

**Action:**

```typescript
// Actuellement: Image SVG
<Image
  src="/blancherenaudin-ajuste.svg"
  alt=".blancherenaudin"
  width={150}
  height={40}
  priority
  className="h-[calc(100%-16px)] w-auto max-h-[92px]"
/>

// Option 1: Ajouter font-brand au SVG (si texte)
// Option 2: Créer une version texte pour desktop réduit
// Option 3: Garder le SVG mais s'assurer qu'il utilise Archivo Black
```

**Détails à clarifier avec Blanche:**

* Est-ce le logo SVG qui doit être en Archivo Black ?
* Ou faut-il remplacer le logo par du texte sur certains écrans ?

---

### 2. **Performance Images** - Optimisations

**Fichiers concernés:**

* `src/components/products/ProductImage.tsx`
* `src/app/product/[id]/ProductDetailClient.tsx`

**Actions à implémenter:**

#### A. Optimiser les variantes d'images

```typescript
// Actuellement: sm/md/lg/xl
// À vérifier: Les tailles sont-elles optimales ?

// Suggestion:
const IMAGE_SIZES = {
  sm: 400,   // Cart, thumbnails
  md: 800,   // Product cards
  lg: 1200,  // Product detail
  xl: 1600,  // Lightbox
}
```

#### B. Ajouter priority aux premières images

```typescript
// Dans ProductDetailClient.tsx
<ProductImage
  productId={product.id}
  imageId={image.id}
  priority={globalIndex === 0} // ✅ Déjà fait
/>
```

#### C. Réduire le blur du placeholder

```typescript
// Dans ProductImage.tsx
// Actuellement: blur important
// À réduire: Transition plus rapide
```

---

## 🟡 Corrections Secondaires

### 3. **ProductCardMinimal** - À vérifier

**Fichier:** `src/components/products/ProductCardMinimal.tsx`

**Status:** Modifié mais non testé

**Vérifier que:**

* Le titre utilise bien `font-brand`
* Le composant est utilisé quelque part (sinon à nettoyer)

---

### 4. **Nettoyage du Code**

#### Headers non utilisés

**Fichiers à évaluer:**

* `src/components/layout/Header.tsx` (legacy)
* `src/components/layout/UnifiedHeader.tsx` (backup)

**Action:** Supprimer ou archiver si HeaderMinimal est le seul utilisé

#### Toast custom

**Fichier:** `src/components/admin/Toast.tsx`

**Situation:**

* `admin/Toast.tsx` (custom, non utilisé)
* `ui/sonner.tsx` (utilisé partout ✅)

**Action:** Supprimer `admin/Toast.tsx` pour éviter la confusion

#### SearchDebug

**Fichier:** `src/components/search/SearchDebug.tsx`

**Action:**

```typescript
// Entourer tout le composant de:
if (process.env.NODE_ENV === 'development') {
  // ... code de debug
}
```

---

## 🟢 Améliorations Futures (Nice to Have)

### UX/UI

* [ ] Loading skeletons plus nombreux
* [ ] Animations de transition entre pages
* [ ] Toast notifications plus stylées
* [ ] Filtre de recherche avec suggestions
* [ ] Comparateur de produits
* [ ] Vue rapide produit (quick view modal)
* [ ] Zoom produit avancé

### Mobile

* [ ] Menu hamburger plus fluide
* [ ] Swipe gestures dans les galeries
* [ ] Bottom navigation pour le compte
* [ ] PWA (Progressive Web App)

### Fonctionnalités

* [ ] Système de reviews/avis clients
* [ ] Programme de fidélité
* [ ] Codes promo avancés (% sur catégories)
* [ ] Recommandations produits (AI)
* [ ] Historique de navigation
* [ ] Liste de souhaits partageable
* [ ] **Notification de retour en stock** (backend pour "Notify me")
* [ ] Chat support client

### Internationalisation

* [ ] Support multi-langues (EN, FR)
* [ ] Multi-devises (EUR, USD, GBP)
* [ ] Détection automatique de la région

---

## 📝 Notes Techniques

### Classes Tailwind pour Archivo Black

* ✅ `font-brand` - Fonctionne (défini dans tailwind.config.ts)
* ❌ `font-black` - Ne marche pas (c'est font-weight, pas font-family)
* ✅ Style inline `fontFamily: 'var(--font-archivo-black)'` - Solution de secours

### Configuration Tailwind

```typescript
// tailwind.config.ts
fontFamily: {
  brand: ['var(--font-archivo-black)', 'sans-serif'],
  body: ['var(--font-archivo-narrow)', 'sans-serif'],
}
```

### Variables CSS

```typescript
// Définies dans layout.tsx
const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
})
```

---

## 🚀 Workflow Recommandé pour les Prochaines Sessions

### 1. Avant de commencer

```powershell
cd "C:\Users\thoma\OneDrive\SONEAR_2025\site_v1_next"
git status
git checkout test-preview-deployment
git pull origin test-preview-deployment
```

### 2. Créer des backups

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item "chemin/fichier.tsx" "chemin/fichier.tsx.backup-$timestamp"
```

### 3. Tester localement

```powershell
npm run dev
# Tester dans le navigateur
```

### 4. Commit et push

```powershell
git add .
git commit -m "feat: [description des modifications]"
git push origin test-preview-deployment
```

### 5. Vérifier le preview Vercel

* Attendre le déploiement automatique
* Tester sur le preview URL
* Partager avec Blanche si nécessaire

---

## 📋 Checklist pour la Prochaine Session

### Priorité 1 (Urgent)

* [ ] Désactiver temporairement le modal "Notify me"
* [ ] Vérifier HeaderMinimal - Logo Archivo Black
* [ ] Tester toutes les modifications sur mobile

### Priorité 2 (Important)

* [ ] Optimisations images (si nécessaire après tests)
* [ ] Nettoyage Headers non utilisés
* [ ] Supprimer Toast custom admin

### Priorité 3 (Nice to have)

* [ ] SearchDebug en dev only
* [ ] Vérifier ProductCardMinimal
* [ ] Documentation des composants clés

---

## 🎯 Objectif Final

**Version 1.0 Production Ready:**

* ✅ Design conforme à la vision de Blanche
* ✅ Performance optimale
* ✅ Code propre et maintenable
* ⏳ Toutes les fonctionnalités critiques implémentées
* ⏳ Tests E2E passants
* ⏳ SEO optimisé
* ⏳ Analytics configuré

**Timeline estimée:**

* **Corrections prioritaires:** 1-2 sessions (2-4h)
* **Fonctionnalités backend (Notify me, etc.):** 1 semaine
* **Optimisations & Polish:** 1-2 semaines
* **Tests & Validation:** 1 semaine
* **🚀 Déploiement Production:** ~3-4 semaines

---

## 📞 Contacts & Ressources

### Documentation Projet

* `docs/point-etape-9-oct-2025.md` - État des lieux complet
* `docs/project-structure.txt` - Arborescence
* `docs/webhook_stripe_route_ts_-_VERSION_CORRIGÉE_COMPLÈTE.txt` - Webhook Stripe

### Branches Git

* `main` - Production (stable)
* `test-preview-deployment` - Preview Vercel (en cours)
* Créer des feature branches si nécessaire

### Environnements

* **Dev:** http://localhost:3000
* **Preview:** [URL Vercel auto-générée]
* **Production:** [À définir]

---

**Document créé le:** 05 novembre 2025

**Auteur:** Thomas (avec assistance Claude)

**Version:** 2.0 - Comprehensive Update

---

## 🔄 Historique des Modifications du Document

* **v1.0** (04 Nov 2025) - Création initiale après Session 1
* **v2.0** (05 Nov 2025) - Mise à jour complète après Session 2
  * Ajout des corrections Session 2
  * Section "À Finaliser" (Notify me)
  * Checklist prochaine session
  * Timeline production
