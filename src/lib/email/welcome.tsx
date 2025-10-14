// src/lib/email/welcome.tsx
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
interface WelcomeEmailProps {
  firstName: string
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Blanche Renaudin</Preview>
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
            <Heading style={h1}>Welcome {firstName}</Heading>
            <Text style={subtitle}>Thank you for joining our community.</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>
              We're delighted to have you with us. Discover our collections of
              contemporary, minimalist pieces designed in Paris.
            </Text>
            <Text style={text}>As a member, you'll enjoy:</Text>
            <ul style={list}>
              <li style={listItem}>Early access to new collections</li>
              <li style={listItem}>Exclusive promotions</li>
              <li style={listItem}>Style tips and inspiration</li>
            </ul>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button
              href="https://blancherenaudin.com/collections"
              style={button}
            >
              Explore collections
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

const content = {
  marginBottom: '32px',
}

const text = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const list = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  paddingLeft: '20px',
}

const listItem = {
  marginBottom: '8px',
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
