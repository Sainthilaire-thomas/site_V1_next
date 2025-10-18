// ============================================
// 1. src/app/shipping/page.tsx
// ============================================
import Link from 'next/link'

export default function ShippingPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/?skip-intro=true"
          className="inline-block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors mb-8"
        >
          ← back to home
        </Link>
        <h1 className="text-section mb-16">.shipping</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-product mb-3">DELIVERY TIMES</h2>
            <p className="text-body text-grey-medium">
              All orders are processed within 3-5 business days. You will
              receive a confirmation email once your order has been shipped with
              tracking information.
            </p>
            <ul className="mt-3 space-y-2 text-body text-grey-medium">
              <li>• Europe: 4-7 business days</li>
              <li>• International: 7-14 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-product mb-3">SHIPPING COSTS</h2>
            <p className="text-body text-grey-medium">
              Shipping costs are calculated at checkout based on your location
              and order weight.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">TRACKING</h2>
            <p className="text-body text-grey-medium">
              Once your order ships, you will receive a tracking number via
              email. You can track your package directly through the carrier's
              website or contact us for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">INTERNATIONAL ORDERS</h2>
            <p className="text-body text-grey-medium">
              International customers are responsible for any customs fees,
              duties, or taxes that may apply. These charges are not included in
              your order total and vary by country.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">QUESTIONS?</h2>
            <p className="text-body text-grey-medium">
              If you have any questions about shipping, please contact us at{' '}
              <a
                href="mailto:contact@blancherenaudin.com"
                className="underline hover:text-black transition-colors"
              >
                contact@blancherenaudin.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
