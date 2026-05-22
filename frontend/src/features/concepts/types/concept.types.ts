export type ConceptStatus = 'active' | 'disabled'

export type ConceptDifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type ConceptCompletionStatus =
  | 'needs_translation'
  | 'has_rejected_text'
  | 'draft'
  | 'needs_review'
  | 'complete'
  | 'published'

export interface Concept {
  id: string
  key: string
  slug: string
  title: string
  description?: string | null
  category?: string | null
  defaultImageUrl?: string | null
  image_url?: string | null
  image_public_id?: string | null
  image_alt_text?: string | null
  difficultyLevel: ConceptDifficultyLevel
  status: ConceptStatus
  publishedAt: string | null
  isPublished: boolean
  sortOrder: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateConceptPayload {
  key: string
  slug: string
  title: string
  description?: string
  category?: string
  defaultImageUrl?: string
  difficultyLevel: ConceptDifficultyLevel
  status: ConceptStatus
  sortOrder: number
}

export interface UpdateConceptPayload {
  key?: string
  slug?: string
  title?: string
  description?: string
  category?: string
  defaultImageUrl?: string
  difficultyLevel?: ConceptDifficultyLevel
  status?: ConceptStatus
  sortOrder?: number
}

export interface ConceptListParams {
  search?: string
  status?: ConceptStatus | 'all'
  category?: string
  difficultyLevel?: ConceptDifficultyLevel | 'all'
  sort?: 'title' | 'newest' | 'sortOrder'
  page?: number
  pageSize?: number
}

export type ConceptListResponse = {
  data: Concept[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

export interface ConceptCompletionLanguage {
  languageId: string
  languageCode: string
  languageName: string
  requiresConceptTextReview: boolean
  hasText: boolean
  textStatus: 'draft' | 'needs_review' | 'approved' | 'rejected' | null
  textId: string | null
  text: string | null
  pronunciation: string | null
}

export interface ConceptCompletionRow extends Concept {
  completionStatus: ConceptCompletionStatus
  isComplete: boolean
  isReadyToPublish: boolean
  missingLanguages: string[]
  draftLanguages: string[]
  needsReviewLanguages: string[]
  rejectedLanguages: string[]
  languages: ConceptCompletionLanguage[]
}

export interface ConceptCompletionListParams {
  search?: string
  status?: ConceptCompletionStatus | 'all'
  language?: string
  page?: number
  pageSize?: number
}

export type ConceptCompletionListResponse = {
  data: ConceptCompletionRow[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

export interface ConceptCompletionSummary {
  totalConcepts: number
  needsTranslation: number
  hasRejectedText: number
  draft: number
  needsReview: number
  complete: number
  published: number
}
