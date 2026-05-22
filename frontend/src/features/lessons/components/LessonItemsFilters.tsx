import { Filter, Search } from 'lucide-react'

import { useI18n } from '../../../i18n'
import type { LessonItemType } from '../types/lessonItem.types'

export type LessonItemsFilterState = {
  search: string
  type: LessonItemType | 'all'
  status: 'all' | 'published' | 'draft'
}

type Props = {
  filters: LessonItemsFilterState
  onChange: (filters: LessonItemsFilterState) => void
}

const fieldClass =
  'w-full rounded-xl border border-sand-200 bg-white py-2.5 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/45 focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.12)]'

export function LessonItemsFilters({ filters, onChange }: Props) {
  const { t } = useI18n()

  function update<Key extends keyof LessonItemsFilterState>(key: Key, value: LessonItemsFilterState[Key]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px_auto] lg:items-center">
        <label className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-body/45">
            <Search className="h-4 w-4" />
          </span>
          <input
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            className={`${fieldClass} pl-10 pr-4`}
            placeholder={t('admin.lessons.items.searchPlaceholder')}
          />
        </label>

        <label className="block">
          <span className="sr-only">{t('admin.lessons.items.filterType')}</span>
          <select
            value={filters.type}
            onChange={(event) => update('type', event.target.value as LessonItemType | 'all')}
            className={`${fieldClass} px-3`}
          >
            <option value="all">{t('admin.lessons.items.filterTypeAll')}</option>
            <option value="VOCABULARY">{t('admin.lessons.items.type.VOCABULARY')}</option>
            <option value="PHRASE">{t('admin.lessons.items.type.PHRASE')}</option>
            <option value="AUDIO_LISTEN">{t('admin.lessons.items.type.AUDIO_LISTEN')}</option>
            <option value="CULTURAL_NOTE">{t('admin.lessons.items.type.CULTURAL_NOTE')}</option>
          </select>
        </label>

        <label className="block">
          <span className="sr-only">{t('admin.lessons.items.filterStatus')}</span>
          <select
            value={filters.status}
            onChange={(event) => update('status', event.target.value as LessonItemsFilterState['status'])}
            className={`${fieldClass} px-3`}
          >
            <option value="all">{t('admin.lessons.items.filterStatusAll')}</option>
            <option value="published">{t('admin.lessons.items.status.published')}</option>
            <option value="draft">{t('admin.lessons.items.status.draft')}</option>
          </select>
        </label>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:text-forest-700"
          onClick={() => onChange({ search: '', type: 'all', status: 'all' })}
        >
          <Filter className="h-4 w-4" />
          {t('admin.lessons.items.filtersReset')}
        </button>
      </div>
    </div>
  )
}
