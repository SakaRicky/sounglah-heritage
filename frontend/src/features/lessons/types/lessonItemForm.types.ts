import type { LessonItemType } from './lessonItem.types'

export type LessonItemFormValues = {
  type: LessonItemType
  title: string
  instructionText: string
  conceptId: string
  orderIndex: string
  isActive: boolean
  usageNote: string
  hideTextUntilPlayed: boolean
  noteTextEn: string
  noteTextFr: string
  imageUrl: string
  imageAltText: string
}

export const emptyLessonItemFormValues: LessonItemFormValues = {
  type: 'VOCABULARY',
  title: '',
  instructionText: '',
  conceptId: '',
  orderIndex: '',
  isActive: true,
  usageNote: '',
  hideTextUntilPlayed: true,
  noteTextEn: '',
  noteTextFr: '',
  imageUrl: '',
  imageAltText: '',
}
