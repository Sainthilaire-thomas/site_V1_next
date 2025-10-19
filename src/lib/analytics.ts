// src/lib/analytics.ts
// ⚡ Custom Analytics System - VERSION WITH UTM SUPPORT
// Tracks user behavior without cookies (GDPR-friendly)

import { createBrowserClient } from './supabase-browser'
import { v4 as uuidv4 } from 'uuid'

// ============================================
// 🔧 CONFIGURATION
// ============================================

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const GEO_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const ENABLE_GEOLOCATION = true // Set to false to disable

// ============================================
// 📊 TYPES
// ============================================

interface AnalyticsEvent {
  event_type: string
  page_path?: string
  page_title?: string
  referrer?: string
  session_id: string
  user_id?: string
  device_type?: string
  screen_resolution?: string
  browser?: string
  os?: string
  country?: string
  country_code?: string
  city?: string
  timezone?: string
  language?: string

  // ⭐ NOUVEAU : Paramètres UTM
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null

  page_load_time?: number
  time_on_page?: number
  product_id?: string
  order_id?: string
  revenue?: number
  cart_value?: number
  properties?: Record<string, any>
}

interface DeviceInfo {
  device_type: 'mobile' | 'tablet' | 'desktop'
  screen_resolution: string
  browser: string
  os: string
  timezone: string
  language: string
}

interface GeoLocation {
  country?: string
  country_code?: string
  city?: string
}

// ============================================
// 💾 CACHE & SESSION MANAGEMENT
// ============================================

let deviceInfoCache: DeviceInfo | null = null
let geoLocationCache: GeoLocation | null = null
let preloadPromise: Promise<void> | null = null

function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  try {
    const stored = localStorage.getItem('analytics_session')
    if (stored) {
      const { id, timestamp } = JSON.parse(stored)
      const now = Date.now()

      // Check if session is still valid
      if (now - timestamp < SESSION_TIMEOUT) {
        // Update timestamp to keep session alive
        localStorage.setItem(
          'analytics_session',
          JSON.stringify({ id, timestamp: now })
        )
        return id
      }
    }

    // Create new session
    const newId = uuidv4()
    localStorage.setItem(
      'analytics_session',
      JSON.stringify({ id: newId, timestamp: Date.now() })
    )
    return newId
  } catch (error) {
    // If localStorage fails, generate temporary session ID
    console.debug('Failed to access localStorage:', error)
    return `temp-${uuidv4()}`
  }
}

function getDeviceInfo(): DeviceInfo {
  if (deviceInfoCache) return deviceInfoCache

  const ua = navigator.userAgent
  const width = window.screen.width
  const height = window.screen.height

  // Detect device type
  let device_type: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device_type = 'tablet'
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    device_type = 'mobile'
  }

  // Detect browser
  let browser = 'Unknown'
  if (ua.indexOf('Firefox') > -1) browser = 'Firefox'
  else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet'
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera'
  else if (ua.indexOf('Trident') > -1) browser = 'IE'
  else if (ua.indexOf('Edge') > -1) browser = 'Edge'
  else if (ua.indexOf('Chrome') > -1) browser = 'Chrome'
  else if (ua.indexOf('Safari') > -1) browser = 'Safari'

  // Detect OS
  let os = 'Unknown'
  if (ua.indexOf('Win') > -1) os = 'Windows'
  else if (ua.indexOf('Mac') > -1) os = 'MacOS'
  else if (ua.indexOf('Linux') > -1) os = 'Linux'
  else if (ua.indexOf('Android') > -1) os = 'Android'
  else if (ua.indexOf('like Mac') > -1) os = 'iOS'

  deviceInfoCache = {
    device_type,
    screen_resolution: `${width}x${height}`,
    browser,
    os,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  }

  return deviceInfoCache
}

async function fetchGeolocation(): Promise<GeoLocation> {
  if (!ENABLE_GEOLOCATION) return {}
  if (geoLocationCache) return geoLocationCache

  // Check cache
  try {
    const cached = localStorage.getItem('analytics_geo_cache')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < GEO_CACHE_DURATION) {
        geoLocationCache = data
        return data
      }
    }
  } catch (error) {
    console.debug('Failed to read geo cache:', error)
  }

  // Fetch from API
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const geo: GeoLocation = {
        country: data.country_name,
        country_code: data.country_code,
        city: data.city,
      }

      // Cache the result
      try {
        localStorage.setItem(
          'analytics_geo_cache',
          JSON.stringify({
            data: geo,
            timestamp: Date.now(),
          })
        )
      } catch (error) {
        console.debug('Failed to cache geo data:', error)
      }

      geoLocationCache = geo
      return geo
    }
  } catch (error) {
    console.debug('Geolocation fetch failed (timeout or error):', error)
  }

  return {}
}

// ============================================
// ⭐ NOUVELLES FONCTIONS UTM
// ============================================

/**
 * Extraire les paramètres UTM de l'URL
 */
function extractUtmParams(): Record<string, string | null> {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
}

/**
 * Sauvegarder les UTM en sessionStorage pour attribution multi-page
 */
function saveUtmToSession() {
  if (typeof window === 'undefined') return
  
  const utm = extractUtmParams()
  
  // Sauvegarder seulement si au moins un paramètre UTM est présent
  if (Object.values(utm).some(v => v !== null)) {
    sessionStorage.setItem('analytics_utm', JSON.stringify(utm))
    console.log('📊 UTM sauvegardés:', utm)
  }
}

/**
 * Récupérer les UTM sauvegardés
 */
function getSavedUtm(): Record<string, string | null> {
  if (typeof window === 'undefined') return {}
  
  const saved = sessionStorage.getItem('analytics_utm')
  if (!saved) return {}
  
  try {
    return JSON.parse(saved)
  } catch {
    return {}
  }
}

// ============================================
// 🚀 PRELOAD FUNCTION (called during homepage animation)
// ⭐ MODIFIÉE pour sauvegarder les UTM
// ============================================

export function preloadAnalyticsData(): Promise<void> {
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    try {
      console.log('🚀 Preloading analytics data...')

      // ⭐ NOUVEAU : Sauvegarder les UTM dès l'arrivée
      saveUtmToSession()

      // Preload device info (instant)
      getDeviceInfo()

      // Preload geolocation (async)
      if (ENABLE_GEOLOCATION) {
        await fetchGeolocation()
      }

      console.log('✅ Analytics data preloaded')
    } catch (error) {
      console.debug('Analytics preload warning:', error)
    }
  })()

  return preloadPromise
}

// ============================================
// 📤 CORE TRACKING FUNCTION
// ⭐ MODIFIÉE pour inclure les UTM
// ============================================

async function sendEvent(event: Partial<AnalyticsEvent>): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const supabase = createBrowserClient()
    const deviceInfo = getDeviceInfo()
    const geo = await fetchGeolocation()

    // ⭐ NOUVEAU : Récupérer les UTM sauvegardés
    const utmParams = getSavedUtm()

    const eventData: AnalyticsEvent = {
      session_id: getSessionId(),
      ...deviceInfo,
      ...geo,

      // ⭐ NOUVEAU : Inclure les paramètres UTM
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      utm_content: utmParams.utm_content || null,
      utm_term: utmParams.utm_term || null,

      ...event,
      event_type: event.event_type || 'custom',
    }

    console.log('📊 Tracking event:', eventData.event_type)

    // ⭐ Log UTM si présents
    if (utmParams.utm_campaign) {
      console.log('🎯 UTM Campaign:', utmParams.utm_campaign)
    }

    console.log('📤 Sending to Supabase:', eventData)

    const { error } = await supabase.from('analytics_events').insert(eventData)

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Event tracked successfully')
  } catch (error) {
    // Don't throw - analytics should never break the app
    console.debug('Analytics tracking failed:', error)
  }
}

// ============================================
// 📊 PUBLIC API - PAGE TRACKING
// ============================================

export async function trackPageView(path: string): Promise<void> {
  const referrer =
    typeof document !== 'undefined' && document.referrer
      ? new URL(document.referrer).hostname === window.location.hostname
        ? 'internal'
        : document.referrer
      : 'direct'

  await sendEvent({
    event_type: 'pageview',
    page_path: path,
    page_title: document.title,
    referrer,
  })
}

export async function trackTimeOnPage(
  path: string,
  seconds: number
): Promise<void> {
  await sendEvent({
    event_type: 'time_on_page',
    page_path: path,
    time_on_page: seconds,
  })
}

// ============================================
// 🛒 E-COMMERCE TRACKING
// ============================================

export async function trackAddToCart(
  productId: string,
  price: number,
  quantity: number = 1,
  properties?: Record<string, any>
): Promise<void> {
  await sendEvent({
    event_type: 'add_to_cart',
    product_id: productId,
    cart_value: price * quantity,
    properties: {
      quantity,
      ...properties,
    },
  })
}

export async function trackRemoveFromCart(
  productId: string,
  price: number,
  quantity: number = 1,
  properties?: Record<string, any>
): Promise<void> {
  await sendEvent({
    event_type: 'remove_from_cart',
    product_id: productId,
    cart_value: price * quantity,
    properties: {
      quantity,
      ...properties,
    },
  })
}

export async function trackUpdateCartQuantity(
  productId: string,
  oldQuantity: number,
  newQuantity: number,
  price: number
): Promise<void> {
  await sendEvent({
    event_type: 'update_cart_quantity',
    product_id: productId,
    cart_value: price * newQuantity,
    properties: {
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      action: newQuantity > oldQuantity ? 'increase' : 'decrease',
    },
  })
}

export async function trackViewCart(
  totalValue: number,
  itemsCount: number,
  totalQuantity: number
): Promise<void> {
  await sendEvent({
    event_type: 'view_cart',
    cart_value: totalValue,
    properties: {
      items_count: itemsCount,
      total_quantity: totalQuantity,
    },
  })
}

export async function trackClearCart(
  totalValue: number,
  itemsCount: number,
  totalQuantity: number
): Promise<void> {
  await sendEvent({
    event_type: 'clear_cart',
    cart_value: totalValue,
    properties: {
      items_count: itemsCount,
      total_quantity: totalQuantity,
    },
  })
}

export async function trackCheckoutStarted(
  cartItems: any[],
  totalValue: number
): Promise<void> {
  await sendEvent({
    event_type: 'begin_checkout',
    cart_value: totalValue,
    properties: {
      items_count: cartItems.length,
      total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      items: cartItems.map((item) => ({
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    },
  })
}

export async function trackPurchaseCompleted(
  orderId: string,
  revenue: number,
  cartItems: any[],
  paymentMethod: string
): Promise<void> {
  await sendEvent({
    event_type: 'purchase',
    order_id: orderId,
    revenue,
    properties: {
      items_count: cartItems.length,
      total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      payment_method: paymentMethod,
      items: cartItems.map((item) => ({
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  })
}

export async function trackCheckoutFailed(
  reason: string,
  cartValue: number,
  itemsCount: number
): Promise<void> {
  await sendEvent({
    event_type: 'checkout_failed',
    cart_value: cartValue,
    properties: {
      items_count: itemsCount,
      reason,
    },
  })
}

// ============================================
// 🔍 SEARCH & INTERACTIONS
// ============================================

export async function trackSearch(
  query: string,
  resultsCount: number
): Promise<void> {
  await sendEvent({
    event_type: 'search',
    properties: {
      query,
      results_count: resultsCount,
    },
  })
}

export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): Promise<void> {
  await sendEvent({
    event_type: eventName,
    properties,
  })
}
