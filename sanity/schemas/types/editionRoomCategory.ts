// sanity/schemas/types/editionRoomCategory.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'editionRoomCategory',
  title: 'Categorie .edition room',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'order',
      title: 'Ordre affichage',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    { title: 'Ordre', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare(selection) {
      return { title: selection.title, subtitle: `Ordre: ${selection.order ?? 0}` }
    },
  },
})
