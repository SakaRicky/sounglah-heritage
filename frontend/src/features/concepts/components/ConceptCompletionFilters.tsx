import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import { conceptCompletionStatusLabel } from '../utils/conceptCompletionLabels'
import type { ConceptCompletionStatus } from '../types/concept.types'
import type { Language } from '../../languages/types/language.types'

type Props = {
  search: string
  status: ConceptCompletionStatus | 'all'
  language: string
  requiredLanguages: Language[]
  viewMode: 'list' | 'grid'
  onSearchChange: (value: string) => void
  onStatusChange: (value: ConceptCompletionStatus | 'all') => void
  onLanguageChange: (value: string) => void
  onClearFilters: () => void
  onViewModeChange: (value: 'list' | 'grid') => void
  showTextPreviews: boolean
  onShowTextPreviewsChange: (value: boolean) => void
}

const completionStatuses: ConceptCompletionStatus[] = [
  'needs_translation',
  'has_rejected_text',
  'draft',
  'needs_review',
  'needs_audio',
  'complete',
  'published',
]

export function ConceptCompletionFilters({
  search,
  status,
  language,
  requiredLanguages,
  viewMode,
  onSearchChange,
  onStatusChange,
  onLanguageChange,
  onClearFilters,
  onViewModeChange,
  showTextPreviews,
  onShowTextPreviewsChange,
}: Props) {
  const hasActiveFilters = Boolean(search || status !== 'all' || language)

  return (
    <AdminFilterBar>
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-end">
        <label className="block col-span-2 sm:col-span-1 lg:col-span-1">
          <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-sand-200 bg-white/90 px-3.5 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
            placeholder="Search concepts..."
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as ConceptCompletionStatus | 'all')}
            className="mt-1 w-full min-w-[9rem] sm:min-w-[11rem] rounded-lg border border-sand-200 bg-white/90 px-2.5 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
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
          <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Required language</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="mt-1 w-full min-w-[9rem] sm:min-w-[11rem] rounded-lg border border-sand-200 bg-white/90 px-2.5 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
          >
            <option value="">All languages</option>
            {requiredLanguages.map((option) => (
              <option key={option.id} value={option.code}>
                {option.name} ({option.code})
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 col-span-2 sm:col-span-1 lg:col-span-1">
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="flex-1 rounded-lg border border-sand-200 bg-white/90 px-4 py-2 text-xs sm:text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50 lg:min-w-[8rem]"
          >
            Clear
          </button>

          {/* Premium View Toggle Switcher */}
          <div className="inline-flex rounded-lg border border-sand-200 bg-white/95 p-0.5 shadow-sm shrink-0 select-none">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-forest-100 text-forest-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] font-bold'
                  : 'text-cocoa-700/60 hover:text-cocoa-800 hover:bg-forest-50/20'
              }`}
              title="List View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-forest-100 text-forest-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] font-bold'
                  : 'text-cocoa-700/60 hover:text-cocoa-800 hover:bg-forest-50/20'
              }`}
              title="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-sand-100/60 pt-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 select-none shadow-sm">
          <input
            type="checkbox"
            checked={showTextPreviews}
            onChange={(event) => onShowTextPreviewsChange(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-sand-300 text-forest-accent focus:ring-forest-100"
          />
          <span>Show translation text</span>
        </label>
        <p className="text-xs text-cocoa-body/75">Click a language badge to preview one translation when this is off.</p>
      </div>
    </AdminFilterBar>
  )
}
