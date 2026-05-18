import { conceptTextStatusLabel } from '../utils/conceptTextLabels'
import type { ConceptTextStatus } from '../types/conceptText.types'

type Props = {
  status: ConceptTextStatus
}

export function ConceptTextStatusBadge({ status }: Props) {
  const className =
    status === 'active'
      ? 'border-forest-accent/25 bg-forest-accent/10 text-forest-700'
      : 'border-sand-200 bg-stone-100 text-cocoa-body/65'

  return (
    <span className={['inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', className].join(' ')}>
      {conceptTextStatusLabel(status)}
    </span>
  )
}
