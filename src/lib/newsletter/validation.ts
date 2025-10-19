// src/lib/newsletter/validation.ts

import { z } from 'zod'

/**
 * Schéma de validation pour la création d'une campagne newsletter
 */
export const createCampaignSchema = z.object({
  // Informations générales
  name: z.string().min(1, 'Nom requis').max(100, 'Maximum 100 caractères'),

  subject: z.string().min(1, 'Objet requis').max(150, 'Maximum 150 caractères'),

  preview_text: z.string().max(200, 'Maximum 200 caractères').optional(),

  // Contenu de l'email
  content: z.object({
    // Hero
    hero_image_url: z.string().url('URL invalide').optional(),

    // Textes principaux
    title: z.string().min(1, 'Titre requis').max(100, 'Maximum 100 caractères'),

    subtitle: z.string().max(200, 'Maximum 200 caractères').optional(),

    // CTA principal
    cta_text: z
      .string()
      .min(1, 'Texte CTA requis')
      .max(50, 'Maximum 50 caractères'),

    cta_link: z
      .string()
      .min(1, 'Lien CTA requis')
      .startsWith('/', 'Le lien doit commencer par /'),

    // Grille de 4 produits
    products: z
      .array(
        z.object({
          id: z.string().uuid('ID produit invalide'),
          position: z.number().int().min(1).max(4),
        })
      )
      .length(4, 'Exactement 4 produits requis')
      .refine(
        (products) => {
          const positions = products.map((p) => p.position)
          const uniquePositions = new Set(positions)
          return uniquePositions.size === 4
        },
        { message: 'Les positions doivent être uniques (1, 2, 3, 4)' }
      ),
  }),
})

/**
 * Schéma pour la mise à jour d'une campagne
 */
export const updateCampaignSchema = createCampaignSchema.partial()

/**
 * Schéma pour l'envoi d'un email de test
 */
export const sendTestEmailSchema = z.object({
  test_email: z.string().email('Email invalide'),
})

/**
 * Type inféré depuis le schéma
 */
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>
