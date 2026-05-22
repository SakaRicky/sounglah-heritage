import { useI18n } from '../../../i18n'
import type { Lesson } from '../types/lesson.types'
import type { LessonItemFormValues } from '../types/lessonItemForm.types'

type Props = {
  values: LessonItemFormValues
  lesson: Lesson
}

function SummaryRow({ label, value, dotClass }: { label: string; value: string; dotClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-cocoa-body/70">{label}</span>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa-800">
        {dotClass ? <span className={`h-2 w-2 rounded-full ${dotClass}`} /> : null}
        {value}
      </span>
    </div>
  )
}

export function LessonItemSummaryCard({ values, lesson }: Props) {
  const { t } = useI18n()

  const orderLabel = values.orderIndex.trim() || t('admin.lessons.itemForm.summaryOrderAppend')
  const statusLabel = values.isActive
    ? t('admin.lessons.itemForm.summaryActive')
    : t('admin.lessons.itemForm.summaryInactive')

  return (
    <aside className="rounded-2xl border border-sand-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(74,42,24,0.06)]">
      <h3 className="text-base font-bold text-cocoa-800">{t('admin.lessons.itemForm.summaryTitle')}</h3>
      <div className="mt-3 divide-y divide-sand-100">
        <SummaryRow
          label={t('admin.lessons.itemForm.summaryType')}
          value={t(`admin.lessons.items.type.${values.type}`)}
        />
        <SummaryRow
          label={t('admin.lessons.itemForm.summaryStatus')}
          value={statusLabel}
          dotClass={values.isActive ? 'bg-forest-accent' : 'bg-terracotta-400'}
        />
        <SummaryRow
          label={t('admin.lessons.itemForm.summaryDifficulty')}
          value={t(`admin.lessons.difficulty.${lesson.difficulty}`)}
          dotClass="bg-forest-accent"
        />
        <SummaryRow label={t('admin.lessons.itemForm.summaryOrder')} value={orderLabel} />
      </div>
    </aside>
  )
}
