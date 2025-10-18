// src/lib/shipping/calculator.ts
import { addBusinessDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  SHIPPING_METHODS,
  SHIPPING_ZONES,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  HOLIDAYS_2025,
} from './config'
import type { ShippingMethod, ShippingCalculation } from './types' // ✅ Ajout de "type"

/**
 * Récupère les méthodes de livraison disponibles pour un pays
 */
export function getAvailableShippingMethods(
  countryCode: string
): ShippingMethod[] {
  return SHIPPING_METHODS.filter(
    (method) => method.enabled && method.countries.includes(countryCode)
  )
}

/**
 * Récupère une méthode de livraison par son ID
 */
export function getShippingMethodById(
  methodId: string
): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === methodId)
}

/**
 * Calcule le coût de livraison pour une commande
 */
export function calculateShippingCost(
  methodId: string,
  countryCode: string,
  cartTotal: number,
  weight?: number // en grammes
): ShippingCalculation | null {
  const method = getShippingMethodById(methodId)

  if (!method || !method.countries.includes(countryCode)) {
    return null
  }

  // Trouver la zone correspondante
  const zone = SHIPPING_ZONES.find((z) => z.countries.includes(countryCode))

  // Récupérer le tarif de la zone (ou utiliser le tarif de base)
  let baseCost = method.base_rate
  let freeThreshold = method.free_shipping_threshold

  if (zone) {
    const zoneRate = zone.rates.find((r) => r.method_id === methodId)
    if (zoneRate) {
      baseCost = zoneRate.base_rate
      freeThreshold = zoneRate.free_threshold
    }
  }

  // Calculer le coût additionnel si poids fourni
  let totalCost = baseCost
  if (weight && zone) {
    const zoneRate = zone.rates.find((r) => r.method_id === methodId)
    if (zoneRate?.per_kg_rate) {
      const weightInKg = weight / 1000
      totalCost += zoneRate.per_kg_rate * weightInKg
    }
  }

  // Vérifier si livraison gratuite
  const isFree =
    (freeThreshold !== undefined && cartTotal >= freeThreshold) ||
    baseCost === 0

  const finalCost = isFree ? 0 : totalCost

  // Calculer la date de livraison estimée
  const estimatedDelivery = calculateEstimatedDelivery(
    method.min_delivery_days,
    method.max_delivery_days
  )

  return {
    method,
    cost: finalCost,
    estimated_delivery: estimatedDelivery,
    is_free: isFree,
    original_cost: isFree && totalCost > 0 ? totalCost : undefined,
  }
}

/**
 * Calcule toutes les options de livraison disponibles
 */
export function getAllShippingOptions(
  countryCode: string,
  cartTotal: number,
  weight?: number
): ShippingCalculation[] {
  const availableMethods = getAvailableShippingMethods(countryCode)

  return availableMethods
    .map((method) =>
      calculateShippingCost(method.id, countryCode, cartTotal, weight)
    )
    .filter((calc): calc is ShippingCalculation => calc !== null)
    .sort((a, b) => a.cost - b.cost) // Trier par prix croissant
}

/**
 * Calcule la date de livraison estimée (en évitant week-ends et jours fériés)
 */
function calculateEstimatedDelivery(
  minDays: number,
  maxDays: number
): {
  min_days: number
  max_days: number
  date_range: string
} {
  const today = new Date()

  // Ajouter les jours ouvrés
  const minDate = addBusinessDays(today, minDays)
  const maxDate = addBusinessDays(today, maxDays)

  // Formater les dates
  const minFormatted = format(minDate, 'd MMM', { locale: fr })
  const maxFormatted = format(maxDate, 'd MMM', { locale: fr })

  return {
    min_days: minDays,
    max_days: maxDays,
    date_range: `${minFormatted} - ${maxFormatted}`,
  }
}

/**
 * Vérifie si une méthode est disponible pour un poids donné
 */
export function isMethodAvailableForWeight(
  methodId: string,
  weight: number // en grammes
): boolean {
  const method = getShippingMethodById(methodId)

  if (!method || !method.weight_limits) {
    return true // Pas de limite
  }

  const { min, max } = method.weight_limits

  if (min !== undefined && weight < min) return false
  if (max !== undefined && weight > max) return false

  return true
}

/**
 * Calcule le montant restant pour bénéficier de la livraison gratuite
 */
export function getRemainingForFreeShipping(
  methodId: string,
  countryCode: string,
  cartTotal: number
): number | null {
  const method = getShippingMethodById(methodId)
  if (!method) return null

  // Trouver le seuil applicable
  const zone = SHIPPING_ZONES.find((z) => z.countries.includes(countryCode))
  const zoneRate = zone?.rates.find((r) => r.method_id === methodId)

  const threshold =
    zoneRate?.free_threshold ||
    method.free_shipping_threshold ||
    DEFAULT_FREE_SHIPPING_THRESHOLD

  if (cartTotal >= threshold) return 0

  return threshold - cartTotal
}
