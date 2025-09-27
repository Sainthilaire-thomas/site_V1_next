import { defineType } from 'sanity'

export default defineType({
  name: 'blockContent',
  title: 'Texte riche',
  type: 'array',
  of: [
    { type: 'block' },
    { type: 'image', options: { hotspot: true } },
  ],
})
