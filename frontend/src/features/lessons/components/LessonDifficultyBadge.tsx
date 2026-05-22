import { StatusBadge } from '../../../components/admin/StatusBadge'
import { useI18n } from '../../../i18n'
import type { LessonDifficulty } from '../types/lesson.types'

export function LessonDifficultyBadge({ difficulty }: { difficulty: LessonDifficulty }) {
  const { t } = useI18n()

  return <StatusBadge variant={difficulty}>{t(`admin.lessons.difficulty.${difficulty}`)}</StatusBadge>
}
