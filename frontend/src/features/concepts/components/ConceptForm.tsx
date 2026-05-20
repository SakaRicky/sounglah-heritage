import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { ModalPortal } from '../../../components/common/ModalPortal'
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
  imageAltText: string
}

export type ConceptFormSubmission = {
  payload: CreateConceptPayload | UpdateConceptPayload
  imageFile: File | null
  imageAltText: string
  imageAltTextChanged: boolean
  removeImage: boolean
}

type Props = {
  concept: Concept | null
  fieldErrors: Record<string, string>
  saving: boolean
  onCancel: () => void
  onSubmit: (submission: ConceptFormSubmission) => void
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
  imageAltText: '',
}

const fieldLabelClass = "text-sm font-semibold text-cocoa-ink"
const fieldClass = "mt-1.5 w-full rounded-cta border border-sand-200 bg-white px-3 py-2.5 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/40 focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
const selectClass = fieldClass
const requiredMark = <span className="text-terracotta-500">*</span>

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
    imageAltText: concept.image_alt_text ?? '',
  }
}

function BookIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5.5A2.5 2.5 0 018 3h10.5v15.5H8a2.5 2.5 0 00-2.5 2.5V5.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5.5A2.5 2.5 0 003 3H2.5v15.5H3a2.5 2.5 0 012.5 2.5V5.5z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 14.25l2.1-2.1a1.1 1.1 0 011.55 0l1.35 1.35.85-.85a1.1 1.1 0 011.55 0l2.1 2.1M8.25 8.75h.01" />
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

function UploadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M5 16v2.25A1.75 1.75 0 006.75 20h10.5A1.75 1.75 0 0019 18.25V16" />
    </svg>
  )
}

export function ConceptForm({ concept, fieldErrors, saving, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(() => valuesFromConcept(concept))
  const [identifierTouched, setIdentifierTouched] = useState(Boolean(concept))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(concept?.image_url ?? null)
  const objectPreviewUrlRef = useRef<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [imageError, setImageError] = useState('')

  const title = concept ? `Edit ${concept.title}` : 'Add concept'

  function clearObjectPreview() {
    if (objectPreviewUrlRef.current) {
      URL.revokeObjectURL(objectPreviewUrlRef.current)
      objectPreviewUrlRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearObjectPreview()
    }
  }, [])

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
    if (imageError) {
      return
    }

    onSubmit({
      payload: {
        title: values.title,
        key: values.key,
        slug: values.slug,
        description: values.description,
        category: values.category,
        defaultImageUrl: values.defaultImageUrl,
        difficultyLevel: values.difficultyLevel,
        status: values.status,
        sortOrder: Number(values.sortOrder),
      },
      imageFile,
      imageAltText: values.imageAltText,
      imageAltTextChanged: values.imageAltText !== (concept?.image_alt_text ?? ''),
      removeImage,
    })
  }

  function handleImageChange(file: File | null) {
    setImageError('')

    if (!file) {
      clearObjectPreview()
      setImageFile(null)
      setImagePreviewUrl(removeImage ? null : concept?.image_url ?? null)
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      clearObjectPreview()
      setImageFile(null)
      setImagePreviewUrl(removeImage ? null : concept?.image_url ?? null)
      setImageError('Choose a JPEG, PNG, or WebP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      clearObjectPreview()
      setImageFile(null)
      setImagePreviewUrl(removeImage ? null : concept?.image_url ?? null)
      setImageError('Choose an image that is 5 MB or smaller.')
      return
    }

    clearObjectPreview()
    const objectUrl = URL.createObjectURL(file)
    objectPreviewUrlRef.current = objectUrl
    setImageFile(file)
    setImagePreviewUrl(objectUrl)
    setRemoveImage(false)
  }

  function handleRemoveImage() {
    clearObjectPreview()
    setImageFile(null)
    setRemoveImage(true)
    setImagePreviewUrl(null)
    setImageError('')
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  function errorFor(key: string) {
    return fieldErrors[key] ? (
      <p className="mt-1 text-xs font-medium text-terracotta-600">{fieldErrors[key]}</p>
    ) : null
  }

  return (
    <ModalPortal>
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-cocoa-ink/55 p-3 md:p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="mx-auto my-2 w-full max-w-5xl rounded-2xl border border-sand-100 bg-cream-50 p-5 shadow-card md:my-0 md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="concept-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-accent/10 text-forest-700 ring-1 ring-forest-accent/10">
              <BookIcon />
            </span>
            <div>
              <h2 id="concept-form-title" className="font-serif text-3xl font-bold leading-tight text-cocoa-800">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-forest-700">
                The key is a stable internal identifier used for imports and content organization.
                Avoid changing it after translations or lessons are created.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-cta border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-cocoa-ink transition hover:border-forest-accent/30 hover:bg-forest-50 hover:text-forest-700"
          >
            <CloseIcon />
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={fieldLabelClass}>Title {requiredMark}</span>
              <input
                value={values.title}
                onChange={(event) => updateValue('title', event.target.value)}
                className={fieldClass}
                placeholder="Enter concept title"
                required
              />
              {errorFor('title')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Key {requiredMark}</span>
              <input
                value={values.key}
                onChange={(event) => updateValue('key', event.target.value)}
                className={`${fieldClass} font-mono`}
                placeholder="Enter unique key"
                required
              />
              {errorFor('key')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Slug {requiredMark}</span>
              <input
                value={values.slug}
                onChange={(event) => updateValue('slug', event.target.value)}
                className={`${fieldClass} font-mono`}
                placeholder="Enter URL-friendly slug"
                required
              />
              {errorFor('slug')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Category</span>
              <input
                value={values.category}
                onChange={(event) => updateValue('category', event.target.value)}
                className={fieldClass}
                placeholder="Select category"
              />
              {errorFor('category')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Difficulty level {requiredMark}</span>
              <select
                value={values.difficultyLevel}
                onChange={(event) => updateValue('difficultyLevel', event.target.value as ConceptDifficultyLevel)}
                className={selectClass}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errorFor('difficultyLevel')}
            </label>

            <label className="block md:col-span-2">
              <span className={fieldLabelClass}>Default image URL</span>
              <input
                value={values.defaultImageUrl}
                onChange={(event) => updateValue('defaultImageUrl', event.target.value)}
                className={fieldClass}
                maxLength={500}
                placeholder="https://example.com/image.png"
              />
              {errorFor('defaultImageUrl')}
            </label>

            <section className="md:col-span-2 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[0_14px_36px_rgba(73,48,29,0.08)]">
              <div className="border-b border-sand-100 bg-cream-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-accent/10 text-forest-700 ring-1 ring-forest-accent/15">
                    <ImageIcon />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-cocoa-800">Concept image</h3>
                    <p className="mt-0.5 text-sm leading-5 text-cocoa-body/65">Add a visual that helps families recognize this concept.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr] md:items-stretch">
                <div className="flex min-h-48 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-sand-200 bg-cream-50/60 p-4 text-center">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt={values.imageAltText || concept?.title || 'Concept image preview'}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-forest-300 ring-1 ring-sand-200">
                        <ImageIcon />
                      </span>
                      <p className="mt-3 font-serif text-base font-bold text-cocoa-800">No image selected</p>
                      <p className="mt-1 max-w-44 text-xs leading-5 text-cocoa-body/60">
                        Upload an image to represent this concept visually.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className={fieldLabelClass}>Upload image</span>
                    <div className="mt-2 rounded-2xl border border-dashed border-sand-200 bg-cream-50/60 p-3">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                        className="sr-only"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="inline-flex w-fit items-center justify-center gap-2 rounded-cta bg-forest-accent px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:opacity-60"
                          disabled={saving}
                        >
                          <UploadIcon />
                          Choose file
                        </button>
                        <span className="min-w-0 truncate text-sm text-cocoa-body/70">
                          {imageFile?.name ?? (imagePreviewUrl ? 'Current image selected' : 'No file chosen')}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-cocoa-body/60">
                        PNG, JPG, or WebP. Up to 5 MB.
                      </p>
                      {imageError ? (
                        <p className="mt-2 text-xs font-medium text-terracotta-600">{imageError}</p>
                      ) : null}
                      {fieldErrors.image ? (
                        <p className="mt-2 text-xs font-medium text-terracotta-600">{fieldErrors.image}</p>
                      ) : null}
                    </div>
                  </div>

                  <label className="block">
                    <span className={fieldLabelClass}>Image alt text</span>
                    <input
                      value={values.imageAltText}
                      onChange={(event) => updateValue('imageAltText', event.target.value)}
                      className={fieldClass}
                      maxLength={255}
                      placeholder="Describe the image for accessibility"
                    />
                  </label>

                  {(concept?.image_url || imageFile) && !removeImage ? (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-cta border border-terracotta-500/30 bg-white px-3 py-2 text-sm font-semibold text-terracotta-600 transition hover:bg-terracotta-400/10 disabled:opacity-60"
                      disabled={saving}
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            <label className="block">
              <span className={fieldLabelClass}>Status {requiredMark}</span>
              <select
                value={values.status}
                onChange={(event) => updateValue('status', event.target.value as ConceptStatus)}
                className={selectClass}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              {errorFor('status')}
            </label>

            <label className="block">
              <span className={fieldLabelClass}>Sort order {requiredMark}</span>
              <input
                type="number"
                value={values.sortOrder}
                onChange={(event) => updateValue('sortOrder', event.target.value)}
                className={fieldClass}
              />
              {errorFor('sortOrder')}
            </label>
          </div>

          <label className="block">
            <span className={fieldLabelClass}>Description</span>
            <textarea
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              className={`${fieldClass} min-h-24 resize-y`}
              placeholder="Enter a detailed description of the concept..."
            />
            {errorFor('description')}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-sand-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-cta border border-sand-200 bg-white px-4 py-2.5 text-sm font-semibold text-cocoa-ink transition hover:border-forest-accent/30 hover:bg-forest-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-cta bg-forest-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover disabled:opacity-60"
            >
              <SaveIcon />
              {saving ? 'Saving...' : concept ? 'Save concept' : 'Create concept'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}
