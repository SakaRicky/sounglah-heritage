import { apiMultipartRequest, apiRequest } from '../../../lib/api'
import type {
  ConceptTextAudio,
  ConceptTextAudioReviewQueueParams,
  ConceptTextAudioReviewQueueResponse,
  ConceptTextReviewQueueParams,
  ConceptTextReviewQueueResponse,
  ConceptText,
  ConceptTextListParams,
  ConceptTextListResponse,
  ConceptTextStatus,
  CreateConceptTextPayload,
  UpdateConceptTextPayload,
} from '../types/conceptText.types'

function buildQuery<T extends object>(params: T = {} as T) {
  const query = new URLSearchParams()

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getConceptTexts(params?: ConceptTextListParams) {
  return apiRequest<ConceptTextListResponse>(`/admin/concept-texts${buildQuery(params)}`, {
    authenticated: true,
  })
}

export async function getConceptTextById(id: string) {
  return apiRequest<{ data: ConceptText }>(`/admin/concept-texts/${id}`, {
    authenticated: true,
  })
}

export async function createConceptText(payload: CreateConceptTextPayload) {
  return apiRequest<{ data: ConceptText }>('/admin/concept-texts', {
    method: 'POST',
    body: payload,
    authenticated: true,
  })
}

export async function updateConceptText(id: string, payload: UpdateConceptTextPayload) {
  return apiRequest<{ data: ConceptText }>(`/admin/concept-texts/${id}`, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  })
}

export async function updateConceptTextStatus(id: string, status: ConceptTextStatus) {
  return apiRequest<{ data: ConceptText }>(`/admin/concept-texts/${id}/status`, {
    method: 'PATCH',
    body: { status },
    authenticated: true,
  })
}

export async function uploadConceptTextAudio(conceptTextId: string, audioBlob: Blob, durationSeconds: number) {
  const formData = new FormData()
  const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm'

  formData.set('audio', audioBlob, `concept-text-${conceptTextId}.${extension}`)
  formData.set('duration_seconds', String(durationSeconds))

  return apiMultipartRequest<{ data: ConceptTextAudio }>(`/admin/concept-texts/${conceptTextId}/audios`, formData, {
    authenticated: true,
  })
}

export async function getConceptTextAudioReviewQueue(params?: ConceptTextAudioReviewQueueParams) {
  return apiRequest<ConceptTextAudioReviewQueueResponse>(`/admin/concept-text-audios/review-queue${buildQuery(params)}`, {
    authenticated: true,
  })
}

export async function getConceptTextReviewQueue(params?: ConceptTextReviewQueueParams) {
  return apiRequest<ConceptTextReviewQueueResponse>(`/admin/concept-texts/review-queue${buildQuery(params)}`, {
    authenticated: true,
  })
}

export async function approveConceptTextAudio(audioId: string) {
  return apiRequest<{ data: ConceptTextAudio }>(`/admin/concept-text-audios/${audioId}/approve`, {
    method: 'PATCH',
    authenticated: true,
  })
}

export async function rejectConceptTextAudio(audioId: string, reviewNote: string) {
  return apiRequest<{ data: ConceptTextAudio }>(`/admin/concept-text-audios/${audioId}/reject`, {
    method: 'PATCH',
    body: { review_note: reviewNote },
    authenticated: true,
  })
}
