// src/lib/email/order-shipped.tsx
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

interface OrderShippedEmailProps {
  orderNumber: string
  customerName: string
  trackingNumber: string
  carrier: string
  trackingUrl: string
  estimatedDelivery?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const OrderShippedEmail = ({
  orderNumber = 'BR-2025-0001',
  customerName = 'Marie',
  trackingNumber = '3SBRCP00012345',
  carrier = 'Colissimo',
  trackingUrl = 'https://www.laposte.fr/outils/suivre-vos-envois?code=3SBRCP00012345',
  estimatedDelivery = 'mercredi 16 octobre',
}: OrderShippedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre commande #{orderNumber} est en route</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-blancherenaudin.png`}
              width="200"
              alt="Blanche Renaudin"
              style={logo}
            />
          </Section>

          {/* Message principal */}
          <Heading style={h1}>Bonne nouvelle {customerName} !</Heading>
          <Text style={text}>
            Votre commande est en route et sera bientôt entre vos mains.
          </Text>

          {/* Numéro de commande */}
          <Section style={orderNumberSection}>
            <Text style={orderNumberLabel}>Numéro de commande</Text>
            <Text style={orderNumberValue}>#{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          {/* Informations de suivi */}
          <Section style={trackingSection}>
            <Heading as="h2" style={h2}>
              Informations de suivi
            </Heading>

            <table style={trackingTable}>
              <tr>
                <td style={trackingLabel}>Transporteur</td>
                <td style={trackingValue}>{carrier}</td>
              </tr>
              <tr>
                <td style={trackingLabel}>Numéro de suivi</td>
                <td style={trackingValue}>{trackingNumber}</td>
              </tr>
              {estimatedDelivery && (
                <tr>
                  <td style={trackingLabel}>Livraison estimée</td>
                  <td style={trackingValue}>{estimatedDelivery}</td>
                </tr>
              )}
            </table>

            {/* CTA Tracking */}
            <Section style={ctaSection}>
              <Button style={button} href={trackingUrl}>
                Suivre mon colis
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Conseils */}
          <Section>
            <Heading as="h2" style={h2}>
              À savoir
            </Heading>
            <Text style={bulletPoint}>
              • Vous recevrez un email lorsque votre colis sera livré
            </Text>
            <Text style={bulletPoint}>
              • Le transporteur peut demander une signature à la livraison
            </Text>
            <Text style={bulletPoint}>
              • En cas d'absence, un avis de passage sera déposé
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Questions */}
          <Section style={questionSection}>
            <Text style={questionText}>Une question sur votre livraison ?</Text>
            <Link href={`${baseUrl}/contact`} style={link}>
              Contactez notre service client
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${baseUrl}/account/orders`} style={link}>
                Mes commandes
              </Link>
              {' · '}
              <Link href={`${baseUrl}/shipping`} style={link}>
                Politique de livraison
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

export default OrderShippedEmail

// Styles
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

const trackingSection = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const trackingTable = {
  width: '100%',
  marginBottom: '24px',
}

const trackingLabel = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  padding: '8px 0',
  width: '150px',
}

const trackingValue = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.6',
  padding: '8px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '16px 0 0',
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

const bulletPoint = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '8px 0',
  paddingLeft: '8px',
}

const questionSection = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
}

const questionText = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 12px',
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
