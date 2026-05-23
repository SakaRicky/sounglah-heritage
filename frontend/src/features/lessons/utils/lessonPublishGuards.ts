import type { TranslationKey } from '../../../i18n'
import type { Lesson } from '../types/lesson.types'

export function getClientPublishBlockers(
  lesson: Pick<Lesson, 'itemCount'> | null,
  t: (key: TranslationKey) => string,
): string[] {
  if (!lesson || lesson.itemCount === 0) {
    return [t('admin.lessons.form.publishBlocked.noActiveItems')]
  }

  return []
}

export function parsePublishErrorFields(
  fields: Record<string, string | string[]> | undefined,
  t: (key: TranslationKey) => string,
): string[] {
  if (!fields) {
    return []
  }

  const reasons: string[] = []

  if (typeof fields.status === 'string') {
    reasons.push(fields.status)
  }

  const items = fields.items
  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (typeof item === 'string') {
        reasons.push(item)
      }
    })
  }

  if (reasons.length === 0) {
    return [t('admin.lessons.form.publishBlocked.generic')]
  }

  return reasons
}

/** Save draft always keeps the lesson unpublished (or archived when chosen). */
export function resolveSaveDraftStatus(formStatus: Lesson['status']): Lesson['status'] {
  return formStatus === 'archived' ? 'archived' : 'draft'
}
