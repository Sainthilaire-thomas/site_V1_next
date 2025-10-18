// src/app/admin/orders/[id]/OrderAdminClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Database } from '@/lib/database.types'
import { Mail, Send, Loader2 } from 'lucide-react'

import { SendTrackingModal } from '@/components/admin/SendTrackingModal'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderStatusHistory =
  Database['public']['Tables']['order_status_history']['Row']

// Type étendu avec relations
interface OrderWithRelations extends Order {
  items?: OrderItem[]
  history?: OrderStatusHistory[]
}

// Type pour l'adresse (JSON)
interface ShippingAddress {
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  postal_code: string
  country: string
}

interface OrderAdminClientProps {
  order: OrderWithRelations
}

export default function OrderAdminClient({
  order: initialOrder,
}: OrderAdminClientProps) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
  const [isSendingConfirmation, setIsSendingConfirmation] = useState(false)

  const shippingAddr =
    order.shipping_address as unknown as ShippingAddress | null
  const subtotal =
    Number(order.total_amount) -
    Number(order.shipping_amount || 0) -
    Number(order.tax_amount || 0)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Erreur mise à jour')

      const updated = await res.json()
      setOrder(updated.order)
      toast.success('Statut mis à jour')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddTracking = async () => {
    const trackingNumber = prompt('Numéro de suivi:')
    if (!trackingNumber) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          status: 'shipped',
          shipped_at: new Date().toISOString(),
        }),
      })

      if (!res.ok) throw new Error('Erreur')

      const updated = await res.json()
      setOrder(updated.order)
      toast.success('Tracking ajouté')
      router.refresh()
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsSendingConfirmation(true)
    try {
      const res = await fetch(
        `/api/admin/orders/${order.id}/resend-confirmation`,
        {
          method: 'POST',
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      toast.success('Email de confirmation renvoyé !')
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'email"
      )
    } finally {
      setIsSendingConfirmation(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Commande {order.order_number}</h1>
          <p className="text-gray-500">
            {new Date(order.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
          {order.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Articles */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {item.product_name || 'Produit'}
                    </h3>
                    {item.variant_value && (
                      <p className="text-sm text-gray-500">
                        {item.variant_name}: {item.variant_value}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Number(item.total_price).toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">
                      {Number(item.unit_price).toFixed(2)}€/u
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>
                  {Number(order.shipping_amount || 0) === 0
                    ? 'Gratuit'
                    : `${Number(order.shipping_amount).toFixed(2)}€`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>TVA</span>
                <span>{Number(order.tax_amount || 0).toFixed(2)}€</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{Number(order.total_amount).toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-gray-500">{order.customer_email}</p>
                {order.customer_phone && (
                  <p className="text-sm text-gray-500">
                    {order.customer_phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Livraison */}
          <Card>
            <CardHeader>
              <CardTitle>Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shippingAddr && (
                <>
                  <p>
                    {shippingAddr.first_name} {shippingAddr.last_name}
                  </p>
                  <p className="text-sm">{shippingAddr.address_line_1}</p>
                  {shippingAddr.address_line_2 && (
                    <p className="text-sm">{shippingAddr.address_line_2}</p>
                  )}
                  <p className="text-sm">
                    {shippingAddr.postal_code} {shippingAddr.city}
                  </p>
                  <p className="text-sm font-medium">{shippingAddr.country}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Historique */}
          {order.history && order.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.history.map((h: OrderStatusHistory) => (
                    <div key={h.id} className="text-sm">
                      <p className="font-medium">{h.to_status}</p>
                      <p className="text-gray-500">
                        {h.created_at
                          ? new Date(h.created_at).toLocaleString('fr-FR')
                          : 'Date inconnue'}
                      </p>
                      {h.comment && (
                        <p className="text-xs text-gray-400">{h.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Statut */}
              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  className="w-full mt-1 p-2 border rounded bg-background text-foreground dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  value={order.status || ''}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payée</option>
                  <option value="processing">En préparation</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <Separator />

              {/* Emails */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Emails</label>

                <Button
                  onClick={handleResendConfirmation}
                  disabled={isSendingConfirmation}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {isSendingConfirmation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Renvoyer confirmation
                    </>
                  )}
                </Button>

                {order.tracking_number ? (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">
                      Suivi envoyé
                    </p>
                    <p className="text-sm font-mono">{order.tracking_number}</p>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsTrackingModalOpen(true)}
                    disabled={isUpdating}
                    className="w-full"
                    size="sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Marquer comme expédiée
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modal de tracking */}
          <SendTrackingModal
            orderId={order.id}
            orderNumber={order.order_number}
            isOpen={isTrackingModalOpen}
            onClose={() => setIsTrackingModalOpen(false)}
            onSuccess={() => {
              router.refresh()
            }}
          />
        </div>
      </div>
    </div>
  )
}
