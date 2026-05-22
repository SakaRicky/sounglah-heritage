import type { ConceptCompletionRow } from '../types/concept.types'
import {
  canBulkApproveReviewStatus,
  canBulkRejectReviewStatus,
} from '../../conceptTexts/utils/conceptTextReviewActions'
import { isHeritageReviewRequired } from './conceptCompletionLanguage'

export function reviewableTextIdsFromCompletionRows(
  rows: ConceptCompletionRow[],
  action: 'approve' | 'reject',
  selectedConceptIds?: Set<string>,
) {
  const scopedRows =
    selectedConceptIds && selectedConceptIds.size > 0
      ? rows.filter((row) => selectedConceptIds.has(row.id))
      : rows

  const ids: string[] = []

  scopedRows.forEach((row) => {
    row.languages.forEach((language) => {
      if (!language.textId || !language.textStatus || !isHeritageReviewRequired(language)) {
        return
      }

      const canApply =
        action === 'approve'
          ? canBulkApproveReviewStatus(language.textStatus)
          : canBulkRejectReviewStatus(language.textStatus)

      if (canApply) {
        ids.push(language.textId)
      }
    })
  })

  return ids
}

export function countReviewableCompletionTexts(
  rows: ConceptCompletionRow[],
  selectedConceptIds?: Set<string>,
) {
  return {
    approveCount: reviewableTextIdsFromCompletionRows(rows, 'approve', selectedConceptIds).length,
    rejectCount: reviewableTextIdsFromCompletionRows(rows, 'reject', selectedConceptIds).length,
  }
}
