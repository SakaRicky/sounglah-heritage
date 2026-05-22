import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { useI18n } from '../../../i18n'
import { LessonFilters } from '../components/LessonFilters'
import { LessonTable } from '../components/LessonTable'
import { useLessonsList } from '../hooks/useLessonsList'
import type { LessonDifficulty, LessonSort, LessonStatus } from '../types/lesson.types'

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function AdminLessonsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<LessonStatus | 'all'>('all')
  const [difficulty, setDifficulty] = useState<LessonDifficulty | 'all'>('all')
  const [sort] = useState<LessonSort>('orderIndex')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const queryParams = useMemo(
    () => ({
      search,
      status,
      difficulty,
      sort,
      page,
      pageSize,
    }),
    [difficulty, page, pageSize, search, sort, status],
  )

  const { lessons, total, loading, error, reload } = useLessonsList(queryParams)
  const filtered = Boolean(search || status !== 'all' || difficulty !== 'all')

  function resetPageAndSetSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function resetPageAndSetStatus(value: LessonStatus | 'all') {
    setPage(1)
    setStatus(value)
  }

  function resetPageAndSetDifficulty(value: LessonDifficulty | 'all') {
    setPage(1)
    setDifficulty(value)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
  }

  function openCreateLesson() {
    navigate('/admin/content/lessons/new')
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={[t('admin.lessons.breadcrumb.section'), t('admin.lessons.breadcrumb.page')]}
        title={t('admin.lessons.title')}
        description={t('admin.lessons.description')}
        action={
          <button
            type="button"
            onClick={openCreateLesson}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition-all duration-200 hover:bg-forest-700 hover:shadow-[0_12px_30px_rgba(31,90,61,0.2)] focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            <PlusIcon />
            {t('admin.lessons.create')}
          </button>
        }
      />

      {error ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="rounded-xl border border-terracotta-500/30 bg-white px-4 py-2 text-sm font-semibold text-terracotta-600 transition hover:bg-cream-50 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              {t('admin.lessons.error.retry')}
            </button>
          </div>
        </div>
      ) : null}

      <LessonFilters
        search={search}
        status={status}
        difficulty={difficulty}
        onSearchChange={resetPageAndSetSearch}
        onStatusChange={resetPageAndSetStatus}
        onDifficultyChange={resetPageAndSetDifficulty}
      />

      <LessonTable
        lessons={lessons}
        loading={loading}
        total={total}
        filtered={filtered}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onCreate={openCreateLesson}
      />
    </div>
  )
}
