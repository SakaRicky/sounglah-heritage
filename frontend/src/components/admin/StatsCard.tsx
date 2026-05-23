import type { ReactNode } from 'react'

type StatsCardProps = {
  icon: ReactNode
  label: string
  value: string | number
  description?: string
  variant?: 'default' | 'green' | 'warm'
  cardClassName?: string
  iconClassName?: string
  descriptionClassName?: string
  labelClassName?: string
  /** Stacked layout and fixed height on small screens for even 2-column grids. */
  dense?: boolean
}

const variantClass: Record<NonNullable<StatsCardProps['variant']>, string> = {
  default: 'from-white/90 via-cream-50 to-forest-50/20',
  green: 'from-forest-50/35 via-cream-50 to-white/95',
  warm: 'from-cream-100/55 via-cream-50 to-gold-400/10',
}

function resolveSurfaceClass(
  variant: StatsCardProps['variant'],
  cardClassName: string | undefined,
  dense: boolean,
): string {
  if (!cardClassName) {
    return ['border-sand-200', dense ? 'max-sm:p-3 sm:p-5' : 'p-5', variantClass[variant ?? 'default']].join(' ')
  }

  if (cardClassName.includes('from-')) {
    return dense ? `${cardClassName} max-sm:p-3 sm:p-5` : cardClassName
  }

  return [variantClass[variant ?? 'default'], cardClassName].join(' ')
}

export function StatsCard({
  icon,
  label,
  value,
  description,
  variant = 'default',
  cardClassName,
  iconClassName,
  descriptionClassName,
  labelClassName,
  dense = false,
}: StatsCardProps) {
  const iconSizeClass = dense
    ? 'h-9 w-9 [&_svg]:h-4 [&_svg]:w-4 sm:h-12 sm:w-12 sm:[&_svg]:h-5 sm:[&_svg]:w-5'
    : 'h-12 w-12'

  const clusterClass = dense
    ? [
        'relative flex w-full min-w-0 flex-1 flex-col items-center gap-1.5 text-center',
        'max-sm:justify-center max-sm:px-0.5',
        'sm:flex-row sm:items-start sm:gap-4 sm:text-left',
      ].join(' ')
    : 'relative flex w-full items-start gap-4'

  const textClass = dense ? 'flex w-full flex-col items-center gap-1 sm:min-w-0 sm:flex-1 sm:items-start' : 'flex min-w-0 flex-1 flex-col'

  const labelClass = [
    'font-medium leading-snug text-forest-600/85',
    dense ? 'text-[11px] sm:text-sm' : 'text-sm',
    dense
      ? 'flex h-[2.25rem] w-full items-center justify-center line-clamp-2 sm:block sm:h-auto sm:line-clamp-none'
      : '',
    labelClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const valueClass = [
    'font-bold tabular-nums text-cocoa-800',
    dense ? 'text-[1.65rem] leading-none sm:mt-2 sm:text-3xl' : 'mt-2 text-3xl',
  ].join(' ')

  return (
    <article
      className={[
        'relative flex h-full w-full overflow-hidden rounded-2xl border bg-gradient-to-br shadow-soft transition-all duration-200 hover:border-forest-300 hover:bg-forest-50/20 hover:shadow-[0_14px_34px_rgba(31,90,61,0.11)]',
        dense ? 'max-sm:flex max-sm:h-32 max-sm:flex-col' : '',
        resolveSurfaceClass(variant, cardClassName, dense),
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border-[18px] border-forest-accent/5" />
      <div className={clusterClass}>
        <span
          className={[
            'flex shrink-0 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_20px_rgba(31,90,61,0.08)]',
            iconSizeClass,
            iconClassName ?? 'border-forest-accent/15 bg-white/70 text-forest-700',
          ].join(' ')}
        >
          {icon}
        </span>
        <div className={textClass}>
          <p className={labelClass}>{label}</p>
          <p className={valueClass}>{value}</p>
          {description ? (
            <p className={['mt-1 text-sm text-cocoa-body/75', descriptionClassName].filter(Boolean).join(' ')}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
