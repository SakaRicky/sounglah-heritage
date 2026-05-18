import { apiRequest } from '../../../lib/api'
import type {
  CreateLanguagePayload,
  Language,
  LanguageListResponse,
  LanguageStatus,
  UpdateLanguagePayload,
} from '../types/language.types'

type GetLanguagesParams = {
  search?: string
  status?: LanguageStatus | 'all'
  page?: number
  pageSize?: number
}

function buildQuery(params: GetLanguagesParams = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getLanguages(params?: GetLanguagesParams) {
  return apiRequest<LanguageListResponse>(`/admin/languages${buildQuery(params)}`, {
    authenticated: true,
  })
}

export async function createLanguage(payload: CreateLanguagePayload) {
  return apiRequest<{ data: Language }>('/admin/languages', {
    method: 'POST',
    body: payload,
    authenticated: true,
  })
}

export async function updateLanguage(id: string, payload: UpdateLanguagePayload) {
  return apiRequest<{ data: Language }>(`/admin/languages/${id}`, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  })
}

export async function updateLanguageStatus(id: string, status: LanguageStatus) {
  return apiRequest<{ data: Language }>(`/admin/languages/${id}/status`, {
    method: 'PATCH',
    body: { status },
    authenticated: true,
  })
}
