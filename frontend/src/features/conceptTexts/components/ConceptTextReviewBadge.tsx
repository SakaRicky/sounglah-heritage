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

export function ConceptTextReviewBadge({ reviewStatus }: Props) {
  return (
    <span className={['inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', badgeClass[reviewStatus]].join(' ')}>
      {conceptTextReviewStatusLabel(reviewStatus)}
    </span>
  )
}
