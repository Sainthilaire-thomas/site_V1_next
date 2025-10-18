// src/lib/shipping/config.ts
import type { ShippingMethod, ShippingZone } from './types'

/**
 * Configuration des méthodes de livraison disponibles
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard',
    code: 'colissimo_standard',
    description: 'Livraison en 5-7 jours ouvrés',
    carrier: 'Colissimo',
    base_rate: 0,
    free_shipping_threshold: 0, // Toujours gratuit
    min_delivery_days: 5,
    max_delivery_days: 7,
    enabled: true,
    countries: ['FR', 'BE', 'LU', 'MC'],
    requires_tracking: true,
  },
  {
    id: 'express',
    name: 'Express',
    code: 'colissimo_express',
    description: 'Livraison en 2-3 jours ouvrés',
    carrier: 'Colissimo',
    base_rate: 15,
    free_shipping_threshold: 200, // Gratuit au-dessus de 200€
    min_delivery_days: 2,
    max_delivery_days: 3,
    enabled: true,
    countries: ['FR', 'BE', 'LU', 'MC'],
    requires_tracking: true,
  },
  {
    id: 'mondial_relay',
    name: 'Point Relais',
    code: 'mondial_relay',
    description: 'Retrait en point relais sous 3-5 jours',
    carrier: 'Mondial Relay',
    base_rate: 5.9,
    free_shipping_threshold: 100,
    min_delivery_days: 3,
    max_delivery_days: 5,
    enabled: true,
    countries: ['FR', 'BE'],
    requires_tracking: true,
  },
  {
    id: 'international',
    name: 'International',
    code: 'colissimo_international',
    description: 'Livraison internationale en 7-14 jours',
    carrier: 'Colissimo',
    base_rate: 25,
    min_delivery_days: 7,
    max_delivery_days: 14,
    enabled: true,
    countries: ['CH', 'DE', 'IT', 'ES', 'PT', 'NL', 'AT'],
    requires_tracking: true,
  },
]

/**
 * Configuration des zones de livraison avec tarifs différenciés
 */
export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'france',
    name: 'France métropolitaine',
    countries: ['FR'],
    rates: [
      { method_id: 'standard', base_rate: 0, free_threshold: 0 },
      { method_id: 'express', base_rate: 15, free_threshold: 200 },
      { method_id: 'mondial_relay', base_rate: 5.9, free_threshold: 100 },
    ],
  },
  {
    id: 'benelux',
    name: 'Belgique, Luxembourg',
    countries: ['BE', 'LU'],
    rates: [
      { method_id: 'standard', base_rate: 8, free_threshold: 150 },
      { method_id: 'express', base_rate: 20, free_threshold: 250 },
      { method_id: 'mondial_relay', base_rate: 7.9, free_threshold: 120 },
    ],
  },
  {
    id: 'europe',
    name: 'Europe',
    countries: ['CH', 'DE', 'IT', 'ES', 'PT', 'NL', 'AT'],
    rates: [{ method_id: 'international', base_rate: 25, free_threshold: 300 }],
  },
]

/**
 * Seuil de gratuité par défaut (global)
 */
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 150

/**
 * Configuration des jours fériés (pour calcul des délais)
 */
export const HOLIDAYS_2025 = [
  '2025-01-01', // Jour de l'an
  '2025-04-21', // Lundi de Pâques
  '2025-05-01', // Fête du travail
  '2025-05-08', // Victoire 1945
  '2025-05-29', // Ascension
  '2025-06-09', // Lundi de Pentecôte
  '2025-07-14', // Fête nationale
  '2025-08-15', // Assomption
  '2025-11-01', // Toussaint
  '2025-11-11', // Armistice 1918
  '2025-12-25', // Noël
]
