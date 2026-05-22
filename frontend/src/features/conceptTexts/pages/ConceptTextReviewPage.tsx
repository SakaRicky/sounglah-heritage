import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Languages, Loader2, RefreshCw, Search } from 'lucide-react'

import { AdminDataTable } from '../../../components/admin/AdminDataTable'
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { getLanguages } from '../../languages/api/languagesApi'
import type { Language } from '../../languages/types/language.types'
import { getConceptTextReviewQueue } from '../api/conceptTextsApi'
import type { ConceptTextReviewQueueItem } from '../types/conceptText.types'
import { conceptTextReviewStatusLabel } from '../utils/conceptTextLabels'

const REVIEW_PAGE_SIZE = 25

function LoadingIcon() {
  return <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
}

export function ConceptTextReviewPage() {
  const [conceptTexts, setConceptTexts] = useState<ConceptTextReviewQueueItem[]>([])
  const [localLanguages, setLocalLanguages] = useState<Language[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        reviewStatus: 'needs_review',
        page: 1,
        pageSize: REVIEW_PAGE_SIZE,
      })
      setConceptTexts(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the text review queue.')
    } finally {
      setLoading(false)
    }
  }, [])

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

      {error ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Text review summary">
        <StatsCard
          icon={loading ? <LoadingIcon /> : <Clock className="h-5 w-5" aria-hidden />}
          label="Needs review"
          value={total}
          description="Local-language phrases waiting for a decision"
          variant="warm"
        />
        <StatsCard
          icon={<Search className="h-5 w-5" aria-hidden />}
          label="Pending on page"
          value={pendingOnPage}
          description="Items ready for approve or reject on this page"
          variant="green"
        />
        <StatsCard
          icon={<Languages className="h-5 w-5" aria-hidden />}
          label="Local languages"
          value={localLanguages.length}
          description={
            localLanguages.length > 0
              ? localLanguages.map((language) => language.name).join(', ')
              : 'Heritage languages with review required'
          }
        />
      </section>

      <AdminDataTable
        title="Heritage translations"
        subtitle={loading ? undefined : `${total} phrase${total === 1 ? '' : 's'}`}
        loading={loading}
        loadingLabel="Loading text review queue..."
        isEmpty={!loading && conceptTexts.length === 0}
        emptyState={{
          title: 'No heritage text needs review right now.',
          description: 'When local-language translations are submitted for review, they will appear here for approval.',
          action: (
            <Link
              to="/admin/content/concept-texts"
              className="inline-flex items-center justify-center rounded-xl bg-forest-accent px-4 py-3 text-sm font-semibold text-white shadow-button transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              Open Concept Texts
            </Link>
          ),
        }}
      >
        <div className="space-y-4 bg-cream-50/35 p-4">
          {conceptTexts.map((conceptText) => (
            <article
              key={conceptText.id}
              className="rounded-2xl border border-sand-200 bg-white/90 p-5 shadow-soft"
            >
              <p className="break-words text-xl font-bold leading-7 text-cocoa-800">{conceptText.text}</p>
              <p className="mt-2 text-sm font-semibold text-cocoa-800">
                {conceptText.concept?.title ?? 'Untitled concept'}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cocoa-body/60">
                {conceptText.language?.name ?? 'Unknown language'} ·{' '}
                {conceptTextReviewStatusLabel(conceptText.reviewStatus)}
              </p>
              {conceptText.referenceTexts && conceptText.referenceTexts.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-cocoa-body/75">
                  {conceptText.referenceTexts.map((reference) => (
                    <li key={reference.languageCode}>
                      <span className="font-semibold uppercase text-forest-700/80">{reference.languageCode}</span>:{' '}
                      {reference.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </AdminDataTable>
    </div>
  )
}
