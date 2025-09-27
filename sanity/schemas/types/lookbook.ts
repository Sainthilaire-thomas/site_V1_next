// sanity/schemas/types/lookbook.ts - Version avec image de couverture
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
      name: 'coverImage',
      type: 'image',
      title: 'Image de couverture',
      description: 'Image principale qui apparaît sur la grille des lookbooks',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'images',
      type: 'array',
      title: "Galerie d'images",
      description: 'Images qui apparaissent dans le détail du lookbook',
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
    prepare(selection) {
      const { title, season, media } = selection
      return {
        title: title,
        subtitle: season,
        media: media,
      }
    },
  },
})
