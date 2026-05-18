import { StatusBadge } from '../../../components/admin/StatusBadge'
import type { LanguageStatus } from '../types/language.types'

export function LanguageStatusBadge({ status }: { status: LanguageStatus }) {
  return <StatusBadge variant={status === 'active' ? 'active' : 'disabled'}>{status}</StatusBadge>
}
