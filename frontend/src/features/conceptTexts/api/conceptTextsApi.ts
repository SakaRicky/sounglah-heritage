import { apiMultipartRequest, apiRequest } from '../../../lib/api'
import type {
  ConceptTextAudio,
  ConceptText,
  ConceptTextListParams,
  ConceptTextListResponse,
  ConceptTextStatus,
  CreateConceptTextPayload,
  UpdateConceptTextPayload,
} from '../types/conceptText.types'

function buildQuery(params: ConceptTextListParams = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
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
