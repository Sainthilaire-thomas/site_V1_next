// src/lib/newsletter/validation.ts

import { z } from 'zod'

/**
 * Schéma de validation pour la création d'une campagne newsletter
 * ✅ Validation conditionnelle : stricte pour 'sent', flexible pour 'draft'
 */
export const createCampaignSchema = z
  .object({
    // Informations générales (TOUJOURS requis)
    name: z.string().min(1, 'Nom requis').max(100, 'Maximum 100 caractères'),

    subject: z
      .string()
      .min(1, 'Objet requis')
      .max(150, 'Maximum 150 caractères'),

    preview_text: z.string().max(200, 'Maximum 200 caractères').optional(),

    // ✅ NOUVEAU : Statut (défaut = draft)
    status: z.enum(['draft', 'sent', 'scheduled']).optional().default('draft'),

    // Contenu de l'email (flexible par défaut)
    content: z.object({
      // Hero
      hero_image_url: z.string().url('URL invalide').nullable().optional(),

      // Textes principaux
      title: z
        .string()
        .max(100, 'Maximum 100 caractères')
        .optional()
        .default(''),

      subtitle: z
        .string()
        .max(200, 'Maximum 200 caractères')
        .optional()
        .default(''),

      // CTA principal
      cta_text: z
        .string()
        .max(50, 'Maximum 50 caractères')
        .optional()
        .default('Découvrir'),

      cta_link: z.string().optional().default('/products'),

      // Grille de 4 produits (optionnelle pour draft)
      products: z
        .array(
          z.object({
            id: z.string().uuid('ID produit invalide'),
            position: z.number().int().min(1).max(4),
          })
        )
        .optional()
        .default([]),
    }),
  })
  .superRefine((data, ctx) => {
    // ✅ Validation stricte UNIQUEMENT pour 'sent' ou 'scheduled'
    if (data.status === 'sent' || data.status === 'scheduled') {
      // Hero image obligatoire
      if (!data.content.hero_image_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'hero_image_url'],
          message: "L'image hero est requise pour l'envoi",
        })
      }

      // Titre obligatoire
      if (!data.content.title || data.content.title.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'title'],
          message: "Titre requis pour l'envoi",
        })
      }

      // Sous-titre obligatoire
      if (!data.content.subtitle || data.content.subtitle.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'subtitle'],
          message: "Sous-titre requis pour l'envoi",
        })
      }

      // CTA texte obligatoire
      if (!data.content.cta_text || data.content.cta_text.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'cta_text'],
          message: "Texte CTA requis pour l'envoi",
        })
      }

      // CTA lien obligatoire et doit commencer par /
      if (!data.content.cta_link || data.content.cta_link.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'cta_link'],
          message: "Lien CTA requis pour l'envoi",
        })
      } else if (!data.content.cta_link.startsWith('/')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'cta_link'],
          message: 'Le lien doit commencer par /',
        })
      }

      // Exactement 4 produits obligatoires
      if (!data.content.products || data.content.products.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content', 'products'],
          message: "Exactement 4 produits requis pour l'envoi",
        })
      } else {
        // Vérifier les positions uniques
        const positions = data.content.products.map((p) => p.position)
        const uniquePositions = new Set(positions)
        if (uniquePositions.size !== 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['content', 'products'],
            message: 'Les positions doivent être uniques (1, 2, 3, 4)',
          })
        }
      }

      // Preview text obligatoire
      if (!data.preview_text || data.preview_text.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['preview_text'],
          message: "Texte de prévisualisation requis pour l'envoi",
        })
      }
    }
  })

/**
 * Schéma pour la mise à jour d'une campagne
 */
export const updateCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Nom requis')
    .max(100, 'Maximum 100 caractères')
    .optional(),
  subject: z
    .string()
    .min(1, 'Objet requis')
    .max(150, 'Maximum 150 caractères')
    .optional(),
  preview_text: z.string().max(200, 'Maximum 200 caractères').optional(),
  content: z
    .object({
      hero_image_url: z.string().url('URL invalide').nullable().optional(),
      title: z.string().max(100, 'Maximum 100 caractères').optional(),
      subtitle: z.string().max(200, 'Maximum 200 caractères').optional(),
      cta_text: z.string().max(50, 'Maximum 50 caractères').optional(),
      cta_link: z.string().optional(),
      products: z
        .array(
          z.object({
            id: z.string().uuid('ID produit invalide'),
            position: z.number().int().min(1).max(4),
          })
        )
        .optional(),
    })
    .optional(),
})

/**
 * Schéma pour l'envoi d'un email de test
 */
export const sendTestEmailSchema = z.object({
  test_email: z.string().email('Email invalide'),
})

/**
 * Types inférés depuis les schémas
 */
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>
