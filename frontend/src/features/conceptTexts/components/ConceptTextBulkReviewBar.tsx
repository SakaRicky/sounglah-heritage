import { Check, Loader2, ThumbsDown } from 'lucide-react'

type Props = {
  approveCount: number
  rejectCount: number
  selectedCount?: number
  busy?: boolean
  onApprove: () => void
  onReject: () => void
  onClearSelection?: () => void
}

export function ConceptTextBulkReviewBar({
  approveCount,
  rejectCount,
  selectedCount = 0,
  busy = false,
  onApprove,
  onReject,
  onClearSelection,
}: Props) {
  if (approveCount === 0 && rejectCount === 0) {
    return null
  }

  const scopeLabel =
    selectedCount > 0
      ? `${selectedCount} selected`
      : `${approveCount || rejectCount} on this page`

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-sand-200 bg-cream-50/85 px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-cocoa-800">Bulk review</p>
        <p className="text-sm text-cocoa-body/75">{scopeLabel}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onClearSelection && selectedCount > 0 ? (
          <button
            type="button"
            onClick={onClearSelection}
            disabled={busy}
            className="rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear selection
          </button>
        ) : null}
        {approveCount > 0 ? (
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-forest-accent/25 bg-forest-accent px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
            Approve ({approveCount})
          </button>
        ) : null}
        {rejectCount > 0 ? (
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-terracotta-500/25 bg-white px-3 py-2 text-sm font-semibold text-terracotta-600 transition hover:border-terracotta-500/45 hover:bg-terracotta-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ThumbsDown className="h-4 w-4" aria-hidden />}
            Reject ({rejectCount})
          </button>
        ) : null}
      </div>
    </section>
  )
}
