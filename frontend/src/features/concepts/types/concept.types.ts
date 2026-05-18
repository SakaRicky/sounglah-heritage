export type ConceptStatus = 'active' | 'disabled'

export type ConceptDifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Concept {
  id: string
  key: string
  slug: string
  title: string
  description?: string | null
  category?: string | null
  difficultyLevel: ConceptDifficultyLevel
  status: ConceptStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateConceptPayload {
  key: string
  slug: string
  title: string
  description?: string
  category?: string
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
