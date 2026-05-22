import { ModalPortal } from '../../../components/common/ModalPortal'
import { useI18n } from '../../../i18n'
import type { LessonItem } from '../types/lessonItem.types'

type Props = {
  item: LessonItem | null
  saving: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteLessonItemDialog({ item, saving, onCancel, onConfirm }: Props) {
  const { t } = useI18n()

  if (!item) {
    return null
  }

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-ink/35 p-4"
        role="presentation"
        onClick={onCancel}
      >
        <div
          className="w-full max-w-md rounded-soft bg-white p-6 shadow-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-lesson-item-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="delete-lesson-item-title" className="text-xl font-bold text-cocoa-800">
            {t('admin.lessons.items.delete.title').replace('{title}', item.title)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-cocoa-body">{t('admin.lessons.items.delete.description')}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-cta border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 disabled:opacity-60"
            >
              {t('admin.lessons.items.delete.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="rounded-cta bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white shadow-button transition hover:bg-terracotta-600 disabled:opacity-60"
            >
              {saving ? t('admin.lessons.items.delete.deleting') : t('admin.lessons.items.delete.confirm')}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
