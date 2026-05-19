import { useState } from 'react'
import type { FormEvent } from 'react'

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
  sortOrder: '0',
}

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
    sortOrder: String(language.sortOrder),
  }
}

export function LanguageForm({ language, fieldErrors, saving, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(() => valuesFromLanguage(language))
  const [identifierTouched, setIdentifierTouched] = useState(Boolean(language))

  const title = language ? `Edit ${language.name}` : 'Add language'

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    if (key === 'code' || key === 'slug') {
      setIdentifierTouched(true)
    }

    if (key === 'name' && !identifierTouched) {
      const identifier = toLanguageIdentifier(value)
      setValues((current) => ({
        ...current,
        name: value,
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
      sortOrder: Number(values.sortOrder),
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
              Code and slug are stable identifiers. Edit them carefully once content depends on them.
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
            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Name</span>
              <input
                value={values.name}
                onChange={(event) => updateValue('name', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                required
              />
              {errorFor('name')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Native name</span>
              <input
                value={values.nativeName}
                onChange={(event) => updateValue('nativeName', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              />
              {errorFor('nativeName')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Code</span>
              <input
                value={values.code}
                onChange={(event) => updateValue('code', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                required
              />
              {errorFor('code')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Slug</span>
              <input
                value={values.slug}
                onChange={(event) => updateValue('slug', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                required
              />
              {errorFor('slug')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Direction</span>
              <select
                value={values.direction}
                onChange={(event) => updateValue('direction', event.target.value as LanguageDirection)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              >
                <option value="ltr">LTR</option>
                <option value="rtl">RTL</option>
              </select>
              {errorFor('direction')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Status</span>
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value as LanguageStatus)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              {errorFor('status')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Sort order</span>
              <input
                type="number"
                value={values.sortOrder}
                onChange={(event) => updateValue('sortOrder', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              />
              {errorFor('sortOrder')}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-cocoa-body">Description</span>
            <textarea
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              className="mt-1 min-h-28 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
            />
            {errorFor('description')}
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
              {saving ? 'Saving...' : 'Save language'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
