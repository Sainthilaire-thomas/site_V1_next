// src/components/layout/FooterMinimal.tsx
import Link from 'next/link'

export default function FooterMinimal() {
  return (
    <footer className="border-t border-grey-light py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Shop */}
          <div>
            <h3 className="text-product mb-6">SHOP</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/hauts"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Tops
                </Link>
              </li>
              <li>
                <Link
                  href="/bas"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Bottoms
                </Link>
              </li>
              <li>
                <Link
                  href="/accessoires"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/lookbooks"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Lookbooks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: House */}
          <div>
            <h3 className="text-product mb-6">HOUSE</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/sustainability"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h3 className="text-product mb-6">HELP</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/livraison"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/retours"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-product mb-6">NEWSLETTER</h3>
            <p className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-4">
              Stay updated with our news
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent"
              />
              <button
                type="submit"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase hover:text-black transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-grey-light pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo + Copyright */}
            <div className="flex items-center gap-8">
              <span className="text-product">.BLANCHERENAUDIN</span>
              <span className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium">
                © 2024 All rights reserved
              </span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-6">
              <a
                href="https://instagram.com/blancherenaudin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
              >
                instagram
              </a>

              <a
                href="https://pinterest.com/blancherenaudin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
              >
                pinterest
              </a>
            </div>

            {/* Legal */}
            <div className="flex items-center gap-6">
              <Link
                href="/mentions-legales"
                className="text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium hover:text-black transition-colors"
              >
                legal notice
              </Link>
              <Link
                href="/confidentialite"
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
