import { useState } from 'react'

import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import type { Concept } from '../../concepts/types/concept.types'
import type { Language } from '../../languages/types/language.types'
import type { ConceptTextReviewStatus, ConceptTextStatus } from '../types/conceptText.types'

export type ConceptTextSort = 'updated' | 'concept' | 'language' | 'text'

type Props = {
  search: string
  conceptSearch: string
  conceptId: string
  languageId: string
  status: ConceptTextStatus | 'all'
  reviewStatus: ConceptTextReviewStatus | 'all'
  sort: ConceptTextSort
  concepts: Concept[]
  languages: Language[]
  onSearchChange: (value: string) => void
  onConceptSearchChange: (value: string) => void
  onConceptChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onStatusChange: (value: ConceptTextStatus | 'all') => void
  onReviewStatusChange: (value: ConceptTextReviewStatus | 'all') => void
  onSortChange: (value: ConceptTextSort) => void
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

export function ConceptTextFilters({
  search,
  conceptSearch,
  conceptId,
  languageId,
  status,
  reviewStatus,
  sort,
  concepts,
  languages,
  onSearchChange,
  onConceptSearchChange,
  onConceptChange,
  onLanguageChange,
  onStatusChange,
  onReviewStatusChange,
  onSortChange,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [
    conceptId,
    languageId,
    status !== 'all' ? status : '',
    reviewStatus !== 'all' ? reviewStatus : '',
    sort !== 'updated' ? sort : '',
  ].filter(Boolean).length

  function clearFilters() {
    onConceptChange('')
    onLanguageChange('')
    onStatusChange('all')
    onReviewStatusChange('all')
    onSortChange('updated')
  }

  return (
    <AdminFilterBar>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-medium text-forest-600">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            placeholder="Search text, concept, language..."
          />
        </label>

        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((current) => !current)}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white/95 px-5 py-3 text-sm font-semibold text-forest-700 shadow-[0_8px_24px_rgba(31,90,61,0.1)] transition hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200"
        >
          <FunnelIcon />
          {filtersOpen ? 'Hide filters' : 'Show filters'}
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-forest-accent px-2 py-0.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
          <ChevronIcon open={filtersOpen} />
        </button>
      </div>

      {filtersOpen ? (
        <div className="mt-5 border-t border-sand-100 pt-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-forest-600">Concept</span>
              <input
                value={conceptSearch}
                onChange={(event) => onConceptSearchChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
                placeholder="Find concept..."
              />
              <select
                value={conceptId}
                onChange={(event) => onConceptChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              >
                <option value="">All concepts</option>
                {concepts.map((concept) => (
                  <option key={concept.id} value={concept.id}>
                    {concept.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-forest-600">Language</span>
              <select
                value={languageId}
                onChange={(event) => onLanguageChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              >
                <option value="">All languages</option>
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-forest-600">Status</span>
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value as ConceptTextStatus | 'all')}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-forest-600">Review</span>
              <select
                value={reviewStatus}
                onChange={(event) => onReviewStatusChange(event.target.value as ConceptTextReviewStatus | 'all')}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="needs_review">Needs review</option>
                <option value="approved">Approved</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-forest-600">Sort</span>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value as ConceptTextSort)}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              >
                <option value="updated">Updated</option>
                <option value="concept">Concept</option>
                <option value="language">Language</option>
                <option value="text">Text</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
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
