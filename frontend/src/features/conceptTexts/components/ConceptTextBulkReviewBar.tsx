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
      : `${approveCount || rejectCount} ready`

  return (
    <section className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-cream-50/95 backdrop-blur-md border border-sand-200/85 p-3.5 sm:p-4 rounded-2xl shadow-[0_16px_40px_rgba(47,26,16,0.15)] flex flex-row items-center justify-between gap-4 transition-all duration-300">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-bold text-cocoa-800">Bulk review</p>
        <p className="text-[11px] sm:text-xs text-cocoa-body/75 truncate">{scopeLabel}</p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {onClearSelection && selectedCount > 0 ? (
          <button
            type="button"
            onClick={onClearSelection}
            disabled={busy}
            className="rounded-xl border border-sand-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        ) : null}
        {approveCount > 0 ? (
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1 sm:gap-2 rounded-xl bg-forest-accent px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" aria-hidden /> : <Check className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />}
            Approve
          </button>
        ) : null}
        {rejectCount > 0 ? (
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1 sm:gap-2 rounded-xl border border-terracotta-500/25 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-terracotta-600 transition hover:border-terracotta-500/45 hover:bg-terracotta-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" aria-hidden /> : <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />}
            Reject
          </button>
        ) : null}
      </div>
    </section>
  )
}
