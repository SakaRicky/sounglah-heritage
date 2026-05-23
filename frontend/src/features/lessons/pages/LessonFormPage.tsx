import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { ApiError, normalizeApiFieldErrors } from '../../../lib/api'
import { useI18n } from '../../../i18n'
import {
  createLesson,
  deleteLessonCoverImage,
  getLessonById,
  updateLesson,
  updateLessonCoverImageAltText,
  uploadLessonCoverImage,
} from '../api/lessonsApi'
import { LessonForm } from '../components/LessonForm'
import type { LessonFormSubmission } from '../components/LessonForm'
import type { CreateLessonPayload, Lesson, UpdateLessonPayload } from '../types/lesson.types'
import {
  getClientPublishBlockers,
  parsePublishErrorFields,
  resolveSaveDraftStatus,
} from '../utils/lessonPublishGuards'

function buildPayload(submission: LessonFormSubmission, status: Lesson['status']): CreateLessonPayload {
  const { values } = submission
  const estimatedMinutes = values.estimatedMinutes.trim()
    ? Number(values.estimatedMinutes)
    : null

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    description: values.description.trim() || undefined,
    difficulty: values.difficulty,
    estimatedMinutes,
    coverImageUrl: values.coverImageUrl.trim() || null,
    coverImageAltText: values.coverImageAltText.trim() || null,
    status,
    orderIndex: Number(values.orderIndex || 0),
  }
}

export function LessonFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { lessonId } = useParams()
  const isEditMode = Boolean(lessonId)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(isEditMode)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [publishBlockers, setPublishBlockers] = useState<string[]>([])

  const loadLesson = useCallback(async () => {
    if (!lessonId) {
      return
    }

    setLoading(true)
    setLoadError('')

    try {
      const response = await getLessonById(lessonId)
      setLesson(response.data)
      setPublishBlockers(getClientPublishBlockers(response.data, t))
    } catch (requestError) {
      setLoadError(requestError instanceof Error ? requestError.message : t('admin.lessons.form.loadError'))
    } finally {
      setLoading(false)
    }
  }, [lessonId, t])

  useEffect(() => {
    if (!isEditMode) {
      return
    }

    const timer = window.setTimeout(() => {
      void loadLesson()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isEditMode, loadLesson])

  const pageTitle = useMemo(() => {
    if (isEditMode && lesson) {
      return t('admin.lessons.form.editTitle').replace('{title}', lesson.title)
    }

    return t('admin.lessons.form.createTitle')
  }, [isEditMode, lesson, t])

  async function applyCoverChanges(savedLesson: Lesson, submission: LessonFormSubmission) {
    let nextLesson = savedLesson

    if (submission.removeCover && savedLesson.coverImageUrl) {
      const response = await deleteLessonCoverImage(savedLesson.id)
      nextLesson = response.data
    } else if (submission.coverFile) {
      const response = await uploadLessonCoverImage(
        savedLesson.id,
        submission.coverFile,
        submission.values.coverImageAltText.trim() || undefined,
      )
      nextLesson = response.data
    } else if (submission.coverAltTextChanged && savedLesson.coverImageUrl) {
      const response = await updateLessonCoverImageAltText(
        savedLesson.id,
        submission.values.coverImageAltText.trim(),
      )
      nextLesson = response.data
    }

    return nextLesson
  }

  async function persistLesson(submission: LessonFormSubmission, targetStatus: Lesson['status']) {
    const payload = buildPayload(submission, targetStatus)
    setFieldErrors({})
    setError('')
    setNotice('')

    let savedLesson: Lesson

    if (lesson) {
      const response = await updateLesson(lesson.id, payload as UpdateLessonPayload)
      savedLesson = response.data
    } else {
      const response = await createLesson(payload)
      savedLesson = response.data
    }

    savedLesson = await applyCoverChanges(savedLesson, submission)
    setLesson(savedLesson)
    setPublishBlockers(getClientPublishBlockers(savedLesson, t))

    return savedLesson
  }

  async function handleSaveDraft(submission: LessonFormSubmission) {
    setSaving(true)

    try {
      const status = resolveSaveDraftStatus(submission.values.status)
      const savedLesson = await persistLesson(submission, status)
      setNotice(t('admin.lessons.form.savedDraft'))

      if (!isEditMode) {
        navigate(`/admin/content/lessons/${savedLesson.id}/edit`, { replace: true })
      }
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.fields) {
        setFieldErrors(normalizeApiFieldErrors(requestError.fields))
      }
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.form.saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(submission: LessonFormSubmission) {
    setPublishing(true)
    setPublishBlockers(getClientPublishBlockers(lesson, t))

    try {
      await persistLesson(submission, 'published')
      setNotice(t('admin.lessons.form.published'))
      navigate('/admin/content/lessons')
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        if (requestError.fields) {
          setFieldErrors(normalizeApiFieldErrors(requestError.fields))
          setPublishBlockers(parsePublishErrorFields(requestError.fields, t))
        }
      }
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.form.publishError'))
    } finally {
      setPublishing(false)
    }
  }

  const activePublishBlockers =
    publishBlockers.length > 0 ? publishBlockers : getClientPublishBlockers(lesson, t)

  if (loading) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-forest-50/20 p-8 text-center text-sm text-cocoa-body shadow-soft">
        {t('admin.lessons.form.loading')}
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {loadError}
        </div>
        <Link
          to="/admin/content/lessons"
          className="inline-flex rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700"
        >
          {t('admin.lessons.form.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={[
          t('admin.lessons.breadcrumb.section'),
          t('admin.lessons.breadcrumb.page'),
          isEditMode ? t('admin.lessons.form.breadcrumbEdit') : t('admin.lessons.form.breadcrumbCreate'),
        ]}
        title={pageTitle}
        description={t('admin.lessons.form.pageDescription')}
        action={
          <Link
            to="/admin/content/lessons"
            className="inline-flex items-center justify-center rounded-xl border border-forest-accent/35 bg-white px-5 py-3 text-sm font-semibold text-forest-700 transition hover:bg-forest-50/30"
          >
            {t('admin.lessons.form.backToList')}
          </Link>
        }
      />

      {notice ? (
        <div className="rounded-cta border border-forest-accent/20 bg-forest-accent/10 px-4 py-3 text-sm font-medium text-forest-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {error}
        </div>
      ) : null}

      <LessonForm
        key={lesson?.id ?? 'new-lesson'}
        lesson={lesson}
        fieldErrors={fieldErrors}
        publishBlockers={activePublishBlockers}
        saving={saving}
        publishing={publishing}
        onCancel={() => navigate('/admin/content/lessons')}
        onSaveDraft={(submission) => void handleSaveDraft(submission)}
        onPublish={(submission) => void handlePublish(submission)}
      />
    </div>
  )
}
