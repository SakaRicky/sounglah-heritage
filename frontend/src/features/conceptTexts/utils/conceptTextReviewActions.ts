import type { ConceptText, ConceptTextReviewStatus } from '../types/conceptText.types'
import { updateConceptText } from '../api/conceptTextsApi'

export type BulkReviewResult = {
  updated: number
  failed: number
}

export async function bulkUpdateConceptTextReviewStatus(
  ids: string[],
  reviewStatus: ConceptTextReviewStatus,
): Promise<BulkReviewResult> {
  if (ids.length === 0) {
    return { updated: 0, failed: 0 }
  }

  const results = await Promise.allSettled(ids.map((id) => updateConceptText(id, { reviewStatus })))

  return {
    updated: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  }
}

export function canBulkApproveReviewStatus(reviewStatus: ConceptTextReviewStatus | null | undefined) {
  return reviewStatus != null && reviewStatus !== 'approved'
}

export function canBulkRejectReviewStatus(reviewStatus: ConceptTextReviewStatus | null | undefined) {
  return reviewStatus != null && reviewStatus !== 'rejected'
}

export function reviewableConceptTextIds(conceptTexts: ConceptText[], action: 'approve' | 'reject', selectedIds?: Set<string>) {
  const scopedTexts =
    selectedIds && selectedIds.size > 0
      ? conceptTexts.filter((conceptText) => selectedIds.has(conceptText.id))
      : conceptTexts

  return scopedTexts
    .filter((conceptText) => {
      if (conceptText.status !== 'active') {
        return false
      }

      return action === 'approve'
        ? canBulkApproveReviewStatus(conceptText.reviewStatus)
        : canBulkRejectReviewStatus(conceptText.reviewStatus)
    })
    .map((conceptText) => conceptText.id)
}

export function countReviewableConceptTexts(conceptTexts: ConceptText[], selectedIds?: Set<string>) {
  return {
    approveCount: reviewableConceptTextIds(conceptTexts, 'approve', selectedIds).length,
    rejectCount: reviewableConceptTextIds(conceptTexts, 'reject', selectedIds).length,
  }
}
