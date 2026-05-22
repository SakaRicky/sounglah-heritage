import { Link } from 'react-router-dom'

import { useI18n } from '../../../i18n'
import { LessonItemTypeBadge } from './LessonItemTypeBadge'
import type { LessonItem } from '../types/lessonItem.types'

type Props = {
  item: LessonItem
  lessonId: string
  isFirst: boolean
  isLast: boolean
  reordering: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

function ChevronUpIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function LessonItemCard({
  item,
  lessonId,
  isFirst,
  isLast,
  reordering,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const { t } = useI18n()
  const conceptLabel = item.concept?.key ?? t('admin.lessons.items.noConcept')
  const actionClass =
    'inline-flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm font-semibold text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/30 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <article
      className={[
        'rounded-2xl border border-sand-200 bg-white/85 p-5 shadow-soft transition',
        item.isActive ? '' : 'opacity-70',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-accent/10 text-sm font-bold text-forest-700 ring-1 ring-forest-accent/15">
            {item.orderIndex}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <LessonItemTypeBadge type={item.type} />
              {!item.isActive ? (
                <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-cocoa-body">
                  {t('admin.lessons.items.inactive')}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-cocoa-800">{item.title}</h3>
            <p className="mt-1 text-sm text-cocoa-body/75">
              {t('admin.lessons.items.linkedConcept')}: <span className="font-medium text-cocoa-800">{conceptLabel}</span>
            </p>
            {item.instructionText ? (
              <p className="mt-2 text-sm leading-6 text-cocoa-body">{item.instructionText}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Link
            to={`/admin/content/lessons/${lessonId}/items/${item.id}/edit`}
            className={actionClass}
          >
            {t('admin.lessons.items.actions.edit')}
          </Link>
          <button type="button" onClick={onMoveUp} disabled={isFirst || reordering} className={actionClass} title={t('admin.lessons.items.actions.moveUp')}>
            <ChevronUpIcon />
            <span className="hidden sm:inline">{t('admin.lessons.items.actions.moveUp')}</span>
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast || reordering} className={actionClass} title={t('admin.lessons.items.actions.moveDown')}>
            <ChevronDownIcon />
            <span className="hidden sm:inline">{t('admin.lessons.items.actions.moveDown')}</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={reordering}
            className="inline-flex items-center gap-1.5 rounded-xl border border-terracotta-500/30 bg-white px-3 py-1.5 text-sm font-semibold text-terracotta-600 transition hover:bg-terracotta-400/10 disabled:opacity-50"
          >
            {t('admin.lessons.items.actions.delete')}
          </button>
        </div>
      </div>
    </article>
  )
}
