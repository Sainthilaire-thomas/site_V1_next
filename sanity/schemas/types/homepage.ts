import { defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    { name: 'heroTitle', type: 'string', title: 'Titre hero' },
    { name: 'heroSubtitle', type: 'string', title: 'Sous-titre' },
    { name: 'heroImage', type: 'image', title: 'Image hero', options: { hotspot: true } },
    {
      name: 'sections',
      title: 'Sections (bannières, carrousels, édito)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'banner',
          title: 'Bannière',
          fields: [
            { name: 'title', type: 'string', title: 'Titre' },
            { name: 'text', type: 'text', title: 'Texte' },
            { name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
            { name: 'ctaLabel', type: 'string', title: 'Texte du bouton' },
            { name: 'ctaHref', type: 'string', title: 'Lien' },
          ]
        },
        {
          type: 'object',
          name: 'carousel',
          title: 'Carrousel',
          fields: [
            { name: 'title', type: 'string', title: 'Titre' },
            { name: 'images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] },
          ]
        },
        {
          type: 'object',
          name: 'editorialPicks',
          title: 'Sélection édito (IDs produits Supabase)',
          fields: [
            { name: 'title', type: 'string', title: 'Titre' },
            { name: 'productIds', type: 'array', of: [{ type: 'string' }], title: 'IDs produits' },
          ]
        }
      ]
    },
    { name: 'seo', type: 'seo', title: 'SEO' },
  ]
})
