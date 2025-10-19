// src/lib/newsletter/render.ts

import { render } from '@react-email/render'
import { NewsletterCampaignEmail } from '@/lib/email/newsletter-campaign'
import { generateNewsletterLink, generateUnsubscribeLink } from './utils'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface Campaign {
  id: string
  utm_campaign: string
  subject: string
  content: {
    hero_image_url?: string
    title: string
    subtitle?: string
    cta_text: string
    cta_link: string
    products: Array<{
      id: string
      position: number
    }>
  }
}

interface Subscriber {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

/**
 * Génère le HTML complet d'un email de campagne newsletter
 * avec tous les liens UTM et les produits enrichis
 */
export async function renderNewsletterCampaignEmail(
  campaign: Campaign,
  subscriber: Subscriber
): Promise<string> {
  try {
    console.log(
      `📧 Rendering email for campaign ${campaign.id} to ${subscriber.email}`
    )

    // 1. Récupérer les détails des produits depuis la DB
    const productIds = campaign.content.products.map((p) => p.id)

    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select(
        `
        id,
        name,
        price,
        slug,
        product_images!product_images_product_id_fkey(image_url:storage_original, is_primary, sort_order)
      `
      )
      .in('id', productIds)

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      throw productsError
    }

    if (!productsData || productsData.length === 0) {
      throw new Error('No products found for campaign')
    }

    console.log(`✅ Found ${productsData.length} products`)

    // 2. Mapper les produits avec leurs images et positions
    const productsMap = new Map(productsData.map((p) => [p.id, p]))

    const enrichedProducts = await Promise.all(
      campaign.content.products.map(async (campaignProduct) => {
        const product = productsMap.get(campaignProduct.id)
        if (!product) {
          console.warn(`⚠️ Product ${campaignProduct.id} not found`)
          return null
        }

        // Récupérer l'image principale
        const primaryImage = product.product_images?.find(
          (img: any) => img.is_primary
        )
        const imageUrl =
          primaryImage?.image_url || product.product_images?.[0]?.image_url

        if (!imageUrl) {
          console.warn(`⚠️ No image found for product ${product.id}`)
          return null
        }

        // ✅ CORRECTION : Générer signed URL pour l'image (AWAIT ajouté)
        const { data: signedData } = await supabaseAdmin.storage
          .from('product-images')
          .createSignedUrl(imageUrl, 60 * 60 * 24 * 7) // 7 jours

        const imagePublicUrl = signedData?.signedUrl || ''

        // Générer lien produit avec UTM
        const productLink = generateNewsletterLink(
          `/product/${product.id}`,
          campaign.utm_campaign,
          subscriber.id,
          `product-grid-item-${campaignProduct.position}`
        )

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: imagePublicUrl,
          link: productLink,
        }
      })
    )

    // ✅ Filtrer les null après Promise.all
    const validProducts = enrichedProducts.filter(Boolean)

    if (validProducts.length === 0) {
      throw new Error('No valid products after enrichment')
    }

    console.log(
      `✅ Enriched ${validProducts.length} products with images and UTM links`
    )

    // 3. Générer le lien CTA avec UTM
    const ctaLink = generateNewsletterLink(
      campaign.content.cta_link,
      campaign.utm_campaign,
      subscriber.id,
      'hero-cta'
    )

    // 4. Générer le lien de désabonnement
    const unsubscribeLink = generateUnsubscribeLink(subscriber.id)

    // 5. Rendre le template React en HTML
    const html = render(
      NewsletterCampaignEmail({
        campaign: {
          subject: campaign.subject,
          content: {
            ...campaign.content,
            cta_link: ctaLink,
            products: validProducts as any,
          },
        },
        subscriber: {
          email: subscriber.email,
          first_name: subscriber.first_name,
        },
        unsubscribeLink,
      })
    )

    console.log('✅ Email HTML rendered successfully')

    return html
  } catch (error) {
    console.error('❌ Error rendering newsletter email:', error)
    throw error
  }
}

/**
 * Génère une version preview (sans subscriber spécifique)
 * Utilisé pour les emails de test et la preview dans l'admin
 */
export async function renderNewsletterPreview(
  campaign: Campaign,
  testEmail: string = 'preview@example.com'
): Promise<string> {
  const mockSubscriber: Subscriber = {
    id: 'preview-subscriber-id',
    email: testEmail,
    first_name: 'Prénom',
    last_name: 'Nom',
  }

  return renderNewsletterCampaignEmail(campaign, mockSubscriber)
}
