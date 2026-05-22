import { useI18n } from '../../../i18n'
import type { LessonStatus } from '../types/lesson.types'

const statusDotClass: Record<LessonStatus, string> = {
  published: 'bg-forest-accent',
  draft: 'bg-sand-300',
  archived: 'bg-sand-300',
}

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  const { t } = useI18n()

  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium capitalize text-cocoa-800">
      <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass[status]}`} aria-hidden />
      {t(`admin.lessons.status.${status}`)}
    </span>
  )
}
