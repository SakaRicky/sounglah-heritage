import { Check, Loader2, ThumbsDown } from 'lucide-react'

import type { ConceptTextReviewStatus } from '../types/conceptText.types'

type Props = {
  reviewStatus: ConceptTextReviewStatus
  saving?: boolean
  compact?: boolean
  onApprove: () => void
  onReject: () => void
}

const iconButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-50'

export function ConceptTextQuickReviewButtons({
  reviewStatus,
  saving = false,
  compact = false,
  onApprove,
  onReject,
}: Props) {
  const canApprove = reviewStatus !== 'approved'
  const canReject = reviewStatus !== 'rejected'

  if (!canApprove && !canReject) {
    return null
  }

  return (
    <div className={['inline-flex items-center gap-1', compact ? '' : ''].join(' ')}>
      {canApprove ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onApprove()
          }}
          disabled={saving}
          title="Approve text"
          aria-label="Approve text"
          className={`${iconButtonClass} border-forest-accent/25 bg-forest-accent/10 text-forest-700 hover:border-forest-accent hover:bg-forest-accent/15`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
        </button>
      ) : null}
      {canReject ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onReject()
          }}
          disabled={saving}
          title="Reject text"
          aria-label="Reject text"
          className={`${iconButtonClass} border-terracotta-500/25 bg-terracotta-400/10 text-terracotta-600 hover:border-terracotta-500/45 hover:bg-terracotta-400/15`}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
