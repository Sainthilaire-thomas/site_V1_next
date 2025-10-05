// src/lib/email/order-confirmation.tsx
import type { Database } from '@/lib/database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']

// Type pour l'adresse (depuis le JSONB)
interface ShippingAddress {
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  postal_code: string
  country: string
}

// Type étendu pour l'email (avec items inclus)
interface OrderWithItems extends Order {
  items?: OrderItem[]
}

export function OrderConfirmationEmail({ order }: { order: OrderWithItems }) {
  const shippingAddr = order.shipping_address as unknown as ShippingAddress

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 40px 0; border-bottom: 1px solid #eee; }
          .logo { font-size: 24px; font-weight: 300; letter-spacing: -0.5px; }
          .order-number { color: #666; margin-top: 10px; font-size: 14px; }
          .section { margin: 30px 0; }
          .items { border: 1px solid #eee; border-radius: 4px; overflow: hidden; }
          .item { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
          .item:last-child { border-bottom: none; }
          .totals { margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
          .total-final { font-size: 18px; font-weight: 600; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
          .address { background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">.blancherenaudin</div>
            <div class="order-number">Commande ${order.order_number}</div>
          </div>

          <!-- Message de confirmation -->
          <div class="section">
            <h2>Merci pour votre commande !</h2>
            <p>Bonjour ${order.customer_name || 'Client'},</p>
            <p>Nous avons bien reçu votre commande et la préparons avec soin.</p>
            <p>Vous recevrez un email de confirmation dès l'expédition de votre colis.</p>
          </div>

          <!-- Articles -->
          <div class="section">
            <h3>Votre commande</h3>
            <div class="items">
              ${
                order.items
                  ?.map(
                    (item) => `
                <div class="item">
                  <div>
                    <strong>${item.product_name || 'Produit'}</strong>
                    ${item.variant_value ? `<div style="font-size: 13px; color: #666;">${item.variant_name}: ${item.variant_value}</div>` : ''}
                    <div style="font-size: 13px; color: #666;">Quantité: ${item.quantity}</div>
                  </div>
                  <div>${Number(item.total_price).toFixed(2)}€</div>
                </div>
              `
                  )
                  .join('') || ''
              }
            </div>

            <!-- Totaux -->
            <div class="totals">
              <div class="total-row">
                <span>Sous-total</span>
                <span>${Number(order.total_amount - (order.shipping_amount || 0) - (order.tax_amount || 0)).toFixed(2)}€</span>
              </div>
              <div class="total-row">
                <span>Livraison</span>
                <span>${(order.shipping_amount || 0) === 0 ? 'Gratuite' : Number(order.shipping_amount).toFixed(2) + '€'}</span>
              </div>
              <div class="total-row">
                <span>TVA</span>
                <span>${Number(order.tax_amount || 0).toFixed(2)}€</span>
              </div>
              <div class="total-row total-final">
                <span>Total</span>
                <span>${Number(order.total_amount).toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <!-- Adresses -->
          <div class="section">
            <h3>Informations de livraison</h3>
            <div class="address">
              <strong>Adresse de livraison</strong><br>
              ${shippingAddr?.first_name || ''} ${shippingAddr?.last_name || ''}<br>
              ${shippingAddr?.address_line_1 || ''}<br>
              ${shippingAddr?.address_line_2 ? shippingAddr.address_line_2 + '<br>' : ''}
              ${shippingAddr?.postal_code || ''} ${shippingAddr?.city || ''}<br>
              ${shippingAddr?.country || ''}
            </div>
            ${order.shipping_method ? `<p><strong>Méthode:</strong> ${order.shipping_method}</p>` : ''}
          </div>

          <!-- CTA -->
          <div class="section" style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}" class="button">
              Suivre ma commande
            </a>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Des questions ? Contactez-nous à hello@blancherenaudin.com</p>
            <p>.blancherenaudin - Mode contemporaine</p>
          </div>
        </div>
      </body>
    </html>
  `
}
