// src/lib/email/newsletter-confirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Button,
} from '@react-email/components'

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
      <Body
        style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
          }}
        >
          <Heading
            style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#000',
            }}
          >
            Confirmez votre inscription
          </Heading>

          <Text
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px',
              color: '#333',
            }}
          >
            Bonjour{firstName ? ` ${firstName}` : ''},
          </Text>

          <Text
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px',
              color: '#333',
            }}
          >
            Merci de votre intérêt pour Blanche Renaudin ! Pour confirmer votre
            inscription à notre newsletter, cliquez sur le bouton ci-dessous :
          </Text>

          <Button
            href={confirmUrl}
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            Confirmer mon inscription
          </Button>

          <Text
            style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '30px',
              lineHeight: '1.6',
            }}
          >
            Ce lien est valide 24 heures.
            <br />
            Si vous n&apos;avez pas demandé cette inscription, ignorez cet
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
