import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Loader2 } from 'lucide-react'


import { AdminDataTable } from '../../../components/admin/AdminDataTable'
import {
  AdminIconAction,
  AdminIconActionAnchor,
  AdminIconActionLink,
  adminIconActionIconClass,
} from '../../../components/admin/AdminIconAction'
import { ImagePreview } from '../../../components/admin/MediaPreview'
import { useI18n } from '../../../i18n'
import type { TranslationKey } from '../../../i18n'
import { LessonDifficultyBadge } from './LessonDifficultyBadge'
import { LessonQuickPublishButton } from './LessonQuickPublishButton'
import { LessonStatusBadge } from './LessonStatusBadge'
import type { Lesson } from '../types/lesson.types'
import { getLessonPublishValidation } from '../api/lessonsApi'

type Props = {
  lessons: Lesson[]
  loading: boolean
  total: number
  filtered: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onCreate: () => void
  publishingLessonId: string | null
  onPublish: (lessonId: string) => void
}

function LessonMark({ title }: { title: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-forest-accent/15 bg-[rgba(31,90,61,0.06)] text-sm font-bold text-forest-700">
      {title.slice(0, 1).toUpperCase()}
    </span>
  )
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-cocoa-body/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.687a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg className={adminIconActionIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18v4.5M10.5 13.5L18 6M15 18H6V9" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

function formatEstimatedMinutes(minutes: number | null, t: (key: TranslationKey) => string) {
  if (minutes === null || minutes <= 0) {
    return t('admin.lessons.table.timeUnknown')
  }

  return t('admin.lessons.table.timeMinutes').replace('{count}', String(minutes))
}

function formatItemCount(count: number, t: (key: TranslationKey) => string) {
  if (count === 0) {
    return t('admin.lessons.table.noActiveItems')
  }

  const label = count === 1 ? t('admin.lessons.table.oneActiveItem') : t('admin.lessons.table.activeItems')
  return label.replace('{count}', String(count))
}

function LessonIdentity({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex items-center gap-3">
      {lesson.coverImageUrl ? (
        <ImagePreview src={lesson.coverImageUrl} alt={lesson.coverImageAltText || lesson.title} />
      ) : (
        <LessonMark title={lesson.title} />
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold text-cocoa-800">{lesson.title}</p>
        <p className="truncate text-sm text-cocoa-body/70">{lesson.slug}</p>
      </div>
    </div>
  )
}

function ItemCountCell({ count, t }: { count: number; t: (key: TranslationKey) => string }) {
  const label = formatItemCount(count, t)

  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-600">
        <WarningIcon />
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-cocoa-body">
      <ListIcon />
      {label}
    </span>
  )
}

function LessonActions({
  lesson,
  publishingLessonId,
  onPublish,
  t,
}: {
  lesson: Lesson
  publishingLessonId: string | null
  onPublish: (lessonId: string) => void
  t: (key: TranslationKey) => string
}) {
  const canPreview = lesson.status === 'published'

  return (
    <div className="flex items-center justify-end gap-1.5">
      <LessonQuickPublishButton
        lesson={lesson}
        publishing={publishingLessonId === lesson.id}
        onPublish={onPublish}
      />
      <AdminIconActionLink
        to={`/admin/content/lessons/${lesson.id}/edit`}
        label={t('admin.lessons.actions.edit')}
      >
        <EditIcon />
      </AdminIconActionLink>
      <AdminIconActionLink
        to={`/admin/content/lessons/${lesson.id}/items`}
        label={t('admin.lessons.actions.manageItems')}
      >
        <svg className={adminIconActionIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </AdminIconActionLink>
      {canPreview ? (
        <AdminIconActionAnchor
          href={`/lessons/${lesson.slug}`}
          target="_blank"
          rel="noreferrer"
          label={t('admin.lessons.actions.preview')}
        >
          <ExternalLinkIcon />
        </AdminIconActionAnchor>
      ) : (
        <AdminIconAction
          label={t('admin.lessons.actions.preview')}
          tooltip={t('admin.lessons.actions.previewDisabled')}
          multilineTooltip
          variant="disabled"
          disabled
        >
          <ExternalLinkIcon />
        </AdminIconAction>
      )}
    </div>
  )
}

function LessonMobileCard({
  lesson,
  publishingLessonId,
  onPublish,
  t,
}: {
  lesson: Lesson
  publishingLessonId: string | null
  onPublish: (lessonId: string) => void
  t: (key: TranslationKey) => string
}) {
  return (
    <article className="rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-soft">
      <LessonIdentity lesson={lesson} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center">
          <LessonStatusBadge status={lesson.status} />
          {lesson.status === 'draft' && <DraftPublishValidationIndicator lessonId={lesson.id} />}
        </div>
        <LessonDifficultyBadge difficulty={lesson.difficulty} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-cocoa-body">
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon />
          {formatEstimatedMinutes(lesson.estimatedMinutes, t)}
        </span>
        <ItemCountCell count={lesson.itemCount} t={t} />
      </div>

      <div className="mt-4 border-t border-sand-100 pt-4">
        <LessonActions
          lesson={lesson}
          publishingLessonId={publishingLessonId}
          onPublish={onPublish}
          t={t}
        />
      </div>
    </article>
  )
}

function DraftPublishValidationIndicator({ lessonId }: { lessonId: string }) {
  const [loading, setLoading] = useState(false)
  const [blockers, setBlockers] = useState<string[] | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleToggle(event: React.MouseEvent) {
    event.stopPropagation()
    if (open) {
      setOpen(false)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    setCoords({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX + rect.width / 2,
    })

    setOpen(true)
    if (blockers !== null) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await getLessonPublishValidation(lessonId)
      setBlockers(response.data.blockers)
    } catch {
      setError('Unable to load blockers.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-amber-500 transition hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
        title="View publish requirements"
      >
        <AlertCircle className="h-4 w-4" />
      </button>

      {open && typeof document !== 'undefined' ? (
        <>
          {/* Mobile View: Render centered modal with backdrop */}
          <div className="sm:hidden">
            {createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-cocoa-ink/35 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
                <div 
                  className="w-full max-w-sm rounded-2xl border border-sand-200 bg-white p-6 shadow-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-sand-100 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-cocoa-800">Publish Requirements</h3>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg p-1 text-xs font-bold text-cocoa-body/40 hover:text-cocoa-body transition"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 text-sm text-cocoa-body leading-relaxed">
                    {loading ? (
                      <div className="flex items-center justify-center py-8 text-cocoa-body/60">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Checking requirements...
                      </div>
                    ) : error ? (
                      <p className="text-terracotta-600 font-medium">{error}</p>
                    ) : blockers && blockers.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2.5 pl-0.5">
                        {blockers.map((blocker, index) => (
                          <li key={index} className="marker:text-amber-500 pl-1 text-[13px] leading-tight text-cocoa-body/90">
                            <span className="inline-block align-top -mt-0.5">{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-forest-700 font-semibold py-1">
                        ✓ This lesson is ready to go live! All linked concepts will be published automatically.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-6 w-full rounded-xl bg-forest-600 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] hover:bg-forest-700 transition"
                  >
                    Got it
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* Desktop/Tablet View: Render absolutely positioned popover via Portal */}
          <div className="hidden sm:block">
            {createPortal(
              <div 
                ref={popoverRef}
                className="absolute z-[9999] w-80 rounded-2xl border border-sand-200 bg-white p-4 shadow-[0_12px_36px_rgba(74,42,24,0.15)] backdrop-blur-md"
                style={{
                  top: `${coords ? coords.top - 8 : 0}px`,
                  left: `${coords ? coords.left : 0}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="flex items-center justify-between border-b border-sand-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cocoa-800">Publish Requirements</h4>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-xs font-bold text-cocoa-body/40 hover:text-cocoa-body"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-2.5 max-h-48 overflow-y-auto pr-1 text-xs text-cocoa-body leading-relaxed">
                  {loading ? (
                    <div className="flex items-center justify-center py-4 text-cocoa-body/60">
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Checking requirements...
                    </div>
                  ) : error ? (
                    <p className="text-terracotta-600 font-medium">{error}</p>
                  ) : blockers && blockers.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1.5 pl-0.5">
                      {blockers.map((blocker, index) => (
                        <li key={index} className="marker:text-amber-500 pl-1 text-[11px] leading-tight text-cocoa-body/90">
                          <span className="inline-block align-top -mt-0.5">{blocker}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-forest-700 font-semibold py-1">
                      ✓ This lesson is ready to go live! All linked concepts will be published automatically.
                    </p>
                  )}
                </div>
                {/* Arrow pointing down */}
                <div className="absolute top-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1.5 rotate-45 border-r border-b border-sand-200 bg-white" />
              </div>,
              document.body
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export function LessonTable({
  lessons,
  loading,
  total,
  filtered,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onCreate,
  publishingLessonId,
  onPublish,
}: Props) {
  const { t } = useI18n()

  return (
    <AdminDataTable
      title={t('admin.lessons.table.title').replace('{count}', String(total))}
      subtitle={t('admin.lessons.table.subtitle')}
      loading={loading}
      loadingLabel={t('admin.lessons.table.loading')}
      isEmpty={lessons.length === 0}
      emptyState={{
        title: filtered ? t('admin.lessons.empty.filteredTitle') : t('admin.lessons.empty.title'),
        description: filtered ? t('admin.lessons.empty.filteredDescription') : t('admin.lessons.empty.description'),
        action: !filtered ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            {t('admin.lessons.create')}
          </button>
        ) : undefined,
      }}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
      }}
      scrollMaxHeight="32rem"
    >
      <div className="space-y-4 bg-cream-50/35 p-3 lg:hidden">
        {lessons.map((lesson) => (
          <LessonMobileCard
            key={lesson.id}
            lesson={lesson}
            publishingLessonId={publishingLessonId}
            onPublish={onPublish}
            t={t}
          />
        ))}
      </div>

      <table className="hidden min-w-full divide-y divide-sand-100 text-left text-sm lg:table">
        <thead className="sticky top-0 z-10 bg-forest-50/95 text-xs uppercase tracking-wide text-forest-700/75 backdrop-blur-sm">
          <tr>
            <th className="px-5 py-4 font-semibold">{t('admin.lessons.table.columnLesson')}</th>
            <th className="px-5 py-4 font-semibold">{t('admin.lessons.table.columnDifficulty')}</th>
            <th className="px-5 py-4 font-semibold">{t('admin.lessons.table.columnTime')}</th>
            <th className="px-5 py-4 font-semibold">{t('admin.lessons.table.columnItems')}</th>
            <th className="px-5 py-4 font-semibold">{t('admin.lessons.table.columnStatus')}</th>
            <th className="px-5 py-4 text-right font-semibold">{t('admin.lessons.table.columnActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100/80 bg-white/70">
          {lessons.map((lesson) => (
            <tr key={lesson.id} className="align-middle transition-all duration-200 hover:bg-forest-50/30">
              <td className="px-5 py-5">
                <LessonIdentity lesson={lesson} />
              </td>
              <td className="px-5 py-4">
                <LessonDifficultyBadge difficulty={lesson.difficulty} />
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1.5 text-cocoa-body">
                  <ClockIcon />
                  {formatEstimatedMinutes(lesson.estimatedMinutes, t)}
                </span>
              </td>
              <td className="px-5 py-4">
                <ItemCountCell count={lesson.itemCount} t={t} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center">
                  <LessonStatusBadge status={lesson.status} />
                  {lesson.status === 'draft' && <DraftPublishValidationIndicator lessonId={lesson.id} />}
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right">
                <LessonActions
                  lesson={lesson}
                  publishingLessonId={publishingLessonId}
                  onPublish={onPublish}
                  t={t}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminDataTable>
  )
}
