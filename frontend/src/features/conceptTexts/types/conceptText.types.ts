export type ConceptTextStatus = 'active' | 'disabled'

export type ConceptTextReviewStatus = 'draft' | 'needs_review' | 'approved'

export interface ConceptText {
  id: string
  conceptId: string
  languageId: string
  text: string
  pronunciation?: string | null
  literalMeaning?: string | null
  usageNote?: string | null
  status: ConceptTextStatus
  reviewStatus: ConceptTextReviewStatus
  createdAt: string
  updatedAt: string
  concept?: {
    id: string
    key: string
    title: string
  } | null
  language?: {
    id: string
    name: string
    code: string
  } | null
}

export interface CreateConceptTextPayload {
  conceptId: string
  languageId: string
  text: string
  pronunciation?: string
  literalMeaning?: string
  usageNote?: string
  status: ConceptTextStatus
  reviewStatus: ConceptTextReviewStatus
}

export interface UpdateConceptTextPayload {
  text?: string
  pronunciation?: string
  literalMeaning?: string
  usageNote?: string
  status?: ConceptTextStatus
  reviewStatus?: ConceptTextReviewStatus
}

export interface ConceptTextListParams {
  search?: string
  conceptId?: string
  languageId?: string
  status?: ConceptTextStatus | 'all'
  reviewStatus?: ConceptTextReviewStatus | 'all'
  sort?: 'updated' | 'concept' | 'language' | 'text'
  page?: number
  pageSize?: number
}

export type ConceptTextListResponse = {
  data: ConceptText[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}
