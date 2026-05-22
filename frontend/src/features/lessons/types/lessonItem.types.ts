export type LessonItemType = 'VOCABULARY' | 'PHRASE' | 'AUDIO_LISTEN' | 'CULTURAL_NOTE'

export type LessonItemConceptSummary = {
  id: string
  key: string
  completionStatus: string
}

export type LessonItem = {
  id: string
  lessonId: string
  type: LessonItemType
  conceptId: string | null
  title: string
  instructionText: string | null
  contentJson: Record<string, unknown>
  orderIndex: number
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
  concept?: LessonItemConceptSummary | null
}

export type LessonItemListResponse = {
  data: LessonItem[]
}

export type ReorderDirection = 'up' | 'down'
