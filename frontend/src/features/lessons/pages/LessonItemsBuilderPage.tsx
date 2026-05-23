import { useCallback, useEffect, useMemo, useState } from 'react'
import { Toast } from '../../../components/common/Toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { useI18n } from '../../../i18n'
import { getLessonById } from '../api/lessonsApi'
import { deleteLessonItem, getLessonItems } from '../api/lessonItemsApi'
import { DeleteLessonItemDialog } from '../components/DeleteLessonItemDialog'
import { LessonItemMobileCard } from '../components/LessonItemMobileCard'
import { LessonItemsFilters, type LessonItemsFilterState } from '../components/LessonItemsFilters'
import { LessonItemsLessonHeader } from '../components/LessonItemsLessonHeader'
import { LessonItemsReorderTip } from '../components/LessonItemsReorderTip'
import { LessonItemsTable } from '../components/LessonItemsTable'
import { LessonItemsTabs } from '../components/LessonItemsTabs'
import { useLessonItemsDragReorder } from '../hooks/useLessonItemsDragReorder'
import type { Lesson } from '../types/lesson.types'
import type { LessonItem } from '../types/lessonItem.types'
import { filterLessonItems } from '../utils/lessonItemDisplay'

const defaultFilters: LessonItemsFilterState = {
  search: '',
  type: 'all',
  status: 'all',
}

export function LessonItemsBuilderPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [items, setItems] = useState<LessonItem[]>([])
  const [filters, setFilters] = useState<LessonItemsFilterState>(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LessonItem | null>(null)

  const loadBuilder = useCallback(async () => {
    if (!lessonId) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [lessonResponse, itemsResponse] = await Promise.all([
        getLessonById(lessonId),
        getLessonItems(lessonId),
      ])
      setLesson(lessonResponse.data)
      setItems(itemsResponse.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.items.loadError'))
    } finally {
      setLoading(false)
    }
  }, [lessonId, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBuilder()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadBuilder])

  const dragReorder = useLessonItemsDragReorder({
    items,
    onItemsChange: setItems,
    onReorderSuccess: () => setNotice(t('admin.lessons.items.reordered')),
    onReorderError: () => {
      setError(t('admin.lessons.items.reorderError'))
      void loadBuilder()
    },
  })

  const filteredItems = useMemo(
    () => filterLessonItems(items, filters.search, filters.type, filters.status),
    [filters.search, filters.status, filters.type, items],
  )

  const activeItemCount = items.filter((item) => item.isActive).length
  const canPreview = lesson?.status === 'published'

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)
    setError('')
    setNotice('')

    try {
      const response = await deleteLessonItem(deleteTarget.id)
      setItems(response.data)
      setDeleteTarget(null)
      setNotice(t('admin.lessons.items.deleted'))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.items.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  if (!lessonId) {
    navigate('/admin/content/lessons')
    return null
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-forest-50/20 p-8 text-center text-sm text-cocoa-body shadow-soft">
        {t('admin.lessons.items.loading')}
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="space-y-4">
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {error || t('admin.lessons.items.loadError')}
        </div>
        <Link
          to="/admin/content/lessons"
          className="inline-flex rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700"
        >
          {t('admin.lessons.items.backToLessons')}
        </Link>
      </div>
    )
  }

  const showingFrom = filteredItems.length > 0 ? 1 : 0
  const showingTo = filteredItems.length
  const totalCount = items.length
  const resultsLabel = t('admin.lessons.items.resultsCount')
    .replace('{from}', String(showingFrom))
    .replace('{to}', String(showingTo))
    .replace('{total}', String(totalCount))

  return (
    <div className="-mx-5 space-y-6 md:-mx-10">
      <div className="space-y-6 px-5 md:px-10">
        <LessonItemsLessonHeader lesson={lesson} activeItemCount={activeItemCount} canPreview={canPreview} />

        <LessonItemsTabs lessonId={lesson.id} />

        <div className="md:hidden">
          <Link
            to={`/admin/content/lessons/${lesson.id}/items/new`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)]"
          >
            <Plus className="h-4 w-4" />
            {t('admin.lessons.items.addItem')}
          </Link>
        </div>

        <LessonItemsFilters filters={filters} onChange={setFilters} />

        <Toast message={notice} type="success" onClose={() => setNotice('')} />
        <Toast message={error} type="error" onClose={() => setError('')} />

        {items.length === 0 ? (
          <div className="rounded-2xl border border-sand-200 bg-forest-50/20 p-8 text-center shadow-soft">
            <h2 className="text-base font-semibold text-cocoa-800">{t('admin.lessons.items.empty.title')}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-cocoa-body">{t('admin.lessons.items.empty.description')}</p>
            <Link
              to={`/admin/content/lessons/${lesson.id}/items/new`}
              className="mt-5 inline-flex rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700"
            >
              {t('admin.lessons.items.addItem')}
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-sand-200 bg-cream-50/40 p-8 text-center">
            <p className="text-sm text-cocoa-body">{t('admin.lessons.items.noFilterResults')}</p>
          </div>
        ) : (
          <>
            <LessonItemsTable
              items={filteredItems}
              lessonId={lesson.id}
              lessonEstimatedMinutes={lesson.estimatedMinutes}
              draggingId={dragReorder.draggingId}
              dragOverId={dragReorder.dragOverId}
              reordering={dragReorder.reordering}
              onDragStart={dragReorder.handleDragStart}
              onDragEnd={dragReorder.handleDragEnd}
              onDragOver={dragReorder.handleDragOver}
              onDrop={dragReorder.handleDrop}
            />

            <div className="space-y-3 md:hidden">
              {filteredItems.map((item) => (
                <LessonItemMobileCard
                  key={item.id}
                  item={item}
                  lessonId={lesson.id}
                  lessonEstimatedMinutes={lesson.estimatedMinutes}
                  totalItems={items.length}
                  draggingId={dragReorder.draggingId}
                  dragOverId={dragReorder.dragOverId}
                  reordering={dragReorder.reordering}
                  onDragStart={dragReorder.handleDragStart}
                  onDragEnd={dragReorder.handleDragEnd}
                  onDragOver={dragReorder.handleDragOver}
                  onDrop={dragReorder.handleDrop}
                  onDelete={() => setDeleteTarget(item)}
                />
              ))}
            </div>

            <p className="text-sm text-cocoa-body/65">{resultsLabel}</p>
          </>
        )}

        {items.length > 0 ? (
          <LessonItemsReorderTip canPreview={canPreview} previewHref={`/lessons/${lesson.slug}`} />
        ) : null}
      </div>

      <DeleteLessonItemDialog
        item={deleteTarget}
        saving={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  )
}
