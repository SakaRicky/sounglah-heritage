import type { ConceptTextReviewStatus, ConceptTextStatus } from '../types/conceptText.types'

export function conceptTextStatusLabel(status: ConceptTextStatus) {
  return status === 'active' ? 'Active' : 'Disabled'
}

export function conceptTextReviewStatusLabel(status: ConceptTextReviewStatus) {
  return {
    draft: 'Draft',
    needs_review: 'Needs review',
    approved: 'Approved',
    rejected: 'Rejected',
  }[status]
}
