import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Languages, Loader2, RefreshCw, Search } from 'lucide-react'

import { AdminDataTable } from '../../../components/admin/AdminDataTable'
import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { formatDate } from '../../../lib/date'
import { getLanguages } from '../../languages/api/languagesApi'
import type { Language } from '../../languages/types/language.types'
import { getConceptTextReviewQueue, updateConceptText } from '../api/conceptTextsApi'
import { ConceptTextReviewActions } from '../components/ConceptTextReviewActions'
import { ConceptTextReviewBadge } from '../components/ConceptTextReviewBadge'
import { ConceptTextReviewMobileCard } from '../components/ConceptTextReviewMobileCard'
import { ConceptTextReviewReferenceTexts } from '../components/ConceptTextReviewReferenceTexts'
import { ConceptTextsSubNav } from '../components/ConceptTextsSubNav'
import type {
  ConceptTextReviewQueueItem,
  ConceptTextReviewQueueReviewStatus,
  ConceptTextReviewStatus,
} from '../types/conceptText.types'
import { conceptTextReviewStatusLabel } from '../utils/conceptTextLabels'

const REVIEW_PAGE_SIZE = 25

const reviewStatusLabels: Record<ConceptTextReviewQueueReviewStatus, string> = {
  all: 'All statuses',
  draft: 'Draft',
  needs_review: 'Needs review',
  approved: 'Approved',
  rejected: 'Rejected',
}

function LoadingIcon() {
  return <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
}

export function ConceptTextReviewPage() {
  const [conceptTexts, setConceptTexts] = useState<ConceptTextReviewQueueItem[]>([])
  const [localLanguages, setLocalLanguages] = useState<Language[]>([])
  const [reviewStatus, setReviewStatus] = useState<ConceptTextReviewQueueReviewStatus>('needs_review')
  const [languageId, setLanguageId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(REVIEW_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingTextId, setSavingTextId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selectedLanguage = useMemo(
    () => localLanguages.find((language) => language.id === languageId) ?? null,
    [languageId, localLanguages],
  )

  const pendingOnPage = useMemo(
    () => conceptTexts.filter((conceptText) => conceptText.reviewStatus === 'needs_review').length,
    [conceptTexts],
  )

  const loadLanguages = useCallback(async () => {
    try {
      const response = await getLanguages({ status: 'active', page: 1, pageSize: 100 })
      setLocalLanguages(response.data.filter((language) => language.requiresConceptTextReview))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load languages.')
    }
  }, [])

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getConceptTextReviewQueue({
        reviewStatus,
        languageId,
        search,
        page,
        pageSize,
      })
      setConceptTexts(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the text review queue.')
    } finally {
      setLoading(false)
    }
  }, [languageId, page, pageSize, reviewStatus, search])

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

  function handleReviewStatusChange(nextReviewStatus: ConceptTextReviewQueueReviewStatus) {
    setPage(1)
    setReviewStatus(nextReviewStatus)
  }

  function handleLanguageChange(nextLanguageId: string) {
    setPage(1)
    setLanguageId(nextLanguageId)
  }

  function handleSearchChange(nextSearch: string) {
    setPage(1)
    setSearch(nextSearch)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
  }

  function resetFilters() {
    setPage(1)
    setReviewStatus('needs_review')
    setLanguageId('')
    setSearch('')
  }

  async function handleQuickReview(conceptText: ConceptTextReviewQueueItem, nextReviewStatus: ConceptTextReviewStatus) {
    setSavingTextId(conceptText.id)
    setError('')

    try {
      await updateConceptText(conceptText.id, { reviewStatus: nextReviewStatus })
      setNotice(nextReviewStatus === 'approved' ? 'Heritage text approved.' : 'Heritage text rejected.')
      await loadQueue()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update review status.')
    } finally {
      setSavingTextId(null)
    }
  }

  const emptyDescription =
    reviewStatus === 'needs_review' && !search && !languageId
      ? 'When local-language translations are submitted for review, they will appear here for approval.'
      : 'Try another review status, language, or search term.'

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concept Texts', 'Text Review']}
        title="Text Review"
        description="Check heritage translations for family-ready accuracy before concepts move toward lessons and publishing."
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

      <section className="grid gap-4 md:grid-cols-3" aria-label="Text review summary">
        <StatsCard
          icon={loading ? <LoadingIcon /> : <Clock className="h-5 w-5" aria-hidden />}
          label={reviewStatusLabels[reviewStatus]}
          value={total}
          description="Heritage phrases matching the current review filter"
          variant="warm"
        />
        <StatsCard
          icon={<Search className="h-5 w-5" aria-hidden />}
          label="Pending on page"
          value={pendingOnPage}
          description="Items still marked needs review on this page"
          variant="green"
        />
        <StatsCard
          icon={<Languages className="h-5 w-5" aria-hidden />}
          label="Language"
          value={selectedLanguage?.name ?? 'All local'}
          description={
            selectedLanguage?.code
              ? selectedLanguage.code.toUpperCase()
              : localLanguages.map((language) => language.name).join(', ') || 'Heritage languages with review required'
          }
        />
      </section>

      <AdminFilterBar>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(14rem,0.7fr)_minmax(14rem,0.7fr)_minmax(16rem,1fr)_auto] xl:items-end">
          <label className="block">
            <span className="text-sm font-medium text-forest-600">Review status</span>
            <select
              value={reviewStatus}
              onChange={(event) => handleReviewStatusChange(event.target.value as ConceptTextReviewQueueReviewStatus)}
              className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-accent focus:ring-2 focus:ring-forest-200"
            >
              <option value="needs_review">{conceptTextReviewStatusLabel('needs_review')}</option>
              <option value="draft">{conceptTextReviewStatusLabel('draft')}</option>
              <option value="approved">{conceptTextReviewStatusLabel('approved')}</option>
              <option value="rejected">{conceptTextReviewStatusLabel('rejected')}</option>
              <option value="all">{reviewStatusLabels.all}</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-forest-600">Local language</span>
            <select
              value={languageId}
              onChange={(event) => handleLanguageChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-accent focus:ring-2 focus:ring-forest-200"
            >
              <option value="">All local languages</option>
              {localLanguages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-forest-600">Search</span>
            <input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Concept, phrase, or language"
              className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-cocoa-800 outline-none transition placeholder:font-normal placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-accent focus:ring-2 focus:ring-forest-200"
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/40 focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            Reset filters
          </button>
        </div>
      </AdminFilterBar>

      <AdminDataTable
        title="Heritage translations"
        subtitle={`${total} phrase${total === 1 ? '' : 's'}`}
        loading={loading}
        loadingLabel="Loading text review queue..."
        scrollMaxHeight="32rem"
        isEmpty={!loading && conceptTexts.length === 0}
        emptyState={{
          title: 'No heritage text matches this review filter.',
          description: emptyDescription,
          action: (
            <Link
              to="/admin/content/concept-texts"
              className="inline-flex items-center justify-center rounded-xl bg-forest-accent px-4 py-3 text-sm font-semibold text-white shadow-button transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              Open Concept Texts
            </Link>
          ),
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
          {conceptTexts.map((conceptText) => (
            <ConceptTextReviewMobileCard
              key={conceptText.id}
              conceptText={conceptText}
              saving={savingTextId === conceptText.id}
              onApprove={() => void handleQuickReview(conceptText, 'approved')}
              onReject={() => void handleQuickReview(conceptText, 'rejected')}
            />
          ))}
        </div>

        <table className="hidden min-w-full divide-y divide-sand-100 text-left text-sm lg:table">
          <thead className="bg-forest-50/30 text-xs uppercase tracking-wide text-forest-700/75">
            <tr>
              <th className="px-5 py-4 font-semibold">Text to review</th>
              <th className="px-5 py-4 font-semibold">Concept</th>
              <th className="px-5 py-4 font-semibold">Language</th>
              <th className="px-5 py-4 font-semibold">Reference</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Updated</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100/80 bg-white/70">
            {conceptTexts.map((conceptText) => (
              <tr key={conceptText.id} className="align-top transition-all duration-200 hover:bg-forest-50/30">
                <td className="max-w-lg px-5 py-4">
                  <p className="break-words text-xl font-bold leading-7 text-cocoa-800">{conceptText.text}</p>
                </td>
                <td className="max-w-xs px-5 py-4">
                  <p className="font-semibold text-cocoa-800">{conceptText.concept?.title ?? 'Untitled concept'}</p>
                  {conceptText.concept?.key ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cocoa-body/55">
                      {conceptText.concept.key}
                    </p>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-cocoa-800">{conceptText.language?.name ?? 'Unknown language'}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cocoa-body/55">
                    {conceptText.language?.code ?? 'unknown'}
                  </p>
                </td>
                <td className="max-w-xs px-5 py-4">
                  <ConceptTextReviewReferenceTexts references={conceptText.referenceTexts} />
                </td>
                <td className="px-5 py-4">
                  <ConceptTextReviewBadge reviewStatus={conceptText.reviewStatus} />
                </td>
                <td className="px-5 py-4 text-cocoa-body">{formatDate(conceptText.updatedAt)}</td>
                <td className="px-5 py-4 text-right">
                  <ConceptTextReviewActions
                    conceptText={conceptText}
                    saving={savingTextId === conceptText.id}
                    onApprove={() => void handleQuickReview(conceptText, 'approved')}
                    onReject={() => void handleQuickReview(conceptText, 'rejected')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </div>
  )
}
