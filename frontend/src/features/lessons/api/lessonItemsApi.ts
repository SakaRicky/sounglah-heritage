import { apiRequest } from '../../../lib/api'
import type {
  CreateLessonItemPayload,
  LessonItemListResponse,
  LessonItemResponse,
  ReorderDirection,
  UpdateLessonItemPayload,
} from '../types/lessonItem.types'

export async function getLessonItems(lessonId: string) {
  return apiRequest<LessonItemListResponse>(`/admin/lessons/${lessonId}/items`, {
    authenticated: true,
  })
}

export async function createLessonItem(lessonId: string, payload: CreateLessonItemPayload) {
  return apiRequest<LessonItemResponse>(`/admin/lessons/${lessonId}/items`, {
    method: 'POST',
    body: payload,
    authenticated: true,
  })
}

export async function updateLessonItem(itemId: string, payload: UpdateLessonItemPayload) {
  return apiRequest<LessonItemResponse>(`/admin/lesson-items/${itemId}`, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  })
}

export async function deleteLessonItem(itemId: string) {
  return apiRequest<LessonItemListResponse>(`/admin/lesson-items/${itemId}`, {
    method: 'DELETE',
    authenticated: true,
  })
}

export async function reorderLessonItem(itemId: string, direction: ReorderDirection) {
  return apiRequest<LessonItemListResponse>(`/admin/lesson-items/${itemId}/reorder`, {
    method: 'PATCH',
    body: { direction },
    authenticated: true,
  })
}
