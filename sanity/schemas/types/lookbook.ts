// sanity/schemas/types/lookbook.ts - Version avec image de couverture + published
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

    // ✅ Toggle pour (dé)publier sans supprimer
    {
      name: 'published',
      title: 'Publié',
      type: 'boolean',
      initialValue: true,
      description:
        'Décochez pour retirer le lookbook du site sans le supprimer.',
    },

    { name: 'season', type: 'string', title: 'Saison / Année' },
    {
      name: 'coverImage',
      type: 'image',
      title: 'Image de couverture',
      description: 'Image principale qui apparaît sur la grille des lookbooks',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
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
