import { useCallback, useEffect, useMemo, useState } from 'react'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { InsightCard } from '../../../components/admin/InsightCard'
import { StatsCard } from '../../../components/admin/StatsCard'
import { ApiError, normalizeApiFieldErrors } from '../../../lib/api'
import {
  createConcept,
  deleteConceptImage,
  getConcepts,
  updateConceptImageAltText,
  updateConcept,
  updateConceptStatus,
  uploadConceptImage,
} from '../api/conceptsApi'
import { ConceptFilters } from '../components/ConceptFilters'
import { ConceptsSubNav } from '../components/ConceptsSubNav'
import type { ConceptSort } from '../components/ConceptFilters'
import { ConceptForm } from '../components/ConceptForm'
import type { ConceptFormSubmission } from '../components/ConceptForm'
import { ConceptTable } from '../components/ConceptTable'
import { ConceptTextsPreviewDialog } from '../components/ConceptTextsPreviewDialog'
import { DisableConceptDialog } from '../components/DisableConceptDialog'
import type {
  Concept,
  ConceptDifficultyLevel,
  ConceptStatus,
  CreateConceptPayload,
  UpdateConceptPayload,
} from '../types/concept.types'

type FormMode = {
  concept: Concept | null
} | null

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5-8 4.5-8-4.5L12 3zM4 12l8 4.5L20 12M4 16.5L12 21l8-4.5" />
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

function CategoryIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4H9l2 2h6.5A2.5 2.5 0 0120 8.5v7A2.5 2.5 0 0117.5 18h-11A2.5 2.5 0 014 15.5v-9z" />
    </svg>
  )
}

function LeafAccent() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20 text-gold-500 ring-1 ring-gold-400/20">
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-7M8 20h8M9 13h6l1-6H8l1 6zM10 7c0-2 1-3 2-4 1 1 2 2 2 4" />
      </svg>
    </div>
  )
}

export function AdminConceptsPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ConceptStatus | 'all'>('all')
  const [category, setCategory] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState<ConceptDifficultyLevel | 'all'>('all')
  const [sort, setSort] = useState<ConceptSort>('sortOrder')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [statusTarget, setStatusTarget] = useState<Concept | null>(null)
  const [previewConcept, setPreviewConcept] = useState<Concept | null>(null)
  const [quickImageUploadingId, setQuickImageUploadingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const loadConcepts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getConcepts({
        search,
        status,
        category,
        difficultyLevel,
        sort,
        page,
        pageSize,
      })
      setConcepts(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load concepts.')
    } finally {
      setLoading(false)
    }
  }, [category, difficultyLevel, page, pageSize, search, sort, status])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConcepts()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadConcepts])

  const activeCount = concepts.filter((concept) => concept.status === 'active').length
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    concepts.forEach((concept) => {
      const categoryName = concept.category || 'Uncategorized'
      counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1)
    })

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
      .slice(0, 5)
  }, [concepts])
  const categories = categoryCounts.length
  const filtered = Boolean(search || category || status !== 'all' || difficultyLevel !== 'all')

  function resetPageAndSetSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function resetPageAndSetStatus(value: ConceptStatus | 'all') {
    setPage(1)
    setStatus(value)
  }

  function resetPageAndSetCategory(value: string) {
    setPage(1)
    setCategory(value)
  }

  function resetPageAndSetDifficultyLevel(value: ConceptDifficultyLevel | 'all') {
    setPage(1)
    setDifficultyLevel(value)
  }

  function resetPageAndSetSort(value: ConceptSort) {
    setPage(1)
    setSort(value)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
  }

  function openCreateForm() {
    setFieldErrors({})
    setFormMode({ concept: null })
  }

  function openEditForm(concept: Concept) {
    setFieldErrors({})
    setFormMode({ concept })
  }

  function validateImageFile(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'Choose a JPEG, PNG, or WebP image.'
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Choose an image that is 5 MB or smaller.'
    }

    return ''
  }

  async function handleQuickImageSelect(concept: Concept, file: File) {
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setQuickImageUploadingId(concept.id)
    setError('')
    setNotice('')

    try {
      await uploadConceptImage(concept.id, file, concept.image_alt_text ?? undefined)
      setNotice(concept.image_url ? 'Concept image replaced.' : 'Concept image uploaded.')
      await loadConcepts()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to upload concept image.')
    } finally {
      setQuickImageUploadingId(null)
    }
  }

  async function handleFormSubmit(submission: ConceptFormSubmission) {
    setSaving(true)
    setFieldErrors({})
    setError('')

    try {
      let savedConcept: Concept

      if (formMode?.concept) {
        const response = await updateConcept(formMode.concept.id, submission.payload as UpdateConceptPayload)
        savedConcept = response.data
        setNotice('Concept updated.')
      } else {
        const response = await createConcept(submission.payload as CreateConceptPayload)
        savedConcept = response.data
        setFormMode({ concept: savedConcept })
        setNotice('Concept created.')
      }

      if (submission.removeImage && savedConcept.image_url) {
        const response = await deleteConceptImage(savedConcept.id)
        savedConcept = response.data
      } else if (submission.imageFile) {
        const response = await uploadConceptImage(savedConcept.id, submission.imageFile, submission.imageAltText)
        savedConcept = response.data
      } else if (formMode?.concept && submission.imageAltTextChanged) {
        const response = await updateConceptImageAltText(savedConcept.id, submission.imageAltText)
        savedConcept = response.data
      }

      setFormMode(null)
      await loadConcepts()
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.fields) {
        setFieldErrors(normalizeApiFieldErrors(requestError.fields))
      }
      setError(requestError instanceof Error ? requestError.message : 'Unable to save concept.')
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
      await updateConceptStatus(statusTarget.id, nextStatus)
      setNotice(nextStatus === 'active' ? 'Concept enabled.' : 'Concept disabled.')
      setStatusTarget(null)
      await loadConcepts()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update concept.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concepts']}
        title="Concepts"
        description="Manage language-independent learning ideas such as greetings, family terms, food, water, and courtesy expressions. Translations will be attached later through Concept Texts."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition-all duration-200 hover:bg-forest-700 hover:shadow-[0_12px_30px_rgba(31,90,61,0.2)] focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            <PlusIcon />
            Add concept
          </button>
        }
      />

      {notice ? (
        <div className="mb-4 rounded-cta border border-forest-accent/20 bg-forest-accent/10 px-4 py-3 text-sm font-medium text-forest-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] xl:grid-cols-[1fr_22rem] items-start">
        {/* Main Command Pane (Left Column) */}
        <div className="space-y-6 min-w-0">
          <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Concept summary">
            <StatsCard
              icon={<LayersIcon />}
              label="Total Concepts"
              value={total}
              description="Reusable learning ideas"
              variant="green"
              dense={true}
              descriptionClassName="max-sm:hidden"
            />
            <StatsCard
              icon={<CheckIcon />}
              label="Visible Active"
              value={activeCount}
              description="On this page"
              dense={true}
              descriptionClassName="max-sm:hidden"
            />
            <StatsCard
              icon={<CategoryIcon />}
              label="Visible Categories"
              value={categories}
              description="Current groupings"
              variant="warm"
              dense={true}
              descriptionClassName="max-sm:hidden"
            />
          </section>

          <ConceptFilters
            search={search}
            status={status}
            category={category}
            difficultyLevel={difficultyLevel}
            sort={sort}
            viewMode={viewMode}
            onSearchChange={resetPageAndSetSearch}
            onStatusChange={resetPageAndSetStatus}
            onCategoryChange={resetPageAndSetCategory}
            onDifficultyLevelChange={resetPageAndSetDifficultyLevel}
            onSortChange={resetPageAndSetSort}
            onViewModeChange={setViewMode}
          />

          <ConceptTable
            concepts={concepts}
            loading={loading}
            total={total}
            filtered={filtered}
            onCreate={openCreateForm}
            onEdit={openEditForm}
            onPreviewTexts={setPreviewConcept}
            onQuickImageSelect={handleQuickImageSelect}
            onToggleStatus={setStatusTarget}
            quickImageUploadingId={quickImageUploadingId}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            viewMode={viewMode}
          />
        </div>

        {/* Sidebar Cabinet Pane (Right Column) */}
        <aside className="space-y-6 shrink-0 w-full lg:sticky lg:top-6">
          <ConceptsSubNav />

          <InsightCard title="Category Shape" description="A quick view of how this concept set is organized.">
            <div className="space-y-4">
              {(categoryCounts.length ? categoryCounts : [{ label: 'No categories yet', count: 0 }]).map((item) => {
                const percent = concepts.length > 0 ? Math.round((item.count / concepts.length) * 100) : 0

                return (
                  <div key={item.label} className="group">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-cocoa-800 transition-colors group-hover:text-forest-700">{item.label}</span>
                      <span className="font-medium text-forest-600/75">{item.count} items</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-cream-100 ring-1 ring-sand-100 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-forest-400 via-forest-accent to-forest-600 shadow-[0_4px_12px_rgba(15,107,58,0.25)] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </InsightCard>

          <InsightCard title="Concept Stewardship" accent={<LeafAccent />}>
            <ul className="space-y-4 pr-1 text-sm leading-6 text-cocoa-body">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-forest-accent shadow-[0_0_8px_rgba(31,90,61,0.5)] animate-pulse" />
                <span>Use language-neutral keys such as family_mother or thank_you.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(185,130,36,0.5)]" />
                <span>Keep disabled concepts visible when reviewing dependencies.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta-500 shadow-[0_0_8px_rgba(169,79,37,0.5)]" />
                <span>Attach translated wording later through Concept Texts, not here.</span>
              </li>
            </ul>
          </InsightCard>
        </aside>
      </div>

      {formMode ? (
        <ConceptForm
          key={formMode.concept?.id ?? 'new-concept'}
          concept={formMode.concept}
          fieldErrors={fieldErrors}
          saving={saving}
          onCancel={() => setFormMode(null)}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      <DisableConceptDialog
        concept={statusTarget}
        saving={saving}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
      />

      <ConceptTextsPreviewDialog
        key={previewConcept?.id ?? 'closed'}
        concept={previewConcept}
        onClose={() => setPreviewConcept(null)}
      />
    </div>
  )
}
