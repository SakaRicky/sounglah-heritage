import { useState } from 'react'

import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import type { ConceptDifficultyLevel, ConceptStatus } from '../types/concept.types'

export type ConceptSort = 'title' | 'newest' | 'sortOrder'

type Props = {
  search: string
  status: ConceptStatus | 'all'
  category: string
  difficultyLevel: ConceptDifficultyLevel | 'all'
  sort: ConceptSort
  viewMode: 'list' | 'grid'
  onSearchChange: (value: string) => void
  onStatusChange: (value: ConceptStatus | 'all') => void
  onCategoryChange: (value: string) => void
  onDifficultyLevelChange: (value: ConceptDifficultyLevel | 'all') => void
  onSortChange: (value: ConceptSort) => void
  onViewModeChange: (value: 'list' | 'grid') => void
}

function FunnelIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16l-6 7v4.5l-4 2V13L4 6z" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={['h-4 w-4 transition-transform', open ? 'rotate-180' : ''].join(' ')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function ConceptFilters({
  search,
  status,
  category,
  difficultyLevel,
  sort,
  viewMode,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onDifficultyLevelChange,
  onSortChange,
  onViewModeChange,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [
    status !== 'all' ? status : '',
    category,
    difficultyLevel !== 'all' ? difficultyLevel : '',
    sort !== 'sortOrder' ? sort : '',
  ].filter(Boolean).length

  function clearFilters() {
    onStatusChange('all')
    onCategoryChange('')
    onDifficultyLevelChange('all')
    onSortChange('sortOrder')
  }

  return (
    <AdminFilterBar>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <label className="block relative">
          <span className="sr-only">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-sand-200 bg-white/95 px-3.5 py-2 text-xs sm:text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
            placeholder="Search by title, key, slug, category..."
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((current) => !current)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-forest-accent/25 bg-white/95 px-4 py-2 text-xs sm:text-sm font-semibold text-forest-700 shadow-sm transition hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            <FunnelIcon />
            {filtersOpen ? 'Hide filters' : 'Show filters'}
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-forest-accent px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {activeFilterCount}
              </span>
            ) : null}
            <ChevronIcon open={filtersOpen} />
          </button>

          {/* Premium View Toggle Group */}
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

      {filtersOpen ? (
        <div className="mt-3 border-t border-sand-100 pt-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 items-end">
            <label className="block">
              <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Status</span>
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value as ConceptStatus | 'all')}
                className="mt-1 w-full rounded-lg border border-sand-200 bg-white/90 px-2.5 py-1.5 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Category</span>
              <input
                value={category}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-sand-200 bg-white/90 px-2.5 py-1.5 text-xs sm:text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                placeholder="family_people"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Difficulty</span>
              <select
                value={difficultyLevel}
                onChange={(event) => onDifficultyLevelChange(event.target.value as ConceptDifficultyLevel | 'all')}
                className="mt-1 w-full rounded-lg border border-sand-200 bg-white/90 px-2.5 py-1.5 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
              >
                <option value="all">All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-semibold text-forest-600 uppercase tracking-wider">Sort</span>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value as ConceptSort)}
                className="mt-1 w-full rounded-lg border border-sand-200 bg-white/90 px-2.5 py-1.5 text-xs sm:text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
              >
                <option value="sortOrder">Sort Order</option>
                <option value="title">Title (A-Z)</option>
                <option value="newest">Newest</option>
              </select>
            </label>

            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <button
                type="button"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="w-full rounded-lg border border-sand-200 bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminFilterBar>
  )
}
