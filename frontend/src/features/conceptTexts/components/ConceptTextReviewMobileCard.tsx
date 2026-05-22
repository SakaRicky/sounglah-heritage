import { CalendarDays } from 'lucide-react'

import { formatDate } from '../../../lib/date'
import type { ConceptTextReviewQueueItem } from '../types/conceptText.types'
import { ConceptTextReviewActions } from './ConceptTextReviewActions'
import { ConceptTextReviewBadge } from './ConceptTextReviewBadge'
import { ConceptTextReviewReferenceTexts } from './ConceptTextReviewReferenceTexts'

function getConceptInitial(value?: string | null) {
  const firstLetter = value?.trim().match(/\p{L}/u)?.[0]
  return firstLetter ? firstLetter.toUpperCase() : '?'
}

type Props = {
  conceptText: ConceptTextReviewQueueItem
  saving?: boolean
  selected?: boolean
  selectable?: boolean
  onToggleSelected?: () => void
  onApprove: () => void
  onReject: () => void
}

export function ConceptTextReviewMobileCard({
  conceptText,
  saving = false,
  selected = false,
  selectable = true,
  onToggleSelected,
  onApprove,
  onReject,
}: Props) {
  const title = conceptText.concept?.title ?? 'Untitled concept'

  return (
    <article className="rounded-2xl border border-sand-100 bg-white/90 p-3.5 shadow-[0_10px_28px_rgba(47,26,16,0.07)] sm:p-4">
      {onToggleSelected ? (
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            disabled={!selectable}
            onChange={onToggleSelected}
            aria-label={`Select ${title}`}
            className="h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-40"
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-cocoa-body/55">Select for bulk review</span>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
        <div className="min-w-0">
          <div className="rounded-2xl border border-forest-accent/20 bg-forest-accent/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/75">Text to review</p>
            <p className="mt-2 break-words text-2xl font-bold leading-tight text-cocoa-800">{conceptText.text}</p>
          </div>

          <div className="mt-3 flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-lg font-bold text-forest-700">
              {getConceptInitial(title)}
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-cocoa-800">{title}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-cocoa-body/70">
                <span className="inline-flex rounded-sm bg-terracotta-500 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-gold-400">
                  {conceptText.language?.code?.slice(0, 2) ?? 'lg'}
                </span>
                <span>{conceptText.language?.name ?? 'Unknown language'}</span>
                <span aria-hidden>·</span>
                <span className="uppercase">{conceptText.language?.code ?? 'unknown'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:border-l sm:border-sand-100 sm:pl-4">
          <p className="flex items-start gap-2 text-sm text-cocoa-body/70">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-cocoa-body/65" aria-hidden />
            <span>
              <span className="block font-medium text-cocoa-body">Updated {formatDate(conceptText.updatedAt)}</span>
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3 sm:ml-[3.25rem]">
        <ConceptTextReviewBadge reviewStatus={conceptText.reviewStatus} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-body/55">Reference</p>
          <div className="mt-1">
            <ConceptTextReviewReferenceTexts references={conceptText.referenceTexts} compact />
          </div>
        </div>
      </div>

      <ConceptTextReviewActions
        conceptText={conceptText}
        saving={saving}
        layout="mobile"
        onApprove={onApprove}
        onReject={onReject}
      />
    </article>
  )
}
