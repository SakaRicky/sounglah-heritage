import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { ApiError, normalizeApiFieldErrors } from '../../../lib/api'
import { useI18n } from '../../../i18n'
import { getConceptCompletion } from '../../concepts/api/conceptsApi'
import type { ConceptCompletionRow } from '../../concepts/types/concept.types'
import { getLessonById } from '../api/lessonsApi'
import { createLessonItem, getLessonItems, updateLessonItem } from '../api/lessonItemsApi'
import { LessonItemForm } from '../components/LessonItemForm'
import type { Lesson } from '../types/lesson.types'
import type { LessonItem } from '../types/lessonItem.types'
import { emptyLessonItemFormValues } from '../types/lessonItemForm.types'
import { buildLessonItemPayload, valuesFromLessonItem } from '../utils/lessonItemForm'

const FORM_ID = 'lesson-item-form'

function CancelIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function LessonItemFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { lessonId, itemId } = useParams()
  const isEditMode = Boolean(itemId)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [item, setItem] = useState<LessonItem | null>(null)
  const [values, setValues] = useState(emptyLessonItemFormValues)
  const [conceptSearchSeed, setConceptSearchSeed] = useState('')
  const [selectedConceptRow, setSelectedConceptRow] = useState<ConceptCompletionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const resolveConceptRow = useCallback(async (conceptId: string, searchHint?: string) => {
    if (!conceptId) {
      return null
    }

    try {
      const response = await getConceptCompletion({
        search: searchHint ?? '',
        status: 'all',
        page: 1,
        pageSize: 25,
      })
      return response.data.find((row) => row.id === conceptId) ?? null
    } catch {
      return null
    }
  }, [])

  const loadPage = useCallback(async () => {
    if (!lessonId) {
      return
    }

    setLoading(true)
    setLoadError('')

    try {
      const lessonResponse = await getLessonById(lessonId)
      setLesson(lessonResponse.data)

      if (isEditMode && itemId) {
        const itemsResponse = await getLessonItems(lessonId)
        const existingItem = itemsResponse.data.find((entry) => entry.id === itemId)

        if (!existingItem) {
          setLoadError(t('admin.lessons.itemForm.itemNotFound'))
          return
        }

        setItem(existingItem)
        setValues(valuesFromLessonItem(existingItem))

        const searchHint = existingItem.concept?.key ?? ''
        setConceptSearchSeed(searchHint)

        if (existingItem.conceptId) {
          const conceptRow = await resolveConceptRow(existingItem.conceptId, searchHint)
          setSelectedConceptRow(conceptRow)
        }
      } else {
        setItem(null)
        setValues(emptyLessonItemFormValues)
        setConceptSearchSeed('')
        setSelectedConceptRow(null)
      }
    } catch (requestError) {
      setLoadError(requestError instanceof Error ? requestError.message : t('admin.lessons.itemForm.loadError'))
    } finally {
      setLoading(false)
    }
  }, [isEditMode, itemId, lessonId, resolveConceptRow, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadPage])

  const pageTitle = useMemo(() => {
    if (isEditMode && item) {
      return t('admin.lessons.itemForm.editTitle').replace('{title}', item.title)
    }

    return t('admin.lessons.itemForm.createTitle')
  }, [isEditMode, item, t])

  function handleConceptSelect(conceptId: string, row: ConceptCompletionRow | null) {
    setValues((current) => ({ ...current, conceptId }))
    setSelectedConceptRow(row)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lessonId) {
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    setFieldErrors({})

    try {
      if (isEditMode && itemId) {
        await updateLessonItem(itemId, buildLessonItemPayload(values, true))
        setNotice(t('admin.lessons.itemForm.saved'))
        navigate(`/admin/content/lessons/${lessonId}/items`)
        return
      }

      await createLessonItem(lessonId, buildLessonItemPayload(values, false))
      setNotice(t('admin.lessons.itemForm.created'))
      navigate(`/admin/content/lessons/${lessonId}/items`)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.fields) {
        setFieldErrors(normalizeApiFieldErrors(requestError.fields))
      }
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.itemForm.saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!lessonId) {
    navigate('/admin/content/lessons')
    return null
  }

  const builderPath = `/admin/content/lessons/${lessonId}/items`

  if (loading) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-forest-50/20 p-8 text-center text-sm text-cocoa-body shadow-soft">
        {t('admin.lessons.itemForm.loading')}
      </div>
    )
  }

  if (loadError || !lesson) {
    return (
      <div className="space-y-4">
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {loadError || t('admin.lessons.itemForm.loadError')}
        </div>
        <Link
          to={builderPath}
          className="inline-flex rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700"
        >
          {t('admin.lessons.itemForm.backToBuilder')}
        </Link>
      </div>
    )
  }

  return (
    <div className="-mx-5 space-y-6 md:-mx-10">
      <div className="px-5 md:px-10">
        <AdminPageHeader
          breadcrumb={[
            t('admin.lessons.breadcrumb.section'),
            t('admin.lessons.breadcrumb.page'),
            lesson.title,
            isEditMode ? t('admin.lessons.itemForm.breadcrumbEdit') : t('admin.lessons.itemForm.breadcrumbCreate'),
          ]}
          title={pageTitle}
          description={t('admin.lessons.itemForm.pageDescription')}
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(builderPath)}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white px-5 py-3 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:text-forest-700 disabled:opacity-50"
              >
                <CancelIcon />
                {t('admin.lessons.itemForm.cancel')}
              </button>
              <button
                type="submit"
                form={FORM_ID}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700 disabled:opacity-50"
              >
                <SaveIcon />
                {saving ? t('admin.lessons.itemForm.saving') : t('admin.lessons.itemForm.save')}
              </button>
            </div>
          }
        />

        {notice ? (
          <div className="mt-6 rounded-cta border border-forest-accent/20 bg-forest-accent/10 px-4 py-3 text-sm font-medium text-forest-700">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
            {error}
          </div>
        ) : null}

        <div className="mt-8">
          <LessonItemForm
            key={item?.id ?? 'new-lesson-item'}
            formId={FORM_ID}
            values={values}
            lesson={lesson}
            isEdit={isEditMode}
            fieldErrors={fieldErrors}
            saving={saving}
            lessonPublished={lesson.status === 'published'}
            conceptSearchSeed={conceptSearchSeed}
            selectedConceptRow={selectedConceptRow}
            onChange={setValues}
            onConceptSelect={handleConceptSelect}
            onSubmit={(event) => void handleSubmit(event)}
          />
        </div>
      </div>
    </div>
  )
}
