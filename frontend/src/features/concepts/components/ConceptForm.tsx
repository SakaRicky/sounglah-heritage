import { useState } from 'react'
import type { FormEvent } from 'react'

import { toConceptKey, toConceptSlug } from '../utils/conceptSlug'
import type {
  Concept,
  ConceptDifficultyLevel,
  ConceptStatus,
  CreateConceptPayload,
  UpdateConceptPayload,
} from '../types/concept.types'

type FormValues = {
  title: string
  key: string
  slug: string
  description: string
  category: string
  defaultImageUrl: string
  difficultyLevel: ConceptDifficultyLevel
  status: ConceptStatus
  sortOrder: string
}

type Props = {
  concept: Concept | null
  fieldErrors: Record<string, string>
  saving: boolean
  onCancel: () => void
  onSubmit: (payload: CreateConceptPayload | UpdateConceptPayload) => void
}

const emptyValues: FormValues = {
  title: '',
  key: '',
  slug: '',
  description: '',
  category: '',
  defaultImageUrl: '',
  difficultyLevel: 'beginner',
  status: 'active',
  sortOrder: '0',
}

function valuesFromConcept(concept: Concept | null): FormValues {
  if (!concept) {
    return emptyValues
  }

  return {
    title: concept.title,
    key: concept.key,
    slug: concept.slug,
    description: concept.description ?? '',
    category: concept.category ?? '',
    defaultImageUrl: concept.defaultImageUrl ?? '',
    difficultyLevel: concept.difficultyLevel,
    status: concept.status,
    sortOrder: String(concept.sortOrder),
  }
}

export function ConceptForm({ concept, fieldErrors, saving, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(() => valuesFromConcept(concept))
  const [identifierTouched, setIdentifierTouched] = useState(Boolean(concept))

  const title = concept ? `Edit ${concept.title}` : 'Add concept'

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    if (key === 'key' || key === 'slug') {
      setIdentifierTouched(true)
    }

    if (key === 'title' && !identifierTouched) {
      setValues((current) => ({
        ...current,
        title: value,
        key: toConceptKey(value),
        slug: toConceptSlug(value),
      }))
      return
    }

    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      title: values.title,
      key: values.key,
      slug: values.slug,
      description: values.description,
      category: values.category,
      defaultImageUrl: values.defaultImageUrl,
      difficultyLevel: values.difficultyLevel,
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
              The key is a stable internal identifier used for imports and content organization.
              Avoid changing it after translations or lessons are created.
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
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-cocoa-body">Title</span>
              <input
                value={values.title}
                onChange={(event) => updateValue('title', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                required
              />
              {errorFor('title')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Key</span>
              <input
                value={values.key}
                onChange={(event) => updateValue('key', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                required
              />
              {errorFor('key')}
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
              <span className="text-sm font-medium text-cocoa-body">Category</span>
              <input
                value={values.category}
                onChange={(event) => updateValue('category', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              />
              {errorFor('category')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Difficulty level</span>
              <select
                value={values.difficultyLevel}
                onChange={(event) => updateValue('difficultyLevel', event.target.value as ConceptDifficultyLevel)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errorFor('difficultyLevel')}
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-cocoa-body">Default image URL</span>
              <input
                value={values.defaultImageUrl}
                onChange={(event) => updateValue('defaultImageUrl', event.target.value)}
                className="mt-1 w-full rounded-cta border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
                maxLength={500}
              />
              {errorFor('defaultImageUrl')}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-cocoa-body">Status</span>
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value as ConceptStatus)}
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
              {saving ? 'Saving...' : 'Save concept'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
