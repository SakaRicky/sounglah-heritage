export type LanguageStatus = 'active' | 'disabled'

export type LanguageDirection = 'ltr' | 'rtl'

export interface Language {
  id: string
  name: string
  nativeName?: string | null
  code: string
  slug: string
  description?: string | null
  direction: LanguageDirection
  status: LanguageStatus
  isRequiredForConceptCompletion: boolean
  sortOrder: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateLanguagePayload {
  name: string
  nativeName?: string
  code: string
  slug: string
  description?: string
  direction: LanguageDirection
  status: LanguageStatus
  isRequiredForConceptCompletion: boolean
  sortOrder: number
}

export interface UpdateLanguagePayload {
  name?: string
  nativeName?: string
  code?: string
  slug?: string
  description?: string
  direction?: LanguageDirection
  status?: LanguageStatus
  isRequiredForConceptCompletion?: boolean
  sortOrder?: number
}

export type LanguageListResponse = {
  data: Language[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}
