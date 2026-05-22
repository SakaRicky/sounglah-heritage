import type { ConceptTextReferenceText } from '../types/conceptText.types'

type Props = {
  references?: ConceptTextReferenceText[]
  compact?: boolean
}

export function ConceptTextReviewReferenceTexts({ references, compact = false }: Props) {
  if (!references || references.length === 0) {
    return <span className="text-sm text-cocoa-body/50">—</span>
  }

  return (
    <ul className={compact ? 'space-y-1 text-xs text-cocoa-body/75' : 'space-y-1 text-sm text-cocoa-body/75'}>
      {references.map((reference) => (
        <li key={reference.languageCode}>
          <span className="font-semibold uppercase text-forest-700/80">{reference.languageCode}</span>:{' '}
          {reference.text}
        </li>
      ))}
    </ul>
  )
}
