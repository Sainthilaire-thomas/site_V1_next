// ============================================
// 2. src/app/returns/page.tsx
// ============================================
import Link from 'next/link'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/?skip-intro=true"
          className="inline-block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors mb-8"
        >
          ← back to home
        </Link>
        <h1 className="text-section mb-16">.returns</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-product mb-3">RETURN POLICY</h2>
            <p className="text-body text-grey-medium">
              We want you to be completely satisfied with your purchase. If
              you're not happy with your order, you may return it within 14 days
              of receipt for a full refund or exchange.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">CONDITIONS</h2>
            <p className="text-body text-grey-medium mb-3">
              To be eligible for a return, items must meet the following
              conditions:
            </p>
            <ul className="space-y-2 text-body text-grey-medium">
              <li>• Unworn, unwashed, and in original condition</li>
              <li>• All original tags attached</li>
              <li>• Returned in original packaging</li>
              <li>• Not altered or damaged</li>
            </ul>
            <p className="text-body text-grey-medium mt-3">
              Please note that intimate apparel, swimwear, and sale items are
              final sale and cannot be returned.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">HOW TO RETURN</h2>
            <ol className="space-y-2 text-body text-grey-medium">
              <li>
                1. Contact us at{' '}
                <a
                  href="mailto:contact@blancherenaudin.com"
                  className="underline hover:text-black transition-colors"
                >
                  contact@blancherenaudin.com
                </a>{' '}
                with your order number
              </li>
              <li>
                2. We will provide you with a return authorization and
                instructions
              </li>
              <li>
                3. Pack your items securely with all original tags and packaging
              </li>
              <li>4. Ship your return using a trackable method</li>
            </ol>
          </section>

          <section>
            <h2 className="text-product mb-3">REFUNDS</h2>
            <p className="text-body text-grey-medium">
              Once we receive and inspect your return, we will process your
              refund within 5-7 business days. The refund will be issued to your
              original payment method. Please note that shipping costs are
              non-refundable unless the return is due to our error.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">EXCHANGES</h2>
            <p className="text-body text-grey-medium">
              If you would like to exchange an item for a different size or
              color, please contact us and we will be happy to assist you.
              Exchanges are subject to availability.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">QUESTIONS?</h2>
            <p className="text-body text-grey-medium">
              For any questions about returns or exchanges, please contact us at{' '}
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
