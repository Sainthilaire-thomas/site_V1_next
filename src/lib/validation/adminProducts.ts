import { z } from 'zod'

export const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.coerce.number().nonnegative(),
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  // ✅ NOUVEAUX CHAMPS
  composition: z.string().optional().nullable(),
  care: z.string().optional().nullable(),
  impact: z.string().optional().nullable(),
  craftsmanship: z.string().optional().nullable(),
  // FIN NOUVEAUX CHAMPS
  sku: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.coerce.boolean().default(true),
  is_featured: z.coerce.boolean().default(false),
})

export const productUpdateSchema = productCreateSchema.partial()

export const variantCreateSchema = z.object({
  name: z.string().min(1), // ex: "Taille"
  value: z.string().min(1), // ex: "M"
  price_modifier: z.coerce.number().default(0),
  sku: z.string().optional().nullable(),
  stock_quantity: z.coerce.number().int().default(0),
  is_active: z.coerce.boolean().default(true),
})

export const stockAdjustSchema = z.object({
  delta: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, 'delta != 0'),
  reason: z.string().min(2),
})
