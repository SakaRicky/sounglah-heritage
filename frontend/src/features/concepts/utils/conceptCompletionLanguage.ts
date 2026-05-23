import type { ConceptCompletionLanguage } from '../types/concept.types'

export function isHeritageReviewRequired(language: ConceptCompletionLanguage): boolean {
  return language.requiresConceptTextReview
}

export function isLanguageCompletionSatisfied(language: ConceptCompletionLanguage): boolean {
  if (!language.hasText) {
    return false
  }

  if (!language.requiresConceptTextReview) {
    return true
  }

  if (language.textStatus !== 'approved') {
    return false
  }

  return !language.requiresAudio || language.hasApprovedAudio
}
