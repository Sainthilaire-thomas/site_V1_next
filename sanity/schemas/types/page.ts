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
