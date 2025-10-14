// src/lib/email/password-reset.tsx
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
interface PasswordResetEmailProps {
  resetUrl: string
  expiresIn: string
}

export const PasswordResetEmail = ({
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
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
            <Heading style={h1}>Reset your password</Heading>
            <Text style={subtitle}>You requested to reset your password</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>
              Click the button below to create a new password. This link will
              expire in <strong>{expiresIn}</strong>.
            </Text>
            <Text style={text}>
              If you didn't request a password reset, you can safely ignore this
              email.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={resetUrl} style={button}>
              Reset password
            </Button>
          </Section>

          {/* Security notice */}
          <Section style={noticeBox}>
            <Text style={noticeText}>
              🔒 For security reasons, never share this link with anyone.
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

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
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

const noticeBox = {
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '32px',
}

const noticeText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.5',
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
