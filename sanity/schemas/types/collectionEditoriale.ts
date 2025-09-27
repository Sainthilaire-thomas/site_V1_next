import { defineType } from 'sanity'

export default defineType({
  name: 'collectionEditoriale',
  title: 'Collection éditoriale',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', title: 'Nom' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'name' } },
    { name: 'intro', type: 'blockContent', title: 'Introduction' },
    { name: 'gallery', type: 'array', title: 'Galerie', of: [{ type: 'image', options: { hotspot: true } }] },
    { name: 'seo', type: 'seo', title: 'SEO' },
  ]
})
