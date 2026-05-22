import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { useI18n } from '../../../i18n'
import { getLessonById } from '../api/lessonsApi'
import { deleteLessonItem, getLessonItems, reorderLessonItem } from '../api/lessonItemsApi'
import { DeleteLessonItemDialog } from '../components/DeleteLessonItemDialog'
import { LessonDifficultyBadge } from '../components/LessonDifficultyBadge'
import { LessonItemCard } from '../components/LessonItemCard'
import { LessonStatusBadge } from '../components/LessonStatusBadge'
import type { Lesson } from '../types/lesson.types'
import type { LessonItem } from '../types/lessonItem.types'

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-cocoa-body/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function LessonItemsBuilderPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [items, setItems] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reordering, setReordering] = useState(false)
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

  async function handleReorder(itemId: string, direction: 'up' | 'down') {
    setReordering(true)
    setError('')
    setNotice('')

    try {
      const response = await reorderLessonItem(itemId, direction)
      setItems(response.data)
      setNotice(t('admin.lessons.items.reordered'))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.items.reorderError'))
    } finally {
      setReordering(false)
    }
  }

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

  const estimatedMinutes =
    lesson.estimatedMinutes && lesson.estimatedMinutes > 0
      ? t('admin.lessons.table.timeMinutes').replace('{count}', String(lesson.estimatedMinutes))
      : t('admin.lessons.table.timeUnknown')

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={[
          t('admin.lessons.breadcrumb.section'),
          t('admin.lessons.breadcrumb.page'),
          lesson.title,
          t('admin.lessons.items.breadcrumb'),
        ]}
        title={t('admin.lessons.items.title').replace('{title}', lesson.title)}
        description={t('admin.lessons.items.description')}
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/admin/content/lessons/${lesson.id}/edit`}
              className="inline-flex items-center justify-center rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700 transition hover:bg-forest-50/30"
            >
              {t('admin.lessons.items.editLesson')}
            </Link>
            <Link
              to={`/admin/content/lessons/${lesson.id}/items/new`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700"
            >
              <PlusIcon />
              {t('admin.lessons.items.addItem')}
            </Link>
          </div>
        }
      />

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-sand-200 bg-white/80 px-5 py-4 shadow-soft">
        <LessonDifficultyBadge difficulty={lesson.difficulty} />
        <LessonStatusBadge status={lesson.status} />
        <span className="inline-flex items-center gap-1.5 text-sm text-cocoa-body">
          <ClockIcon />
          {estimatedMinutes}
        </span>
        <span className="text-sm text-cocoa-body/75">
          {t('admin.lessons.items.stepCount').replace('{count}', String(items.length))}
        </span>
      </section>

      {notice ? (
        <div className="rounded-cta border border-forest-accent/20 bg-forest-accent/10 px-4 py-3 text-sm font-medium text-forest-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadBuilder()}
              className="rounded-xl border border-terracotta-500/30 bg-white px-4 py-2 text-sm font-semibold text-terracotta-600"
            >
              {t('admin.lessons.error.retry')}
            </button>
          </div>
        </div>
      ) : null}

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
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <LessonItemCard
              key={item.id}
              item={item}
              lessonId={lesson.id}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              reordering={reordering}
              onMoveUp={() => void handleReorder(item.id, 'up')}
              onMoveDown={() => void handleReorder(item.id, 'down')}
              onDelete={() => setDeleteTarget(item)}
            />
          ))}
        </div>
      )}

      <DeleteLessonItemDialog
        item={deleteTarget}
        saving={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  )
}
