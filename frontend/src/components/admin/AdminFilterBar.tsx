import type { ReactNode } from 'react'

type AdminFilterBarProps = {
  children: ReactNode
}

export function AdminFilterBar({ children }: AdminFilterBarProps) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-[linear-gradient(135deg,rgba(242,247,240,0.28),rgba(255,253,247,0.9))] p-5 shadow-soft transition-colors duration-200 hover:border-forest-300">
      {children}
    </section>
  )
}
