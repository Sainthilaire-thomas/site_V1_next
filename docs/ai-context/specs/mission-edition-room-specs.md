# 📋 Specs Mission: .edition room

## 🎯 Objectif

Implémenter un système de blog/journal éditorial pour Blanche Renaudin permettant de publier des articles sur les inspirations, coulisses, et engagements de la marque.

**Nom de la rubrique:** `.edition room`  
**URL:** `/edition-room`  
**CMS:** Sanity (cohérent avec le reste du contenu éditorial)

---

## 📐 Scope de la mission

### Ce qu'on fait

1. **Transformer le schéma Sanity existant**
   - Renommer `collectionEditoriale` → `editionRoomPost`
   - Enrichir avec nouveaux champs (auteur, catégories, tags, featured, status)
   - Créer schéma `editionRoomCategory` pour les catégories

2. **Renommer les routes Next.js**
   - `/collections-editoriales` → `/edition-room`
   - `/collections-editoriales/[slug]` → `/edition-room/[slug]`

3. **Créer les pages et composants**
   - Page liste `/edition-room/page.tsx`
   - Page article `/edition-room/[slug]/page.tsx`
   - Composant `EditionRoomCard.tsx`
   - Composant `EditionRoomContent.tsx`

4. **Intégrer dans la navigation**
   - Ajouter `.edition room` dans le header
   - Optionnel: section dans le footer

5. **Configurer Sanity Studio**
   - Structure claire pour Blanche
   - Preview personnalisé
   - Workflow brouillon/publié

### Ce qu'on ne fait PAS (hors scope)

- Analytics avancés (tracking vues, attribution)
- Commentaires
- Recherche full-text dans les articles
- Système de tags avec pages dédiées
- Newsletter signup dans les articles
- Multi-langue

---

## 🎨 Design & UX

### Style visuel

Cohérent avec le reste du site :
- Typographie: Archivo Black (titres), Archivo Narrow (body)
- Minimaliste, beaucoup de blanc
- Images full-width ou aspect-ratio 3:4
- Hover effects subtils (scale, opacity)

### Page liste `/edition-room`

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     .edition room                           │
│            inspirations · coulisses · engagements           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [À LA UNE]                                                 │
│  ┌────────────────────────┐ ┌────────────────────────┐     │
│  │                        │ │                        │     │
│  │     Featured 1         │ │     Featured 2         │     │
│  │     (16:9)             │ │     (16:9)             │     │
│  │                        │ │                        │     │
│  │  Titre article         │ │  Titre article         │     │
│  │  Date · Auteur         │ │  Date · Auteur         │     │
│  └────────────────────────┘ └────────────────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │          │ │          │ │          │                    │
│  │  (3:4)   │ │  (3:4)   │ │  (3:4)   │                    │
│  │          │ │          │ │          │                    │
│  │  Titre   │ │  Titre   │ │  Titre   │                    │
│  │  Date    │ │  Date    │ │  Date    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Page article `/edition-room/[slug]`

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Catégorie]                                                │
│                                                             │
│  TITRE DE L'ARTICLE                                         │
│  EN MAJUSCULES                                              │
│                                                             │
│  17 novembre 2025 · par Blanche Renaudin                    │
│                                                             │
│  Extrait / chapô de l'article sur une ou                    │
│  deux lignes maximum.                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              IMAGE PRINCIPALE (16:9)                │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Contenu de l'article en rich text.                         │
│                                                             │
│  Lorem ipsum dolor sit amet, consectetur adipiscing         │
│  elit. Sed do eiusmod tempor incididunt ut labore.         │
│                                                             │
│  > Citation mise en avant avec                              │
│  > bordure violette à gauche                                │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐                         │
│  │   Galerie    │ │   Galerie    │                         │
│  │   Image 1    │ │   Image 2    │                         │
│  └──────────────┘ └──────────────┘                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [PRODUITS ASSOCIÉS] (si applicable)                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                               │
│  │    │ │    │ │    │ │    │                               │
│  └────┘ └────┘ └────┘ └────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Schéma Sanity détaillé

### editionRoomPost

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| title | string | ✅ | Titre de l'article |
| slug | slug | ✅ | URL (auto-générée) |
| author | object | ❌ | Nom + rôle |
| publishedAt | datetime | ✅ | Date de publication |
| excerpt | text | ❌ | Résumé (150-160 chars) |
| mainImage | image + alt | ✅ | Image principale avec hotspot |
| categories | reference[] | ❌ | Catégories |
| tags | string[] | ❌ | Tags libres |
| content | blockContent | ✅ | Contenu rich text |
| gallery | image[] | ❌ | Galerie optionnelle |
| relatedProducts | reference[] | ❌ | Produits Supabase (par ID) |
| seo | seo | ❌ | Métadonnées SEO |
| featured | boolean | ❌ | Mis en avant (default: false) |
| status | string | ✅ | draft / published / archived |

### editionRoomCategory

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| title | string | ✅ | Nom de la catégorie |
| slug | slug | ✅ | URL |
| description | text | ❌ | Description |

### Catégories suggérées

- **Inspirations** - Moodboards, influences
- **Coulisses** - Behind the scenes, making-of
- **Engagements** - Sustainability, éthique
- **Style** - Conseils mode, looks
- **Événements** - Pop-ups, markets

---

## 🔗 Intégration navigation

### Header (HeaderMinimal.tsx)

```tsx
// Ajouter dans la navigation desktop
<Link href="/edition-room" className="...">
  .edition room
</Link>

// Ajouter dans le menu mobile
```

### Position dans le menu

```
.tops | .bottoms | .accessories | .silhouettes | .edition room | .impact | .essence | .contact
```

---

## ✅ Critères de succès

### Fonctionnel

- [ ] Sanity Studio : Blanche peut créer/éditer/publier des articles
- [ ] Liste : `/edition-room` affiche les articles publiés
- [ ] Détail : `/edition-room/[slug]` affiche un article complet
- [ ] Featured : Articles marqués "featured" apparaissent en haut
- [ ] Navigation : `.edition room` accessible depuis le header
- [ ] Responsive : Fonctionne sur mobile/tablette/desktop

### Technique

- [ ] Build Next.js sans erreurs TypeScript
- [ ] ISR configuré (revalidate = 3600)
- [ ] SEO : metadata dynamique par article
- [ ] Images : optimisées via Sanity CDN

### UX

- [ ] Design cohérent avec le reste du site
- [ ] Temps de chargement < 2s
- [ ] Navigation fluide

---

## 📁 Fichiers à créer/modifier

### À créer

```
sanity/schemas/types/editionRoomPost.ts      # Schéma article
sanity/schemas/types/editionRoomCategory.ts  # Schéma catégorie
src/app/edition-room/page.tsx                # Liste articles
src/app/edition-room/[slug]/page.tsx         # Article individuel
src/components/edition-room/EditionRoomCard.tsx
src/components/edition-room/EditionRoomContent.tsx
```

### À modifier

```
sanity/schemas/index.ts                      # Ajouter les nouveaux schémas
sanity/structure.ts                          # Structure Sanity Studio
src/lib/queries.ts                           # Queries GROQ
src/components/layout/HeaderMinimal.tsx      # Navigation
next.config.ts                               # Redirection legacy
```

### À supprimer (après migration)

```
sanity/schemas/types/collectionEditoriale.ts
src/app/collections-editoriales/             # Tout le dossier
```

---

## 🚀 Plan d'implémentation suggéré

### Phase 1 : Backend Sanity (1-2h)
1. Créer `editionRoomPost.ts`
2. Créer `editionRoomCategory.ts`
3. Mettre à jour `schemas/index.ts`
4. Configurer `structure.ts`
5. Déployer Sanity

### Phase 2 : Routes Next.js (1-2h)
1. Créer dossier `/edition-room`
2. Implémenter page liste
3. Implémenter page article
4. Ajouter queries GROQ

### Phase 3 : Composants (1h)
1. Créer `EditionRoomCard.tsx`
2. Créer `EditionRoomContent.tsx`
3. Intégrer rich text rendering

### Phase 4 : Intégration (30min)
1. Ajouter navigation header
2. Configurer redirections
3. Nettoyer legacy code

### Phase 5 : Tests & Polish (30min)
1. Créer article test
2. Vérifier responsive
3. Tester SEO
4. Former Blanche

---

## 📎 Ressources

- [Sanity Schema Types](https://www.sanity.io/docs/schema-types)
- [Portable Text](https://www.sanity.io/docs/presenting-block-text)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- Document analyse : `BLOG-comparaison-sanity-vs-custom.md`
- Document implémentation : `BLOG-guide-implementation-express.md`

---

*Specs créées le 24 novembre 2025*
