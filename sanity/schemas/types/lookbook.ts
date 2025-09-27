// sanity/schemas/types/lookbook.ts - Version corrigée
import { defineType } from 'sanity'

export default defineType({
  name: 'lookbook',
  title: 'Lookbook',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Titre' },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title', maxLength: 96 },
    },
    { name: 'season', type: 'string', title: 'Saison / Année' },
    {
      name: 'images',
      type: 'array',
      title: 'Images',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    { name: 'seo', type: 'seo', title: 'SEO' },
  ],
})
