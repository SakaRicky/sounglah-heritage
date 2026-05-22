import { apiMultipartRequest, apiRequest } from '../../../lib/api'
import type {
  Concept,
  ConceptCompletionListParams,
  ConceptCompletionListResponse,
  ConceptCompletionRow,
  ConceptCompletionSummary,
  ConceptListParams,
  ConceptListResponse,
  ConceptStatus,
  CreateConceptPayload,
  UpdateConceptPayload,
} from '../types/concept.types'

function buildQuery(params: ConceptListParams | ConceptCompletionListParams = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getConcepts(params?: ConceptListParams) {
  return apiRequest<ConceptListResponse>(`/admin/concepts${buildQuery(params)}`, {
    authenticated: true,
  })
}

export async function getConceptById(id: string) {
  return apiRequest<{ data: Concept }>(`/admin/concepts/${id}`, {
    authenticated: true,
  })
}

export async function getConceptCompletion(params?: ConceptCompletionListParams) {
  return apiRequest<ConceptCompletionListResponse>(`/admin/concepts/completion${buildQuery(params)}`, {
    authenticated: true,
  })
}

export async function getConceptCompletionById(id: string) {
  return apiRequest<{ data: ConceptCompletionRow }>(`/admin/concepts/${id}/completion`, {
    authenticated: true,
  })
}

export async function getConceptCompletionSummary() {
  return apiRequest<{ data: ConceptCompletionSummary }>('/admin/concepts/completion/summary', {
    authenticated: true,
  })
}

export async function createConcept(payload: CreateConceptPayload) {
  return apiRequest<{ data: Concept }>('/admin/concepts', {
    method: 'POST',
    body: payload,
    authenticated: true,
  })
}

export async function updateConcept(id: string, payload: UpdateConceptPayload) {
  return apiRequest<{ data: Concept }>(`/admin/concepts/${id}`, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  })
}

export async function updateConceptStatus(id: string, status: ConceptStatus) {
  return apiRequest<{ data: Concept }>(`/admin/concepts/${id}/status`, {
    method: 'PATCH',
    body: { status },
    authenticated: true,
  })
}

export async function uploadConceptImage(id: string, image: File, imageAltText?: string) {
  const formData = new FormData()
  formData.set('image', image)

  if (imageAltText !== undefined) {
    formData.set('image_alt_text', imageAltText)
  }

  return apiMultipartRequest<{ data: Concept }>(`/admin/concepts/${id}/image`, formData, {
    method: 'POST',
    authenticated: true,
  })
}

export async function updateConceptImageAltText(id: string, imageAltText: string) {
  return apiRequest<{ data: Concept }>(`/admin/concepts/${id}/image-alt-text`, {
    method: 'PATCH',
    body: { image_alt_text: imageAltText },
    authenticated: true,
  })
}

export async function deleteConceptImage(id: string) {
  return apiRequest<{ data: Concept }>(`/admin/concepts/${id}/image`, {
    method: 'DELETE',
    authenticated: true,
  })
}

export async function publishConcept(id: string) {
  return apiRequest<{ data: Concept }>(`/admin/concepts/${id}/publish`, {
    method: 'POST',
    authenticated: true,
  })
}
