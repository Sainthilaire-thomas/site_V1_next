// ============================================
// 4. src/app/legal-notice/page.tsx
// ============================================
import Link from 'next/link'

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors mb-8"
        >
          ← back to home
        </Link>
        <h1 className="text-section mb-16">.legal notice</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-product mb-3">SITE PUBLISHER</h2>
            <p className="text-body text-grey-medium">
              Blanche Renaudin
              <br />
              Registered office: 25 bouleverd de La Tour MAubourg 75007 Paris
              <br />
              Email: contact@blancherenaudin.com
              <br />
              VAT Number: [VAT Number]
              <br />
              Registration Number: [SIRET/Registration Number]
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">HOSTING</h2>
            <p className="text-body text-grey-medium">
              This website is hosted by:
              <br />
              Vercel Inc.
              <br />
              440 N Barranca Ave #4133
              <br />
              Covina, CA 91723, United States
              <br />
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-black transition-colors"
              >
                vercel.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">INTELLECTUAL PROPERTY</h2>
            <p className="text-body text-grey-medium">
              All content on this website, including but not limited to text,
              images, graphics, logos, photographs, and designs, is the
              exclusive property of Blanche Renaudin and is protected by French
              and international copyright laws. Any reproduction,
              representation, modification, or distribution of this content, in
              whole or in part, without prior written authorization is strictly
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">TRADEMARK</h2>
            <p className="text-body text-grey-medium">
              "Blanche Renaudin" and all associated logos are registered
              trademarks. Any use of these marks without express written consent
              is prohibited and may result in legal action.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">LIMITATION OF LIABILITY</h2>
            <p className="text-body text-grey-medium">
              While we strive to ensure the accuracy of information on this
              website, Blanche Renaudin cannot be held responsible for any
              errors, omissions, or results obtained from the use of this
              information. We reserve the right to modify the content of this
              site at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">HYPERLINKS</h2>
            <p className="text-body text-grey-medium">
              This website may contain links to external websites. Blanche
              Renaudin has no control over the content of these sites and cannot
              be held responsible for their content or privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">APPLICABLE LAW</h2>
            <p className="text-body text-grey-medium">
              This website and its use are governed by French law. Any dispute
              relating to the use of this site shall be subject to the exclusive
              jurisdiction of French courts.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">TERMS OF SALE</h2>
            <p className="text-body text-grey-medium">
              All purchases made through this website are subject to our terms
              and conditions of sale. By placing an order, you acknowledge that
              you have read, understood, and accept these terms. Prices are
              displayed in Euros and include applicable VAT. We reserve the
              right to modify our prices at any time, although products will be
              invoiced at the rate in effect at the time of order validation.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">CONTACT</h2>
            <p className="text-body text-grey-medium">
              For any questions regarding these legal notices, please contact us
              at{' '}
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
