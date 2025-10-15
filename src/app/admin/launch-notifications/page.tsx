// src/app/admin/launch-notifications/page.tsx
import { getServerSupabase } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Mail, Phone, ShoppingCart, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Type pour les items du panier
interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
}

export default async function LaunchNotificationsPage() {
  const user = await requireAdmin()
  const supabase = await getServerSupabase()

  // Récupérer toutes les notifications
  const { data: notifications, error } = await supabase
    .from('launch_notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notifications:', error)
  }

  const total = notifications?.length || 0
  const pending =
    notifications?.filter((n) => n.status === 'pending').length || 0
  const totalRevenue =
    notifications?.reduce((sum, n) => sum + (Number(n.cart_total) || 0), 0) || 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Launch Notifications</h1>
        <p className="text-gray-600">
          Customers waiting for payment to be available
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Potential Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              €{totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No notification requests yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Cart Total</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => {
                    // Parser les cart_items en tant que tableau
                    const cartItems = Array.isArray(notification.cart_items)
                      ? (notification.cart_items as unknown as CartItem[])
                      : []

                    return (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="font-medium">
                            {notification.first_name} {notification.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-3 h-3" />
                              <a
                                href={`mailto:${notification.email}`}
                                className="hover:text-violet-600 underline"
                              >
                                {notification.email}
                              </a>
                            </div>
                            {notification.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-3 h-3" />
                                <a
                                  href={`tel:${notification.phone}`}
                                  className="hover:text-violet-600"
                                >
                                  {notification.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600">
                            €
                            {notification.cart_total
                              ? Number(notification.cart_total).toFixed(2)
                              : '0.00'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <details className="cursor-pointer">
                            <summary className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                              <ShoppingCart className="w-4 h-4" />
                              {cartItems.length || 0} items
                            </summary>
                            <div className="mt-2 ml-6 space-y-1 text-xs text-gray-600">
                              {cartItems.map((item, idx) => (
                                <div key={idx}>
                                  • {item.name} (x{item.quantity}) - €
                                  {item.price}
                                </div>
                              ))}
                            </div>
                          </details>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {notification.created_at &&
                              new Date(
                                notification.created_at
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              notification.status === 'pending'
                                ? 'outline'
                                : notification.status === 'notified'
                                  ? 'secondary'
                                  : 'default'
                            }
                          >
                            {notification.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>When payment is ready:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Send a personalized email to all pending customers</li>
            <li>
              Include a direct link to checkout with their cart pre-filled
            </li>
            <li>Update status to "notified" after sending</li>
            <li>
              Track conversions and update to "converted" when they purchase
            </li>
          </ol>
          <p className="mt-4">
            <strong>Email template suggestion:</strong> "Hi [Name], we're
            excited to announce that payment is now live! Your selected items
            are ready for checkout: [link]"
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
