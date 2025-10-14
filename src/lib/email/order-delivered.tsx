// src/lib/email/order-delivered.tsx
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
  Hr,
} from '@react-email/components'
import { EMAIL_CONFIG } from './utils'

interface OrderDeliveredEmailProps {
  orderNumber: string
  customerName: string
  deliveredAt: string
}

export const OrderDeliveredEmail = ({
  orderNumber,
  customerName,
  deliveredAt,
}: OrderDeliveredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} has been delivered</Preview>
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

          {/* Icon */}
          <Section style={iconSection}>
            <div style={iconCircle}>✓</div>
          </Section>

          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Delivered!</Heading>
            <Text style={subtitle}>
              Hi {customerName}, your order has been successfully delivered.
            </Text>
          </Section>

          {/* Info */}
          <Section style={infoBox}>
            <Text style={infoLabel}>Order number</Text>
            <Text style={infoValue}>#{orderNumber}</Text>

            <Hr style={infoHr} />

            <Text style={infoLabel}>Delivered on</Text>
            <Text style={infoValue}>{deliveredAt}</Text>
          </Section>

          {/* Message */}
          <Section style={messageSection}>
            <Text style={message}>
              We hope you love your new pieces! If you have any questions or
              concerns, please don't hesitate to reach out to us.
            </Text>
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
  marginBottom: '24px',
}

const logo = {
  margin: '0 auto',
}

const iconSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const iconCircle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '32px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const messageSection = {
  marginBottom: '32px',
}

const message = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
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
