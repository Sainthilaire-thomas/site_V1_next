import { defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    // ========== SECTION HERO ==========
    {
      name: 'hero',
      title: '🎬 Section Hero',
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
          description: 'Ex: Découvrez les pièces essentielles de la saison',
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
          description: 'Ex: DÉCOUVRIR',
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
      title: '👕 Zone HAUTS (grande image)',
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
      title: '👖 Zone BAS (petite image)',
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
      title: '👜 Zone ACCESSOIRES (petite image)',
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
      title: '📸 Zone SILHOUETTES (moyenne image)',
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
      title: '🌱 Zone IMPACT (moyenne image)',
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
