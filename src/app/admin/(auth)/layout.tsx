// src/app/admin/(auth)/layout.tsx
import type { ReactNode } from 'react' // ← Ajouter "type"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">{children}</div>
  )
}
