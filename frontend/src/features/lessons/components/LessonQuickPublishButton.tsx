import { AdminIconAction, adminIconActionIconClass } from '../../../components/admin/AdminIconAction'
import { useI18n } from '../../../i18n'
import type { Lesson } from '../types/lesson.types'
import { getClientPublishBlockers } from '../utils/lessonPublishGuards'

type Props = {
  lesson: Lesson
  publishing: boolean
  onPublish: (lessonId: string) => void
}

function SendIcon() {
  return (
    <svg
      className={adminIconActionIconClass}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12 3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className={`${adminIconActionIconClass} animate-spin`} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function LessonQuickPublishButton({ lesson, publishing, onPublish }: Props) {
  const { t } = useI18n()

  if (lesson.status === 'published') {
    return null
  }

  const blockers = getClientPublishBlockers(lesson, t)
  const canPublish = blockers.length === 0
  const disabledReason = blockers[0] ?? null
  const publishLabel = publishing ? t('admin.lessons.actions.publishing') : t('admin.lessons.actions.publish')

  return (
    <AdminIconAction
      label={publishLabel}
      tooltip={canPublish ? publishLabel : disabledReason ?? publishLabel}
      multilineTooltip={!canPublish}
      variant={canPublish ? 'primary' : 'disabled'}
      disabled={!canPublish || publishing}
      onClick={() => onPublish(lesson.id)}
    >
      {publishing ? <SpinnerIcon /> : <SendIcon />}
    </AdminIconAction>
  )
}
