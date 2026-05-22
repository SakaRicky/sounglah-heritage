import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { useI18n } from '../../../i18n'
import { toLessonSlug } from '../utils/lessonSlug'
import type { Lesson, LessonDifficulty, LessonStatus } from '../types/lesson.types'

export type LessonFormValues = {
  title: string
  slug: string
  description: string
  difficulty: LessonDifficulty
  estimatedMinutes: string
  coverImageUrl: string
  coverImageAltText: string
  status: LessonStatus
  orderIndex: string
}

export type LessonFormSubmission = {
  values: LessonFormValues
  coverFile: File | null
  removeCover: boolean
  coverAltTextChanged: boolean
}

type Props = {
  lesson: Lesson | null
  fieldErrors: Record<string, string>
  publishBlockers: string[]
  saving: boolean
  publishing: boolean
  onCancel: () => void
  onSaveDraft: (submission: LessonFormSubmission) => void
  onPublish: (submission: LessonFormSubmission) => void
}

const emptyValues: LessonFormValues = {
  title: '',
  slug: '',
  description: '',
  difficulty: 'beginner',
  estimatedMinutes: '',
  coverImageUrl: '',
  coverImageAltText: '',
  status: 'draft',
  orderIndex: '0',
}

const fieldLabelClass = 'text-sm font-semibold text-cocoa-ink'
const fieldClass =
  'mt-1.5 w-full rounded-cta border border-sand-200 bg-white px-4 py-3 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/40 focus:border-forest-600 focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]'
const fieldHelpClass = 'mt-2 text-sm leading-5 text-cocoa-body/70'
const sectionRuleClass = 'h-px flex-1 bg-sand-100'
const requiredMark = <span className="text-terracotta-500">*</span>

function valuesFromLesson(lesson: Lesson | null): LessonFormValues {
  if (!lesson) {
    return emptyValues
  }

  return {
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description ?? '',
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes ? String(lesson.estimatedMinutes) : '',
    coverImageUrl: lesson.coverImageUrl ?? '',
    coverImageAltText: lesson.coverImageAltText ?? '',
    status: lesson.status,
    orderIndex: String(lesson.orderIndex),
  }
}

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-accent/10 text-forest-700 ring-1 ring-forest-accent/10">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <h2 className="font-serif text-xl font-bold text-cocoa-800">{title}</h2>
        <div className={sectionRuleClass} />
      </div>
    </div>
  )
}

function BookIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5.5A2.5 2.5 0 018 3h10.5v15.5H8a2.5 2.5 0 00-2.5 2.5V5.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5.5A2.5 2.5 0 003 3H2.5v15.5H3a2.5 2.5 0 012.5 2.5V5.5z" />
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

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5l.45-1.5h2.1l.45 1.5 1.42.58 1.38-.75 1.48 1.49-.74 1.37.58 1.42 1.5.45v2.1l-1.5.45-.58 1.42.74 1.37-1.48 1.49-1.38-.75-1.42.58-.45 1.5h-2.1l-.45-1.5-1.42-.58-1.38.75-1.48-1.49.74-1.37-.58-1.42-1.5-.45v-2.1l1.5-.45.58-1.42-.74-1.37 1.48-1.49 1.38.75 1.42-.58z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 11.1a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  )
}

export function LessonForm({
  lesson,
  fieldErrors,
  publishBlockers,
  saving,
  publishing,
  onCancel,
  onSaveDraft,
  onPublish,
}: Props) {
  const { t } = useI18n()
  const [values, setValues] = useState<LessonFormValues>(() => valuesFromLesson(lesson))
  const [slugTouched, setSlugTouched] = useState(Boolean(lesson))
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(lesson?.coverImageUrl ?? null)
  const [removeCover, setRemoveCover] = useState(false)
  const [coverError, setCoverError] = useState('')
  const objectPreviewUrlRef = useRef<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const publishDisabled = publishBlockers.length > 0 || saving || publishing
  const hasCover =
    Boolean(coverFile) ||
    Boolean(values.coverImageUrl.trim()) ||
    Boolean(!removeCover && lesson?.coverImageUrl)

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

  function updateValue<Key extends keyof LessonFormValues>(key: Key, value: LessonFormValues[Key]) {
    if (key === 'slug') {
      setSlugTouched(true)
    }

    if (key === 'title' && !slugTouched) {
      setValues((current) => ({
        ...current,
        title: value,
        slug: toLessonSlug(String(value)),
      }))
      return
    }

    setValues((current) => ({ ...current, [key]: value }))
  }

  function buildSubmission(): LessonFormSubmission | null {
    if (coverError) {
      return null
    }

    if (hasCover && !values.coverImageAltText.trim()) {
      setCoverError(t('admin.lessons.form.coverAltRequired'))
      return null
    }

    return {
      values,
      coverFile,
      removeCover,
      coverAltTextChanged: values.coverImageAltText !== (lesson?.coverImageAltText ?? ''),
    }
  }

  function handleSaveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submission = buildSubmission()
    if (!submission) {
      return
    }

    onSaveDraft(submission)
  }

  function handlePublish() {
    const submission = buildSubmission()
    if (!submission || publishDisabled) {
      return
    }

    onPublish(submission)
  }

  function handleCoverFileChange(file: File | null) {
    setCoverError('')

    if (!file) {
      clearObjectPreview()
      setCoverFile(null)
      setCoverPreviewUrl(removeCover ? null : lesson?.coverImageUrl || values.coverImageUrl || null)
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCoverError(t('admin.lessons.form.coverFileType'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setCoverError(t('admin.lessons.form.coverFileSize'))
      return
    }

    clearObjectPreview()
    const objectUrl = URL.createObjectURL(file)
    objectPreviewUrlRef.current = objectUrl
    setCoverFile(file)
    setCoverPreviewUrl(objectUrl)
    setRemoveCover(false)
  }

  function handleRemoveCover() {
    clearObjectPreview()
    setCoverFile(null)
    setRemoveCover(true)
    setCoverPreviewUrl(null)
    setCoverError('')
    setValues((current) => ({ ...current, coverImageUrl: '' }))
    if (coverInputRef.current) {
      coverInputRef.current.value = ''
    }
  }

  function errorFor(key: string) {
    return fieldErrors[key] ? (
      <p className="mt-1 text-xs font-medium text-terracotta-600">{fieldErrors[key]}</p>
    ) : null
  }

  return (
    <form className="space-y-8" onSubmit={handleSaveDraft}>
      <section className="rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-soft md:p-7">
        <SectionHeader icon={<BookIcon />} title={t('admin.lessons.form.sectionBasics')} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={fieldLabelClass}>
              {t('admin.lessons.form.title')} {requiredMark}
            </span>
            <input
              value={values.title}
              onChange={(event) => updateValue('title', event.target.value)}
              className={fieldClass}
              placeholder={t('admin.lessons.form.titlePlaceholder')}
              required
            />
            {errorFor('title')}
          </label>

          <label className="block md:col-span-2">
            <span className={fieldLabelClass}>
              {t('admin.lessons.form.slug')} {requiredMark}
            </span>
            <input
              value={values.slug}
              onChange={(event) => updateValue('slug', event.target.value)}
              className={`${fieldClass} font-mono`}
              placeholder={t('admin.lessons.form.slugPlaceholder')}
              required
            />
            <p className={fieldHelpClass}>{t('admin.lessons.form.slugHelp')}</p>
            {errorFor('slug')}
          </label>

          <label className="block md:col-span-2">
            <span className={fieldLabelClass}>{t('admin.lessons.form.descriptionLabel')}</span>
            <textarea
              value={values.description}
              onChange={(event) => updateValue('description', event.target.value)}
              className={`${fieldClass} min-h-28`}
              placeholder={t('admin.lessons.form.descriptionPlaceholder')}
            />
            {errorFor('description')}
          </label>

          <label className="block">
            <span className={fieldLabelClass}>
              {t('admin.lessons.form.difficulty')} {requiredMark}
            </span>
            <select
              value={values.difficulty}
              onChange={(event) => updateValue('difficulty', event.target.value as LessonDifficulty)}
              className={fieldClass}
            >
              <option value="beginner">{t('admin.lessons.difficulty.beginner')}</option>
              <option value="intermediate">{t('admin.lessons.difficulty.intermediate')}</option>
              <option value="advanced">{t('admin.lessons.difficulty.advanced')}</option>
            </select>
            {errorFor('difficulty')}
          </label>

          <label className="block">
            <span className={fieldLabelClass}>{t('admin.lessons.form.estimatedMinutes')}</span>
            <input
              type="number"
              min={1}
              value={values.estimatedMinutes}
              onChange={(event) => updateValue('estimatedMinutes', event.target.value)}
              className={fieldClass}
              placeholder="5"
            />
            {errorFor('estimatedMinutes')}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-soft md:p-7">
        <SectionHeader icon={<ImageIcon />} title={t('admin.lessons.form.sectionCover')} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                {coverPreviewUrl ? (
                  <img src={coverPreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-3 text-center text-xs font-medium text-cocoa-body/50">
                    {t('admin.lessons.form.noCover')}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-xl border border-forest-accent/35 bg-white px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-50/30"
                >
                  {t('admin.lessons.form.uploadCover')}
                </button>
                {(coverPreviewUrl || lesson?.coverImageUrl) && !removeCover ? (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-semibold text-cocoa-body transition hover:border-terracotta-500/40 hover:text-terracotta-600"
                  >
                    {t('admin.lessons.form.removeCover')}
                  </button>
                ) : null}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => handleCoverFileChange(event.target.files?.[0] ?? null)}
              />
            </div>
            {coverError ? <p className="mt-2 text-xs font-medium text-terracotta-600">{coverError}</p> : null}
            {errorFor('coverImageUrl')}
          </div>

          <label className="block md:col-span-2">
            <span className={fieldLabelClass}>{t('admin.lessons.form.coverUrl')}</span>
            <input
              value={values.coverImageUrl}
              onChange={(event) => {
                setRemoveCover(false)
                updateValue('coverImageUrl', event.target.value)
                if (event.target.value.trim()) {
                  setCoverPreviewUrl(event.target.value.trim())
                  setCoverFile(null)
                  clearObjectPreview()
                }
              }}
              className={fieldClass}
              maxLength={500}
              placeholder="https://example.com/cover.jpg"
            />
            <p className={fieldHelpClass}>{t('admin.lessons.form.coverUrlHelp')}</p>
          </label>

          <label className="block md:col-span-2">
            <span className={fieldLabelClass}>
              {t('admin.lessons.form.coverAlt')}
              {hasCover ? requiredMark : null}
            </span>
            <input
              value={values.coverImageAltText}
              onChange={(event) => updateValue('coverImageAltText', event.target.value)}
              className={fieldClass}
              maxLength={255}
              placeholder={t('admin.lessons.form.coverAltPlaceholder')}
            />
            {errorFor('coverImageAltText')}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-sand-200 bg-white/80 p-5 shadow-soft md:p-7">
        <SectionHeader icon={<SettingsIcon />} title={t('admin.lessons.form.sectionSettings')} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={fieldLabelClass}>{t('admin.lessons.form.status')}</span>
            <select
              value={values.status}
              onChange={(event) => updateValue('status', event.target.value as LessonStatus)}
              className={fieldClass}
            >
              <option value="draft">{t('admin.lessons.status.draft')}</option>
              <option value="published">{t('admin.lessons.status.published')}</option>
              <option value="archived">{t('admin.lessons.status.archived')}</option>
            </select>
            {errorFor('status')}
          </label>

          <label className="block">
            <span className={fieldLabelClass}>{t('admin.lessons.form.orderIndex')}</span>
            <input
              type="number"
              value={values.orderIndex}
              onChange={(event) => updateValue('orderIndex', event.target.value)}
              className={fieldClass}
            />
            {errorFor('orderIndex')}
          </label>
        </div>
      </section>

      {publishBlockers.length > 0 ? (
        <div className="rounded-cta border border-gold-400/30 bg-gold-400/10 px-4 py-4">
          <p className="text-sm font-semibold text-cocoa-800">{t('admin.lessons.form.publishBlocked.title')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-cocoa-body">
            {publishBlockers.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-sand-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving || publishing}
          className="rounded-xl border border-sand-200 bg-white px-5 py-3 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:text-forest-700 disabled:opacity-50"
        >
          {t('admin.lessons.form.cancel')}
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving || publishing}
            className="rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700 transition hover:bg-forest-50/30 disabled:opacity-50"
          >
            {saving ? t('admin.lessons.form.saving') : t('admin.lessons.form.saveDraft')}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishDisabled}
            className="rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? t('admin.lessons.form.publishing') : t('admin.lessons.form.publish')}
          </button>
        </div>
      </div>
    </form>
  )
}
