import { useI18n } from '../../../i18n'
import type { LessonItemType } from '../types/lessonItem.types'

const typeClass: Record<LessonItemType, string> = {
  VOCABULARY: 'bg-forest-accent/10 text-forest-700',
  PHRASE: 'bg-gold-400/20 text-cocoa-800',
  AUDIO_LISTEN: 'bg-terracotta-400/15 text-terracotta-600',
  CULTURAL_NOTE: 'bg-sand-100/90 text-cocoa-body',
}

export function LessonItemTypeBadge({ type }: { type: LessonItemType }) {
  const { t } = useI18n()

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeClass[type]}`}>
      {t(`admin.lessons.items.type.${type}`)}
    </span>
  )
}
