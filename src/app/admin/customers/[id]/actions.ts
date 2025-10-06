'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function updateCustomerAction(
  customerId: string,
  data: {
    first_name: string
    last_name: string
    phone: string
    role: string
  }
) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    if (error) {
      return { ok: false as const, error: { message: error.message } }
    }

    revalidatePath(`/admin/customers/${customerId}`)
    revalidatePath('/admin/customers')
    return { ok: true as const }
  } catch (error: any) {
    return { ok: false as const, error: { message: 'Erreur serveur' } }
  }
}
