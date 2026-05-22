export type ConceptStatus = 'active' | 'disabled'

export type ConceptDifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

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
