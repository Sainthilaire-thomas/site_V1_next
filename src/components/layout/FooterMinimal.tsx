// src/components/layout/FooterMinimal.tsx
import Link from 'next/link'

export default function FooterMinimal() {
  return (
    <footer className="border-t border-grey-light py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Colonne 1: Shop */}
          <div>
            <h3 className="text-product mb-6">SHOP</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/hauts"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Hauts
                </Link>
              </li>
              <li>
                <Link
                  href="/bas"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Bas
                </Link>
              </li>
              <li>
                <Link
                  href="/accessoires"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Accessoires
                </Link>
              </li>
              <li>
                <Link
                  href="/lookbooks"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Lookbooks
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 2: Maison */}
          <div>
            <h3 className="text-product mb-6">MAISON</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/sustainability"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Aide */}
          <div>
            <h3 className="text-product mb-6">AIDE</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/livraison"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Livraison
                </Link>
              </li>
              <li>
                <Link
                  href="/retours"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  Retours
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-body text-grey-medium hover:text-black transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Newsletter */}
          <div>
            <h3 className="text-product mb-6">NEWSLETTER</h3>
            <p className="text-body text-grey-medium mb-4">
              Recevez nos actualités
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-body transition-colors bg-transparent"
              />
              <button type="submit" className="btn-text">
                S'INSCRIRE
              </button>
            </form>
          </div>
        </div>

        {/* Ligne séparation */}
        <div className="border-t border-grey-light pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo + Copyright */}
            <div className="flex items-center gap-8">
              <span className="text-product">.BLANCHERENAUDIN</span>
              <span className="text-body text-grey-medium text-sm">
                © 2024 Tous droits réservés
              </span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-6">
              <a
                href="https://instagram.com/blancherenaudin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-grey-medium hover:text-black transition-colors"
              >
                INSTAGRAM
              </a>

              <a
                href="https://pinterest.com/blancherenaudin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-grey-medium hover:text-black transition-colors"
              >
                PINTEREST
              </a>
            </div>

            {/* Légal */}
            <div className="flex items-center gap-6">
              <Link
                href="/mentions-legales"
                className="text-body text-grey-medium hover:text-black transition-colors text-sm"
              >
                Mentions légales
              </Link>
              <Link
                href="/confidentialite"
                className="text-body text-grey-medium hover:text-black transition-colors text-sm"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
