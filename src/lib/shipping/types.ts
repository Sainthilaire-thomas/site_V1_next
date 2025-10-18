// src/lib/shipping/types.ts

export type ShippingMethod = {
  id: string
  name: string
  code: string // Pour l'intégration API (colissimo, mondialrelay, etc.)
  description: string
  carrier?: string // Nom du transporteur
  base_rate: number
  free_shipping_threshold?: number // Montant pour livraison gratuite
  min_delivery_days: number
  max_delivery_days: number
  enabled: boolean
  countries: string[] // Codes pays ISO (FR, BE, etc.)
  weight_limits?: {
    min?: number // en grammes
    max?: number
  }
  requires_tracking?: boolean
}

export type ShippingZone = {
  id: string
  name: string
  countries: string[]
  rates: ShippingRate[]
}

export type ShippingRate = {
  method_id: string
  base_rate: number
  per_kg_rate?: number // Coût additionnel par kilo
  free_threshold?: number // Montant pour livraison gratuite dans cette zone
}

export type ShippingCalculation = {
  method: ShippingMethod
  cost: number
  estimated_delivery: {
    min_days: number
    max_days: number
    date_range: string
  }
  is_free: boolean
  original_cost?: number // Si réduction appliquée
}
