// src/components/layout/FooterMinimal.tsx
import Link from 'next/link'
import { NewsletterSubscribe } from '@/components/newsletter/NewsletterSubscribe'

export default function FooterMinimal() {
  return (
    <footer className="border-t border-grey-light py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Newsletter */}
          <div>
            <NewsletterSubscribe />
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-product mb-3">SHOP</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products/hauts"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .tops
                </Link>
              </li>
              <li>
                <Link
                  href="/products/bas"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .bottoms
                </Link>
              </li>
              <li>
                <Link
                  href="/products/accessoires"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/silhouettes"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .silhouettes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: House */}
          <div>
            <h3 className="text-product mb-3">MAISON</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .essence
                </Link>
              </li>
              <li>
                <Link
                  href="/impact"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .impact
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help */}
          <div>
            <h3 className="text-product mb-3">HELP</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shipping"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  .returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-grey-light pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo + Copyright */}
            <div className="flex items-center gap-8">
              <span
                className="text-[18px] tracking-[0.05em] font-bold lowercase"
                style={{ color: 'hsl(271 74% 37%)' }}
              >
                .blancherenaudin
              </span>
              <span className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                © 2025 all rights reserved
              </span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-6">
              <a
                href="https://www.instagram.com/the.blancherenaudin?igsh=azg1cmNmYXNvcGtu&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
              >
                instagram
              </a>
            </div>

            {/* Legal */}
            <div className="flex items-center gap-6">
              <Link
                href="/legal-notice"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
              >
                legal notice
              </Link>
              <Link
                href="/privacy"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
              >
                privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
