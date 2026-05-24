export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type LessonStatus = 'draft' | 'published' | 'archived'

export type LessonSort = 'orderIndex' | 'title' | 'updatedAt'

export type Lesson = {
  id: string
  title: string
  slug: string
  description: string | null
  difficulty: LessonDifficulty
  estimatedMinutes: number | null
  coverImageUrl: string | null
  coverImagePublicId: string | null
  coverImageAltText: string | null
  status: LessonStatus
  orderIndex: number
  itemCount: number
  createdAt: string | null
  updatedAt: string | null
}

export type LessonListResponse = {
  data: Lesson[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

export type CreateLessonPayload = {
  title: string
  slug: string
  description?: string
  difficulty: LessonDifficulty
  estimatedMinutes?: number | null
  coverImageUrl?: string | null
  coverImageAltText?: string | null
  status: LessonStatus
  orderIndex?: number
}

export type UpdateLessonPayload = Partial<CreateLessonPayload>

export type LessonPublishValidation = {
  lessonId: string
  isReadyToPublish: boolean
  blockers: string[]
}

