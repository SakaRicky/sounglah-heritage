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
  const dotClass = status === 'active' ? 'bg-forest-accent' : 'bg-cocoa-body/45'

  return (
    <span className={['inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', className].join(' ')}>
      <span className={['h-2 w-2 rounded-full', dotClass].join(' ')} />
      {conceptTextStatusLabel(status)}
    </span>
  )
}
