// src/lib/email/order-delivered.tsx
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

interface OrderDeliveredEmailProps {
  orderNumber: string
  customerName: string
  deliveredAt: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const OrderDeliveredEmail = ({
  orderNumber = 'BR-2025-0001',
  customerName = 'Marie',
  deliveredAt = 'mercredi 16 octobre à 14h32',
}: OrderDeliveredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre commande #{orderNumber} a été livrée</Preview>
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
          <Heading style={h1}>C'est arrivé {customerName} ! 🎉</Heading>
          <Text style={text}>Votre commande a été livrée avec succès.</Text>

          {/* Info livraison */}
          <Section style={deliverySection}>
            <Text style={deliveryLabel}>Livrée le</Text>
            <Text style={deliveryValue}>{deliveredAt}</Text>
            {/* ✅ CORRECTION ICI */}
            <Text style={orderNumberStyle}>Commande #{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          {/* Satisfait ? */}
          <Section style={satisfactionSection}>
            <Heading as="h2" style={h2}>
              Satisfaite de votre achat ?
            </Heading>
            <Text style={satisfactionText}>
              Nous serions ravis de connaître votre avis sur cette commande.
              Votre retour nous aide à nous améliorer.
            </Text>
            <Section style={ctaSection}>
              <Button
                style={button}
                href={`${baseUrl}/account/orders/${orderNumber}/review`}
              >
                Laisser un avis
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Retour */}
          <Section>
            <Heading as="h2" style={h2}>
              Un problème avec votre commande ?
            </Heading>
            <Text style={returnText}>
              Vous avez 30 jours pour retourner vos articles si vous n'êtes pas
              entièrement satisfaite.
            </Text>
            <Section style={ctaSecondarySection}>
              <Button style={buttonSecondary} href={`${baseUrl}/returns`}>
                Retourner un article
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Partage */}
          <Section style={shareSection}>
            <Text style={shareText}>
              Partagez votre style avec la communauté
            </Text>
            <Text style={shareHashtag}>#BlancheRenaudin</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${baseUrl}/contact`} style={link}>
                Nous contacter
              </Link>
              {' · '}
              <Link href={`${baseUrl}/account/orders`} style={link}>
                Mes commandes
              </Link>
              {' · '}
              <Link href={`${baseUrl}/returns`} style={link}>
                Retours
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

export default OrderDeliveredEmail

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
  textAlign: 'center' as const,
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const deliverySection = {
  backgroundColor: '#f0f8f0',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const deliveryLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '500',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const deliveryValue = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 16px',
}

// ✅ AJOUT DU STYLE MANQUANT
const orderNumberStyle = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
}

const hr = {
  borderColor: '#e6e6e6',
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '32px 0',
}

const satisfactionSection = {
  textAlign: 'center' as const,
}

const satisfactionText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
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

const returnText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const ctaSecondarySection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const buttonSecondary = {
  backgroundColor: '#ffffff',
  border: '2px solid #000000',
  borderRadius: '4px',
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  lineHeight: '1',
  padding: '14px 32px',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
  display: 'inline-block',
}

const shareSection = {
  textAlign: 'center' as const,
  padding: '32px',
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
}

const shareText = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const shareHashtag = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: '0',
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
