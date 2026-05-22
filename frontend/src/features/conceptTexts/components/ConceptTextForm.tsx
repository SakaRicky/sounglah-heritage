import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { ModalPortal } from '../../../components/common/ModalPortal'
import type { Concept } from '../../concepts/types/concept.types'
import type { Language } from '../../languages/types/language.types'
import type {
  ConceptText,
  ConceptTextReviewStatus,
  ConceptTextStatus,
  CreateConceptTextPayload,
  UpdateConceptTextPayload,
} from '../types/conceptText.types'

type FormValues = {
  conceptId: string
  languageId: string
  text: string
  pronunciation: string
  audioUrl: string
  pronunciationNote: string
  literalMeaning: string
  usageNote: string
  status: ConceptTextStatus
  reviewStatus: ConceptTextReviewStatus
}

type Props = {
  conceptText: ConceptText | null
  concepts: Concept[]
  languages: Language[]
  conceptSearch: string
  fieldErrors: Record<string, string>
  saving: boolean
  onConceptSearchChange: (value: string) => void
  onCancel: () => void
  onSubmit: (payload: CreateConceptTextPayload | UpdateConceptTextPayload) => void
}

const emptyValues: FormValues = {
  conceptId: '',
  languageId: '',
  text: '',
  pronunciation: '',
  audioUrl: '',
  pronunciationNote: '',
  literalMeaning: '',
  usageNote: '',
  status: 'active',
  reviewStatus: 'draft',
}

const fieldLabelClass = 'text-sm font-semibold text-cocoa-ink'
const fieldClass = 'mt-1.5 w-full rounded-cta border border-sand-200 bg-white px-4 py-3 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/40 focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]'
const fieldHelpClass = 'mt-2 text-sm leading-5 text-cocoa-body/70'
const requiredMark = <span className="text-terracotta-500">*</span>

function valuesFromConceptText(conceptText: ConceptText | null): FormValues {
  if (!conceptText) {
    return emptyValues
  }

  return {
    conceptId: conceptText.conceptId,
    languageId: conceptText.languageId,
    text: conceptText.text,
    pronunciation: conceptText.pronunciation ?? '',
    audioUrl: conceptText.audioUrl ?? '',
    pronunciationNote: conceptText.pronunciationNote ?? '',
    literalMeaning: conceptText.literalMeaning ?? '',
    usageNote: conceptText.usageNote ?? '',
    status: conceptText.status,
    reviewStatus: conceptText.reviewStatus,
  }
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.25h14M7.5 5.25v13.5M16.5 5.25v13.5M8.75 18.75h6.5" />
    </svg>
  )
}

function ContextIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 12h5M8 15h6" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h11l3 3v12H5v-15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.5v5h7v-5M8 19.5v-5h8v5" />
    </svg>
  )
}

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-accent/10 text-forest-700 ring-1 ring-forest-accent/10">
        {icon}
      </span>
      <h3 className="shrink-0 text-sm font-bold uppercase text-forest-700">{title}</h3>
      <span className="h-px flex-1 bg-sand-100" />
    </div>
  )
}

export function ConceptTextForm({
  conceptText,
  concepts,
  languages,
  conceptSearch,
  fieldErrors,
  saving,
  onConceptSearchChange,
  onCancel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<FormValues>(() => valuesFromConceptText(conceptText))
  const title = conceptText ? 'Edit Concept Text' : 'Add Concept Text'
  const selectedConcept = concepts.find((concept) => concept.id === values.conceptId) ?? conceptText?.concept
  const selectedLanguage = languages.find((language) => language.id === values.languageId) ?? conceptText?.language

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      text: values.text,
      pronunciation: values.pronunciation,
      audioUrl: values.audioUrl,
      pronunciationNote: values.pronunciationNote,
      literalMeaning: values.literalMeaning,
      usageNote: values.usageNote,
      status: values.status,
      reviewStatus: values.reviewStatus,
    }

    if (conceptText) {
      onSubmit(payload)
      return
    }

    onSubmit({
      ...payload,
      conceptId: values.conceptId,
      languageId: values.languageId,
    })
  }

  function errorFor(key: string) {
    return fieldErrors[key] ? (
      <p className="mt-1 text-xs font-medium text-terracotta-600">{fieldErrors[key]}</p>
    ) : null
  }

  return (
    <ModalPortal>
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-cocoa-ink/55 p-3 md:p-6"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="mx-auto my-2 w-full max-w-5xl overflow-hidden rounded-2xl border border-sand-100 bg-cream-50 shadow-card md:my-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="concept-text-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden px-5 py-6 md:px-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[30rem] bg-[url('/images/artifacts/sounglah_corner_decor_01.png')] bg-[length:auto_15rem] bg-right-bottom bg-no-repeat opacity-55 md:block" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 id="concept-text-form-title" className="font-serif text-4xl font-bold leading-tight text-cocoa-800">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-forest-700">
              Each concept can have one primary text per language. Create a new record to move text to a different concept or language.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close concept text form"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-cta border border-sand-200 bg-white text-cocoa-ink transition hover:border-forest-accent/30 hover:bg-forest-50 hover:text-forest-700"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <form className="space-y-8 border-t border-sand-100 px-5 py-6 md:px-8" onSubmit={handleSubmit}>
          <section className="space-y-5">
            <SectionHeader icon={<TextIcon />} title="Text identity" />
            <div className="grid gap-5 md:grid-cols-2">
            {conceptText ? (
              <div className="rounded-cta border border-sand-200 bg-white px-3 py-3">
                <span className={fieldLabelClass}>Concept</span>
                <p className="mt-1 font-semibold text-cocoa-800">{selectedConcept?.title ?? 'Unknown concept'}</p>
                <p className="font-mono text-xs text-cocoa-body/65">{selectedConcept?.key ?? values.conceptId}</p>
              </div>
            ) : (
              <label className="block">
                <span className={fieldLabelClass}>Concept {requiredMark}</span>
                <input
                  value={conceptSearch}
                  onChange={(event) => onConceptSearchChange(event.target.value)}
                  className={fieldClass}
                  placeholder="Find concept..."
                />
                <select
                  value={values.conceptId}
                  onChange={(event) => updateValue('conceptId', event.target.value)}
                  className={fieldClass}
                  required
                >
                  <option value="">Select concept</option>
                  {concepts.map((concept) => (
                    <option key={concept.id} value={concept.id}>
                      {concept.title}
                    </option>
                  ))}
                </select>
                <p className={fieldHelpClass}>Choose the language-independent idea this text belongs to.</p>
                {errorFor('conceptId')}
              </label>
            )}

            {conceptText ? (
              <div className="rounded-cta border border-sand-200 bg-white px-3 py-3">
                <span className={fieldLabelClass}>Language</span>
                <p className="mt-1 font-semibold text-cocoa-800">{selectedLanguage?.name ?? 'Unknown language'}</p>
                <p className="font-mono text-xs text-cocoa-body/65">{selectedLanguage?.code ?? values.languageId}</p>
              </div>
            ) : (
              <label className="block">
                <span className={fieldLabelClass}>Language {requiredMark}</span>
                <select
                  value={values.languageId}
                  onChange={(event) => updateValue('languageId', event.target.value)}
                  className={fieldClass}
                  required
                >
                  <option value="">Select language</option>
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
                <p className={fieldHelpClass}>Choose the language family members will see this text in.</p>
                {errorFor('languageId')}
              </label>
            )}

            <label className="block md:col-span-2">
              <span className={fieldLabelClass}>Text {requiredMark}</span>
              <textarea
                value={values.text}
                onChange={(event) => updateValue('text', event.target.value)}
                className={`${fieldClass} min-h-24 resize-y`}
                placeholder="Add the word or phrase families should learn"
                required
              />
              {errorFor('text')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Pronunciation</span>
              <input
                value={values.pronunciation}
                onChange={(event) => updateValue('pronunciation', event.target.value)}
                className={fieldClass}
                placeholder="Optional pronunciation guide"
              />
              {errorFor('pronunciation')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Audio URL</span>
              <input
                value={values.audioUrl}
                onChange={(event) => updateValue('audioUrl', event.target.value)}
                className={fieldClass}
                maxLength={500}
                placeholder="https://example.com/audio.mp3"
              />
              {errorFor('audioUrl')}
            </label>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeader icon={<ContextIcon />} title="Review and notes" />
            <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Review status</span>
              <select
                value={values.reviewStatus}
                onChange={(event) => updateValue('reviewStatus', event.target.value as ConceptTextReviewStatus)}
                className={fieldClass}
              >
                <option value="draft">Draft</option>
                <option value="needs_review">Needs review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {errorFor('reviewStatus')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Status</span>
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value as ConceptTextStatus)}
                className={fieldClass}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              {errorFor('status')}
            </label>

          <label className="block md:col-span-2">
            <span className={fieldLabelClass}>Pronunciation note</span>
            <textarea
              value={values.pronunciationNote}
              onChange={(event) => updateValue('pronunciationNote', event.target.value)}
              className={`${fieldClass} min-h-20 resize-y`}
              placeholder="Add guidance for reviewers, parents, or learners"
            />
            {errorFor('pronunciationNote')}
          </label>

          <label className="block">
            <span className={fieldLabelClass}>Literal meaning</span>
            <textarea
              value={values.literalMeaning}
              onChange={(event) => updateValue('literalMeaning', event.target.value)}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="Optional literal meaning"
            />
            {errorFor('literalMeaning')}
          </label>

          <label className="block">
            <span className={fieldLabelClass}>Usage note</span>
            <textarea
              value={values.usageNote}
              onChange={(event) => updateValue('usageNote', event.target.value)}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="When should families use this phrase?"
            />
            {errorFor('usageNote')}
          </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-sand-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-cta border border-sand-200 bg-white px-7 py-3 text-sm font-semibold text-cocoa-ink transition hover:border-forest-accent/30 hover:bg-forest-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-cta bg-forest-accent px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(31,90,61,0.24)] transition hover:bg-forest-accent-hover disabled:opacity-60"
            >
              <SaveIcon />
              {saving ? 'Saving...' : 'Save concept text'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}
