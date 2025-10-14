// src/lib/email/password-reset.tsx
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

interface PasswordResetEmailProps {
  resetUrl: string
  expiresIn: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const PasswordResetEmail = ({
  resetUrl = `${baseUrl}/auth/reset-password?token=example`,
  expiresIn = '1 heure',
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe</Preview>
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
          <Heading style={h1}>Réinitialiser votre mot de passe</Heading>
          <Text style={text}>
            Vous avez demandé à réinitialiser le mot de passe de votre compte
            Blanche Renaudin.
          </Text>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={button} href={resetUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          {/* Info */}
          <Section style={infoSection}>
            <Text style={infoText}>
              Ce lien expirera dans <strong>{expiresIn}</strong>.
            </Text>
            <Text style={infoText}>
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans
              votre navigateur :
            </Text>
            <Text style={linkText}>{resetUrl}</Text>
          </Section>

          <Hr style={hr} />

          {/* Sécurité */}
          <Section style={securitySection}>
            <Heading as="h2" style={h2}>
              Vous n'avez pas demandé cette réinitialisation ?
            </Heading>
            <Text style={securityText}>
              Si vous n'avez pas demandé à réinitialiser votre mot de passe,
              vous pouvez ignorer cet email en toute sécurité. Votre mot de
              passe ne sera pas modifié.
            </Text>
            <Text style={securityText}>
              Pour des raisons de sécurité, nous vous recommandons de ne jamais
              partager votre mot de passe avec quiconque.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${baseUrl}/contact`} style={link}>
                Nous contacter
              </Link>
              {' · '}
              <Link href={`${baseUrl}/privacy`} style={link}>
                Confidentialité
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

export default PasswordResetEmail

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
  fontSize: '18px',
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

const infoSection = {
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const infoText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const linkText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#e6e6e6',
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '32px 0',
}

const securitySection = {
  backgroundColor: '#fff9e6',
  border: '1px solid #ffe066',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const securityText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.6',
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
