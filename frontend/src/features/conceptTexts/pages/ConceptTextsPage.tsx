import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Plus } from 'lucide-react'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { InsightCard } from '../../../components/admin/InsightCard'
import { StatsCard } from '../../../components/admin/StatsCard'
import { ApiError } from '../../../lib/api'
import { getConcepts } from '../../concepts/api/conceptsApi'
import type { Concept } from '../../concepts/types/concept.types'
import { getLanguages } from '../../languages/api/languagesApi'
import type { Language } from '../../languages/types/language.types'
import {
  createConceptText,
  getConceptTexts,
  updateConceptText,
  updateConceptTextStatus,
  uploadConceptTextAudio,
} from '../api/conceptTextsApi'
import { ConceptTextFilters } from '../components/ConceptTextFilters'
import type { ConceptTextSort } from '../components/ConceptTextFilters'
import { ConceptTextForm } from '../components/ConceptTextForm'
import { ConceptTextTable } from '../components/ConceptTextTable'
import { DisableConceptTextDialog } from '../components/DisableConceptTextDialog'
import type {
  ConceptText,
  ConceptTextReviewStatus,
  ConceptTextStatus,
  CreateConceptTextPayload,
  UpdateConceptTextPayload,
} from '../types/conceptText.types'
import { canRecordConceptTextAudio } from '../utils/conceptTextAudioPermissions'

type FormMode = {
  conceptText: ConceptText | null
} | null

function TranslateIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h8M8 5v14M5 9h6M13 19l4-10 4 10M14.5 15h5" />
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

function ReviewIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h8M8 15h5M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
  )
}

export function AdminConceptTextsPage() {
  const [conceptTexts, setConceptTexts] = useState<ConceptText[]>([])
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [conceptSearch, setConceptSearch] = useState('')
  const [conceptId, setConceptId] = useState('')
  const [languageId, setLanguageId] = useState('')
  const [status, setStatus] = useState<ConceptTextStatus | 'all'>('all')
  const [reviewStatus, setReviewStatus] = useState<ConceptTextReviewStatus | 'all'>('all')
  const [sort, setSort] = useState<ConceptTextSort>('updated')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [statusTarget, setStatusTarget] = useState<ConceptText | null>(null)

  const loadReferenceData = useCallback(async () => {
    try {
      const [conceptResponse, languageResponse] = await Promise.all([
        getConcepts({ search: conceptSearch, status: 'active', sort: 'title', page: 1, pageSize: 100 }),
        getLanguages({ status: 'active', page: 1, pageSize: 100 }),
      ])
      setConcepts(conceptResponse.data)
      setLanguages(languageResponse.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load concepts and languages.')
    }
  }, [conceptSearch])

  const loadConceptTexts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getConceptTexts({
        search,
        conceptId,
        languageId,
        status,
        reviewStatus,
        sort,
        page,
        pageSize,
      })
      setConceptTexts(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load concept texts.')
    } finally {
      setLoading(false)
    }
  }, [conceptId, languageId, page, pageSize, reviewStatus, search, sort, status])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReferenceData()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadReferenceData])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConceptTexts()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadConceptTexts])

  const activeCount = conceptTexts.filter((conceptText) => conceptText.status === 'active').length
  const approvedCount = conceptTexts.filter((conceptText) => conceptText.reviewStatus === 'approved').length
  const needsReviewCount = conceptTexts.filter((conceptText) => conceptText.reviewStatus === 'needs_review').length
  const languageCounts = useMemo(() => {
    const counts = new Map<string, number>()
    conceptTexts.forEach((conceptText) => {
      const languageName = conceptText.language?.name ?? 'Unknown'
      counts.set(languageName, (counts.get(languageName) ?? 0) + 1)
    })

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
      .slice(0, 5)
  }, [conceptTexts])
  const filtered = Boolean(search || conceptId || languageId || status !== 'all' || reviewStatus !== 'all')

  function resetPageAndSetSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function resetPageAndSetConceptId(value: string) {
    setPage(1)
    setConceptId(value)
  }

  function resetPageAndSetLanguageId(value: string) {
    setPage(1)
    setLanguageId(value)
  }

  function resetPageAndSetStatus(value: ConceptTextStatus | 'all') {
    setPage(1)
    setStatus(value)
  }

  function resetPageAndSetReviewStatus(value: ConceptTextReviewStatus | 'all') {
    setPage(1)
    setReviewStatus(value)
  }

  function resetPageAndSetSort(value: ConceptTextSort) {
    setPage(1)
    setSort(value)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
  }

  function openCreateForm() {
    setFieldErrors({})
    setFormMode({ conceptText: null })
  }

  function openEditForm(conceptText: ConceptText) {
    setFieldErrors({})
    setFormMode({ conceptText })
  }

  async function handleFormSubmit(payload: CreateConceptTextPayload | UpdateConceptTextPayload) {
    setSaving(true)
    setFieldErrors({})
    setError('')

    try {
      if (formMode?.conceptText) {
        await updateConceptText(formMode.conceptText.id, payload as UpdateConceptTextPayload)
        setNotice('Concept text updated.')
      } else {
        await createConceptText(payload as CreateConceptTextPayload)
        setNotice('Concept text created.')
      }

      setFormMode(null)
      await loadConceptTexts()
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.fields) {
        setFieldErrors(requestError.fields)
      }
      setError(requestError instanceof Error ? requestError.message : 'Unable to save concept text.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusConfirm() {
    if (!statusTarget) {
      return
    }

    const nextStatus = statusTarget.status === 'active' ? 'disabled' : 'active'
    setSaving(true)
    setError('')

    try {
      await updateConceptTextStatus(statusTarget.id, nextStatus)
      setNotice(nextStatus === 'active' ? 'Concept text enabled.' : 'Concept text disabled.')
      setStatusTarget(null)
      await loadConceptTexts()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update concept text.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAudioSubmitted(conceptText: ConceptText, audioBlob: Blob, durationSeconds: number) {
    setError('')

    if (!canRecordConceptTextAudio(conceptText.language?.code)) {
      const message = 'Audio recording is currently available for Médumba only.'
      setError(message)
      throw new Error(message)
    }

    try {
      await uploadConceptTextAudio(conceptText.id, audioBlob, durationSeconds)
      setNotice('Recording submitted for review.')
      await loadConceptTexts()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit recording.')
      throw requestError
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concept Texts']}
        title="Concept Texts"
        description="Manage translated text for each concept and language. A concept such as Greeting can have English, French, Médumba, and future language versions."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/content/concept-texts/recording"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white px-5 py-3 text-sm font-semibold text-forest-700 shadow-[0_8px_24px_rgba(31,90,61,0.1)] transition-all duration-200 hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              <Mic className="h-4 w-4" aria-hidden />
              Recording mode
            </Link>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition-all duration-200 hover:bg-forest-700 hover:shadow-[0_12px_30px_rgba(31,90,61,0.2)] focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add concept text
            </button>
          </div>
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

      <section className="grid gap-4 md:grid-cols-3" aria-label="Concept text summary">
        <StatsCard icon={<TranslateIcon />} label="Total Texts" value={total} description="Concept-language expressions" variant="green" />
        <StatsCard icon={<CheckIcon />} label="Visible Active" value={activeCount} description={`${approvedCount} approved on this page`} />
        <StatsCard icon={<ReviewIcon />} label="Visible Review" value={needsReviewCount} description="On this page" variant="warm" />
      </section>

      <ConceptTextFilters
        search={search}
        conceptSearch={conceptSearch}
        conceptId={conceptId}
        languageId={languageId}
        status={status}
        reviewStatus={reviewStatus}
        sort={sort}
        concepts={concepts}
        languages={languages}
        onSearchChange={resetPageAndSetSearch}
        onConceptSearchChange={setConceptSearch}
        onConceptChange={resetPageAndSetConceptId}
        onLanguageChange={resetPageAndSetLanguageId}
        onStatusChange={resetPageAndSetStatus}
        onReviewStatusChange={resetPageAndSetReviewStatus}
        onSortChange={resetPageAndSetSort}
      />

      <ConceptTextTable
        conceptTexts={conceptTexts}
        loading={loading}
        total={total}
        filtered={filtered}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onToggleStatus={setStatusTarget}
        onAudioSubmitted={handleAudioSubmitted}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <InsightCard title="Language Coverage" description="Current visible distribution across filtered concept texts.">
          <div className="space-y-4">
            {(languageCounts.length ? languageCounts : [{ label: 'No languages yet', count: 0 }]).map((item) => {
              const percent = conceptTexts.length > 0 ? Math.round((item.count / conceptTexts.length) * 100) : 0

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-cocoa-800">{item.label}</span>
                    <span className="font-medium text-forest-600/75">{item.count} texts</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-cream-100 ring-1 ring-sand-100">
                    <div
                      className="h-2.5 rounded-full bg-forest-accent shadow-[0_4px_12px_rgba(31,90,61,0.14)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </InsightCard>

        <InsightCard title="Primary Text Rule">
          <ul className="space-y-4 pr-4 text-sm leading-6 text-cocoa-body">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-forest-accent" />
              <span>Each concept-language pair has one primary text.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
              <span>Use review status to separate draft, review, and approved translations.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta-500" />
              <span>Disable old text instead of deleting records from the content system.</span>
            </li>
          </ul>
        </InsightCard>
      </section>

      {formMode ? (
        <ConceptTextForm
          key={formMode.conceptText?.id ?? 'new-concept-text'}
          conceptText={formMode.conceptText}
          concepts={concepts}
          languages={languages}
          conceptSearch={conceptSearch}
          fieldErrors={fieldErrors}
          saving={saving}
          onConceptSearchChange={setConceptSearch}
          onCancel={() => setFormMode(null)}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      <DisableConceptTextDialog
        conceptText={statusTarget}
        saving={saving}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
      />
    </div>
  )
}
