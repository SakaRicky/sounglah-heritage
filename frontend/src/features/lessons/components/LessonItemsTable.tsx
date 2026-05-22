import type { DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { GripVertical, Pencil } from 'lucide-react'

import { useI18n } from '../../../i18n'
import { LessonItemTypeIcon } from './LessonItemTypeIcon'
import type { LessonItem } from '../types/lessonItem.types'
import {
  estimateLessonItemMinutes,
  getLessonItemEnglishLabel,
  getLessonItemMedumbaLabel,
  getLessonItemStatus,
} from '../utils/lessonItemDisplay'

type Props = {
  items: LessonItem[]
  lessonId: string
  lessonEstimatedMinutes: number | null
  draggingId: string | null
  dragOverId: string | null
  reordering: boolean
  onDragStart: (itemId: string) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent, itemId: string) => void
  onDrop: (itemId: string) => void
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

export function LessonItemsTable({
  items,
  lessonId,
  lessonEstimatedMinutes,
  draggingId,
  dragOverId,
  reordering,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: Props) {
  const { t } = useI18n()

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[0_8px_30px_rgba(74,42,24,0.05)] md:block">
      <table className="min-w-full divide-y divide-sand-100">
        <thead className="bg-cream-50/70">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.order')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.type')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.contentMedumba')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.english')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.estTime')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.status')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-cocoa-body/60">
              {t('admin.lessons.items.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {items.map((item) => {
            const isDragging = draggingId === item.id
            const isDragOver = dragOverId === item.id
            const status = getLessonItemStatus(item)
            const typeLabel = t(`admin.lessons.items.type.${item.type}`)

            return (
              <tr
                key={item.id}
                draggable={!reordering}
                onDragStart={() => onDragStart(item.id)}
                onDragEnd={onDragEnd}
                onDragOver={(event) => onDragOver(event, item.id)}
                onDrop={(event) => {
                  event.preventDefault()
                  void onDrop(item.id)
                }}
                className={[
                  'transition',
                  isDragging ? 'opacity-45' : '',
                  isDragOver ? 'bg-forest-50/60 ring-1 ring-inset ring-forest-accent/25' : 'hover:bg-cream-50/40',
                ].join(' ')}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.stopPropagation()
                        onDragStart(item.id)
                      }}
                      className="cursor-grab rounded-md p-1 text-cocoa-body/45 transition hover:bg-sand-100 hover:text-cocoa-body active:cursor-grabbing"
                      aria-label={t('admin.lessons.items.dragHandle')}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-cocoa-800">{item.orderIndex}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <LessonItemTypeIcon type={item.type} size="sm" showLabel label={typeLabel} />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-cocoa-800">{getLessonItemMedumbaLabel(item)}</td>
                <td className="px-4 py-3 text-sm text-cocoa-body">{getLessonItemEnglishLabel(item)}</td>
                <td className="px-4 py-3 text-sm text-cocoa-body">
                  {estimateLessonItemMinutes(lessonEstimatedMinutes, items.length)}
                </td>
                <td className="px-4 py-3">
                  <ItemStatusBadge status={status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/content/lessons/${lessonId}/items/${item.id}/edit`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sand-200 bg-white text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/30"
                    aria-label={t('admin.lessons.items.actions.edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
