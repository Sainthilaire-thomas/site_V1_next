// src/app/api/admin/orders/[id]/resend-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { sendOrderConfirmationHook } from '@/lib/email/send-order-confirmation-hook'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.message || 'Non autorisé' },
        { status: adminCheck.status }
      )
    }

    const { id: orderId } = await params

    console.log('📧 Resending confirmation email for order:', orderId)

    const result = await sendOrderConfirmationHook(orderId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de confirmation renvoyé avec succès',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Échec de l'envoi de l'email",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error resending confirmation email:', error)

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
