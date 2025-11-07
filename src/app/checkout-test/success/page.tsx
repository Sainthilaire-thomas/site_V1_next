// src/app/checkout-test/success/page.tsx
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutTestSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string }
}) {
  const orderNumber = searchParams.order

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-2xl w-full text-center py-16">
        {/* Icône de succès - version minimaliste */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-black" strokeWidth={1.5} />
          </div>
        </div>

        {/* Titre - style Archivo Black uppercase */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 font-['Archivo_Black'] uppercase tracking-[0.05em]">
          Order confirmed
        </h1>

        {/* Message principal */}
        <p className="text-base text-gray-600 mb-2 font-['Archivo_Narrow']">
          Your order has been successfully placed.
        </p>

        {orderNumber && (
          <p className="text-sm text-gray-500 mb-12 font-['Archivo_Narrow']">
            Order number: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}

        {/* Informations - style sobre */}
        <div className="border border-gray-200 p-8 mb-12 text-left max-w-md mx-auto">
          <h2 className="font-semibold mb-6 text-xs uppercase tracking-[0.15em] font-['Archivo_Narrow']">
            What happens next
          </h2>
          <ul className="space-y-4 text-sm text-gray-600 font-['Archivo_Narrow']">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></span>
              <span>A confirmation email has been sent</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></span>
              <span>We are preparing your order</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></span>
              <span>You will receive a shipping tracking email</span>
            </li>
          </ul>
        </div>

        {/* Boutons d'action - noir cohérent avec le site */}
        <div className="space-y-4 max-w-md mx-auto">
          <Button
            asChild
            className="w-full bg-black hover:bg-black/90 text-white font-['Archivo_Narrow'] uppercase tracking-wider h-12"
          >
            <Link href="/">Continue shopping</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-black text-black hover:bg-black hover:text-white font-['Archivo_Narrow'] uppercase tracking-wider h-12 transition-colors"
          >
            <Link href="/account/orders">View my orders</Link>
          </Button>
        </div>

        {/* Footer discret */}
        <p className="text-xs text-gray-400 mt-12 font-['Archivo_Narrow']">
          Need help?{' '}
          <Link href="/contact" className="underline hover:text-black">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
