export type ConceptTextStatus = 'active' | 'disabled'

export type ConceptTextReviewStatus = 'draft' | 'needs_review' | 'approved' | 'rejected'

export type ConceptTextAudioStatus = 'missing' | 'pending_review' | 'approved' | 'rejected'

export interface ConceptTextAudioSummary {
  status: ConceptTextAudioStatus
  currentAudioId: string | null
  currentAudioUrl: string | null
  pendingAudioId: string | null
  pendingAudioUrl: string | null
  durationSeconds: number | null
}

export interface ConceptTextAudio {
  id: string
  conceptTextId: string
  audioUrl: string
  audioPublicId: string
  storageProvider: string
  durationSeconds: number | null
  fileSizeBytes: number | null
  mimeType: string | null
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived'
  recordedByUserId: number | null
  reviewedByUserId: number | null
  reviewNote: string | null
  createdAt: string | null
  updatedAt: string | null
  submittedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  conceptText?: Pick<ConceptText, 'id' | 'text' | 'conceptId' | 'languageId' | 'concept' | 'language'> | null
}

export interface ConceptText {
  id: string
  conceptId: string
  languageId: string
  text: string
  pronunciation?: string | null
  audioUrl?: string | null
  pronunciationNote?: string | null
  literalMeaning?: string | null
  usageNote?: string | null
  status: ConceptTextStatus
  reviewStatus: ConceptTextReviewStatus
  audioSummary?: ConceptTextAudioSummary
  createdAt: string | null
  updatedAt: string | null
  concept?: {
    id: string
    key: string
    title: string
    image_url?: string | null
    image_alt_text?: string | null
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
  audioUrl?: string
  pronunciationNote?: string
  literalMeaning?: string
  usageNote?: string
  status: ConceptTextStatus
  reviewStatus: ConceptTextReviewStatus
}

export interface UpdateConceptTextPayload {
  text?: string
  pronunciation?: string
  audioUrl?: string
  pronunciationNote?: string
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

export interface ConceptTextReferenceText {
  languageCode: string
  text: string
}

export interface ConceptTextReviewQueueItem extends ConceptText {
  referenceTexts?: ConceptTextReferenceText[]
}

export type ConceptTextReviewQueueReviewStatus = ConceptTextReviewStatus | 'all'

export interface ConceptTextReviewQueueParams {
  reviewStatus?: ConceptTextReviewQueueReviewStatus
  languageId?: string
  search?: string
  page?: number
  pageSize?: number
}

export type ConceptTextReviewQueueResponse = {
  data: ConceptTextReviewQueueItem[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

export type ConceptTextAudioReviewStatus = ConceptTextAudio['status'] | 'all'

export interface ConceptTextAudioReviewQueueParams {
  status?: ConceptTextAudioReviewStatus
  languageId?: string
  conceptId?: string
  page?: number
  pageSize?: number
}

export type ConceptTextAudioReviewQueueResponse = {
  data: ConceptTextAudio[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}
