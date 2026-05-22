import type { ConceptCompletionLanguage, ConceptCompletionRow } from '../../concepts/types/concept.types'

export function languageForCode(row: ConceptCompletionRow, code: string): ConceptCompletionLanguage | undefined {
  return row.languages.find((language) => language.languageCode.toLowerCase() === code.toLowerCase())
}

export function conceptImageUrl(row: ConceptCompletionRow | null): string | null {
  if (!row) {
    return null
  }

  return row.defaultImageUrl ?? row.image_url ?? null
}
