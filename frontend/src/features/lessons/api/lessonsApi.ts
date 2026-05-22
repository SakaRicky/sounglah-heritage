import { apiRequest } from '../../../lib/api'
import type {
  LessonDifficulty,
  LessonListResponse,
  LessonSort,
  LessonStatus,
} from '../types/lesson.types'

export type GetLessonsParams = {
  search?: string
  status?: LessonStatus | 'all'
  difficulty?: LessonDifficulty | 'all'
  sort?: LessonSort
  page?: number
  pageSize?: number
}

function buildQuery(params: GetLessonsParams = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getLessons(params?: GetLessonsParams) {
  return apiRequest<LessonListResponse>(`/admin/lessons${buildQuery(params)}`, {
    authenticated: true,
  })
}
