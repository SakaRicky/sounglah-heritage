import type { ConceptCompletionStatus } from '../types/concept.types'

export function conceptCompletionStatusLabel(status: ConceptCompletionStatus) {
  return {
    needs_translation: 'Needs translation',
    has_rejected_text: 'Has rejected text',
    draft: 'Draft',
    needs_review: 'Needs review',
    complete: 'Complete',
    published: 'Published',
  }[status]
}
