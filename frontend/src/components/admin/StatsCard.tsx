import type { ReactNode } from 'react'

type StatsCardProps = {
  icon: ReactNode
  label: string
  value: string | number
  description?: string
  variant?: 'default' | 'green' | 'warm'
}

const variantClass: Record<NonNullable<StatsCardProps['variant']>, string> = {
  default: 'from-white/90 via-cream-50 to-forest-50/20',
  green: 'from-forest-50/35 via-cream-50 to-white/95',
  warm: 'from-cream-100/55 via-cream-50 to-gold-400/10',
}

export function StatsCard({ icon, label, value, description, variant = 'default' }: StatsCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-sand-200 bg-gradient-to-br ${variantClass[variant]} p-5 shadow-soft transition-all duration-200 hover:border-forest-300 hover:bg-forest-50/20 hover:shadow-[0_14px_34px_rgba(31,90,61,0.11)]`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border-[18px] border-forest-accent/5" />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-forest-accent/15 bg-white/70 text-forest-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_20px_rgba(31,90,61,0.08)]">
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-forest-600/85">{label}</p>
          <p className="mt-2 text-3xl font-bold text-cocoa-800">{value}</p>
          {description ? <p className="mt-1 text-sm text-cocoa-body/75">{description}</p> : null}
        </div>
      </div>
    </article>
  )
}
