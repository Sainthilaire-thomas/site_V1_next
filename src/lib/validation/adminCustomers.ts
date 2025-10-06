import { z } from 'zod'

// Schéma de mise à jour du profil client
export const customerUpdateSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis').optional(),
  last_name: z.string().min(1, 'Nom requis').optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(['customer', 'admin']).optional(),
  avatar_url: z.string().url().optional().nullable(),
})

// Schéma de création de note
export const customerNoteCreateSchema = z.object({
  note: z.string().min(1, 'Note requise').max(1000, 'Note trop longue'),
})

// Schéma de filtres pour la liste
export const customersFilterSchema = z.object({
  q: z.string().optional(), // recherche
  role: z.enum(['customer', 'admin', 'all']).optional(),
  sort: z.enum(['newest', 'oldest', 'name', 'orders', 'revenue']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export type CustomerUpdate = z.infer<typeof customerUpdateSchema>
export type CustomerNoteCreate = z.infer<typeof customerNoteCreateSchema>
export type CustomersFilter = z.infer<typeof customersFilterSchema>
