import { apiRequest } from '../../../lib/api'
import type { LessonItemListResponse, ReorderDirection } from '../types/lessonItem.types'

export async function getLessonItems(lessonId: string) {
  return apiRequest<LessonItemListResponse>(`/admin/lessons/${lessonId}/items`, {
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
