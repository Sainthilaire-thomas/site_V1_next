// src/lib/email/newsletter-campaign.tsx

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  link: string // Déjà avec UTM
}

interface NewsletterCampaignEmailProps {
  campaign: {
    subject: string
    content: {
      hero_image_url?: string
      title: string
      subtitle?: string
      cta_text: string
      cta_link: string // Déjà avec UTM
      products: Product[]
    }
  }
  subscriber: {
    first_name?: string
    email: string
  }
  unsubscribeLink: string
}

/**
 * Template Email Newsletter - Style Jacquemus
 * Design minimaliste, typographie Archivo, espacement généreux
 */
export function NewsletterCampaignEmail({
  campaign,
  subscriber,
  unsubscribeLink,
}: NewsletterCampaignEmailProps) {
  const { content } = campaign
  const firstName = subscriber.first_name || ''

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo+Narrow:wght@400;500;600&display=swap');

          body {
            font-family: 'Archivo Narrow', Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }

          /* Logo */
          .logo-section {
            text-align: center;
            padding: 40px 0 20px 0;
          }

          .logo {
            width: 180px;
            height: auto;
          }

          /* Hero */
          .hero-section {
            position: relative;
            margin: 0;
            padding: 0;
          }

          .hero-image {
            width: 100%;
            height: auto;
            display: block;
          }

          /* Textes principaux */
          .title {
            font-family: 'Archivo Black', Arial, sans-serif;
            font-size: 42px;
            line-height: 1.1;
            letter-spacing: 0.05em;
            text-align: center;
            margin: 40px 20px 20px 20px;
            text-transform: uppercase;
            color: #000000;
          }

          .subtitle {
            font-size: 16px;
            line-height: 1.5;
            letter-spacing: 0.15em;
            text-align: center;
            color: #666666;
            margin: 0 20px 40px 20px;
            text-transform: lowercase;
          }

          /* CTA Principal */
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }

          .cta-button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            padding: 16px 48px;
            text-decoration: none;
            font-size: 13px;
            letter-spacing: 0.15em;
            text-transform: lowercase;
            border-radius: 0;
            font-weight: 500;
          }

          .cta-button:hover {
            background-color: #333333;
          }

          /* Grille Produits */
          .products-section {
            margin: 60px 20px;
          }

          .products-grid {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
          }

          .product-cell {
            width: 50%;
            padding: 10px;
            vertical-align: top;
          }

          .product-link {
            display: block;
            text-decoration: none;
          }

          .product-image {
            width: 100%;
            height: auto;
            display: block;
            margin-bottom: 12px;
          }

          .product-name {
            font-size: 13px;
            letter-spacing: 0.05em;
            color: #000000;
            margin: 0 0 4px 0;
            text-transform: lowercase;
            text-align: center;
          }

          .product-price {
            font-size: 13px;
            color: #666666;
            margin: 0;
            text-align: center;
          }

          /* Footer */
          .footer {
            text-align: center;
            font-size: 11px;
            color: #999999;
            margin: 60px 20px 40px 20px;
            line-height: 1.6;
          }

          .footer a {
            color: #999999;
            text-decoration: underline;
          }

          .footer-divider {
            border: none;
            border-top: 1px solid #eeeeee;
            margin: 40px 0 20px 0;
          }

          /* Responsive */
          @media only screen and (max-width: 600px) {
            .title {
              font-size: 32px;
              margin: 30px 15px 15px 15px;
            }

            .subtitle {
              font-size: 14px;
              margin: 0 15px 30px 15px;
            }

            .cta-button {
              padding: 14px 36px;
              font-size: 12px;
            }

            .products-section {
              margin: 40px 10px;
            }

            .product-cell {
              padding: 5px;
            }

            .product-name,
            .product-price {
              font-size: 12px;
            }
          }
        `}</style>
      </Head>

      <Body>
        <Container className="container">
          {/* Logo */}
          <Section className="logo-section">
            <Img
              src="https://blancherenaudin.com/logo-blancherenaudin.png"
              alt=".blancherenaudin"
              className="logo"
              width="180"
            />
          </Section>

          {/* Hero Image */}
          {content.hero_image_url && (
            <Section className="hero-section">
              <Img
                src={content.hero_image_url}
                alt={content.title}
                className="hero-image"
                width="600"
              />
            </Section>
          )}

          {/* Titre Principal */}
          <Text className="title">{content.title}</Text>

          {/* Sous-titre */}
          {content.subtitle && (
            <Text className="subtitle">{content.subtitle}</Text>
          )}

          {/* CTA Principal */}
          <Section className="cta-section">
            <Link href={content.cta_link} className="cta-button">
              {content.cta_text}
            </Link>
          </Section>

          {/* Grille Produits 2x2 */}
          {content.products && content.products.length > 0 && (
            <Section className="products-section">
              <table className="products-grid" width="100%">
                <tbody>
                  {/* Ligne 1 : Produits 1 & 2 */}
                  <tr>
                    {content.products.slice(0, 2).map((product) => (
                      <td key={product.id} className="product-cell">
                        <Link href={product.link} className="product-link">
                          <Img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image"
                            width="270"
                          />
                          <Text className="product-name">{product.name}</Text>
                          <Text className="product-price">
                            {product.price.toFixed(2)}€
                          </Text>
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Ligne 2 : Produits 3 & 4 */}
                  <tr>
                    {content.products.slice(2, 4).map((product) => (
                      <td key={product.id} className="product-cell">
                        <Link href={product.link} className="product-link">
                          <Img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image"
                            width="270"
                          />
                          <Text className="product-name">{product.name}</Text>
                          <Text className="product-price">
                            {product.price.toFixed(2)}€
                          </Text>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Section>
          )}

          {/* Divider */}
          <Hr className="footer-divider" />

          {/* Footer */}
          <Section className="footer">
            <Text style={{ marginBottom: '10px' }}>
              Suivez-nous sur{' '}
              <Link href="https://instagram.com/blancherenaudin">
                Instagram
              </Link>
            </Text>

            <Text style={{ marginTop: '20px', marginBottom: '10px' }}>
              Vous recevez cet email car vous êtes inscrit(e) à notre
              newsletter.
            </Text>

            <Text style={{ marginTop: '10px' }}>
              <Link href={unsubscribeLink}>Se désabonner</Link>
            </Text>

            <Text style={{ marginTop: '20px', color: '#cccccc' }}>
              .blancherenaudin
              <br />
              Paris, France
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/**
 * Version preview (pour tests et preview dans l'admin)
 */
export const NewsletterCampaignEmailPreview = NewsletterCampaignEmail
