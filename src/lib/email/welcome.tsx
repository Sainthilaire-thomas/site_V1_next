// src/lib/email/welcome.tsx
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

interface WelcomeEmailProps {
  firstName: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const WelcomeEmail = ({ firstName = 'Marie' }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue chez Blanche Renaudin</Preview>
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
          <Heading style={h1}>Bienvenue {firstName}</Heading>
          <Text style={text}>
            Nous sommes ravis de vous accueillir dans l'univers Blanche
            Renaudin. Découvrez une mode contemporaine, élégante et
            intemporelle.
          </Text>

          {/* Image hero */}
          <Section style={heroSection}>
            <Img
              src={`${baseUrl}/email-welcome-hero.jpg`}
              width="560"
              alt="Collection Blanche Renaudin"
              style={heroImage}
            />
          </Section>

          <Hr style={hr} />

          {/* Avantages */}
          <Section>
            <Heading as="h2" style={h2}>
              Vos avantages
            </Heading>

            <table style={benefitsTable}>
              <tr>
                <td style={benefitCell}>
                  <Text style={benefitIcon}>🚚</Text>
                  <Text style={benefitTitle}>Livraison offerte</Text>
                  <Text style={benefitText}>
                    Dès 150€ d'achat en France métropolitaine
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={benefitCell}>
                  <Text style={benefitIcon}>↩️</Text>
                  <Text style={benefitTitle}>Retours gratuits</Text>
                  <Text style={benefitText}>30 jours pour changer d'avis</Text>
                </td>
              </tr>
              <tr>
                <td style={benefitCell}>
                  <Text style={benefitIcon}>✨</Text>
                  <Text style={benefitTitle}>Offres exclusives</Text>
                  <Text style={benefitText}>
                    Accès prioritaire aux nouveautés et ventes privées
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Heading as="h2" style={h2}>
              Prête à découvrir la collection ?
            </Heading>
            <Button style={button} href={`${baseUrl}/products`}>
              Explorer la collection
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Categories */}
          <Section>
            <Heading as="h2" style={h2}>
              Nos univers
            </Heading>

            <table style={categoriesTable}>
              <tr>
                <td style={categoryCell}>
                  <Link href={`${baseUrl}/products/tops`} style={categoryLink}>
                    <Img
                      src={`${baseUrl}/category-tops.jpg`}
                      width="170"
                      height="227"
                      alt="Hauts"
                      style={categoryImage}
                    />
                    <Text style={categoryName}>Hauts</Text>
                  </Link>
                </td>
                <td style={categoryCell}>
                  <Link
                    href={`${baseUrl}/products/bottoms`}
                    style={categoryLink}
                  >
                    <Img
                      src={`${baseUrl}/category-bottoms.jpg`}
                      width="170"
                      height="227"
                      alt="Bas"
                      style={categoryImage}
                    />
                    <Text style={categoryName}>Bas</Text>
                  </Link>
                </td>
                <td style={categoryCell}>
                  <Link
                    href={`${baseUrl}/products/accessories`}
                    style={categoryLink}
                  >
                    <Img
                      src={`${baseUrl}/category-accessories.jpg`}
                      width="170"
                      height="227"
                      alt="Accessoires"
                      style={categoryImage}
                    />
                    <Text style={categoryName}>Accessoires</Text>
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* Social */}
          <Section style={socialSection}>
            <Text style={socialText}>Suivez-nous</Text>
            <Text style={socialHashtag}>#BlancheRenaudin</Text>
            <Section style={socialLinks}>
              <Link
                href="https://instagram.com/blancherenaudin"
                style={socialLink}
              >
                Instagram
              </Link>
              {' · '}
              <Link
                href="https://pinterest.com/blancherenaudin"
                style={socialLink}
              >
                Pinterest
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${baseUrl}/about`} style={link}>
                Notre histoire
              </Link>
              {' · '}
              <Link href={`${baseUrl}/impact`} style={link}>
                Engagement
              </Link>
              {' · '}
              <Link href={`${baseUrl}/contact`} style={link}>
                Contact
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

export default WelcomeEmail

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

const heroSection = {
  margin: '32px 0',
}

const heroImage = {
  width: '100%',
  borderRadius: '8px',
}

const hr = {
  borderColor: '#e6e6e6',
  borderStyle: 'solid',
  borderWidth: '1px',
  margin: '32px 0',
}

const benefitsTable = {
  width: '100%',
}

const benefitCell = {
  textAlign: 'center' as const,
  padding: '16px 0',
}

const benefitIcon = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const benefitTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const benefitText = {
  color: '#666666',
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

const categoriesTable = {
  width: '100%',
}

const categoryCell = {
  padding: '8px',
  textAlign: 'center' as const,
}

const categoryLink = {
  textDecoration: 'none',
}

const categoryImage = {
  borderRadius: '4px',
  width: '100%',
}

const categoryName = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  margin: '8px 0 0',
  textTransform: 'uppercase' as const,
}

const socialSection = {
  textAlign: 'center' as const,
  padding: '32px',
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
}

const socialText = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const socialHashtag = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: '0 0 16px',
}

const socialLinks = {
  margin: '16px 0 0',
}

const socialLink = {
  color: '#000000',
  textDecoration: 'underline',
  fontSize: '14px',
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
