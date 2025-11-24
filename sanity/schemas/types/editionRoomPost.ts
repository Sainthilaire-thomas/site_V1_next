// sanity/schemas/types/editionRoomPost.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'editionRoomPost',
  title: 'Article .edition room',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'object',
      fields: [
        { name: 'name', type: 'string', title: 'Nom', initialValue: 'Blanche Renaudin' },
        { name: 'role', type: 'string', title: 'Role', initialValue: 'Creatrice' },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extrait / Resume',
      type: 'text',
      rows: 3,
      description: 'Court resume pour les apercus et SEO (150-160 caracteres)',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Image principale',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Texte alternatif', type: 'string' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'reference',
      to: [{ type: 'editionRoomCategory' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Texte alternatif' },
            { name: 'caption', type: 'string', title: 'Legende' },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'featured',
      title: 'Article mis en avant',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'Brouillon', value: 'draft' },
          { title: 'Publie', value: 'published' },
          { title: 'Archive', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    { title: 'Date (recent)', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', author: 'author.name', media: 'mainImage', status: 'status', featured: 'featured' },
    prepare(selection) {
      const { title, author, status, featured } = selection
      const emoji = status === 'published' ? '🟢' : status === 'draft' ? '🟡' : '⚫'
      return {
        title: `${featured ? '⭐ ' : ''}${title}`,
        subtitle: `${emoji} ${status} - ${author || 'Sans auteur'}`,
        media: selection.media,
      }
    },
  },
})
