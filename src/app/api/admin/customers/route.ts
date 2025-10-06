import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getCustomers } from '@/lib/services/customerService'
import { customersFilterSchema } from '@/lib/validation/adminCustomers'

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const params = {
    q: searchParams.get('q') || undefined,
    role: searchParams.get('role') || 'all',
    sort: searchParams.get('sort') || 'newest',
    limit: Number(searchParams.get('limit') || 50),
    offset: Number(searchParams.get('offset') || 0),
  }

  const parsed = customersFilterSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const result = await getCustomers(parsed.data)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
