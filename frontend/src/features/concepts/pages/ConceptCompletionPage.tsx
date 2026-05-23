import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { getLanguages } from '../../languages/api/languagesApi'
import type { Language } from '../../languages/types/language.types'
import { updateConceptText } from '../../conceptTexts/api/conceptTextsApi'
import { ConceptTextBulkReviewBar } from '../../conceptTexts/components/ConceptTextBulkReviewBar'
import type { ConceptTextReviewStatus } from '../../conceptTexts/types/conceptText.types'
import {
  bulkUpdateConceptTextReviewStatus,
} from '../../conceptTexts/utils/conceptTextReviewActions'
import { getConceptCompletion, getConceptCompletionSummary, publishConcept } from '../api/conceptsApi'
import { ConceptCompletionFilters } from '../components/ConceptCompletionFilters'
import { ConceptCompletionTable } from '../components/ConceptCompletionTable'
import { ConceptsSubNav } from '../components/ConceptsSubNav'
import {
  countReviewableCompletionTexts,
  reviewableTextIdsFromCompletionRows,
} from '../utils/conceptCompletionReviewActions'
import type {
  ConceptCompletionRow,
  ConceptCompletionStatus,
  ConceptCompletionSummary,
} from '../types/concept.types'

const initialSummary: ConceptCompletionSummary = {
  totalConcepts: 0,
  needsTranslation: 0,
  hasRejectedText: 0,
  draft: 0,
  needsReview: 0,
  needsAudio: 0,
  complete: 0,
  published: 0,
}

function AlertIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.5h3.4L20 18.5H4L10.3 4.5z" />
    </svg>
  )
}

function RejectIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function DraftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l4 4v12H8V4zm8 0v4h4M8 13h8M8 17h5" />
    </svg>
  )
}

function ReviewIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AudioIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9v6h3l4 3V6l-4 3H7zM17 9.5a4 4 0 010 5M19.5 7a7.5 7.5 0 010 10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2 2 4-5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PublishIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l7.5 4.25v5.75c0 4-3.1 6.4-7.5 7.5-4.4-1.1-7.5-3.5-7.5-7.5V8L12 3.75zM9 12.25l2 2 4-4.5" />
    </svg>
  )
}

type SummaryCardConfig = {
  label: string
  value: number
  description: string
  icon: ReactNode
  variant?: 'default' | 'green' | 'warm'
  cardClassName?: string
  iconClassName?: string
}

function SummaryCardsGrid({
  summary,
  activeStatus,
  onStatusSelect,
}: {
  summary: ConceptCompletionSummary
  activeStatus: ConceptCompletionStatus | 'all'
  onStatusSelect: (status: ConceptCompletionStatus | 'all') => void
}) {
  const cards: (SummaryCardConfig & { status: ConceptCompletionStatus })[] = [
    {
      status: 'needs_translation',
      label: 'Needs translation',
      value: summary.needsTranslation,
      description: 'Missing required language text',
      icon: <AlertIcon />,
      cardClassName: 'from-terracotta-400/10 via-cream-50 to-white/95 border-terracotta-500/15',
      iconClassName: 'border-terracotta-500/20 bg-terracotta-400/10 text-terracotta-600',
    },
    {
      status: 'has_rejected_text',
      label: 'Has rejected text',
      value: summary.hasRejectedText,
      description: 'Required text was rejected',
      icon: <RejectIcon />,
      cardClassName: 'from-terracotta-400/10 via-cream-50 to-white/95 border-terracotta-500/15',
      iconClassName: 'border-terracotta-500/20 bg-terracotta-400/10 text-terracotta-600',
    },
    {
      status: 'draft',
      label: 'Draft',
      value: summary.draft,
      description: 'Required text still in draft',
      icon: <DraftIcon />,
    },
    {
      status: 'needs_review',
      label: 'Needs review',
      value: summary.needsReview,
      description: 'Waiting for text approval',
      icon: <ReviewIcon />,
      variant: 'warm',
    },
    {
      status: 'needs_audio',
      label: 'Needs audio',
      value: summary.needsAudio,
      description: 'Needs approved heritage audio',
      icon: <AudioIcon />,
      variant: 'warm',
    },
    {
      status: 'complete',
      label: 'Complete',
      value: summary.complete,
      description: 'Texts and audio are ready',
      icon: <CheckIcon />,
      variant: 'green',
    },
    {
      status: 'published',
      label: 'Published',
      value: summary.published,
      description: 'Ready for learners',
      icon: <PublishIcon />,
      variant: 'green',
    },
  ]

  return (
    <section
      className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4"
      aria-label="Concept completion summary"
    >
      {cards.map((card, index) => {
        const isActive = activeStatus === card.status
        const isLastOddMobile = index === cards.length - 1 && cards.length % 2 === 1

        return (
          <button
            key={card.status}
            type="button"
            onClick={() => onStatusSelect(isActive ? 'all' : card.status)}
            className={[
              'flex h-full w-full min-w-0 rounded-2xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-200',
              isActive ? 'ring-2 ring-forest-accent/35 scale-[0.98]' : 'sm:hover:scale-[1.01]',
              isLastOddMobile ? 'max-sm:col-span-2' : '',
            ].join(' ')}
          >
            <StatsCard
              dense
              icon={card.icon}
              label={card.label}
              value={card.value}
              description={card.description}
              descriptionClassName="hidden sm:block"
              variant={card.variant}
              cardClassName={[
                card.cardClassName,
                'h-full w-full',
              ]
                .filter(Boolean)
                .join(' ')}
              iconClassName={card.iconClassName}
            />
          </button>
        )
      })}
    </section>
  )
}

export function ConceptCompletionPage() {
  const [rows, setRows] = useState<ConceptCompletionRow[]>([])
  const [summary, setSummary] = useState<ConceptCompletionSummary>(initialSummary)
  const [requiredLanguages, setRequiredLanguages] = useState<Language[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ConceptCompletionStatus | 'all'>('all')
  const [language, setLanguage] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [showTextPreviews, setShowTextPreviews] = useState(false)
  const [reviewingTextId, setReviewingTextId] = useState<string | null>(null)
  const [bulkReviewing, setBulkReviewing] = useState(false)
  const [publishingConceptId, setPublishingConceptId] = useState<string | null>(null)
  const [selectedConceptIds, setSelectedConceptIds] = useState<Set<string>>(() => new Set())
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    let isMounted = true

    async function loadRequiredLanguages() {
      try {
        const response = await getLanguages({ status: 'active', pageSize: 100 })
        if (!isMounted) {
          return
        }

        setRequiredLanguages(
          response.data
            .filter((item) => item.isRequiredForConceptCompletion)
            .sort((first, second) => first.sortOrder - second.sortOrder || first.name.localeCompare(second.name)),
        )
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load required languages.')
        }
      }
    }

    void loadRequiredLanguages()

    return () => {
      isMounted = false
    }
  }, [])

  const loadCompletion = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [listResponse, summaryResponse] = await Promise.all([
        getConceptCompletion({
          search,
          status,
          language,
          page,
          pageSize,
        }),
        getConceptCompletionSummary(),
      ])

      setRows(listResponse.data)
      setTotal(listResponse.meta.total)
      setSummary(summaryResponse.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load concept completion.')
    } finally {
      setLoading(false)
    }
  }, [language, page, pageSize, search, status])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCompletion()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadCompletion])

  const requiredLanguageColumns = useMemo(
    () =>
      requiredLanguages.map((languageItem) => ({
        languageId: languageItem.id,
        languageCode: languageItem.code,
        languageName: languageItem.name,
        requiresConceptTextReview: languageItem.requiresConceptTextReview,
      })),
    [requiredLanguages],
  )

  const reviewableCounts = useMemo(
    () => countReviewableCompletionTexts(rows, selectedConceptIds),
    [rows, selectedConceptIds],
  )

  const filtered = Boolean(search || status !== 'all' || language)

  function resetPageAndSetSearch(value: string) {
    setPage(1)
    setSearch(value)
    setSelectedConceptIds(new Set())
  }

  function resetPageAndSetStatus(value: ConceptCompletionStatus | 'all') {
    setPage(1)
    setStatus(value)
    setSelectedConceptIds(new Set())
  }

  function resetPageAndSetLanguage(value: string) {
    setPage(1)
    setLanguage(value)
    setSelectedConceptIds(new Set())
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    setSelectedConceptIds(new Set())
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
    setSelectedConceptIds(new Set())
  }

  function clearFilters() {
    setPage(1)
    setSearch('')
    setStatus('all')
    setLanguage('')
    setSelectedConceptIds(new Set())
  }

  async function handleBulkReview(reviewStatus: ConceptTextReviewStatus) {
    const action = reviewStatus === 'approved' ? 'approve' : 'reject'
    const ids = reviewableTextIdsFromCompletionRows(rows, action, selectedConceptIds)

    if (ids.length === 0) {
      return
    }

    setBulkReviewing(true)
    setError('')
    setNotice('')

    try {
      const result = await bulkUpdateConceptTextReviewStatus(ids, reviewStatus)
      const actionLabel = reviewStatus === 'approved' ? 'approved' : 'rejected'

      if (result.failed > 0) {
        setError(`${result.failed} of ${ids.length} concept texts could not be ${actionLabel}.`)
      }

      if (result.updated > 0) {
        setNotice(`${result.updated} concept text${result.updated === 1 ? '' : 's'} ${actionLabel}.`)
      }

      setSelectedConceptIds(new Set())
      await loadCompletion()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to bulk update review status.')
    } finally {
      setBulkReviewing(false)
    }
  }

  function toggleConceptSelected(conceptId: string) {
    setSelectedConceptIds((current) => {
      const next = new Set(current)
      if (next.has(conceptId)) {
        next.delete(conceptId)
      } else {
        next.add(conceptId)
      }
      return next
    })
  }

  function toggleSelectAllConcepts() {
    setSelectedConceptIds((current) => {
      const allSelected = rows.length > 0 && rows.every((row) => current.has(row.id))
      return allSelected ? new Set() : new Set(rows.map((row) => row.id))
    })
  }

  async function handleQuickReview(textId: string, reviewStatus: ConceptTextReviewStatus) {
    setReviewingTextId(textId)
    setError('')
    setNotice('')

    try {
      await updateConceptText(textId, { reviewStatus })
      setNotice(reviewStatus === 'approved' ? 'Concept text approved.' : 'Concept text rejected.')
      await loadCompletion()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update review status.')
    } finally {
      setReviewingTextId(null)
    }
  }

  async function handlePublish(conceptId: string) {
    setPublishingConceptId(conceptId)
    setError('')
    setNotice('')

    try {
      await publishConcept(conceptId)
      setNotice('Concept published.')
      await loadCompletion()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to publish concept.')
    } finally {
      setPublishingConceptId(null)
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concepts', 'Completion']}
        title="Concept Completion"
        description="Review concept translation status and publish when ready."
      />

      <ConceptsSubNav />

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

      <SummaryCardsGrid summary={summary} activeStatus={status} onStatusSelect={resetPageAndSetStatus} />

      <ConceptCompletionFilters
        search={search}
        status={status}
        language={language}
        requiredLanguages={requiredLanguages}
        viewMode={viewMode}
        onSearchChange={resetPageAndSetSearch}
        onStatusChange={resetPageAndSetStatus}
        onLanguageChange={resetPageAndSetLanguage}
        onClearFilters={clearFilters}
        onViewModeChange={setViewMode}
        showTextPreviews={showTextPreviews}
        onShowTextPreviewsChange={setShowTextPreviews}
      />

      <ConceptTextBulkReviewBar
        approveCount={reviewableCounts.approveCount}
        rejectCount={reviewableCounts.rejectCount}
        selectedCount={selectedConceptIds.size}
        busy={bulkReviewing || Boolean(reviewingTextId)}
        onApprove={() => void handleBulkReview('approved')}
        onReject={() => void handleBulkReview('rejected')}
        onClearSelection={() => setSelectedConceptIds(new Set())}
      />

      <ConceptCompletionTable
        rows={rows}
        requiredLanguages={requiredLanguageColumns}
        loading={loading}
        total={total}
        filtered={filtered}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showTextPreviews={showTextPreviews}
        reviewingTextId={reviewingTextId}
        onReviewStatusChange={handleQuickReview}
        selectedConceptIds={selectedConceptIds}
        onToggleConceptSelected={toggleConceptSelected}
        onToggleSelectAllConcepts={toggleSelectAllConcepts}
        publishingConceptId={publishingConceptId}
        onPublish={handlePublish}
        viewMode={viewMode}
      />
    </div>
  )
}
