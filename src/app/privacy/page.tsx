// ============================================
// 3. src/app/privacy/page.tsx
// ============================================
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors mb-8"
        >
          ← back to home
        </Link>
        <h1 className="text-section mb-16">.privacy policy</h1>

        <div className="space-y-12">
          <section>
            <p className="text-body text-grey-medium mb-3">
              Last updated: January 2025
            </p>
            <p className="text-body text-grey-medium">
              Blanche Renaudin respects your privacy and is committed to
              protecting your personal data. This privacy policy explains how we
              collect, use, and safeguard your information when you visit our
              website or make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">INFORMATION WE COLLECT</h2>
            <p className="text-body text-grey-medium mb-3">
              We collect the following types of information:
            </p>
            <ul className="space-y-2 text-body text-grey-medium">
              <li>
                • Personal identification information (name, email address,
                shipping address, phone number)
              </li>
              <li>
                • Payment information (credit card details, billing address)
              </li>
              <li>• Order history and preferences</li>
              <li>
                • Technical data (IP address, browser type, device information)
              </li>
              <li>• Cookies and usage data to improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-product mb-3">HOW WE USE YOUR INFORMATION</h2>
            <p className="text-body text-grey-medium mb-3">
              We use your personal data to:
            </p>
            <ul className="space-y-2 text-body text-grey-medium">
              <li>• Process and fulfill your orders</li>
              <li>• Communicate with you about your orders and account</li>
              <li>• Send you marketing communications (with your consent)</li>
              <li>• Improve our website and services</li>
              <li>• Prevent fraud and ensure security</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-product mb-3">DATA PROTECTION</h2>
            <p className="text-body text-grey-medium">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. All payment transactions
              are encrypted using SSL technology.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">COOKIES</h2>
            <p className="text-body text-grey-medium">
              Our website uses cookies to enhance your browsing experience,
              analyze site traffic, and personalize content. You can control
              cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">YOUR RIGHTS</h2>
            <p className="text-body text-grey-medium mb-3">
              Under GDPR, you have the right to:
            </p>
            <ul className="space-y-2 text-body text-grey-medium">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Object to processing of your data</li>
              <li>• Request data portability</li>
              <li>• Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-product mb-3">DATA RETENTION</h2>
            <p className="text-body text-grey-medium">
              We retain your personal data only for as long as necessary to
              fulfill the purposes outlined in this policy, or as required by
              law. Order information is typically retained for accounting and
              legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">THIRD-PARTY SERVICES</h2>
            <p className="text-body text-grey-medium">
              We may share your data with trusted third-party service providers
              (payment processors, shipping companies, email services) who
              assist us in operating our business. These parties are obligated
              to protect your data and use it only for the services they
              provide.
            </p>
          </section>

          <section>
            <h2 className="text-product mb-3">CONTACT US</h2>
            <p className="text-body text-grey-medium">
              If you have any questions about this privacy policy or wish to
              exercise your rights, please contact us at{' '}
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
