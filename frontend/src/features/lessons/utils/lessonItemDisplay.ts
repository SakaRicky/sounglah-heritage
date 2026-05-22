import type { LessonItem } from '../types/lessonItem.types'
import type { LessonItemType } from '../types/lessonItem.types'

export function getLessonItemMedumbaLabel(item: LessonItem): string {
  if (item.type === 'CULTURAL_NOTE') {
    const noteTextEn = item.contentJson.noteTextEn
    return typeof noteTextEn === 'string' && noteTextEn.trim() ? noteTextEn.trim() : item.title
  }

  return item.title
}

export function getLessonItemEnglishLabel(item: LessonItem): string {
  if (item.type === 'CULTURAL_NOTE') {
    const noteTextEn = item.contentJson.noteTextEn
    return typeof noteTextEn === 'string' ? noteTextEn.trim() : '—'
  }

  if (item.concept?.key) {
    return item.concept.key.replace(/_/g, ' ')
  }

  return '—'
}

export function getLessonItemStatus(item: LessonItem): 'published' | 'draft' {
  return item.isActive ? 'published' : 'draft'
}

export function estimateLessonItemMinutes(lessonEstimatedMinutes: number | null, itemCount: number): string {
  if (!lessonEstimatedMinutes || lessonEstimatedMinutes <= 0 || itemCount <= 0) {
    return '~ 1 min'
  }

  const minutes = Math.max(1, Math.round(lessonEstimatedMinutes / itemCount))
  return `~ ${minutes} min`
}

export function filterLessonItems(
  items: LessonItem[],
  search: string,
  typeFilter: LessonItemType | 'all',
  statusFilter: 'all' | 'published' | 'draft',
): LessonItem[] {
  const query = search.trim().toLowerCase()

  return items.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false
    }

    const status = getLessonItemStatus(item)
    if (statusFilter !== 'all' && status !== statusFilter) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [
      item.title,
      item.instructionText ?? '',
      item.concept?.key ?? '',
      getLessonItemMedumbaLabel(item),
      getLessonItemEnglishLabel(item),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function reorderLessonItemsLocally(items: LessonItem[], fromIndex: number, toIndex: number): LessonItem[] {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)

  return next.map((item, index) => ({
    ...item,
    orderIndex: index + 1,
  }))
}
