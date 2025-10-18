'use client'

type Address = {
  id: string
  type: string | null
  first_name: string | null // ✅ Permettre null
  last_name: string | null // ✅ Permettre null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  is_default: boolean | null
}

type Props = {
  addresses: Address[]
}

export function AddressesTab({ addresses }: Props) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Aucune adresse enregistrée
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {address.type === 'shipping' ? '📦' : '🏠'}
              </span>
              <span className="font-medium capitalize">
                {address.type || 'Adresse'}
              </span>
            </div>
            {address.is_default && (
              <span className="px-2 py-0.5 bg-violet/10 text-violet text-xs rounded">
                Par défaut
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="font-medium">
              {address.first_name || ''} {address.last_name || ''}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {address.address_line1 || 'Adresse non renseignée'}
            </div>
            {address.address_line2 && (
              <div className="text-gray-600 dark:text-gray-400">
                {address.address_line2}
              </div>
            )}
            <div className="text-gray-600 dark:text-gray-400">
              {address.postal_code || ''} {address.city || ''}
            </div>
            <div className="font-medium">{address.country || ''}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
