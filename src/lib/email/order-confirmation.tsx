// src/lib/email/order-confirmation.tsx
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
interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    imageUrl?: string
  }>
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price / 100)
  }

  return (
    <Html>
      <Head />
      <Preview>Thank you for your order {orderNumber}</Preview>
      <Body
        style={{
          backgroundColor: '#ffffff',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
        }}
      >
        <Container
          style={{
            margin: '0 auto',
            padding: '40px 20px',
            maxWidth: '600px',
          }}
        >
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
          <Section
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <Heading
              style={{
                color: '#000000',
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 8px',
                padding: '0',
                lineHeight: '1.2',
              }}
            >
              Thank you {customerName}
            </Heading>
            <Text
              style={{
                color: '#666666',
                fontSize: '16px',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              Your order has been confirmed and will be shipped soon.
            </Text>
          </Section>

          {/* Order number */}
          <Section
            style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '32px',
            }}
          >
            <Text
              style={{
                color: '#666666',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '0 0 4px',
              }}
            >
              ORDER NUMBER
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: '24px',
                fontWeight: '700',
                margin: '0',
              }}
            >
              #{orderNumber}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e5e5e5', margin: '32px 0' }} />

          {/* Items */}
          <Section>
            <Heading
              as="h2"
              style={{
                color: '#000000',
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 16px',
              }}
            >
              Your order
            </Heading>
            {items.map((item, index) => (
              <Section key={index} style={{ marginBottom: '16px' }}>
                <table
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                >
                  <tbody>
                    <tr>
                      {item.imageUrl && (
                        <td
                          style={{
                            width: '80px',
                            paddingRight: '16px',
                          }}
                        >
                          <Img
                            src={item.imageUrl}
                            width="80"
                            height="80"
                            alt={item.name}
                            style={{ borderRadius: '4px' }}
                          />
                        </td>
                      )}
                      <td style={{ verticalAlign: 'middle' }}>
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: '16px',
                            fontWeight: '500',
                            margin: '0 0 4px',
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: '#666666',
                            fontSize: '14px',
                            margin: '0',
                          }}
                        >
                          Quantity: {item.quantity}
                        </Text>
                      </td>
                      <td
                        style={{
                          verticalAlign: 'middle',
                          textAlign: 'right',
                          width: '100px',
                        }}
                      >
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: '16px',
                            fontWeight: '600',
                            margin: '0',
                          }}
                        >
                          {formatPrice(item.price)}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            ))}
          </Section>

          <Hr style={{ borderColor: '#e5e5e5', margin: '32px 0' }} />

          {/* Totals */}
          <Section style={{ marginTop: '24px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>
                    <Text
                      style={{
                        color: '#666666',
                        fontSize: '14px',
                        margin: '0',
                      }}
                    >
                      Subtotal
                    </Text>
                  </td>
                  <td align="right">
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '14px',
                        margin: '0',
                      }}
                    >
                      {formatPrice(subtotal)}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text
                      style={{
                        color: '#666666',
                        fontSize: '14px',
                        margin: '0',
                      }}
                    >
                      Shipping
                    </Text>
                  </td>
                  <td align="right">
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '14px',
                        margin: '0',
                      }}
                    >
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </Text>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <Hr style={{ borderColor: '#e5e5e5', margin: '16px 0' }} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '16px',
                        fontWeight: '700',
                        margin: '0',
                      }}
                    >
                      Total
                    </Text>
                  </td>
                  <td align="right">
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: '16px',
                        fontWeight: '700',
                        margin: '0',
                      }}
                    >
                      {formatPrice(total)}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={{ borderColor: '#e5e5e5', margin: '32px 0' }} />

          {/* Shipping address */}
          <Section>
            <Heading
              as="h2"
              style={{
                color: '#000000',
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 16px',
              }}
            >
              Shipping address
            </Heading>
            <Text
              style={{
                color: '#666666',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0',
              }}
            >
              {shippingAddress.line1}
              {shippingAddress.line2 && (
                <>
                  <br />
                  {shippingAddress.line2}
                </>
              )}
              <br />
              {shippingAddress.postalCode} {shippingAddress.city}
              <br />
              {shippingAddress.country}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#e5e5e5', margin: '32px 0' }} />

          {/* Footer */}
          <Section
            style={{
              textAlign: 'center',
              marginTop: '32px',
            }}
          >
            <Text
              style={{
                color: '#999999',
                fontSize: '12px',
                lineHeight: '1.5',
                margin: '4px 0',
              }}
            >
              Questions?{' '}
              <Link
                href="mailto:contact@blancherenaudin.com"
                style={{
                  color: '#000000',
                  textDecoration: 'underline',
                }}
              >
                Contact us
              </Link>
            </Text>
            <Text
              style={{
                color: '#999999',
                fontSize: '12px',
                lineHeight: '1.5',
                margin: '4px 0',
              }}
            >
              <Link
                href="https://blancherenaudin.com"
                style={{
                  color: '#000000',
                  textDecoration: 'underline',
                }}
              >
                blancherenaudin.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
