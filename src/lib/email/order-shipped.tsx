// src/lib/email/order-shipped.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'
import { EMAIL_CONFIG } from './utils'
interface OrderShippedEmailProps {
  orderNumber: string
  customerName: string
  trackingNumber: string
  carrier: string
  trackingUrl: string
  estimatedDelivery: string
}

export const OrderShippedEmail = ({
  orderNumber,
  customerName,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery,
}: OrderShippedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has been shipped</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
           <Section
                      style={{
                        textAlign: 'center',
                        marginBottom: '32px',
                      }}
                    >
                      <Img
                        src={EMAIL_CONFIG.logoUrl}
                        width={EMAIL_CONFIG.logoWidth}
                        height={EMAIL_CONFIG.logoHeight}
                        alt={EMAIL_CONFIG.brandName}
                        style={{ margin: '0 auto' }}
                      />
                    </Section>

          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Your order is on its way!</Heading>
            <Text style={subtitle}>
              Hi {customerName}, your order has been shipped.
            </Text>
          </Section>

          {/* Order info */}
          <Section style={infoBox}>
            <Text style={infoLabel}>Order number</Text>
            <Text style={infoValue}>#{orderNumber}</Text>

            <Hr style={infoHr} />

            <Text style={infoLabel}>Tracking number</Text>
            <Text style={infoValue}>{trackingNumber}</Text>

            <Hr style={infoHr} />

            <Text style={infoLabel}>Carrier</Text>
            <Text style={infoValue}>{carrier}</Text>

            <Hr style={infoHr} />

            <Text style={infoLabel}>Estimated delivery</Text>
            <Text style={infoValue}>{estimatedDelivery}</Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={trackingUrl} style={button}>
              Track your package
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions?{' '}
              <Link href="mailto:contact@blancherenaudin.com" style={link}>
                Contact us
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href="https://blancherenaudin.com" style={link}>
                blancherenaudin.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  margin: '0 auto',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#000000',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px',
  lineHeight: '1.2',
}

const subtitle = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
}

const infoLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px',
}

const infoValue = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
}

const infoHr = {
  borderColor: '#e5e5e5',
  margin: '16px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
}

const footer = {
  textAlign: 'center' as const,
}

const footerText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '4px 0',
}

const link = {
  color: '#000000',
  textDecoration: 'underline',
}
