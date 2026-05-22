import { Lightbulb } from 'lucide-react'

import { useI18n } from '../../../i18n'

type Props = {
  canPreview: boolean
  previewHref: string
}

export function LessonItemsReorderTip({ canPreview, previewHref }: Props) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-forest-accent/15 bg-forest-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-700">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-cocoa-800">{t('admin.lessons.items.reorderTipTitle')}</p>
          <p className="mt-1 text-sm text-cocoa-body/75">{t('admin.lessons.items.reorderTipDescription')}</p>
        </div>
      </div>

      {canPreview ? (
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-forest-accent/35 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-white/80"
        >
          {t('admin.lessons.items.viewAsLearner')}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-sand-200 bg-stone-50 px-5 py-2.5 text-sm font-semibold text-cocoa-body/45"
        >
          {t('admin.lessons.items.viewAsLearner')}
        </button>
      )}
    </div>
  )
}
