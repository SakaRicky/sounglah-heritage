import { useCallback, useEffect, useMemo, useState } from 'react'

import { Toast } from '../../../components/common/Toast'
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { ApiError, normalizeApiFieldErrors } from '../../../lib/api'
import { getTimestamp } from '../../../lib/date'
import {
  createLanguage,
  getLanguages,
  updateLanguage,
  updateLanguageStatus,
} from '../api/languagesApi'
import { DisableLanguageDialog } from '../components/DisableLanguageDialog'
import { LanguageFilters } from '../components/LanguageFilters'
import type { LanguageSort } from '../components/LanguageFilters'
import { LanguageForm } from '../components/LanguageForm'
import { LanguageTable } from '../components/LanguageTable'
import type {
  CreateLanguagePayload,
  Language,
  LanguageStatus,
  UpdateLanguagePayload,
} from '../types/language.types'

type FormMode = {
  language: Language | null
} | null

type StatCard = {
  label: string
  value: string
  description: string
  icon: 'globe' | 'check' | 'required'
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function StatIcon({ type }: { type: StatCard['icon'] }) {
  const path = {
    globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.3 5.3 3.3 9S14.2 18.7 12 21c-2.2-2.3-3.3-5.3-3.3-9S9.8 5.3 12 3z',
    check: 'M9 12.75l2 2 4-5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    required: 'M12 3.75l7.5 4.25v5.75c0 4-3.1 6.4-7.5 7.5-4.4-1.1-7.5-3.5-7.5-7.5V8L12 3.75zM9 12.25l2 2 4-4.5',
  }[type]

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function StatsGrid({ total, active, required }: { total: number; active: number; required: number }) {
  const stats: StatCard[] = [
    {
      label: 'Total Languages',
      value: String(total),
      description: 'Languages configured',
      icon: 'globe',
    },
    {
      label: 'Active Languages',
      value: String(active),
      description: 'Visible on this page',
      icon: 'check',
    },
    {
      label: 'Required Languages',
      value: String(required),
      description: 'Needed for concept completion',
      icon: 'required',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-3" aria-label="Language summary">
      {stats.map((stat) => (
        <StatsCard
          key={stat.label}
          icon={<StatIcon type={stat.icon} />}
          label={stat.label}
          value={stat.value}
          description={stat.description}
          variant={stat.icon === 'check' ? 'green' : 'default'}
        />
      ))}
    </section>
  )
}

export function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<LanguageStatus | 'all'>('all')
  const [sort, setSort] = useState<LanguageSort>('name')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [statusTarget, setStatusTarget] = useState<Language | null>(null)

  const loadLanguages = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getLanguages({ search, status, page, pageSize })
      setLanguages(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load languages.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, status])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLanguages()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadLanguages])

  const sortedLanguages = useMemo(() => {
    return [...languages].sort((first, second) => {
      if (sort === 'newest') {
        return getTimestamp(second.updatedAt) - getTimestamp(first.updatedAt)
      }

      if (sort === 'sortOrder') {
        return first.sortOrder - second.sortOrder || first.name.localeCompare(second.name)
      }

      return first.name.localeCompare(second.name)
    })
  }, [languages, sort])

  const activeCount = languages.filter((language) => language.status === 'active').length
  const requiredCount = languages.filter((language) => language.isRequiredForConceptCompletion).length

  function resetPageAndSetSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function resetPageAndSetStatus(value: LanguageStatus | 'all') {
    setPage(1)
    setStatus(value)
  }

  function resetPageAndSetSort(value: LanguageSort) {
    setPage(1)
    setSort(value)
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPage(1)
    setPageSize(nextPageSize)
  }

  function openCreateForm() {
    setFieldErrors({})
    setFormMode({ language: null })
  }

  function openEditForm(language: Language) {
    setFieldErrors({})
    setFormMode({ language })
  }

  async function handleFormSubmit(payload: CreateLanguagePayload | UpdateLanguagePayload) {
    setSaving(true)
    setFieldErrors({})
    setError('')

    try {
      if (formMode?.language) {
        await updateLanguage(formMode.language.id, payload as UpdateLanguagePayload)
        setNotice('Language updated.')
      } else {
        await createLanguage(payload as CreateLanguagePayload)
        setNotice('Language created.')
      }

      setFormMode(null)
      await loadLanguages()
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.fields) {
        setFieldErrors(normalizeApiFieldErrors(requestError.fields))
      }
      setError(requestError instanceof Error ? requestError.message : 'Unable to save language.')
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
      await updateLanguageStatus(statusTarget.id, nextStatus)
      setNotice(nextStatus === 'active' ? 'Language enabled.' : 'Language disabled.')
      setStatusTarget(null)
      await loadLanguages()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update language.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Languages']}
        title="Languages"
        description="Manage the languages supported by Sounglah. Languages are used by concepts, lessons, stories, and translation content."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition-all duration-200 hover:bg-forest-700 hover:shadow-[0_12px_30px_rgba(31,90,61,0.2)] focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            <PlusIcon />
            Add Language
          </button>
        }
      />

      <Toast message={notice} type="success" onClose={() => setNotice('')} />
      <Toast message={error} type="error" onClose={() => setError('')} />

      <StatsGrid total={total} active={activeCount} required={requiredCount} />

      <LanguageFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={resetPageAndSetSearch}
        onStatusChange={resetPageAndSetStatus}
        onSortChange={resetPageAndSetSort}
      />

      <LanguageTable
        languages={sortedLanguages}
        loading={loading}
        total={total}
        onEdit={openEditForm}
        onToggleStatus={setStatusTarget}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {formMode ? (
        <LanguageForm
          key={formMode.language?.id ?? 'new-language'}
          language={formMode.language}
          fieldErrors={fieldErrors}
          saving={saving}
          onCancel={() => setFormMode(null)}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      <DisableLanguageDialog
        language={statusTarget}
        saving={saving}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
      />
    </div>
  )
}
