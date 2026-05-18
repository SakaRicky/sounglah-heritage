import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import type { LanguageStatus } from '../types/language.types'

export type LanguageSort = 'name' | 'newest' | 'sortOrder'

type Props = {
  search: string
  status: LanguageStatus | 'all'
  sort: LanguageSort
  onSearchChange: (value: string) => void
  onStatusChange: (value: LanguageStatus | 'all') => void
  onSortChange: (value: LanguageSort) => void
}

function FunnelIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16l-6 7v4.5l-4 2V13L4 6z" />
    </svg>
  )
}

export function LanguageFilters({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: Props) {
  return (
    <AdminFilterBar>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-medium text-forest-600">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            placeholder="Search by name, native name, code, or slug..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as LanguageStatus | 'all')}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-forest-600">Sort</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as LanguageSort)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
          >
            <option value="name">Name (A-Z)</option>
            <option value="newest">Newest</option>
            <option value="sortOrder">Sort Order</option>
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
