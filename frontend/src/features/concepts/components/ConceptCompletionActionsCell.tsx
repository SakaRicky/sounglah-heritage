import { Link } from 'react-router-dom'

import type { ConceptCompletionRow } from '../types/concept.types'
import { getPrimaryFixAction, getPublishDisabledReason } from '../utils/conceptCompletionQuickActions'

type Props = {
  row: ConceptCompletionRow
  publishingConceptId: string | null
  onPublish: (conceptId: string) => void
}

export function ConceptCompletionActionsCell({ row, publishingConceptId, onPublish }: Props) {
  const isPublished = row.completionStatus === 'published'
  const canPublish = row.isReadyToPublish
  const disabledReason = getPublishDisabledReason(row)
  const primaryFix = getPrimaryFixAction(row)
  const publishing = publishingConceptId === row.id

  return (
    <div className="flex flex-col items-end gap-2">
      {isPublished ? (
        <span className="inline-flex items-center rounded-full border border-forest-accent/25 bg-forest-accent/10 px-3 py-1 text-xs font-semibold text-forest-700">
          Published
        </span>
      ) : (
        <div className="group relative inline-flex">
          <button
            type="button"
            disabled={!canPublish || publishing}
            aria-label={disabledReason ?? 'Publish concept'}
            onClick={() => onPublish(row.id)}
            className={[
              'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-forest-200',
              canPublish
                ? 'border border-forest-accent/35 bg-forest-600 text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] hover:bg-forest-700'
                : 'cursor-not-allowed border border-sand-200 bg-stone-100 text-cocoa-body/45',
            ].join(' ')}
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
          {!canPublish && disabledReason ? (
            <div
              role="tooltip"
              className="pointer-events-none invisible absolute right-0 top-full z-20 mt-2 w-max max-w-[14rem] rounded-lg border border-sand-200 bg-white px-3 py-2 text-left text-xs leading-5 text-cocoa-body opacity-0 shadow-card transition-opacity duration-150 group-hover:visible group-hover:opacity-100"
            >
              {disabledReason}
            </div>
          ) : null}
        </div>
      )}

      {primaryFix && !isPublished ? (
        <Link
          to={primaryFix.to}
          className="text-xs font-semibold text-forest-700 underline-offset-2 hover:underline"
        >
          {primaryFix.label}
        </Link>
      ) : null}
    </div>
  )
}
