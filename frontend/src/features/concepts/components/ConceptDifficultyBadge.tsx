import { StatusBadge } from '../../../components/admin/StatusBadge'
import type { ConceptDifficultyLevel } from '../types/concept.types'

export function ConceptDifficultyBadge({ difficulty }: { difficulty: ConceptDifficultyLevel }) {
  return <StatusBadge variant={difficulty}>{difficulty}</StatusBadge>
}
