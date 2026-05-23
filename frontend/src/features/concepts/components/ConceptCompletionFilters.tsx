import { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const hasActiveFilters = Boolean(search || status !== 'all' || language)
  const activeFiltersCount = (status !== 'all' ? 1 : 0) + (language ? 1 : 0)

  return (
    <AdminFilterBar>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-0">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-sand-200 bg-white/90 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
            placeholder="Search concepts by keyword..."
          />
          <span className="absolute left-3 top-2.5 text-cocoa-body/40">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 select-none ${
              isExpanded || activeFiltersCount > 0
                ? 'border-forest-accent/35 bg-forest-50/30 text-forest-700 font-bold ring-1 ring-forest-accent/20'
                : 'border-sand-200 bg-white text-cocoa-body hover:border-forest-accent/35 hover:bg-forest-50/20'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-forest-accent px-1 text-[9px] font-bold text-white leading-none">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-lg border border-sand-200 bg-white/90 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700"
            >
              Clear
            </button>
          )}

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

      {/* Expandable Advanced Options */}
      {isExpanded && (
        <div className="mt-4 border-t border-sand-100/60 pt-4 animate-in slide-in-from-top-2 duration-200 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Completion Milestone Status</span>
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value as ConceptCompletionStatus | 'all')}
                className="mt-1.5 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
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
              <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider">Required Language</span>
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
              >
                <option value="">All active languages</option>
                {requiredLanguages.map((option) => (
                  <option key={option.id} value={option.code}>
                    {option.name} ({option.code})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-sand-100/40 pt-3.5">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 select-none shadow-sm">
              <input
                type="checkbox"
                checked={showTextPreviews}
                onChange={(event) => onShowTextPreviewsChange(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-sand-300 text-forest-accent focus:ring-forest-100"
              />
              <span>Show translation text inline</span>
            </label>
            <p className="text-xs text-cocoa-body/65">Click a language badge in the table to preview its translation when this is disabled.</p>
          </div>
        </div>
      )}
    </AdminFilterBar>
  )
}
