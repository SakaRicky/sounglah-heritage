import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import { conceptCompletionStatusLabel } from '../utils/conceptCompletionLabels'
import type { ConceptCompletionStatus } from '../types/concept.types'
import type { Language } from '../../languages/types/language.types'

type Props = {
  search: string
  status: ConceptCompletionStatus | 'all'
  language: string
  requiredLanguages: Language[]
  onSearchChange: (value: string) => void
  onStatusChange: (value: ConceptCompletionStatus | 'all') => void
  onLanguageChange: (value: string) => void
  onClearFilters: () => void
  showTextPreviews: boolean
  onShowTextPreviewsChange: (value: boolean) => void
}

const completionStatuses: ConceptCompletionStatus[] = [
  'needs_translation',
  'has_rejected_text',
  'draft',
  'needs_review',
  'complete',
  'published',
]

export function ConceptCompletionFilters({
  search,
  status,
  language,
  requiredLanguages,
  onSearchChange,
  onStatusChange,
  onLanguageChange,
  onClearFilters,
  showTextPreviews,
  onShowTextPreviewsChange,
}: Props) {
  const hasActiveFilters = Boolean(search || status !== 'all' || language)

  return (
    <AdminFilterBar>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-medium text-forest-600">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            placeholder="Search concepts..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as ConceptCompletionStatus | 'all')}
            className="mt-2 w-full min-w-44 rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="all">All statuses</option>
            {completionStatuses.map((option) => (
              <option key={option} value={option}>
                {conceptCompletionStatusLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Required language</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="mt-2 w-full min-w-44 rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="">All languages</option>
            {requiredLanguages.map((option) => (
              <option key={option.id} value={option.code}>
                {option.name} ({option.code})
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50 lg:min-w-36"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-4">
        <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-sand-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30">
          <input
            type="checkbox"
            checked={showTextPreviews}
            onChange={(event) => onShowTextPreviewsChange(event.target.checked)}
            className="h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-200"
          />
          Show translation text
        </label>
        <p className="text-sm text-cocoa-body/70">Click a language badge to preview one translation when this is off.</p>
      </div>
    </AdminFilterBar>
  )
}
