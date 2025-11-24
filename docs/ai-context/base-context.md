# Blanche Renaudin - Contexte Base

*Généré le 2025-11-24*


## blockContent.ts
```typescript
import { defineType } from 'sanity'

export default defineType({
  name: 'blockContent',
  title: 'Texte riche',
  type: 'array',
  of: [
    { type: 'block' },
    { type: 'image', options: { hotspot: true } },
  ],
})
```

## collectionEditoriale.ts
```typescript
// sanity/schemas/types/collectionEditoriale.ts - Version avec image de couverture
import { defineType } from 'sanity'

export default defineType({
  name: 'collectionEditoriale',
  title: 'Collection Ã©ditoriale',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', title: 'Nom' },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'name', maxLength: 96 },
    },
    {
      name: 'coverImage',
      type: 'image',
      title: 'Image de couverture',
      description:
        'Image principale qui apparaÃ®t sur la grille des collections Ã©ditoriales',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'intro',
      type: 'blockContent',
      title: 'Introduction',
    },
    {
      name: 'gallery',
      type: 'array',
      title: "Galerie d'images",
      description: 'Images qui apparaissent dans le dÃ©tail de la collection',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    { name: 'seo', type: 'seo', title: 'SEO' },
    {
      name: 'published',
      title: 'PubliÃ©',
      type: 'boolean',
      initialValue: true,
      description:
        'DÃ©cochez pour retirer la collection du site sans la supprimer.',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, media } = selection
      return {
        title: title,
        media: media,
      }
    },
  },
})
```

## homepage.ts
```typescript
import { defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    // ========== SECTION HERO ==========
    {
      name: 'hero',
      title: 'ðŸŽ¬ Section Hero',
      type: 'object',
      fields: [
        {
          name: 'title',
          type: 'string',
          title: 'Titre',
          description: 'Ex: NOUVELLE COLLECTION',
        },
        {
          name: 'subtitle',
          type: 'text',
          title: 'Sous-titre',
          description: 'Ex: DÃ©couvrez les piÃ¨ces essentielles de la saison',
        },
        {
          name: 'image',
          type: 'image',
          title: 'Image de fond',
          options: { hotspot: true },
        },
        {
          name: 'ctaLabel',
          type: 'string',
          title: 'Texte du bouton',
          description: 'Ex: DÃ‰COUVRIR',
        },
        {
          name: 'ctaLink',
          type: 'string',
          title: 'Lien du bouton',
          description: 'Ex: /hauts',
        },
      ],
    },

    // ========== ZONE HAUTS (Grande) ==========
    {
      name: 'zoneHauts',
      title: 'ðŸ‘• Zone HAUTS (grande image)',
      type: 'object',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Titre',
          initialValue: 'HAUTS',
        },
        { name: 'subtitle', type: 'text', title: 'Sous-titre (optionnel)' },
        { name: 'link', type: 'string', title: 'Lien', initialValue: '/hauts' },
      ],
    },

    // ========== ZONE BAS (Petite) ==========
    {
      name: 'zoneBas',
      title: 'ðŸ‘– Zone BAS (petite image)',
      type: 'object',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        { name: 'title', type: 'string', title: 'Titre', initialValue: 'BAS' },
        { name: 'subtitle', type: 'text', title: 'Sous-titre (optionnel)' },
        { name: 'link', type: 'string', title: 'Lien', initialValue: '/bas' },
      ],
    },

    // ========== ZONE ACCESSOIRES (Petite) ==========
    {
      name: 'zoneAccessoires',
      title: 'ðŸ‘œ Zone ACCESSOIRES (petite image)',
      type: 'object',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Titre',
          initialValue: 'ACCESSOIRES',
        },
        { name: 'subtitle', type: 'text', title: 'Sous-titre (optionnel)' },
        {
          name: 'link',
          type: 'string',
          title: 'Lien',
          initialValue: '/accessoires',
        },
      ],
    },

    // ========== ZONE SILHOUETTES (Moyenne) ==========
    {
      name: 'zoneSilhouettes',
      title: 'ðŸ“¸ Zone SILHOUETTES (moyenne image)',
      type: 'object',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Titre',
          initialValue: '.SILHOUETTES',
        },
        { name: 'subtitle', type: 'text', title: 'Sous-titre (optionnel)' },
        {
          name: 'link',
          type: 'string',
          title: 'Lien',
          initialValue: '/silhouettes',
        },
      ],
    },

    // ========== ZONE SUSTAINABILITY (Moyenne) ==========
    {
      name: 'zoneImpact',
      title: 'ðŸŒ± Zone IMPACT (moyenne image)',
      type: 'object',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Titre',
          initialValue: 'IMPACT',
        },
        { name: 'subtitle', type: 'text', title: 'Sous-titre (optionnel)' },
        {
          name: 'link',
          type: 'string',
          title: 'Lien',
          initialValue: '/impact',
        },
      ],
    },

    // ========== SEO ==========
    { name: 'seo', type: 'seo', title: 'SEO' },
  ],
})
```

## impactPage.ts
```typescript
// sanity/schemas/types/impactPage.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'impactPage',
  title: 'Page Impact',
  type: 'document',
  fields: [
    // SEO
    {
      name: 'seo',
      type: 'seo',
      title: 'SEO',
    },

    // Hero Section
    {
      name: 'hero',
      title: 'Section Hero',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Titre' },
        { name: 'subtitle', type: 'text', title: 'Sous-titre' },
        {
          name: 'image',
          type: 'image',
          title: 'Image de fond',
          options: { hotspot: true },
        },
      ],
    },

    // Engagements
    {
      name: 'commitments',
      title: 'Nos Engagements',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
        {
          name: 'items',
          type: 'array',
          title: 'Liste des engagements',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'number', type: 'string', title: 'NumÃ©ro' },
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
              ],
            },
          ],
        },
      ],
    },

    // MatiÃ¨res
    {
      name: 'materials',
      title: 'Nos MatiÃ¨res',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        {
          name: 'items',
          type: 'array',
          title: 'Liste des matiÃ¨res',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
                {
                  name: 'image',
                  type: 'image',
                  title: 'Image',
                  options: { hotspot: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // Impact (statistiques)
    {
      name: 'impact',
      title: 'Notre Impact',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        { name: 'year', type: 'string', title: 'AnnÃ©e' },
        {
          name: 'stats',
          type: 'array',
          title: 'Statistiques',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'number', type: 'string', title: 'Chiffre' },
                { name: 'label', type: 'string', title: 'Label' },
              ],
            },
          ],
        },
      ],
    },

    // Processus
    {
      name: 'process',
      title: 'Notre Processus',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        {
          name: 'steps',
          type: 'array',
          title: 'Ã‰tapes',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'number', type: 'string', title: 'NumÃ©ro' },
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
                {
                  name: 'image',
                  type: 'image',
                  title: 'Image',
                  options: { hotspot: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // Certifications
    {
      name: 'certifications',
      title: 'Certifications',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        { name: 'description', type: 'text', title: 'Description' },
        {
          name: 'badges',
          type: 'array',
          title: 'Labels',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', type: 'string', title: 'Nom' },
                {
                  name: 'logo',
                  type: 'image',
                  title: 'Logo (optionnel)',
                  options: { hotspot: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // Atelier
    {
      name: 'workshop',
      title: 'Notre Atelier',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Titre' },
        { name: 'description', type: 'text', title: 'Description' },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
      ],
    },

    // Mouvement
    {
      name: 'movement',
      title: 'Rejoignez le Mouvement',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        { name: 'description', type: 'text', title: 'Description' },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
        {
          name: 'actions',
          type: 'array',
          title: 'Actions',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
              ],
            },
          ],
        },
      ],
    },

    // CTA Final
    {
      name: 'cta',
      title: 'Call-to-Action Final',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Titre' },
        {
          name: 'primaryButton',
          type: 'object',
          title: 'Bouton principal',
          fields: [
            { name: 'text', type: 'string', title: 'Texte' },
            { name: 'link', type: 'string', title: 'Lien' },
          ],
        },
        {
          name: 'secondaryButton',
          type: 'object',
          title: 'Bouton secondaire',
          fields: [
            { name: 'text', type: 'string', title: 'Texte' },
            { name: 'link', type: 'string', title: 'Lien' },
          ],
        },
      ],
    },
  ],
})
```

## lookbook.ts
```typescript
// sanity/schemas/types/lookbook.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'lookbook',
  title: 'Lookbook',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Titre' },

    // âœ… NOUVEAU : Sous-titre
    {
      name: 'subtitle',
      type: 'text',
      title: 'Sous-titre',
      description: 'Texte secondaire affichÃ© sous le titre principal',
      rows: 3,
    },

    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title', maxLength: 96 },
    },

    {
      name: 'published',
      title: 'PubliÃ©',
      type: 'boolean',
      initialValue: true,
      description:
        'DÃ©cochez pour retirer le lookbook du site sans le supprimer.',
    },

    { name: 'season', type: 'string', title: 'Saison / AnnÃ©e' },
    {
      name: 'coverImage',
      type: 'image',
      title: 'Image de couverture',
      description: 'Image principale qui apparaÃ®t sur la grille des lookbooks',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'images',
      type: 'array',
      title: "Galerie d'images",
      description: 'Images qui apparaissent dans le dÃ©tail du lookbook',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    { name: 'seo', type: 'seo', title: 'SEO' },
  ],
  preview: {
    select: {
      title: 'title',
      season: 'season',
      media: 'coverImage',
    },
    prepare(selection: { title?: string; season?: string; media?: any }) {
      const { title, season, media } = selection
      return {
        title,
        subtitle: season,
        media,
      }
    },
  },
})
```

## page.ts
```typescript
import { defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Titre' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title', maxLength: 96 } },
    { name: 'content', type: 'blockContent', title: 'Contenu' },
    { name: 'seo', type: 'seo', title: 'SEO' },
  ]
})
```

## seo.ts
```typescript
import { defineType } from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', title: 'Titre SEO' },
    { name: 'description', type: 'text', title: 'Description' },
    { name: 'image', type: 'image', title: 'Image de partage', options: { hotspot: true } },
  ]
})
```

## index.ts
```typescript
import homepage from './types/homepage'
import page from './types/page'
import lookbook from './types/lookbook'
import collectionEditoriale from './types/collectionEditoriale'
import blockContent from './types/blockContent'
import seo from './types/seo'
import impactPage from './types/impactPage'

export const schemaTypes = [
  homepage,
  page,
  lookbook,
  collectionEditoriale,
  blockContent,
  seo,
  impactPage,
]
```

## structure.ts
```typescript
// sanity/structure.ts
import type { StructureBuilder } from 'sanity/desk'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Homepage')
        .child(
          S.document().schemaType('homepage').documentId('homepage-singleton')
        ),

      // â† AJOUTER LA PAGE IMPACT ICI
      S.listItem()
        .title('Page Impact')
        .child(
          S.document().schemaType('impactPage').documentId('impact-singleton')
        ),

      S.divider(),

      S.listItem()
        .title('Pages')
        .child(
          S.documentTypeList('page')
            .title('Toutes les pages')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      // Lookbooks
      S.listItem()
        .title('Lookbooks')
        .child(
          S.list()
            .title('Lookbooks')
            .items([
              S.listItem()
                .title('PubliÃ©s')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Lookbooks publiÃ©s')
                    .filter(
                      '_type == "lookbook" && coalesce(published, true) == true'
                    )
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.listItem()
                .title('DÃ©publiÃ©s')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Lookbooks dÃ©publiÃ©s')
                    .filter('_type == "lookbook" && published == false')
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.divider(),
              S.listItem()
                .title('Tous')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Tous les lookbooks')
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
            ])
        ),

      // Collections Ã©ditoriales
      S.listItem()
        .title('Collections Ã©ditoriales')
        .child(
          S.list()
            .title('Collections Ã©ditoriales')
            .items([
              S.listItem()
                .title('PubliÃ©es')
                .child(
                  S.documentTypeList('collectionEditoriale')
                    .title('Collections publiÃ©es')
                    .filter(
                      '_type == "collectionEditoriale" && coalesce(published, true) == true'
                    )
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.listItem()
                .title('DÃ©publiÃ©es')
                .child(
                  S.documentTypeList('collectionEditoriale')
                    .title('Collections dÃ©publiÃ©es')
                    .filter(
                      '_type == "collectionEditoriale" && published == false'
                    )
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.divider(),
              S.listItem()
                .title('Toutes')
                .child(
                  S.documentTypeList('collectionEditoriale')
                    .title('Toutes les collections Ã©ditoriales')
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
            ])
        ),

      S.divider(),

      S.listItem()
        .title('SEO (rÃ©utilisable)')
        .child(
          S.documentTypeList('seo')
            .title('EntrÃ©es SEO')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
    ])
```

## queries.ts
```typescript
// src/lib/queries.ts
import { groq } from 'next-sanity'

// === Homepage ===
export const HOMEPAGE_QUERY = groq`*[_type=="homepage" && _id == "homepage-singleton"][0]{
  hero {
    title,
    subtitle,
    image,
    ctaLabel,
    ctaLink
  },
  zoneHauts {
    image,
    title,
    subtitle,
    link
  },
  zoneBas {
    image,
    title,
    subtitle,
    link
  },
  zoneAccessoires {
    image,
    title,
    subtitle,
    link
  },
  zoneSilhouettes {
    image,
    title,
    subtitle,
    link
  },
   zoneImpact {
    image,
    title,
    subtitle,
    link
  },
  seo
}`

// === Collections Ã©ditoriales ===

// Liste (uniquement publiÃ©es)
export const COLLECTIONS_EDITORIALES_QUERY = groq`*[
  _type == "collectionEditoriale" && coalesce(published, true) == true
] | order(_createdAt desc) {
  _id,
  name,
  slug,
  coverImage,
  intro,
  gallery,
  seo
}`

// DÃ©tail par slug (uniquement publiÃ©e)
export const COLLECTION_EDITORIALE_QUERY = groq`*[
  _type=="collectionEditoriale" &&
  slug.current == $slug &&
  coalesce(published, true) == true
][0]{
  _id,
  name,
  slug,
  intro,
  gallery,
  seo
}`

// === Lookbooks (affichÃ©s comme "Silhouettes" sur le site) ===

// Liste (uniquement publiÃ©s)
export const LOOKBOOKS_QUERY = groq`*[
  _type == "lookbook" && coalesce(published, true) == true
] | order(_createdAt desc) {
  _id,
  title,
  season,
  slug,
  coverImage,
  images,
  seo
}`

// DÃ©tail par slug (uniquement publiÃ©)
export const LOOKBOOK_QUERY = groq`*[
  _type=="lookbook" &&
  slug.current == $slug &&
  coalesce(published, true) == true
][0]{
  _id,
  title,
  subtitle,
  season,
  slug,
  images,
  seo
}`

// === Pages statiques ===

export const PAGE_QUERY = groq`*[_type=="page" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  content,
  seo
}`

export const PAGES_QUERY = groq`*[_type=="page"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  content,
  seo
}`
```
