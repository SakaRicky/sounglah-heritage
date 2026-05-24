import type { DragEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { useI18n } from '../../../i18n'
import { LessonItemTypeIcon } from './LessonItemTypeIcon'
import type { LessonItem } from '../types/lessonItem.types'
import {
  estimateLessonItemMinutes,
  getLessonItemEnglishLabel,
  getLessonItemMedumbaLabel,
  getLessonItemStatus,
} from '../utils/lessonItemDisplay'
import { PublishReadinessBadge } from './LessonItemsTable'

type Props = {
  item: LessonItem
  lessonId: string
  lessonEstimatedMinutes: number | null
  totalItems: number
  draggingId: string | null
  dragOverId: string | null
  reordering: boolean
  onDragStart: (itemId: string) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent, itemId: string) => void
  onDrop: (itemId: string) => void
  onDelete: () => void
}

function ItemStatusBadge({ status }: { status: 'published' | 'draft' }) {
  const { t } = useI18n()

  if (status === 'published') {
    return (
      <span className="inline-flex rounded-full bg-forest-accent/10 px-2.5 py-1 text-xs font-semibold text-forest-700">
        {t('admin.lessons.items.status.published')}
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-cocoa-body/70">
      {t('admin.lessons.items.status.draft')}
    </span>
  )
}

export function LessonItemMobileCard({
  item,
  lessonId,
  lessonEstimatedMinutes,
  totalItems,
  draggingId,
  dragOverId,
  reordering,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDelete,
}: Props) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isDragging = draggingId === item.id
  const isDragOver = dragOverId === item.id
  const status = getLessonItemStatus(item)
  const typeLabel = t(`admin.lessons.items.type.${item.type}`)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <article
      draggable={!reordering}
      onDragStart={() => onDragStart(item.id)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOver(event, item.id)}
      onDrop={(event) => {
        event.preventDefault()
        void onDrop(item.id)
      }}
      className={[
        'rounded-2xl border bg-white p-4 shadow-[0_8px_24px_rgba(74,42,24,0.05)] transition md:hidden',
        isDragging ? 'opacity-45' : '',
        isDragOver ? 'border-forest-accent/40 bg-forest-50/40' : 'border-sand-200',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              event.stopPropagation()
              onDragStart(item.id)
            }}
            className="cursor-grab rounded-md p-1 text-cocoa-body/45 active:cursor-grabbing"
            aria-label={t('admin.lessons.items.dragHandle')}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-cocoa-body/60">{item.orderIndex}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <LessonItemTypeIcon type={item.type} size="sm" showLabel label={typeLabel} />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sand-200 bg-white text-cocoa-body transition hover:border-forest-accent/35"
                aria-label={t('admin.lessons.items.actions.menu')}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-soft">
                  <Link
                    to={`/admin/content/lessons/${lessonId}/items/${item.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cocoa-body hover:bg-cream-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="h-4 w-4" />
                    {t('admin.lessons.items.actions.edit')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete()
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-terracotta-600 hover:bg-terracotta-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('admin.lessons.items.actions.delete')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="mt-3 text-lg font-semibold text-cocoa-800">{getLessonItemMedumbaLabel(item)}</h3>
          <p className="mt-1 text-sm text-cocoa-body/70">{getLessonItemEnglishLabel(item)}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-cocoa-body/60">
              {estimateLessonItemMinutes(lessonEstimatedMinutes, totalItems)}
            </span>
            <ItemStatusBadge status={status} />
            <PublishReadinessBadge item={item} />
          </div>
        </div>
      </div>
    </article>
  )
}
