import { StatusBadge } from '../../../components/admin/StatusBadge'
import type { ConceptStatus } from '../types/concept.types'

export function ConceptStatusBadge({ status }: { status: ConceptStatus }) {
  return <StatusBadge variant={status === 'active' ? 'active' : 'disabled'}>{status}</StatusBadge>
}
