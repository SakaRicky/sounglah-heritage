import { useEffect, useMemo, useState } from 'react'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { getConceptCompletion, getConceptCompletionSummary } from '../api/conceptsApi'
import type { ConceptCompletionRow, ConceptCompletionSummary } from '../types/concept.types'

const initialSummary: ConceptCompletionSummary = {
  totalConcepts: 0,
  needsTranslation: 0,
  hasRejectedText: 0,
  draft: 0,
  needsReview: 0,
  complete: 0,
  published: 0,
}

function CompletionIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16M4 12h10M4 17.5h7M17 14l2 2 4-5" />
    </svg>
  )
}

function ReviewIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5h8l3 3v11H5V5h3zM16 5v4h3M8 13h8M8 17h5" />
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

function EmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-sand-300 bg-cream-50/70 p-8 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700 ring-1 ring-forest-accent/10">
        <CompletionIcon />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-cocoa-800">No concepts to check yet</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-cocoa-body">
        Add concepts and their English, French, and Médumba texts first. This page will then show what is ready for
        children and families to use in lessons.
      </p>
    </section>
  )
}

function LoadingState() {
  return (
    <section className="rounded-2xl border border-sand-200 bg-cream-50/80 p-8 shadow-soft" aria-live="polite">
      <div className="space-y-4">
        <div className="h-5 w-48 animate-pulse rounded-full bg-sand-100" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded-full bg-sand-100" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-sand-100" />
      </div>
    </section>
  )
}

export function ConceptCompletionPage() {
  const [rows, setRows] = useState<ConceptCompletionRow[]>([])
  const [summary, setSummary] = useState<ConceptCompletionSummary>(initialSummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadCompletion() {
      try {
        const [listResponse, summaryResponse] = await Promise.all([
          getConceptCompletion({ page: 1, pageSize: 20 }),
          getConceptCompletionSummary(),
        ])

        if (!isMounted) {
          return
        }

        setRows(listResponse.data)
        setSummary(summaryResponse.data)
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load concept completion.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadCompletion()

    return () => {
      isMounted = false
    }
  }, [])

  const readyCount = summary.complete + summary.published
  const blockedCount = useMemo(
    () => summary.needsTranslation + summary.hasRejectedText + summary.draft + summary.needsReview,
    [summary],
  )
  const previewRows = rows.slice(0, 5)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concept Completion']}
        title="Concept Completion"
        description="See which concepts have the required family-language texts ready for lessons, and which ones still need translation or review before children use them."
      />

      {error ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Concept completion summary">
        <StatsCard
          icon={<CompletionIcon />}
          label="Total Concepts"
          value={summary.totalConcepts}
          description="Checked for required texts"
          variant="green"
        />
        <StatsCard icon={<ReviewIcon />} label="Need Attention" value={blockedCount} description="Missing or not approved" />
        <StatsCard icon={<PublishIcon />} label="Ready or Published" value={readyCount} description="Approved in every required language" variant="warm" />
      </section>

      {loading ? <LoadingState /> : null}

      {!loading && !error && rows.length === 0 ? <EmptyState /> : null}

      {!loading && !error && rows.length > 0 ? (
        <section className="rounded-2xl border border-sand-200 bg-cream-50/85 p-6 shadow-soft">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-cocoa-800">Workflow Preview</h2>
              <p className="mt-1 text-sm text-cocoa-body">
                Loaded the first {previewRows.length} of {summary.totalConcepts} concepts. Filters, full table, and
                mobile cards follow in the next slice.
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-sand-200/70 overflow-hidden rounded-xl border border-sand-200 bg-white/65">
            {previewRows.map((row) => (
              <article key={row.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-cocoa-800">{row.title}</h3>
                  <p className="mt-1 text-sm text-cocoa-body">
                    {row.missingLanguages.length > 0
                      ? `Missing: ${row.missingLanguages.join(', ')}`
                      : row.rejectedLanguages.length > 0
                        ? `Rejected: ${row.rejectedLanguages.join(', ')}`
                        : row.needsReviewLanguages.length > 0
                          ? `Needs review: ${row.needsReviewLanguages.join(', ')}`
                          : row.draftLanguages.length > 0
                            ? `Draft: ${row.draftLanguages.join(', ')}`
                            : 'Required texts are approved.'}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-700">
                  {row.completionStatus.replace(/_/g, ' ')}
                </span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
