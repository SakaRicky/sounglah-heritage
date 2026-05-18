import { apiRequest } from '../../../lib/api'
import type {
  Concept,
  ConceptListParams,
  ConceptListResponse,
  ConceptStatus,
  CreateConceptPayload,
  UpdateConceptPayload,
} from '../types/concept.types'

function buildQuery(params: ConceptListParams = {}) {
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
