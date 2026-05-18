type StatusBadgeVariant = 'active' | 'inactive' | 'disabled' | 'draft' | 'beginner' | 'intermediate' | 'advanced'

type StatusBadgeProps = {
  variant: StatusBadgeVariant
  children?: string
}

const variantClass: Record<StatusBadgeVariant, string> = {
  active: 'bg-green-100 text-forest-700',
  inactive: 'bg-sand-100/80 text-cocoa-body',
  disabled: 'bg-sand-100/80 text-cocoa-body',
  draft: 'bg-cream-100 text-cocoa-body',
  beginner: 'bg-forest-accent/10 text-forest-700',
  intermediate: 'bg-gold-400/20 text-cocoa-800',
  advanced: 'bg-terracotta-400/15 text-terracotta-600',
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${variantClass[variant]}`}>
      {children ?? variant}
    </span>
  )
}
