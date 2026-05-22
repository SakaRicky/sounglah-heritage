import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { ModalPortal } from '../../../components/common/ModalPortal'
import { toLanguageIdentifier } from '../utils/languageSlug'
import type {
  CreateLanguagePayload,
  Language,
  LanguageDirection,
  LanguageStatus,
  UpdateLanguagePayload,
} from '../types/language.types'

type FormValues = {
  name: string
  nativeName: string
  code: string
  slug: string
  description: string
  direction: LanguageDirection
  status: LanguageStatus
  isRequiredForConceptCompletion: boolean
  requiresConceptTextReview: boolean
  sortOrder: string
}

type Props = {
  language: Language | null
  fieldErrors: Record<string, string>
  saving: boolean
  onCancel: () => void
  onSubmit: (payload: CreateLanguagePayload | UpdateLanguagePayload) => void
}

const emptyValues: FormValues = {
  name: '',
  nativeName: '',
  code: '',
  slug: '',
  description: '',
  direction: 'ltr',
  status: 'active',
  isRequiredForConceptCompletion: false,
  requiresConceptTextReview: false,
  sortOrder: '0',
}

const fieldLabelClass = 'text-sm font-semibold text-cocoa-ink'
const fieldClass = 'mt-1.5 w-full rounded-cta border border-sand-200 bg-white px-4 py-3 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/40 focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]'
const fieldHelpClass = 'mt-2 text-sm leading-5 text-cocoa-body/70'
const sectionRuleClass = 'h-px flex-1 bg-sand-100'
const requiredMark = <span className="text-terracotta-500">*</span>

function valuesFromLanguage(language: Language | null): FormValues {
  if (!language) {
    return emptyValues
  }

  return {
    name: language.name,
    nativeName: language.nativeName ?? '',
    code: language.code,
    slug: language.slug,
    description: language.description ?? '',
    direction: language.direction,
    status: language.status,
    isRequiredForConceptCompletion: language.isRequiredForConceptCompletion,
    requiresConceptTextReview: language.requiresConceptTextReview,
    sortOrder: String(language.sortOrder),
  }
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function IdentityIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 20.25a6.75 6.75 0 0113.5 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5l.45-1.5h2.1l.45 1.5 1.42.58 1.38-.75 1.48 1.49-.74 1.37.58 1.42 1.5.45v2.1l-1.5.45-.58 1.42.74 1.37-1.48 1.49-1.38-.75-1.42.58-.45 1.5h-2.1l-.45-1.5-1.42-.58-1.38.75-1.48-1.49.74-1.37-.58-1.42-1.5-.45v-2.1l1.5-.45.58-1.42-.74-1.37 1.48-1.49 1.38.75 1.42-.58z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 11.1a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  )
}

function NotesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.75h7.25L18 7.5v12.75H7V3.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75V7.5H18M9.75 11.25h5.5M9.75 14.25h5.5M9.75 17.25h3.25" />
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
      <span className={sectionRuleClass} />
    </div>
  )
}

export function LanguageForm({ language, fieldErrors, saving, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(() => valuesFromLanguage(language))
  const [identifierTouched, setIdentifierTouched] = useState(Boolean(language))

  const title = language ? `Edit ${language.name}` : 'Add Language'

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    if (key === 'code' || key === 'slug') {
      setIdentifierTouched(true)
    }

    if (key === 'name' && !identifierTouched) {
      const name = String(value)
      const identifier = toLanguageIdentifier(name)
      setValues((current) => ({
        ...current,
        name,
        code: identifier,
        slug: identifier,
      }))
      return
    }

    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      name: values.name,
      nativeName: values.nativeName,
      code: values.code,
      slug: values.slug,
      description: values.description,
      direction: values.direction,
      status: values.status,
      isRequiredForConceptCompletion: values.isRequiredForConceptCompletion,
      requiresConceptTextReview: values.requiresConceptTextReview,
      sortOrder: Number(values.sortOrder),
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
        aria-labelledby="language-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden px-5 py-6 md:px-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[30rem] bg-[url('/images/artifacts/sounglah_corner_decor_01.png')] bg-[length:auto_15rem] bg-right-bottom bg-no-repeat opacity-55 md:block" />
          <div className="pointer-events-none absolute right-28 top-4 hidden h-44 w-44 rounded-full bg-forest-accent/5 md:block" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h2 id="language-form-title" className="font-serif text-4xl font-bold leading-tight text-cocoa-800">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-forest-700">
              Code and slug are stable identifiers. Edit them carefully once content depends on them.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close language form"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-cta border border-sand-200 bg-white text-cocoa-ink transition hover:border-forest-accent/30 hover:bg-forest-50 hover:text-forest-700"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <form className="space-y-8 border-t border-sand-100 px-5 py-6 md:px-8" onSubmit={handleSubmit}>
          <section className="space-y-5">
            <SectionHeader icon={<IdentityIcon />} title="Language identity" />
            <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className={fieldLabelClass}>Name {requiredMark}</span>
              <input
                value={values.name}
                onChange={(event) => updateValue('name', event.target.value)}
                className={fieldClass}
                placeholder="e.g. English"
                required
              />
              <p className={fieldHelpClass}>The name used within the system.</p>
              {errorFor('name')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Native name</span>
              <input
                value={values.nativeName}
                onChange={(event) => updateValue('nativeName', event.target.value)}
                className={fieldClass}
                placeholder="e.g. Francais"
              />
              <p className={fieldHelpClass}>The name in the native form.</p>
              {errorFor('nativeName')}
            </label>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeader icon={<SettingsIcon />} title="System configuration" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className={fieldLabelClass}>Code {requiredMark}</span>
              <input
                value={values.code}
                onChange={(event) => updateValue('code', event.target.value)}
                className={`${fieldClass} font-mono`}
                placeholder="e.g. en"
                required
              />
              <p className={fieldHelpClass}>Short stable identifier used internally.</p>
              {errorFor('code')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Slug {requiredMark}</span>
              <input
                value={values.slug}
                onChange={(event) => updateValue('slug', event.target.value)}
                className={`${fieldClass} font-mono`}
                placeholder="e.g. english"
                required
              />
              <p className={fieldHelpClass}>Used in URLs and public routing.</p>
              {errorFor('slug')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Direction</span>
              <select
                value={values.direction}
                onChange={(event) => updateValue('direction', event.target.value as LanguageDirection)}
                className={fieldClass}
              >
                <option value="ltr">LTR (Left to Right)</option>
                <option value="rtl">RTL (Right to Left)</option>
              </select>
              <p className={fieldHelpClass}>Text direction for this language.</p>
              {errorFor('direction')}
            </label>

            <label className="block lg:col-span-2">
              <span className={fieldLabelClass}>Status {requiredMark}</span>
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value as LanguageStatus)}
                className={fieldClass}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <p className={fieldHelpClass}>Enable or disable this language.</p>
              {errorFor('status')}
            </label>

            <label className="flex gap-3 rounded-cta border border-sand-100 bg-white px-4 py-3 lg:col-span-2">
              <input
                type="checkbox"
                checked={values.isRequiredForConceptCompletion}
                onChange={(event) => updateValue('isRequiredForConceptCompletion', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-accent"
              />
              <span>
                <span className={fieldLabelClass}>Required for concept completion</span>
                <span className="mt-1 block text-sm leading-5 text-cocoa-body/70">
                  Concepts need text in this language before they can be considered complete.
                </span>
                {errorFor('isRequiredForConceptCompletion')}
              </span>
            </label>

            <label className="flex gap-3 rounded-cta border border-sand-100 bg-white px-4 py-3 lg:col-span-2">
              <input
                type="checkbox"
                checked={values.requiresConceptTextReview}
                onChange={(event) => updateValue('requiresConceptTextReview', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-accent"
              />
              <span>
                <span className={fieldLabelClass}>Heritage review required for completion</span>
                <span className="mt-1 block text-sm leading-5 text-cocoa-body/70">
                  Turn on for local languages like Médumba. English and French can stay off so only heritage
                  translations block publishing.
                </span>
                {errorFor('requiresConceptTextReview')}
              </span>
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Sort order {requiredMark}</span>
              <input
                type="number"
                value={values.sortOrder}
                onChange={(event) => updateValue('sortOrder', event.target.value)}
                className={fieldClass}
              />
              <p className={fieldHelpClass}>Controls display order in learner interfaces.</p>
              {errorFor('sortOrder')}
            </label>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeader icon={<NotesIcon />} title="Additional notes" />
            <label className="block">
            <span className={fieldLabelClass}>Description</span>
            <textarea
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              className={`${fieldClass} min-h-28 resize-y`}
              maxLength={500}
              placeholder="Add a short description about this language (optional)"
            />
            <div className="mt-2 flex items-start justify-between gap-4">
              <p className={fieldHelpClass}>Optional notes to help content managers understand this language.</p>
              <p className="shrink-0 text-sm font-medium text-cocoa-body/70">{values.description.length} / 500</p>
            </div>
            {errorFor('description')}
          </label>
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
              {saving ? 'Saving...' : 'Save language'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}
