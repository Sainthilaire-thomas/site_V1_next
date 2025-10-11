// src/app/checkout/success/page.tsx
import { Suspense } from 'react'
import CheckoutSuccessContent from './CheckoutSuccessContent'
import { Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-grey-medium" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
