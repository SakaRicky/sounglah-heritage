import type { LessonDifficulty } from './lesson.types'

export type PublicLessonListItem = {
  slug: string
  title: string
  description: string | null
  difficulty: LessonDifficulty
  estimatedMinutes: number | null
  coverImageUrl: string | null
  coverImageAltText: string | null
  activeItemCount: number
}

export type PublicLessonListResponse = {
  data: PublicLessonListItem[]
}

export type PublicConceptTextEntry = {
  text: string
  pronunciation: string | null
  audioUrl: string | null
  hasApprovedAudio?: boolean
}

export type PublicConceptPayload = {
  id: string
  key: string
  imageUrl: string | null
  imageAltText: string | null
  texts: Partial<Record<'en' | 'fr' | 'med', PublicConceptTextEntry>>
}

export type PublicLessonItem = {
  id: string
  type: 'VOCABULARY' | 'PHRASE' | 'AUDIO_LISTEN' | 'CULTURAL_NOTE'
  title: string
  instructionText: string | null
  orderIndex: number
  contentJson: Record<string, unknown>
  conceptPayload: PublicConceptPayload | null
}

export type PublicLessonDetail = {
  slug: string
  title: string
  description: string | null
  difficulty: LessonDifficulty
  estimatedMinutes: number | null
  coverImageUrl: string | null
  coverImageAltText: string | null
  items: PublicLessonItem[]
}
