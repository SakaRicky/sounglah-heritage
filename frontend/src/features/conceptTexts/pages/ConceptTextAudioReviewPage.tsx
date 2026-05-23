import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, Clock, Headphones, Loader2, RefreshCw, RotateCcw, Search, UserRound, X } from 'lucide-react'

import { AdminDataTable } from '../../../components/admin/AdminDataTable'
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { ModalPortal } from '../../../components/common/ModalPortal'
import { Toast } from '../../../components/common/Toast'
import { formatDate } from '../../../lib/date'
import { resolveMediaUrl } from '../../../lib/media'
import { getLanguages } from '../../languages/api/languagesApi'
import type { Language } from '../../languages/types/language.types'
import {
  approveConceptTextAudio,
  getConceptTextAudioReviewQueue,
  rejectConceptTextAudio,
  undoConceptTextAudioReview,
} from '../api/conceptTextsApi'
import { AudioPlayerMini } from '../components/AudioPlayerMini'
import { ConceptTextsSubNav } from '../components/ConceptTextsSubNav'
import type {
  ConceptTextAudio,
  ConceptTextAudioReviewStatus,
} from '../types/conceptText.types'
import { canManageConceptTextAudio } from '../utils/conceptTextAudioPermissions'

const REVIEW_PAGE_SIZE = 25

type RejectDialogProps = {
  audio: ConceptTextAudio | null
  note: string
  saving: boolean
  onNoteChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

type MobileReviewCardProps = {
  audio: ConceptTextAudio
  isSaving: boolean
  canReview: boolean
  canApprove: boolean
  canReject: boolean
  onApprove: (audio: ConceptTextAudio) => void
  onReject: (audio: ConceptTextAudio) => void
  onUndo: (audio: ConceptTextAudio) => void
}

const statusLabels: Record<ConceptTextAudioReviewStatus, string> = {
  all: 'All statuses',
  draft: 'Draft',
  pending_review: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
}

function LoadingIcon() {
  return <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
}

function formatSubmittedTime(value?: string | null) {
  const timestamp = value ? new Date(value).getTime() : 0

  if (!timestamp || Number.isNaN(timestamp)) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function getConceptInitial(value?: string | null) {
  const firstLetter = value?.trim().match(/\p{L}/u)?.[0]
  return firstLetter ? firstLetter.toUpperCase() : '?'
}

function ReviewStatusPill({ status }: { status: ConceptTextAudio['status'] }) {
  const classes: Record<ConceptTextAudio['status'], string> = {
    draft: 'border-sand-200 bg-cream-100 text-cocoa-body/70',
    pending_review: 'border-gold-500/25 bg-gold-400/15 text-cocoa-700',
    approved: 'border-forest-accent/25 bg-forest-accent/10 text-forest-700',
    rejected: 'border-terracotta-500/20 bg-terracotta-400/10 text-terracotta-600',
    archived: 'border-sand-200 bg-sand-100/60 text-cocoa-body/60',
  }

  return (
    <span className={['inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', classes[status]].join(' ')}>
      {statusLabels[status]}
    </span>
  )
}

function RejectDialog({ audio, note, saving, onNoteChange, onCancel, onConfirm }: RejectDialogProps) {
  if (!audio) {
    return null
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-ink/35 p-4" role="presentation" onClick={onCancel}>
        <div
          className="w-full max-w-lg rounded-2xl border border-sand-200 bg-cream-50 p-6 shadow-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-audio-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="reject-audio-title" className="text-xl font-bold text-cocoa-800">
            Reject this recording?
          </h2>
          <p className="mt-3 text-sm leading-6 text-cocoa-body">
            Add a short note so the recorder knows what to fix before trying again.
          </p>

          <div className="mt-5 rounded-cta border border-sand-100 bg-white p-3">
            <p className="font-semibold text-cocoa-800">{audio.conceptText?.text ?? 'Concept text'}</p>
            <p className="mt-1 text-sm text-cocoa-body/70">
              {audio.conceptText?.concept?.title ?? 'Concept'} · {audio.conceptText?.language?.name ?? 'Language'}
            </p>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-forest-600">Review note</span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/40 focus:border-forest-accent focus:ring-2 focus:ring-forest-200"
              placeholder="Example: Please record this more slowly and clearly."
            />
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-cta border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/30 hover:bg-forest-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-cta bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(149,64,37,0.18)] transition hover:bg-terracotta-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
              {saving ? 'Rejecting...' : 'Reject audio'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

function MobileReviewCard({ audio, isSaving, canReview, canApprove, canReject, onApprove, onReject, onUndo }: MobileReviewCardProps) {
  const conceptText = audio.conceptText
  const title = conceptText?.concept?.title ?? 'Untitled concept'
  const submittedAt = audio.submittedAt ?? audio.createdAt
  const submittedTime = formatSubmittedTime(submittedAt)

  return (
    <article className="rounded-2xl border border-sand-100 bg-white/90 p-3.5 shadow-[0_10px_28px_rgba(47,26,16,0.07)] sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-start">
        <div className="min-w-0">
          <div className="rounded-2xl border border-forest-accent/20 bg-forest-accent/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/75">Text to review</p>
            <p className="mt-2 break-words text-2xl font-bold leading-tight text-cocoa-800">
              {conceptText?.text ?? 'No text available'}
            </p>
          </div>

          <div className="mt-3 flex min-w-0 gap-3">
            {conceptText?.concept?.image_url ? (
              <img
                src={resolveMediaUrl(conceptText.concept.image_url) ?? undefined}
                alt={conceptText.concept.image_alt_text || title}
                className="h-10 w-10 shrink-0 rounded-xl object-cover border border-sand-200"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-lg font-bold text-forest-700">
                {getConceptInitial(title)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-cocoa-800">{title}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-cocoa-body/70">
                <span className="inline-flex rounded-sm bg-terracotta-500 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-gold-400">
                  {conceptText?.language?.code?.slice(0, 2) ?? 'lg'}
                </span>
                <span>{conceptText?.language?.name ?? 'Unknown language'}</span>
                <span aria-hidden>·</span>
                <span className="uppercase">{conceptText?.language?.code ?? 'unknown'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:border-l sm:border-sand-100 sm:pl-4">
          <p className="flex items-start gap-2 text-sm text-cocoa-body/70">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-cocoa-body/65" aria-hidden />
            <span>
              <span className="block font-medium text-cocoa-body">{formatDate(submittedAt)}</span>
              {submittedTime ? <span className="text-xs">{submittedTime}</span> : null}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm font-medium text-cocoa-body/70">
            <UserRound className="h-4 w-4 shrink-0 text-cocoa-body/65" aria-hidden />
            Recorder {audio.recordedByUserId ? `#${audio.recordedByUserId}` : 'unknown'}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2 sm:ml-[3.25rem]">
        <ReviewStatusPill status={audio.status} />
        <AudioPlayerMini src={audio.audioUrl} durationSeconds={audio.durationSeconds} canReview={canReview} />
        <p className="flex items-center gap-2 text-xs font-medium text-cocoa-body/60">
          <Headphones className="h-4 w-4" aria-hidden />
          Tap to listen
        </p>
        {audio.reviewNote ? <p className="rounded-xl bg-cream-100 px-3 py-2 text-xs text-cocoa-body/70">{audio.reviewNote}</p> : null}
      </div>

      {audio.status === 'pending_review' ? (
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:ml-[3.25rem] sm:flex sm:justify-end">
          <button
            type="button"
            onClick={() => onApprove(audio)}
            disabled={!canReview || !canApprove || isSaving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-forest-accent px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(audio)}
            disabled={!canReview || !canReject || isSaving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-terracotta-500/35 bg-white px-3.5 py-2 text-sm font-semibold text-terracotta-600 transition hover:border-terracotta-500/55 hover:bg-terracotta-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-3 flex sm:ml-[3.25rem] sm:justify-end">
          <button
            type="button"
            onClick={() => onUndo(audio)}
            disabled={isSaving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-3.5 py-2 text-sm font-semibold text-cocoa-700 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Undo review
          </button>
        </div>
      )}
    </article>
  )
}

export function ConceptTextAudioReviewPage() {
  const [audios, setAudios] = useState<ConceptTextAudio[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [status, setStatus] = useState<ConceptTextAudioReviewStatus>('pending_review')
  const [languageId, setLanguageId] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(REVIEW_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingAudioId, setSavingAudioId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [rejectTarget, setRejectTarget] = useState<ConceptTextAudio | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const selectedLanguage = useMemo(
    () => languages.find((language) => language.id === languageId) ?? null,
    [languageId, languages],
  )

  const pendingOnPage = audios.filter((audio) => audio.status === 'pending_review').length
  const canReviewAudio = canManageConceptTextAudio('review')
  const canApproveAudio = canManageConceptTextAudio('approve')
  const canRejectAudio = canManageConceptTextAudio('reject')

  const loadLanguages = useCallback(async () => {
    try {
      const response = await getLanguages({ status: 'active', page: 1, pageSize: 100 })
      setLanguages(response.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load languages.')
    }
  }, [])

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getConceptTextAudioReviewQueue({
        status,
        languageId,
        page,
        pageSize,
      })
      setAudios(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the audio review queue.')
    } finally {
      setLoading(false)
    }
  }, [languageId, page, pageSize, status])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLanguages()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadLanguages])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadQueue])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  function handleStatusChange(nextStatus: ConceptTextAudioReviewStatus) {
    setPage(1)
    setStatus(nextStatus)
  }

  function handleLanguageChange(nextLanguageId: string) {
    setPage(1)
    setLanguageId(nextLanguageId)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
  }

  async function handleApprove(audio: ConceptTextAudio) {
    setSavingAudioId(audio.id)
    setError('')

    try {
      await approveConceptTextAudio(audio.id)
      setNotice('Audio approved and set as the current pronunciation.')
      await loadQueue()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to approve audio.')
    } finally {
      setSavingAudioId(null)
    }
  }

  function openRejectDialog(audio: ConceptTextAudio) {
    setRejectTarget(audio)
    setRejectNote('')
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) {
      return
    }

    setSavingAudioId(rejectTarget.id)
    setError('')

    try {
      await rejectConceptTextAudio(rejectTarget.id, rejectNote.trim())
      setNotice('Audio rejected. The note was saved for the recorder.')
      setRejectTarget(null)
      setRejectNote('')
      await loadQueue()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reject audio.')
    } finally {
      setSavingAudioId(null)
    }
  }

  async function handleUndoReview(audio: ConceptTextAudio) {
    const confirmed = window.confirm(
      'Are you sure you want to undo this review? This will return the recording to Pending review status and clear any existing review notes.'
    )
    if (!confirmed) {
      return
    }

    setSavingAudioId(audio.id)
    setError('')

    try {
      await undoConceptTextAudioReview(audio.id)
      setNotice('Review decision undone. Recording is back in Pending review status.')
      await loadQueue()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to undo review decision.')
    } finally {
      setSavingAudioId(null)
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concept Texts', 'Audio Review']}
        title="Audio Review"
        description="Listen to submitted pronunciations, approve clear recordings for lessons, or send gentle notes when a family word needs another take."
        action={
          <button
            type="button"
            onClick={() => void loadQueue()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white px-4 py-3 text-sm font-semibold text-forest-700 shadow-[0_8px_24px_rgba(31,90,61,0.1)] transition hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
            Refresh
          </button>
        }
      />

      <ConceptTextsSubNav />

      <Toast message={notice} type="success" onClose={() => setNotice('')} />
      <Toast message={error} type="error" onClose={() => setError('')} />

      <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Audio review summary">
        <StatsCard
          icon={loading ? <LoadingIcon /> : <Clock className="h-5 w-5" aria-hidden />}
          label={statusLabels[status]}
          value={total}
          description="Recordings matching the current review filter"
          variant="warm"
          dense={true}
          descriptionClassName="max-sm:hidden"
        />
        <StatsCard
          icon={<Search className="h-5 w-5" aria-hidden />}
          label="Pending on page"
          value={pendingOnPage}
          description="Items ready for approve or reject decisions"
          variant="green"
          dense={true}
          descriptionClassName="max-sm:hidden"
        />
        <StatsCard
          icon={<Check className="h-5 w-5" aria-hidden />}
          label="Language"
          value={selectedLanguage?.name ?? 'All'}
          description={selectedLanguage?.code ? selectedLanguage.code.toUpperCase() : 'Every active language'}
          dense={true}
          descriptionClassName="max-sm:hidden"
        />
      </section>

      <AdminFilterBar>
        <div className="flex flex-row items-end gap-2 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(14rem,0.7fr)_auto]">
          <label className="block flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-forest-600">Status</span>
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value as ConceptTextAudioReviewStatus)}
              className="mt-1 sm:mt-2 w-full rounded-xl border border-sand-200 bg-white px-2 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-accent focus:ring-2 focus:ring-forest-200"
            >
              <option value="pending_review">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>

          <label className="block flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-forest-600">Language</span>
            <select
              value={languageId}
              onChange={(event) => handleLanguageChange(event.target.value)}
              className="mt-1 sm:mt-2 w-full rounded-xl border border-sand-200 bg-white px-2 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-accent focus:ring-2 focus:ring-forest-200"
            >
              <option value="">All</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setPage(1)
              setStatus('pending_review')
              setLanguageId('')
            }}
            title="Reset filters"
            className="flex items-center justify-center rounded-xl border border-sand-200 bg-white p-2.5 sm:px-4 sm:py-3 text-sm font-semibold text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/40 focus:outline-none focus:ring-2 focus:ring-forest-200 h-[38px] sm:h-[46px]"
          >
            <span className="hidden sm:inline">Reset filters</span>
            <span className="sm:hidden"><X className="h-4 w-4" /></span>
          </button>
        </div>
      </AdminFilterBar>

      <AdminDataTable
        title="Submitted recordings"
        subtitle={`${total} recording${total === 1 ? '' : 's'}`}
        loading={loading}
        loadingLabel="Loading audio review queue..."
        isEmpty={audios.length === 0}
        emptyState={{
          title: 'No recordings need this review.',
          description: 'When recorders submit pronunciation audio, pending items will appear here for approval.',
        }}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: handlePageSizeChange,
        }}
      >
        <div className="space-y-4 bg-cream-50/35 p-3 lg:hidden">
          {audios.map((audio) => {
            const isSaving = savingAudioId === audio.id
            const canReview = canReviewAudio && audio.status === 'pending_review'

            return (
              <MobileReviewCard
                key={audio.id}
                audio={audio}
                isSaving={isSaving}
                canReview={canReview}
                canApprove={canApproveAudio}
                canReject={canRejectAudio}
                onApprove={(selectedAudio) => void handleApprove(selectedAudio)}
                onReject={openRejectDialog}
                onUndo={(selectedAudio) => void handleUndoReview(selectedAudio)}
              />
            )
          })}
        </div>

        <table className="hidden min-w-full divide-y divide-sand-100 text-left text-sm lg:table">
          <thead className="bg-forest-50/30 text-xs uppercase tracking-wide text-forest-700/75">
            <tr>
              <th className="px-5 py-4 font-semibold">Text to review</th>
              <th className="px-5 py-4 font-semibold">Concept</th>
              <th className="px-5 py-4 font-semibold">Language</th>
              <th className="px-5 py-4 font-semibold">Audio</th>
              <th className="px-5 py-4 font-semibold">Submitted</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100/80 bg-white/70">
            {audios.map((audio) => {
              const isSaving = savingAudioId === audio.id
              const conceptText = audio.conceptText
              const canReview = canReviewAudio && audio.status === 'pending_review'

              return (
                <tr key={audio.id} className="align-middle transition-all duration-200 hover:bg-forest-50/30">
                  <td className="max-w-lg px-5 py-4">
                    <p className="break-words text-xl font-bold leading-7 text-cocoa-800">{conceptText?.text ?? 'No text available'}</p>
                  </td>
                  <td className="max-w-xs px-5 py-4">
                    <div className="flex items-center gap-3">
                      {conceptText?.concept?.image_url ? (
                        <img
                          src={resolveMediaUrl(conceptText.concept.image_url) ?? undefined}
                          alt={conceptText.concept.image_alt_text || (conceptText?.concept?.title ?? 'Concept')}
                          className="h-10 w-10 shrink-0 rounded-xl object-cover border border-sand-200"
                        />
                      ) : null}
                      <p className="font-semibold text-cocoa-800">{conceptText?.concept?.title ?? 'Untitled concept'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-cocoa-800">{conceptText?.language?.name ?? 'Unknown language'}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cocoa-body/55">
                      {conceptText?.language?.code ?? 'unknown'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <ReviewStatusPill status={audio.status} />
                      <AudioPlayerMini src={audio.audioUrl} durationSeconds={audio.durationSeconds} canReview={canReview} />
                      {audio.reviewNote ? <p className="max-w-xs text-xs text-cocoa-body/65">{audio.reviewNote}</p> : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-cocoa-body">
                    <p>{formatDate(audio.submittedAt ?? audio.createdAt)}</p>
                    <p className="mt-1 text-xs text-cocoa-body/55">
                      Recorder {audio.recordedByUserId ? `#${audio.recordedByUserId}` : 'unknown'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {audio.status === 'pending_review' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleApprove(audio)}
                            disabled={!canReview || !canApproveAudio || isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-forest-accent px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectDialog(audio)}
                            disabled={!canReview || !canRejectAudio || isSaving}
                            className="inline-flex items-center gap-2 rounded-lg border border-terracotta-500/25 bg-white px-3 py-2 text-sm font-semibold text-terracotta-600 transition hover:border-terracotta-500/45 hover:bg-terracotta-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-4 w-4" aria-hidden />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleUndoReview(audio)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-semibold text-cocoa-700 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden />
                          Undo review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </AdminDataTable>

      <RejectDialog
        audio={rejectTarget}
        note={rejectNote}
        saving={savingAudioId === rejectTarget?.id}
        onNoteChange={setRejectNote}
        onCancel={() => {
          if (!savingAudioId) {
            setRejectTarget(null)
            setRejectNote('')
          }
        }}
        onConfirm={() => void handleRejectConfirm()}
      />
    </div>
  )
}
