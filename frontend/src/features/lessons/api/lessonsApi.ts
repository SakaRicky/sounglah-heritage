import { apiMultipartRequest, apiRequest } from '../../../lib/api'
import type {
  CreateLessonPayload,
  Lesson,
  LessonDifficulty,
  LessonListResponse,
  LessonSort,
  LessonStatus,
  UpdateLessonPayload,
  LessonPublishValidation,
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

export async function getLessonById(id: string) {
  return apiRequest<{ data: Lesson }>(`/admin/lessons/${id}`, {
    authenticated: true,
  })
}

export async function createLesson(payload: CreateLessonPayload) {
  return apiRequest<{ data: Lesson }>('/admin/lessons', {
    method: 'POST',
    body: payload,
    authenticated: true,
  })
}

export async function updateLesson(id: string, payload: UpdateLessonPayload) {
  return apiRequest<{ data: Lesson }>(`/admin/lessons/${id}`, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  })
}

export async function uploadLessonCoverImage(id: string, image: File, coverImageAltText?: string) {
  const formData = new FormData()
  formData.set('image', image)

  if (coverImageAltText !== undefined) {
    formData.set('cover_image_alt_text', coverImageAltText)
  }

  return apiMultipartRequest<{ data: Lesson }>(`/admin/lessons/${id}/cover-image`, formData, {
    method: 'POST',
    authenticated: true,
  })
}

export async function updateLessonCoverImageAltText(id: string, coverImageAltText: string) {
  return apiRequest<{ data: Lesson }>(`/admin/lessons/${id}/cover-image-alt-text`, {
    method: 'PATCH',
    body: { coverImageAltText },
    authenticated: true,
  })
}

export async function deleteLessonCoverImage(id: string) {
  return apiRequest<{ data: Lesson }>(`/admin/lessons/${id}/cover-image`, {
    method: 'DELETE',
    authenticated: true,
  })
}

export async function getLessonPublishValidation(id: string) {
  return apiRequest<{ data: LessonPublishValidation }>(`/admin/lessons/${id}/publish-validation`, {
    authenticated: true,
  })
}
