import { conceptTextReviewStatusLabel } from '../utils/conceptTextLabels'
import type { ConceptTextReviewStatus } from '../types/conceptText.types'

type Props = {
  reviewStatus: ConceptTextReviewStatus
}

const badgeClass: Record<ConceptTextReviewStatus, string> = {
  draft: 'border-sand-200 bg-stone-100 text-cocoa-body/70',
  needs_review: 'border-gold-500/30 bg-gold-400/15 text-gold-700',
  approved: 'border-forest-accent/25 bg-forest-accent/10 text-forest-700',
}

const dotClass: Record<ConceptTextReviewStatus, string> = {
  draft: 'bg-cocoa-body/45',
  needs_review: 'bg-gold-500',
  approved: 'bg-forest-accent',
}

export function ConceptTextReviewBadge({ reviewStatus }: Props) {
  return (
    <span className={['inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold', badgeClass[reviewStatus]].join(' ')}>
      <span className={['h-2 w-2 rounded-full', dotClass[reviewStatus]].join(' ')} />
      {conceptTextReviewStatusLabel(reviewStatus)}
    </span>
  )
}
