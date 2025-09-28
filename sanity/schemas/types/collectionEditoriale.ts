// sanity/schemas/types/collectionEditoriale.ts - Version avec image de couverture
import { defineType } from 'sanity'

export default defineType({
  name: 'collectionEditoriale',
  title: 'Collection éditoriale',
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
        'Image principale qui apparaît sur la grille des collections éditoriales',
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
      description: 'Images qui apparaissent dans le détail de la collection',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    { name: 'seo', type: 'seo', title: 'SEO' },
    {
      name: 'published',
      title: 'Publié',
      type: 'boolean',
      initialValue: true,
      description:
        'Décochez pour retirer la collection du site sans la supprimer.',
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
