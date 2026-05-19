import { useState } from 'react'
import type { FormEvent } from 'react'

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
  fieldErrors: Record<string, string>
  saving: boolean
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

export function ConceptTextForm({
  conceptText,
  concepts,
  languages,
  fieldErrors,
  saving,
  onCancel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<FormValues>(() => valuesFromConceptText(conceptText))
  const title = conceptText ? 'Edit concept text' : 'Add concept text'
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
    <div className="fixed inset-0 z-40 flex justify-end bg-cocoa-ink/30">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-cream-50 p-5 shadow-card md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-cocoa-800">{title}</h2>
            <p className="mt-2 text-sm text-forest-600/75">
              Each concept can have one primary text per language. Create a new record to move text to a different concept or language.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-cta border border-sand-200 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/30 hover:bg-forest-50 hover:text-forest-700"
          >
            Close
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {conceptText ? (
              <div className="rounded-cta border border-sand-200 bg-white px-3 py-3">
                <span className="text-sm font-medium text-cocoa-body">Concept</span>
                <p className="mt-1 font-semibold text-cocoa-800">{selectedConcept?.title ?? 'Unknown concept'}</p>
                <p className="font-mono text-xs text-cocoa-body/65">{selectedConcept?.key ?? values.conceptId}</p>
              </div>
            ) : (
              <label className="block">
                <span className="text-sm font-medium text-cocoa-body">Concept</span>
                <select
                  value={values.conceptId}
                  onChange={(event) => updateValue('conceptId', event.target.value)}
                  className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                  required
                >
                  <option value="">Select concept</option>
                  {concepts.map((concept) => (
                    <option key={concept.id} value={concept.id}>
                      {concept.title}
                    </option>
                  ))}
                </select>
                {errorFor('conceptId')}
              </label>
            )}

            {conceptText ? (
              <div className="rounded-cta border border-sand-200 bg-white px-3 py-3">
                <span className="text-sm font-medium text-cocoa-body">Language</span>
                <p className="mt-1 font-semibold text-cocoa-800">{selectedLanguage?.name ?? 'Unknown language'}</p>
                <p className="font-mono text-xs text-cocoa-body/65">{selectedLanguage?.code ?? values.languageId}</p>
              </div>
            ) : (
              <label className="block">
                <span className="text-sm font-medium text-cocoa-body">Language</span>
                <select
                  value={values.languageId}
                  onChange={(event) => updateValue('languageId', event.target.value)}
                  className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                  required
                >
                  <option value="">Select language</option>
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
                {errorFor('languageId')}
              </label>
            )}

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-cocoa-body">Text</span>
              <textarea
                value={values.text}
                onChange={(event) => updateValue('text', event.target.value)}
                className="mt-1 min-h-24 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                required
              />
              {errorFor('text')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Pronunciation</span>
              <input
                value={values.pronunciation}
                onChange={(event) => updateValue('pronunciation', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              />
              {errorFor('pronunciation')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Audio URL</span>
              <input
                value={values.audioUrl}
                onChange={(event) => updateValue('audioUrl', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                maxLength={500}
              />
              {errorFor('audioUrl')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Review status</span>
              <select
                value={values.reviewStatus}
                onChange={(event) => updateValue('reviewStatus', event.target.value as ConceptTextReviewStatus)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              >
                <option value="draft">Draft</option>
                <option value="needs_review">Needs review</option>
                <option value="approved">Approved</option>
              </select>
              {errorFor('reviewStatus')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Status</span>
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value as ConceptTextStatus)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              {errorFor('status')}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-cocoa-body">Pronunciation note</span>
            <textarea
              value={values.pronunciationNote}
              onChange={(event) => updateValue('pronunciationNote', event.target.value)}
              className="mt-1 min-h-20 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
            />
            {errorFor('pronunciationNote')}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-cocoa-body">Literal meaning</span>
            <textarea
              value={values.literalMeaning}
              onChange={(event) => updateValue('literalMeaning', event.target.value)}
              className="mt-1 min-h-24 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
            />
            {errorFor('literalMeaning')}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-cocoa-body">Usage note</span>
            <textarea
              value={values.usageNote}
              onChange={(event) => updateValue('usageNote', event.target.value)}
              className="mt-1 min-h-28 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
            />
            {errorFor('usageNote')}
          </label>

          <div className="flex justify-end gap-3 border-t border-sand-100 pt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-cta border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/30 hover:bg-forest-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-cta bg-forest-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save concept text'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
