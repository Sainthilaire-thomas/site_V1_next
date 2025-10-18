// src/components/admin/SendTrackingModal.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Truck } from 'lucide-react'

interface SendTrackingModalProps {
  orderId: string
  orderNumber: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Transporteurs français courants
const CARRIERS = [
  {
    value: 'colissimo',
    label: 'Colissimo',
    urlPattern: 'https://www.laposte.fr/outils/suivre-vos-envois?code=',
  },
  {
    value: 'chronopost',
    label: 'Chronopost',
    urlPattern:
      'https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=',
  },
  {
    value: 'mondial-relay',
    label: 'Mondial Relay',
    urlPattern: 'https://www.mondialrelay.fr/suivi-de-colis/?NumeroExpedition=',
  },
  {
    value: 'ups',
    label: 'UPS',
    urlPattern: 'https://www.ups.com/track?tracknum=',
  },
  {
    value: 'dhl',
    label: 'DHL',
    urlPattern: 'https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=',
  },
  {
    value: 'fedex',
    label: 'FedEx',
    urlPattern: 'https://www.fedex.com/fedextrack/?trknbr=',
  },
  { value: 'custom', label: 'Autre', urlPattern: '' },
]

export function SendTrackingModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onSuccess,
}: SendTrackingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [customTrackingUrl, setCustomTrackingUrl] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')

  // Générer l'URL de tracking automatiquement
  const getTrackingUrl = () => {
    if (carrier === 'custom') {
      return customTrackingUrl
    }

    const selectedCarrier = CARRIERS.find((c) => c.value === carrier)
    if (selectedCarrier && trackingNumber) {
      return selectedCarrier.urlPattern + trackingNumber
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!trackingNumber.trim()) {
      toast.error('Veuillez saisir un numéro de suivi')
      return
    }

    if (!carrier) {
      toast.error('Veuillez sélectionner un transporteur')
      return
    }

    const trackingUrl = getTrackingUrl()
    if (!trackingUrl) {
      toast.error('URL de suivi invalide')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/send-tracking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackingNumber: trackingNumber.trim(),
            carrier:
              CARRIERS.find((c) => c.value === carrier)?.label || carrier,
            trackingUrl,
            estimatedDelivery: estimatedDelivery || undefined,
          }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Email de suivi envoyé avec succès')
        onSuccess?.()
        handleClose()
      } else {
        toast.error(data.error || "Erreur lors de l'envoi")
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error("Erreur lors de l'envoi de l'email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTrackingNumber('')
      setCarrier('')
      setCustomTrackingUrl('')
      setEstimatedDelivery('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* ✅ DialogContent avec dark mode */}
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
            <Truck className="h-5 w-5" />
            Envoyer les informations de suivi
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Commande #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transporteur */}
          <div className="space-y-2">
            <Label htmlFor="carrier" className="dark:text-gray-200">
              Transporteur <span className="text-red-500">*</span>
            </Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Sélectionner un transporteur" />
              </SelectTrigger>
              <SelectContent className="z-[100] dark:bg-gray-800 dark:border-gray-600">
                {CARRIERS.map((c) => (
                  <SelectItem
                    key={c.value}
                    value={c.value}
                    className="dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                  >
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Numéro de suivi */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber" className="dark:text-gray-200">
              Numéro de suivi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ex: 3SBRCP00012345"
              disabled={isLoading}
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* URL personnalisée (si "Autre" sélectionné) */}
          {carrier === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customUrl" className="dark:text-gray-200">
                URL de suivi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customUrl"
                type="url"
                value={customTrackingUrl}
                onChange={(e) => setCustomTrackingUrl(e.target.value)}
                placeholder="https://exemple.com/tracking/..."
                disabled={isLoading}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          )}

          {/* ✅ APERÇU URL - VERSION AMÉLIORÉE */}
          {carrier && (
            <div className="rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 p-4">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    {trackingNumber
                      ? 'Aperçu du lien de suivi :'
                      : 'Lien de suivi (en attente du numéro)'}
                  </p>
                  {trackingNumber && getTrackingUrl() ? (
                    <>
                      <a
                        href={getTrackingUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 dark:text-blue-300 hover:underline break-all font-mono"
                      >
                        {getTrackingUrl()}
                      </a>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        💡 Cliquez pour tester le lien avant d'envoyer
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                      {carrier === 'custom'
                        ? "Saisissez l'URL complète ci-dessus"
                        : "Saisissez un numéro de suivi pour voir l'URL"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Date de livraison estimée (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDelivery" className="dark:text-gray-200">
              Livraison estimée{' '}
              <span className="text-gray-500 dark:text-gray-400">
                (optionnel)
              </span>
            </Label>
            <Input
              id="estimatedDelivery"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="Ex: mercredi 16 octobre"
              disabled={isLoading}
              className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Format libre, ex: "dans 2-3 jours", "vendredi matin", etc.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="dark:bg-violet dark:hover:bg-violet/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
