import { resolveMediaUrl } from '../../../lib/media'
import type { ConceptCompletionLanguage, ConceptCompletionRow } from '../../concepts/types/concept.types'

export function languageForCode(row: ConceptCompletionRow, code: string): ConceptCompletionLanguage | undefined {
  return row.languages.find((language) => language.languageCode.toLowerCase() === code.toLowerCase())
}

export function conceptImageUrl(row: ConceptCompletionRow | null): string | null {
  if (!row) {
    return null
  }

  return resolveMediaUrl(row.defaultImageUrl ?? row.image_url ?? null)
}

export function previewAudioStatusKey(
  language: ConceptCompletionLanguage,
): 'admin.lessons.itemForm.previewAudioMissing' | 'admin.lessons.itemForm.previewAudioPending' | 'admin.lessons.itemForm.previewAudioRejected' {
  if (language.audioStatus === 'pending_review') {
    return 'admin.lessons.itemForm.previewAudioPending'
  }

  if (language.audioStatus === 'rejected') {
    return 'admin.lessons.itemForm.previewAudioRejected'
  }

  return 'admin.lessons.itemForm.previewAudioMissing'
}
