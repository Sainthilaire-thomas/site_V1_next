import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getCustomerStats } from '@/lib/services/customerService'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const stats = await getCustomerStats()
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching customer stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        total: 0,
        newThisMonth: 0,
        active: 0,
        totalRevenue: 0,
      },
      { status: 500 }
    )
  }
}
