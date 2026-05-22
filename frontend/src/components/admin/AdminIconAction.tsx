import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'default' | 'primary' | 'disabled'

type SharedProps = {
  label: string
  tooltip?: string
  variant?: Variant
  children: ReactNode
  className?: string
}

export const adminIconActionButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-forest-200'

export const adminIconActionIconClass = 'h-5 w-5'

const baseClass = adminIconActionButtonClass

const variantClass: Record<Variant, string> = {
  default:
    'border-forest-accent/35 bg-white text-forest-700 hover:border-forest-accent hover:bg-forest-50/30 hover:shadow-[0_8px_22px_rgba(31,90,61,0.08)]',
  primary:
    'border-forest-accent/35 bg-forest-600 text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] hover:bg-forest-700',
  disabled: 'cursor-not-allowed border-sand-200 bg-stone-100 text-cocoa-body/45 opacity-50',
}

function ActionTooltip({ text, multiline = false }: { text: string; multiline?: boolean }) {
  return (
    <span
      role="tooltip"
      className={[
        'pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg bg-cocoa-800 px-2.5 py-1.5 text-center text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150',
        'group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
        multiline ? 'max-w-[14rem] whitespace-normal leading-5' : 'max-w-[12rem] whitespace-nowrap',
      ].join(' ')}
    >
      {text}
    </span>
  )
}

function ActionShell({
  label,
  tooltip,
  multilineTooltip = false,
  children,
}: {
  label: string
  tooltip?: string
  multilineTooltip?: boolean
  children: ReactNode
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <ActionTooltip text={tooltip ?? label} multiline={multilineTooltip} />
    </span>
  )
}

export function AdminIconAction({
  label,
  tooltip,
  multilineTooltip = false,
  variant = 'default',
  children,
  className = '',
  ...rest
}: SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    multilineTooltip?: boolean
  }) {
  return (
    <ActionShell label={label} tooltip={tooltip} multilineTooltip={multilineTooltip}>
      <button
        type="button"
        aria-label={label}
        className={[baseClass, variantClass[variant], className].join(' ')}
        {...rest}
      >
        {children}
      </button>
    </ActionShell>
  )
}

export function AdminIconActionLink({
  label,
  tooltip,
  variant = 'default',
  children,
  className = '',
  ...rest
}: SharedProps & LinkProps) {
  return (
    <ActionShell label={label} tooltip={tooltip}>
      <Link aria-label={label} className={[baseClass, variantClass[variant], className].join(' ')} {...rest}>
        {children}
      </Link>
    </ActionShell>
  )
}

export function AdminIconActionAnchor({
  label,
  tooltip,
  variant = 'default',
  children,
  className = '',
  ...rest
}: SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <ActionShell label={label} tooltip={tooltip}>
      <a aria-label={label} className={[baseClass, variantClass[variant], className].join(' ')} {...rest}>
        {children}
      </a>
    </ActionShell>
  )
}
