import { Link } from 'react-router-dom'
import { ChevronLeft, Clock, ExternalLink, List, Plus } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { resolveMediaUrl } from '../../../lib/media'
import { LessonDifficultyBadge } from './LessonDifficultyBadge'
import { LessonStatusBadge } from './LessonStatusBadge'
import type { Lesson } from '../types/lesson.types'

type Props = {
  lesson: Lesson
  activeItemCount: number
  canPreview: boolean
}

export function LessonItemsLessonHeader({ lesson, activeItemCount, canPreview }: Props) {
  const { t } = useI18n()
  const lessonsPath = '/admin/content/lessons'
  const lessonDetailsPath = `/admin/content/lessons/${lesson.id}/edit`
  const lessonItemsPath = `/admin/content/lessons/${lesson.id}/items`

  const estimatedMinutes =
    lesson.estimatedMinutes && lesson.estimatedMinutes > 0
      ? t('admin.lessons.table.timeMinutes').replace('{count}', String(lesson.estimatedMinutes))
      : t('admin.lessons.table.timeUnknown')

  const itemCountLabel = t('admin.lessons.items.activeItemCount').replace('{count}', String(activeItemCount))

  return (
    <header className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-cocoa-body/70">
        <Link
          to="/admin/content/lessons"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sand-200 bg-white text-cocoa-body transition hover:border-forest-accent/35 hover:text-forest-700"
          aria-label={t('admin.lessons.items.backToLessons')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <nav aria-label="Lesson item breadcrumbs">
          <ol className="flex flex-wrap items-center gap-y-1">
            <li>
              <Link
                to="/admin"
                className="rounded-md transition hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {t('admin.lessons.breadcrumb.section')}
              </Link>
            </li>
            <li aria-hidden className="mx-1.5 text-sand-300">›</li>
            <li>
              <Link
                to={lessonsPath}
                className="rounded-md transition hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {t('admin.lessons.breadcrumb.page')}
              </Link>
            </li>
            <li aria-hidden className="mx-1.5 text-sand-300">›</li>
            <li>
              <Link
                to={lessonDetailsPath}
                className="rounded-md font-medium text-cocoa-800 transition hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {lesson.title}
              </Link>
            </li>
            <li aria-hidden className="mx-1.5 text-sand-300">›</li>
            <li>
              <Link
                to={lessonItemsPath}
                aria-current="page"
                className="rounded-md font-medium text-cocoa-800 transition hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {t('admin.lessons.items.breadcrumb')}
              </Link>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {lesson.coverImageUrl ? (
            <img
              src={resolveMediaUrl(lesson.coverImageUrl) ?? undefined}
              alt={lesson.coverImageAltText ?? lesson.title}
              className="h-20 w-20 shrink-0 rounded-xl border border-sand-200 object-cover shadow-soft"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-sand-200 bg-forest-50 text-xl font-bold text-forest-700">
              {lesson.title.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-cocoa-800 md:text-3xl">{lesson.title}</h1>
              <LessonStatusBadge status={lesson.status} />
            </div>
            {lesson.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-cocoa-body">{lesson.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-cocoa-body">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cocoa-body/55" />
                {estimatedMinutes}
              </span>
              <LessonDifficultyBadge difficulty={lesson.difficulty} />
              <span className="inline-flex items-center gap-1.5">
                <List className="h-4 w-4 text-cocoa-body/55" />
                {itemCountLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          {canPreview ? (
            <a
              href={`/lessons/${lesson.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700 transition hover:bg-forest-50/30"
            >
              <ExternalLink className="h-4 w-4" />
              {t('admin.lessons.items.previewLesson')}
            </a>
          ) : (
            <button
              type="button"
              disabled
              title={t('admin.lessons.actions.previewDisabled')}
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-sand-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-cocoa-body/45"
            >
              <ExternalLink className="h-4 w-4" />
              {t('admin.lessons.items.previewLesson')}
            </button>
          )}
          <Link
            to={`/admin/content/lessons/${lesson.id}/items/new`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700"
          >
            <Plus className="h-4 w-4" />
            {t('admin.lessons.items.addItem')}
          </Link>
        </div>
      </div>
    </header>
  )
}
