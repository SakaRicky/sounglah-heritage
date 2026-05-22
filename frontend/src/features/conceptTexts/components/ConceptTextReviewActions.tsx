import { Link } from 'react-router-dom'
import { Check, Loader2, Pencil, ThumbsDown } from 'lucide-react'

import type { ConceptTextReviewQueueItem } from '../types/conceptText.types'
import { conceptTextReviewEditPath } from '../utils/conceptTextReviewPaths'

type Props = {
  conceptText: ConceptTextReviewQueueItem
  saving?: boolean
  layout?: 'desktop' | 'mobile'
  onApprove: () => void
  onReject: () => void
}

export function ConceptTextReviewActions({
  conceptText,
  saving = false,
  layout = 'desktop',
  onApprove,
  onReject,
}: Props) {
  const canApprove = conceptText.reviewStatus !== 'approved'
  const canReject = conceptText.reviewStatus !== 'rejected'
  const editPath = conceptTextReviewEditPath(conceptText.id)

  if (layout === 'mobile') {
    return (
      <div className="mt-3 space-y-2.5 sm:ml-[3.25rem]">
        <div className="grid grid-cols-2 gap-2.5">
          {canApprove ? (
            <button
              type="button"
              onClick={onApprove}
              disabled={saving}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-forest-accent px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
              Approve
            </button>
          ) : null}
          {canReject ? (
            <button
              type="button"
              onClick={onReject}
              disabled={saving}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-terracotta-500/35 bg-white px-3.5 py-2 text-sm font-semibold text-terracotta-600 transition hover:border-terracotta-500/55 hover:bg-terracotta-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ThumbsDown className="h-4 w-4" aria-hidden />
              Reject
            </button>
          ) : null}
        </div>
        <Link
          to={editPath}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white px-3.5 py-2 text-sm font-semibold text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/40"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Edit text
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canApprove ? (
        <button
          type="button"
          onClick={onApprove}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-forest-accent px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
          Approve
        </button>
      ) : null}
      {canReject ? (
        <button
          type="button"
          onClick={onReject}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-terracotta-500/25 bg-white px-3 py-2 text-sm font-semibold text-terracotta-600 transition hover:border-terracotta-500/45 hover:bg-terracotta-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ThumbsDown className="h-4 w-4" aria-hidden />
          Reject
        </button>
      ) : null}
      <Link
        to={editPath}
        className="inline-flex items-center gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/40"
      >
        <Pencil className="h-4 w-4" aria-hidden />
        Edit
      </Link>
    </div>
  )
}
