import { apiGet } from '../../../lib/api'
import type { PublicLessonDetail, PublicLessonListResponse } from '../types/publicLesson.types'

export function getPublicLessons() {
  return apiGet<PublicLessonListResponse>('/lessons')
}

export function getPublicLessonBySlug(slug: string) {
  return apiGet<PublicLessonDetail>(`/lessons/${encodeURIComponent(slug)}`)
}
