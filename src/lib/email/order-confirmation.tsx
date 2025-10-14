// src/lib/email/order-confirmation.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const OrderConfirmationEmail = ({
  orderNumber = 'BR-2025-0001',
  customerName = 'Marie',
  items = [
    {
      name: 'Robe longue noire',
      quantity: 1,
      price: 29500,
      imageUrl: undefined,
    },
  ],
  subtotal = 29500,
  shipping = 0,
  total = 29500,
  shippingAddress = {
    line1: '123 rue de la Mode',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
  },
}: OrderConfirmationEmailProps) => {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100)
  }

  return (
    <Html>
      <Head />
      <Preview>Merci pour votre commande #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header avec logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-blancherenaudin.png`}
              width="200"
              alt="Blanche Renaudin"
              style={logo}
            />
          </Section>

          {/* Message principal */}
          <Heading style={h1}>Merci {customerName}</Heading>
          <Text style={text}>
            Votre commande a été confirmée et sera bientôt expédiée.
          </Text>

          {/* Numéro de commande */}
          <Section style={orderNumberSection}>
            <Text style={orderNumberLabel}>Numéro de commande</Text>
            <Text style={orderNumberValue}>#{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          {/* Articles commandés */}
          <Section>
            <Heading as="h2" style={h2}>
              Votre commande
            </Heading>
            {items.map((item, index) => (
              <Section key={index} style={itemSection}>
                <table style={itemTable}>
                  <tr>
                    {item.imageUrl && (
                      <td style={itemImageCell}>
                        <Img
                          src={item.imageUrl}
                          width="80"
                          height="80"
                          alt={item.name}
                          style={itemImage}
                        />
                      </td>
                    )}
                    <td style={itemDetailsCell}>
                      <Text style={itemName}>{item.name}</Text>
                      <Text style={itemQuantity}>
                        Quantité: {item.quantity}
                      </Text>
                    </td>
                    <td style={itemPriceCell}>
                      <Text style={itemPrice}>{formatPrice(item.price)}</Text>
                    </td>
                  </tr>
                </table>
              </Section>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Totaux */}
          <Section style={totalsSection}>
            <table style={totalsTable}>
              <tr>
                <td style={totalLabel}>Sous-total</td>
                <td style={totalValue}>{formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td style={totalLabel}>Livraison</td>
                <td style={totalValue}>
                  {shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
                </td>
              </tr>
              <tr>
                <td style={totalLabelBold}>Total</td>
                <td style={totalValueBold}>{formatPrice(total)}</td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Adresse de livraison */}
          <Section>
            <Heading as="h2" style={h2}>
              Adresse de livraison
            </Heading>
            <Text style={address}>
              {shippingAddress.line1}
              {shippingAddress.line2 && (
                <>
                  <br />
                  {shippingAddress.line2}
                </>
              )}
              <br />
              {shippingAddress.postalCode} {shippingAddress.city}
              <br />
              {shippingAddress.country}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={button} href={`${baseUrl}/account/orders`}>
              Suivre ma commande
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Vous avez des questions ?{' '}
              <Link href={`${baseUrl}/contact`} style={link}>
                Contactez-nous
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/returns`} style={link}>
                Politique de retour
              </Link>
              {' · '}
              <Link href={`${baseUrl}/shipping`} style={link}>
                Livraison
              </Link>
            </Text>
            <Text style={footerTextSmall}>
              © 2025 Blanche Renaudin. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail

// Styles inspirés de Jacquemus - minimaliste et élégant
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#000000',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
  margin: '16px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: '600',
  letterSpacing: '0',
  lineHeight: '1.3',
  margin: '24px 0 16px',
  padding: '0',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const orderNumberSection = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const orderNumberLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '500',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const orderNumberValue = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: '0',
}

const hr = {
  borderColor: '#e6e6e6',
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '32px 0',
}

const itemSection = {
  margin: '16px 0',
}

const itemTable = {
  width: '100%',
}

const itemImageCell = {
  width: '80px',
  paddingRight: '16px',
  verticalAlign: 'top' as const,
}

const itemImage = {
  borderRadius: '4px',
  objectFit: 'cover' as const,
}

const itemDetailsCell = {
  verticalAlign: 'top' as const,
}

const itemName = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '1.4',
  margin: '0 0 4px',
}

const itemQuantity = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
}

const itemPriceCell = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  paddingLeft: '16px',
}

const itemPrice = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0',
  whiteSpace: 'nowrap' as const,
}

const totalsSection = {
  margin: '24px 0',
}

const totalsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const totalLabel = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  padding: '8px 0',
  textAlign: 'left' as const,
}

const totalValue = {
  color: '#000000',
  fontSize: '14px',
  lineHeight: '1.6',
  padding: '8px 0',
  textAlign: 'right' as const,
}

const totalLabelBold = {
  ...totalLabel,
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  paddingTop: '16px',
}

const totalValueBold = {
  ...totalValue,
  fontSize: '18px',
  fontWeight: '700',
  paddingTop: '16px',
}

const address = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  lineHeight: '1',
  padding: '16px 32px',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
  display: 'inline-block',
}

const footer = {
  borderTop: '1px solid #e6e6e6',
  marginTop: '32px',
  paddingTop: '32px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px',
}

const footerTextSmall = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '16px 0 0',
}

const link = {
  color: '#000000',
  textDecoration: 'underline',
}
