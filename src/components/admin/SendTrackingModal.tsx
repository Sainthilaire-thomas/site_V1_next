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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Envoyer les informations de suivi
          </DialogTitle>
          <DialogDescription>Commande #{orderNumber}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transporteur */}
          <div className="space-y-2">
            <Label htmlFor="carrier">
              Transporteur <span className="text-red-500">*</span>
            </Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un transporteur" />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Numéro de suivi */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">
              Numéro de suivi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ex: 3SBRCP00012345"
              disabled={isLoading}
            />
          </div>

          {/* URL personnalisée (si "Autre" sélectionné) */}
          {carrier === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customUrl">
                URL de suivi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customUrl"
                type="url"
                value={customTrackingUrl}
                onChange={(e) => setCustomTrackingUrl(e.target.value)}
                placeholder="https://exemple.com/tracking/..."
                disabled={isLoading}
              />
            </div>
          )}

          {/* URL générée automatiquement */}
          {carrier && carrier !== 'custom' && trackingNumber && (
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p className="font-medium mb-1">URL de suivi générée :</p>
              <p className="text-gray-600 break-all">{getTrackingUrl()}</p>
            </div>
          )}

          {/* Date de livraison estimée (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDelivery">
              Livraison estimée{' '}
              <span className="text-gray-500">(optionnel)</span>
            </Label>
            <Input
              id="estimatedDelivery"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="Ex: mercredi 16 octobre"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Format libre, ex: "dans 2-3 jours", "vendredi matin", etc.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
