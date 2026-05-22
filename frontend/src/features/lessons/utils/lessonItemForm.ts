import type { LessonItemFormValues } from '../types/lessonItemForm.types'
import type {
  CreateLessonItemPayload,
  LessonItemType,
  UpdateLessonItemPayload,
} from '../types/lessonItem.types'

export function buildLessonItemContentJson(type: LessonItemType, values: LessonItemFormValues) {
  if (type === 'PHRASE') {
    const usageNote = values.usageNote.trim()
    return usageNote ? { usageNote } : {}
  }

  if (type === 'AUDIO_LISTEN') {
    return { hideTextUntilPlayed: values.hideTextUntilPlayed }
  }

  if (type === 'CULTURAL_NOTE') {
    const content: Record<string, string> = {
      noteTextEn: values.noteTextEn.trim(),
      noteTextFr: values.noteTextFr.trim(),
    }

    const imageUrl = values.imageUrl.trim()
    const imageAltText = values.imageAltText.trim()

    if (imageUrl) {
      content.imageUrl = imageUrl
    }

    if (imageAltText) {
      content.imageAltText = imageAltText
    }

    return content
  }

  return {}
}

export function buildLessonItemPayload(values: LessonItemFormValues, isEdit: true): UpdateLessonItemPayload
export function buildLessonItemPayload(values: LessonItemFormValues, isEdit: false): CreateLessonItemPayload
export function buildLessonItemPayload(
  values: LessonItemFormValues,
  isEdit: boolean,
): CreateLessonItemPayload | UpdateLessonItemPayload {
  const orderIndex = values.orderIndex.trim() ? Number(values.orderIndex) : undefined

  const payload = {
    title: values.title.trim(),
    instructionText: values.instructionText.trim() || null,
    conceptId: values.type === 'CULTURAL_NOTE' ? null : values.conceptId || null,
    contentJson: buildLessonItemContentJson(values.type, values),
    ...(orderIndex !== undefined && !Number.isNaN(orderIndex) ? { orderIndex } : {}),
    isActive: values.isActive,
  }

  if (isEdit) {
    return payload
  }

  return { ...payload, type: values.type }
}

export function valuesFromLessonItem(item: {
  type: LessonItemType
  title: string
  instructionText: string | null
  conceptId: string | null
  orderIndex: number
  isActive: boolean
  contentJson: Record<string, unknown>
}): LessonItemFormValues {
  const content = item.contentJson ?? {}

  return {
    type: item.type,
    title: item.title,
    instructionText: item.instructionText ?? '',
    conceptId: item.conceptId ?? '',
    orderIndex: String(item.orderIndex),
    isActive: item.isActive,
    usageNote: typeof content.usageNote === 'string' ? content.usageNote : '',
    hideTextUntilPlayed:
      typeof content.hideTextUntilPlayed === 'boolean' ? content.hideTextUntilPlayed : true,
    noteTextEn: typeof content.noteTextEn === 'string' ? content.noteTextEn : '',
    noteTextFr: typeof content.noteTextFr === 'string' ? content.noteTextFr : '',
    imageUrl: typeof content.imageUrl === 'string' ? content.imageUrl : '',
    imageAltText: typeof content.imageAltText === 'string' ? content.imageAltText : '',
  }
}
