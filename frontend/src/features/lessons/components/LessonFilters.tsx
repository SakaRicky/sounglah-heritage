import { useState } from 'react'

import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import { useI18n } from '../../../i18n'
import type { LessonDifficulty, LessonStatus } from '../types/lesson.types'

type Props = {
  search: string
  status: LessonStatus | 'all'
  difficulty: LessonDifficulty | 'all'
  onSearchChange: (value: string) => void
  onStatusChange: (value: LessonStatus | 'all') => void
  onDifficultyChange: (value: LessonDifficulty | 'all') => void
}

function SearchIcon() {
  return (
    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-body/45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.34 6.34M4 15a8 8 0 0013.66 2.66" />
    </svg>
  )
}

function FunnelIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16l-6 7v4.5l-4 2V13L4 6z" />
    </svg>
  )
}

export function LessonFilters({
  search,
  status,
  difficulty,
  onSearchChange,
  onStatusChange,
  onDifficultyChange,
}: Props) {
  const { t } = useI18n()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasActiveFilters = status !== 'all' || difficulty !== 'all'

  function clearFilters() {
    onStatusChange('all')
    onDifficultyChange('all')
  }

  const filterFields = (
    <>
      <label className="block min-w-[10rem]">
        <span className="text-sm font-medium text-forest-600">{t('admin.lessons.filters.status')}</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as LessonStatus | 'all')}
          className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
        >
          <option value="all">{t('admin.lessons.filters.allStatuses')}</option>
          <option value="draft">{t('admin.lessons.status.draft')}</option>
          <option value="published">{t('admin.lessons.status.published')}</option>
          <option value="archived">{t('admin.lessons.status.archived')}</option>
        </select>
      </label>

      <label className="block min-w-[10rem]">
        <span className="text-sm font-medium text-forest-600">{t('admin.lessons.filters.difficulty')}</span>
        <select
          value={difficulty}
          onChange={(event) => onDifficultyChange(event.target.value as LessonDifficulty | 'all')}
          className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
        >
          <option value="all">{t('admin.lessons.filters.allDifficulties')}</option>
          <option value="beginner">{t('admin.lessons.difficulty.beginner')}</option>
          <option value="intermediate">{t('admin.lessons.difficulty.intermediate')}</option>
          <option value="advanced">{t('admin.lessons.difficulty.advanced')}</option>
        </select>
      </label>

      <div className="flex items-end">
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ResetIcon />
          {t('admin.lessons.filters.clear')}
        </button>
      </div>
    </>
  )

  return (
    <AdminFilterBar>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="relative block">
          <span className="text-sm font-medium text-forest-600">{t('admin.lessons.filters.search')}</span>
          <SearchIcon />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 py-3 pl-10 pr-4 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            placeholder={t('admin.lessons.filters.searchPlaceholder')}
          />
        </label>

        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((current) => !current)}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white/95 px-5 py-3 text-sm font-semibold text-forest-700 shadow-[0_8px_24px_rgba(31,90,61,0.1)] transition hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200 lg:hidden"
        >
          <FunnelIcon />
          {t('admin.lessons.filters.toggle')}
          {hasActiveFilters ? (
            <span className="rounded-full bg-forest-accent px-2 py-0.5 text-xs font-bold text-white">!</span>
          ) : null}
        </button>
      </div>

      <div className="mt-5 hidden gap-4 border-t border-sand-100 pt-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid">
        {filterFields}
      </div>

      {filtersOpen ? (
        <div className="mt-5 grid gap-4 border-t border-sand-100 pt-5 lg:hidden">
          {filterFields}
        </div>
      ) : null}
    </AdminFilterBar>
  )
}
