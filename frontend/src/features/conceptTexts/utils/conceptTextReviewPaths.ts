export function conceptTextReviewEditPath(conceptTextId: string) {
  return `/admin/content/concept-texts?edit=${encodeURIComponent(conceptTextId)}`
}
