// sanity/schemas/types/impactPage.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'impactPage',
  title: 'Page Impact',
  type: 'document',
  fields: [
    // SEO
    {
      name: 'seo',
      type: 'seo',
      title: 'SEO',
    },

    // Hero Section
    {
      name: 'hero',
      title: 'Section Hero',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Titre' },
        { name: 'subtitle', type: 'text', title: 'Sous-titre' },
        {
          name: 'image',
          type: 'image',
          title: 'Image de fond',
          options: { hotspot: true },
        },
      ],
    },

    // Engagements
    {
      name: 'commitments',
      title: 'Nos Engagements',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
        {
          name: 'items',
          type: 'array',
          title: 'Liste des engagements',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'number', type: 'string', title: 'Numéro' },
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
              ],
            },
          ],
        },
      ],
    },

    // Matières
    {
      name: 'materials',
      title: 'Nos Matières',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        {
          name: 'items',
          type: 'array',
          title: 'Liste des matières',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
                {
                  name: 'image',
                  type: 'image',
                  title: 'Image',
                  options: { hotspot: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // Impact (statistiques)
    {
      name: 'impact',
      title: 'Notre Impact',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        { name: 'year', type: 'string', title: 'Année' },
        {
          name: 'stats',
          type: 'array',
          title: 'Statistiques',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'number', type: 'string', title: 'Chiffre' },
                { name: 'label', type: 'string', title: 'Label' },
              ],
            },
          ],
        },
      ],
    },

    // Processus
    {
      name: 'process',
      title: 'Notre Processus',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        {
          name: 'steps',
          type: 'array',
          title: 'Étapes',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'number', type: 'string', title: 'Numéro' },
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
                {
                  name: 'image',
                  type: 'image',
                  title: 'Image',
                  options: { hotspot: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // Certifications
    {
      name: 'certifications',
      title: 'Certifications',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        { name: 'description', type: 'text', title: 'Description' },
        {
          name: 'badges',
          type: 'array',
          title: 'Labels',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', type: 'string', title: 'Nom' },
                {
                  name: 'logo',
                  type: 'image',
                  title: 'Logo (optionnel)',
                  options: { hotspot: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // Atelier
    {
      name: 'workshop',
      title: 'Notre Atelier',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Titre' },
        { name: 'description', type: 'text', title: 'Description' },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
      ],
    },

    // Mouvement
    {
      name: 'movement',
      title: 'Rejoignez le Mouvement',
      type: 'object',
      fields: [
        { name: 'sectionTitle', type: 'string', title: 'Titre de section' },
        { name: 'description', type: 'text', title: 'Description' },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
        {
          name: 'actions',
          type: 'array',
          title: 'Actions',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', type: 'string', title: 'Titre' },
                { name: 'description', type: 'text', title: 'Description' },
              ],
            },
          ],
        },
      ],
    },

    // CTA Final
    {
      name: 'cta',
      title: 'Call-to-Action Final',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Titre' },
        {
          name: 'primaryButton',
          type: 'object',
          title: 'Bouton principal',
          fields: [
            { name: 'text', type: 'string', title: 'Texte' },
            { name: 'link', type: 'string', title: 'Lien' },
          ],
        },
        {
          name: 'secondaryButton',
          type: 'object',
          title: 'Bouton secondaire',
          fields: [
            { name: 'text', type: 'string', title: 'Texte' },
            { name: 'link', type: 'string', title: 'Lien' },
          ],
        },
      ],
    },
  ],
})
