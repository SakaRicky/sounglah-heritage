import { conceptCompletionStatusLabel } from '../utils/conceptCompletionLabels'
import type { ConceptCompletionStatus } from '../types/concept.types'

type Props = {
  status: ConceptCompletionStatus
}

const badgeClass: Record<ConceptCompletionStatus, string> = {
  needs_translation: 'border-terracotta-500/25 bg-terracotta-400/10 text-terracotta-600',
  has_rejected_text: 'border-terracotta-500/25 bg-terracotta-400/10 text-terracotta-600',
  draft: 'border-sand-200 bg-stone-100 text-cocoa-body/70',
  needs_review: 'border-gold-500/30 bg-gold-400/15 text-gold-700',
  complete: 'border-forest-accent/25 bg-forest-accent/10 text-forest-700',
  published: 'border-forest-accent/25 bg-forest-accent/10 text-forest-700',
}

const dotClass: Record<ConceptCompletionStatus, string> = {
  needs_translation: 'bg-terracotta-500',
  has_rejected_text: 'bg-terracotta-500',
  draft: 'bg-cocoa-body/45',
  needs_review: 'bg-gold-500',
  complete: 'bg-forest-accent',
  published: 'bg-forest-accent',
}

export function ConceptCompletionStatusBadge({ status }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold',
        badgeClass[status],
      ].join(' ')}
    >
      <span className={['h-2 w-2 rounded-full', dotClass[status]].join(' ')} />
      {conceptCompletionStatusLabel(status)}
    </span>
  )
}
