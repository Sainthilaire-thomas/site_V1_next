// src/app/account/page.tsx
import { getServerSupabase } from '@/lib/supabase-server'
import { Package, Heart, User } from 'lucide-react'

export default async function AccountDashboard() {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch stats
  const [ordersCount, wishlistCount] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase
      .from('wishlist_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
  ])

  const stats = [
    { label: 'Commandes', value: ordersCount.count ?? 0, icon: Package },
    { label: 'Favoris', value: wishlistCount.count ?? 0, icon: Heart },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-[32px] font-light tracking-tight text-black mb-2">
          Bonjour, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-[15px] text-grey-medium">
          Bienvenue dans votre espace personnel
        </p>
      </div>

      {/* Stats Cards - Style minimaliste */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="border border-grey-light p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-5 h-5 text-grey-medium" strokeWidth={1.5} />
                <span className="text-[11px] tracking-[0.1em] uppercase text-grey-medium">
                  {stat.label}
                </span>
              </div>
              <div className="text-[32px] font-light text-black">
                {stat.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Section Activité récente */}
      <div>
        <h2 className="text-[18px] font-light text-black mb-6">
          Activité récente
        </h2>
        <div className="border-t border-grey-light">
          {/* Liste des dernières commandes/actions */}
          <p className="py-8 text-center text-grey-medium text-[13px]">
            Aucune activité récente
          </p>
        </div>
      </div>
    </div>
  )
}
