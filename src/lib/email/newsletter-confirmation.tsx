// src/lib/email/newsletter-confirmation.tsx
import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
  Img,
} from '@react-email/components'
import { EMAIL_CONFIG } from './utils' // ✅ AJOUTÉ

interface NewsletterConfirmationProps {
  firstName?: string
  confirmUrl: string
}

export default function NewsletterConfirmation({
  firstName,
  confirmUrl,
}: NewsletterConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo PNG (pas SVG !) */}
          <Section style={header}>
            <Img
              src={EMAIL_CONFIG.logoUrl} // ✅ CHANGÉ : PNG au lieu de SVG
              alt={EMAIL_CONFIG.brandName}
              width="200"
              height="80"
              style={logo}
            />
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={title}>
              {firstName ? `hello ${firstName},` : 'hello,'}
            </Text>

            <Text style={paragraph}>
              thank you for your interest in our newsletter.
            </Text>

            <Text style={paragraph}>
              to complete your subscription and receive our exclusive updates,
              please confirm your email address by clicking the button below:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={confirmUrl}>
                confirm subscription
              </Button>
            </Section>

            <Text style={paragraph}>
              or copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{confirmUrl}</Text>

            <Hr style={divider} />

            <Text style={footer}>this link is valid for 24 hours.</Text>

            <Text style={footer}>
              if you didn&apos;t request to receive our newsletter, you can
              safely ignore this email.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © 2025 blanche renaudin. all rights reserved.
            </Text>
            <Text style={footerText}>
              <Link
                href="https://www.blancherenaudin.com/privacy"
                style={footerLink}
              >
                privacy policy
              </Link>
              {' | '}
              <Link
                href="https://www.instagram.com/the.blancherenaudin"
                style={footerLink}
              >
                instagram
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles (minimalist Jacquemus style)
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
}

const header = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  display: 'block',
  maxWidth: '200px', // ✅ AJOUTÉ pour cohérence
  height: 'auto', // ✅ AJOUTÉ
}

const content = {
  padding: '20px 40px 40px',
}

const title = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#000000',
  marginBottom: '16px',
  textTransform: 'lowercase' as const,
  letterSpacing: '0.05em',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#333333',
  marginBottom: '16px',
  letterSpacing: '0.02em',
  textTransform: 'lowercase' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '0',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
  letterSpacing: '0.15em',
  textTransform: 'lowercase' as const,
}

const linkText = {
  fontSize: '12px',
  color: '#666666',
  wordBreak: 'break-all' as const,
  marginTop: '8px',
}

const divider = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
}

const footer = {
  fontSize: '13px',
  color: '#666666',
  lineHeight: '1.5',
  marginBottom: '8px',
  textTransform: 'lowercase' as const,
}

const footerSection = {
  padding: '20px 40px',
  backgroundColor: '#f9f9f9',
  borderTop: '1px solid #e6e6e6',
}

const footerText = {
  fontSize: '12px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '4px 0',
  textTransform: 'lowercase' as const,
}

const footerLink = {
  color: '#666666',
  textDecoration: 'underline',
}
