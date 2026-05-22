import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from '../../../i18n'
import type { ConceptCompletionRow } from '../../concepts/types/concept.types'
import { ConceptCompletionLanguageBadge } from '../../concepts/components/ConceptCompletionLanguageBadge'
import type { Lesson } from '../types/lesson.types'
import { LessonItemConceptPicker } from './LessonItemConceptPicker'
import { LessonItemFormSection } from './LessonItemFormSection'
import { LessonItemLivePreview } from './LessonItemLivePreview'
import { LessonItemSummaryCard } from './LessonItemSummaryCard'
import { LessonItemTypeSelector } from './LessonItemTypeIcon'
import type { LessonItemFormValues } from '../types/lessonItemForm.types'
import { conceptImageUrl, languageForCode } from '../utils/lessonItemPreview'

type Props = {
  formId: string
  values: LessonItemFormValues
  lesson: Lesson
  isEdit: boolean
  fieldErrors: Record<string, string>
  saving: boolean
  lessonPublished: boolean
  conceptSearchSeed: string
  selectedConceptRow: ConceptCompletionRow | null
  onChange: (values: LessonItemFormValues) => void
  onConceptSelect: (conceptId: string, row: ConceptCompletionRow | null) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const fieldLabelClass = 'text-sm font-semibold text-cocoa-ink'
const fieldClass =
  'mt-1.5 w-full rounded-cta border border-sand-200 bg-cream-50/40 px-4 py-3 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/45 focus:border-forest-600 focus:bg-white focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]'
const requiredMark = <span className="text-terracotta-500">*</span>

function ActiveToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-sand-200 bg-cream-50/40 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-cocoa-800">{label}</p>
        <p className="mt-0.5 text-xs text-cocoa-body/65">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-7 w-12 shrink-0 rounded-full transition',
          checked ? 'bg-forest-accent' : 'bg-sand-200',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition',
            checked ? 'left-[22px]' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function LessonItemForm({
  formId,
  values,
  lesson,
  isEdit,
  fieldErrors,
  lessonPublished,
  conceptSearchSeed,
  selectedConceptRow,
  onChange,
  onConceptSelect,
  onSubmit,
}: Props) {
  const { t } = useI18n()
  const [showPublishedConceptHint, setShowPublishedConceptHint] = useState(false)

  function updateValue<Key extends keyof LessonItemFormValues>(key: Key, value: LessonItemFormValues[Key]) {
    onChange({ ...values, [key]: value })
  }

  function errorFor(key: string) {
    return fieldErrors[key] ? (
      <p className="mt-1 text-xs font-medium text-terracotta-600">{fieldErrors[key]}</p>
    ) : null
  }

  function handleConceptSelect(conceptId: string, row: ConceptCompletionRow | null) {
    onConceptSelect(conceptId, row)
    if (lessonPublished && row && row.completionStatus !== 'published') {
      setShowPublishedConceptHint(true)
    }
  }

  const showConceptPicker = values.type !== 'CULTURAL_NOTE'
  const medLanguage = selectedConceptRow ? languageForCode(selectedConceptRow, 'med') : undefined
  const conceptImage = conceptImageUrl(selectedConceptRow)

  return (
    <form id={formId} className="space-y-6" onSubmit={onSubmit}>
      {showPublishedConceptHint ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm text-terracotta-700">
          {t('admin.lessons.itemForm.publishedLessonConceptHint')}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LessonItemFormSection
            number={1}
            title={t('admin.lessons.itemForm.sectionTypeTitle')}
            description={t('admin.lessons.itemForm.sectionTypeDescription')}
          >
            <LessonItemTypeSelector
              value={values.type}
              disabled={isEdit}
              onChange={(type) => updateValue('type', type)}
            />
            {errorFor('type')}
          </LessonItemFormSection>

          <LessonItemFormSection
            number={2}
            title={t('admin.lessons.itemForm.sectionContentTitle')}
            description={t('admin.lessons.itemForm.sectionContentDescription')}
          >
            <div className="space-y-4">
              <label className="block">
                <span className={fieldLabelClass}>
                  {t('admin.lessons.itemForm.title')} {requiredMark}
                </span>
                <input
                  value={values.title}
                  onChange={(event) => updateValue('title', event.target.value)}
                  className={fieldClass}
                  placeholder={t('admin.lessons.itemForm.titlePlaceholder')}
                  required
                />
                {errorFor('title')}
              </label>

              <label className="block">
                <span className={fieldLabelClass}>{t('admin.lessons.itemForm.instructionText')}</span>
                <textarea
                  value={values.instructionText}
                  onChange={(event) => updateValue('instructionText', event.target.value)}
                  className={`${fieldClass} min-h-24`}
                  placeholder={t('admin.lessons.itemForm.instructionPlaceholder')}
                />
                {errorFor('instructionText')}
              </label>

              {showConceptPicker ? (
                <div>
                  <p className={fieldLabelClass}>
                    {t('admin.lessons.itemForm.concept')} {requiredMark}
                  </p>
                  <p className="mt-1 text-sm text-cocoa-body/70">{t('admin.lessons.itemForm.conceptHelp')}</p>
                  <div className="mt-3">
                    <LessonItemConceptPicker
                      selectedConceptId={values.conceptId}
                      initialSearch={conceptSearchSeed}
                      onSelect={handleConceptSelect}
                    />
                  </div>
                  {errorFor('conceptId')}
                </div>
              ) : null}

              {values.type === 'PHRASE' ? (
                <label className="block">
                  <span className={fieldLabelClass}>{t('admin.lessons.itemForm.usageNote')}</span>
                  <textarea
                    value={values.usageNote}
                    onChange={(event) => updateValue('usageNote', event.target.value)}
                    className={`${fieldClass} min-h-24`}
                    placeholder={t('admin.lessons.itemForm.usageNotePlaceholder')}
                  />
                  {errorFor('contentJson.usageNote')}
                </label>
              ) : null}

              {values.type === 'CULTURAL_NOTE' ? (
                <>
                  <label className="block">
                    <span className={fieldLabelClass}>
                      {t('admin.lessons.itemForm.noteTextEn')} {requiredMark}
                    </span>
                    <textarea
                      value={values.noteTextEn}
                      onChange={(event) => updateValue('noteTextEn', event.target.value)}
                      className={`${fieldClass} min-h-24`}
                      required
                    />
                    {errorFor('contentJson.noteTextEn')}
                  </label>
                  <label className="block">
                    <span className={fieldLabelClass}>
                      {t('admin.lessons.itemForm.noteTextFr')} {requiredMark}
                    </span>
                    <textarea
                      value={values.noteTextFr}
                      onChange={(event) => updateValue('noteTextFr', event.target.value)}
                      className={`${fieldClass} min-h-24`}
                      required
                    />
                    {errorFor('contentJson.noteTextFr')}
                  </label>
                </>
              ) : null}
            </div>
          </LessonItemFormSection>

          <LessonItemFormSection
            number={3}
            title={t('admin.lessons.itemForm.sectionMediaTitle')}
            description={t('admin.lessons.itemForm.sectionMediaDescription')}
          >
            {showConceptPicker ? (
              selectedConceptRow ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-sand-200 bg-cream-50/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-cocoa-800">{t('admin.lessons.itemForm.mediaAudio')}</p>
                        <p className="mt-1 text-xs text-cocoa-body/65">{t('admin.lessons.itemForm.mediaAudioHelp')}</p>
                      </div>
                      {medLanguage ? <ConceptCompletionLanguageBadge language={medLanguage} showCode /> : null}
                    </div>
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-3 py-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-accent/10 text-forest-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="text-sm text-cocoa-body">
                        {medLanguage?.hasText
                          ? t('admin.lessons.itemForm.mediaAudioReady')
                          : t('admin.lessons.itemForm.mediaAudioMissing')}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sand-200 bg-cream-50/50 p-4">
                    <p className="text-sm font-semibold text-cocoa-800">{t('admin.lessons.itemForm.mediaImage')}</p>
                    <p className="mt-1 text-xs text-cocoa-body/65">{t('admin.lessons.itemForm.mediaImageHelp')}</p>
                    {conceptImage ? (
                      <img src={conceptImage} alt="" className="mt-3 h-32 w-full rounded-xl border border-sand-200 object-cover" />
                    ) : (
                      <p className="mt-3 rounded-xl border border-dashed border-sand-200 bg-white px-4 py-6 text-center text-sm text-cocoa-body/60">
                        {t('admin.lessons.itemForm.mediaImageMissing')}
                      </p>
                    )}
                  </div>

                  <Link
                    to="/admin/content/concept-texts"
                    className="inline-flex text-sm font-semibold text-forest-700 hover:underline"
                  >
                    {t('admin.lessons.itemForm.linkConceptTexts')} →
                  </Link>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-sand-200 bg-cream-50/40 px-4 py-6 text-center text-sm text-cocoa-body/70">
                  {t('admin.lessons.itemForm.mediaSelectConcept')}
                </p>
              )
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className={fieldLabelClass}>{t('admin.lessons.itemForm.imageUrl')}</span>
                  <input
                    value={values.imageUrl}
                    onChange={(event) => updateValue('imageUrl', event.target.value)}
                    className={fieldClass}
                    maxLength={500}
                    placeholder="https://"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className={fieldLabelClass}>{t('admin.lessons.itemForm.imageAltText')}</span>
                  <input
                    value={values.imageAltText}
                    onChange={(event) => updateValue('imageAltText', event.target.value)}
                    className={fieldClass}
                    maxLength={255}
                  />
                </label>
              </div>
            )}
          </LessonItemFormSection>

          <LessonItemFormSection number={4} title={t('admin.lessons.itemForm.sectionSettingsTitle')}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={fieldLabelClass}>{t('admin.lessons.itemForm.orderIndex')}</span>
                <input
                  type="number"
                  min={1}
                  value={values.orderIndex}
                  onChange={(event) => updateValue('orderIndex', event.target.value)}
                  className={fieldClass}
                  placeholder={t('admin.lessons.itemForm.orderIndexPlaceholder')}
                />
                {errorFor('orderIndex')}
              </label>

              {values.type === 'AUDIO_LISTEN' ? (
                <label className="flex items-center gap-3 self-end rounded-xl border border-sand-200 bg-cream-50/40 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={values.hideTextUntilPlayed}
                    onChange={(event) => updateValue('hideTextUntilPlayed', event.target.checked)}
                    className="h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-200"
                  />
                  <span className="text-sm font-medium text-cocoa-body">{t('admin.lessons.itemForm.hideTextUntilPlayed')}</span>
                </label>
              ) : null}

              <div className="md:col-span-2">
                <ActiveToggle
                  checked={values.isActive}
                  onChange={(checked) => updateValue('isActive', checked)}
                  label={t('admin.lessons.itemForm.isActive')}
                  description={t('admin.lessons.itemForm.isActiveHelp')}
                />
              </div>
            </div>
          </LessonItemFormSection>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <LessonItemLivePreview values={values} selectedConceptRow={selectedConceptRow} />
          <LessonItemSummaryCard values={values} lesson={lesson} />
        </div>
      </div>
    </form>
  )
}
