import type { ConceptCompletionLanguage, ConceptCompletionRow } from '../types/concept.types'
import { isHeritageReviewRequired, isLanguageCompletionSatisfied } from './conceptCompletionLanguage'

export function buildConceptTextListPath({
  conceptId,
  languageId,
  action,
  textId,
}: {
  conceptId: string
  languageId: string
  action?: 'create' | 'edit'
  textId?: string
}) {
  const params = new URLSearchParams()
  params.set('conceptId', conceptId)
  params.set('languageId', languageId)

  if (action === 'create') {
    params.set('action', 'create')
  }

  if (action === 'edit' && textId) {
    params.set('edit', textId)
  }

  return `/admin/content/concept-texts?${params.toString()}`
}

export function getLanguageQuickAction(language: ConceptCompletionLanguage, conceptId: string) {
  if (!language.languageId) {
    return null
  }

  if (!language.hasText || !language.textStatus) {
    return {
      label: 'Add text',
      to: buildConceptTextListPath({
        conceptId,
        languageId: language.languageId,
        action: 'create',
      }),
    }
  }

  if (isLanguageCompletionSatisfied(language)) {
    return null
  }

  if (!isHeritageReviewRequired(language)) {
    return null
  }

  if (language.textStatus === 'approved' && language.requiresAudio && !language.hasApprovedAudio) {
    if (language.audioStatus === 'pending_review') {
      return {
        label: 'Review audio',
        to: '/admin/audio-review',
      }
    }

    return {
      label: 'Record audio',
      to: buildConceptTextListPath({
        conceptId,
        languageId: language.languageId,
        action: 'edit',
        textId: language.textId ?? undefined,
      }),
    }
  }

  const label =
    language.textStatus === 'needs_review'
      ? 'Review'
      : language.textStatus === 'rejected'
        ? 'Fix rejected'
        : 'Edit'

  return {
    label,
    to: buildConceptTextListPath({
      conceptId,
      languageId: language.languageId,
      action: 'edit',
      textId: language.textId ?? undefined,
    }),
  }
}

export function getPublishDisabledReason(row: ConceptCompletionRow): string | null {
  if (row.isReadyToPublish || row.completionStatus === 'published') {
    return null
  }

  const parts: string[] = []

  if (row.missingLanguages.length > 0) {
    parts.push(`Missing: ${row.missingLanguages.join(', ')}`)
  }

  if (row.rejectedLanguages.length > 0) {
    parts.push(`Rejected: ${row.rejectedLanguages.join(', ')}`)
  }

  if (row.draftLanguages.length > 0) {
    parts.push(`Draft: ${row.draftLanguages.join(', ')}`)
  }

  if (row.needsReviewLanguages.length > 0) {
    parts.push(`Needs review: ${row.needsReviewLanguages.join(', ')}`)
  }

  if (row.needsAudioLanguages.length > 0) {
    parts.push(`Needs audio: ${row.needsAudioLanguages.join(', ')}`)
  }

  return parts.length > 0
    ? `Cannot publish. ${parts.join('. ')}.`
    : 'Cannot publish until all required texts and heritage audio are approved.'
}

export function getPrimaryFixAction(row: ConceptCompletionRow) {
  for (const languageCode of row.missingLanguages) {
    const language = row.languages.find((item) => item.languageCode === languageCode)
    if (language) {
      return getLanguageQuickAction(language, row.id)
    }
  }

  for (const languageCode of row.rejectedLanguages) {
    const language = row.languages.find((item) => item.languageCode === languageCode)
    if (language) {
      return getLanguageQuickAction(language, row.id)
    }
  }

  for (const languageCode of row.draftLanguages) {
    const language = row.languages.find((item) => item.languageCode === languageCode)
    if (language) {
      return getLanguageQuickAction(language, row.id)
    }
  }

  for (const languageCode of row.needsReviewLanguages) {
    const language = row.languages.find((item) => item.languageCode === languageCode)
    if (language) {
      return getLanguageQuickAction(language, row.id)
    }
  }

  for (const languageCode of row.needsAudioLanguages) {
    const language = row.languages.find((item) => item.languageCode === languageCode)
    if (language) {
      return getLanguageQuickAction(language, row.id)
    }
  }

  return null
}
