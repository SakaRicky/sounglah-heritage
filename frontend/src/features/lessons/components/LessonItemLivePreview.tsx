import { useI18n } from '../../../i18n'
import type { ConceptCompletionRow } from '../../concepts/types/concept.types'
import type { LessonItemFormValues } from '../types/lessonItemForm.types'
import { conceptImageUrl, languageForCode } from '../utils/lessonItemPreview'

type Props = {
  values: LessonItemFormValues
  selectedConceptRow: ConceptCompletionRow | null
}

function WaveformPlaceholder() {
  return (
    <div className="flex h-8 flex-1 items-end gap-0.5 px-2">
      {[3, 6, 4, 8, 5, 7, 4, 9, 6, 5, 8, 4, 7, 5, 6].map((height, index) => (
        <span
          key={index}
          className="w-1 rounded-full bg-forest-accent/35"
          style={{ height: `${height * 3}px` }}
        />
      ))}
    </div>
  )
}

export function LessonItemLivePreview({ values, selectedConceptRow }: Props) {
  const { t } = useI18n()

  const isCulturalNote = values.type === 'CULTURAL_NOTE'
  const medLanguage = selectedConceptRow ? languageForCode(selectedConceptRow, 'med') : undefined
  const enLanguage = selectedConceptRow ? languageForCode(selectedConceptRow, 'en') : undefined
  const frLanguage = selectedConceptRow ? languageForCode(selectedConceptRow, 'fr') : undefined

  const previewImage = isCulturalNote
    ? values.imageUrl.trim() || null
    : conceptImageUrl(selectedConceptRow)

  const displayTitle = isCulturalNote
    ? values.title.trim() || t('admin.lessons.itemForm.previewPlaceholderTitle')
    : medLanguage?.text?.trim() || values.title.trim() || t('admin.lessons.itemForm.previewPlaceholderTitle')

  const transliteration = medLanguage?.pronunciation?.trim() ?? ''
  const englishText = isCulturalNote ? values.noteTextEn.trim() : enLanguage?.text?.trim() ?? ''
  const frenchText = isCulturalNote ? values.noteTextFr.trim() : frLanguage?.text?.trim() ?? ''
  const usageNote = values.type === 'PHRASE' ? values.usageNote.trim() : ''

  const hasPreviewContent =
    Boolean(displayTitle) ||
    Boolean(selectedConceptRow) ||
    Boolean(values.noteTextEn) ||
    Boolean(values.noteTextFr)

  return (
    <aside className="rounded-2xl border border-sand-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(74,42,24,0.06)]">
      <h3 className="text-base font-bold text-cocoa-800">{t('admin.lessons.itemForm.previewTitle')}</h3>

      <div className="mt-4 overflow-hidden rounded-2xl border border-sand-200 bg-gradient-to-b from-cream-50 to-white">
        {!hasPreviewContent ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-cocoa-800">{t('admin.lessons.itemForm.previewEmptyTitle')}</p>
            <p className="mt-1 max-w-xs text-sm text-cocoa-body/70">{t('admin.lessons.itemForm.previewEmptyDescription')}</p>
          </div>
        ) : (
          <div className="p-4">
            {previewImage ? (
              <div className="overflow-hidden rounded-xl border border-sand-200 bg-sand-100">
                <img src={previewImage} alt="" className="h-40 w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-sand-200 bg-cream-50/80 text-sm text-cocoa-body/60">
                {t('admin.lessons.itemForm.previewNoImage')}
              </div>
            )}

            {!isCulturalNote && selectedConceptRow ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-3 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-accent text-white shadow-[0_6px_16px_rgba(15,107,58,0.25)]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <WaveformPlaceholder />
                <span className="text-xs font-medium text-cocoa-body/60">00:05</span>
              </div>
            ) : null}

            <div className="mt-4 text-center">
              <p className="font-serif text-2xl font-bold text-forest-700">{displayTitle}</p>
              {transliteration ? (
                <p className="mt-1 text-sm italic text-cocoa-body/65">{transliteration}</p>
              ) : null}
            </div>

            {(englishText || frenchText) && !isCulturalNote ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {englishText ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-cocoa-800">
                    <span aria-hidden>🇬🇧</span>
                    {englishText}
                  </span>
                ) : null}
                {frenchText ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-cocoa-800">
                    <span aria-hidden>🇫🇷</span>
                    {frenchText}
                  </span>
                ) : null}
              </div>
            ) : null}

            {isCulturalNote && (englishText || frenchText) ? (
              <div className="mt-4 space-y-2 text-sm text-cocoa-body">
                {englishText ? <p>{englishText}</p> : null}
                {frenchText ? <p className="text-cocoa-body/75">{frenchText}</p> : null}
              </div>
            ) : null}

            {usageNote ? (
              <div className="mt-4 rounded-xl border border-gold-400/25 bg-gold-400/10 px-4 py-3 text-left">
                <p className="flex items-center gap-2 text-sm font-semibold text-cocoa-800">
                  <span className="text-base" aria-hidden>
                    💡
                  </span>
                  {t('admin.lessons.itemForm.previewWhenToUse')}
                </p>
                <p className="mt-1 text-sm leading-6 text-cocoa-body">{usageNote}</p>
              </div>
            ) : null}

            {values.instructionText.trim() ? (
              <p className="mt-4 rounded-xl bg-forest-50/60 px-4 py-3 text-center text-sm text-cocoa-body">
                {values.instructionText.trim()}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  )
}
