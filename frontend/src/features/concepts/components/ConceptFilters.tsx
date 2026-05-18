import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import type { ConceptDifficultyLevel, ConceptStatus } from '../types/concept.types'

export type ConceptSort = 'title' | 'newest' | 'sortOrder'

type Props = {
  search: string
  status: ConceptStatus | 'all'
  category: string
  difficultyLevel: ConceptDifficultyLevel | 'all'
  sort: ConceptSort
  onSearchChange: (value: string) => void
  onStatusChange: (value: ConceptStatus | 'all') => void
  onCategoryChange: (value: string) => void
  onDifficultyLevelChange: (value: ConceptDifficultyLevel | 'all') => void
  onSortChange: (value: ConceptSort) => void
}

function FunnelIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16l-6 7v4.5l-4 2V13L4 6z" />
    </svg>
  )
}

export function ConceptFilters({
  search,
  status,
  category,
  difficultyLevel,
  sort,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onDifficultyLevelChange,
  onSortChange,
}: Props) {
  return (
    <AdminFilterBar>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_11rem_12rem_12rem_11rem_auto] xl:items-end">
        <label className="block">
          <span className="text-sm font-medium text-forest-600">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            placeholder="Search by title, key, slug, category..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as ConceptStatus | 'all')}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Category</span>
          <input
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            placeholder="Family"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Difficulty</span>
          <select
            value={difficultyLevel}
            onChange={(event) => onDifficultyLevelChange(event.target.value as ConceptDifficultyLevel | 'all')}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="all">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Sort</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as ConceptSort)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="sortOrder">Sort Order</option>
            <option value="title">Title (A-Z)</option>
            <option value="newest">Newest</option>
          </select>
        </label>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white/95 px-5 py-3 text-sm font-semibold text-forest-700 shadow-[0_8px_24px_rgba(31,90,61,0.1)] transition hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200"
        >
          <FunnelIcon />
          Filter
        </button>
      </div>
    </AdminFilterBar>
  )
}
