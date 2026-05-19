import { useCallback, useEffect, useMemo, useState } from 'react'

import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { ApiError } from '../../../lib/api'
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
  icon: 'globe' | 'check' | 'layers' | 'translate'
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
    layers: 'M12 3l8 4.5-8 4.5-8-4.5L12 3zM4 12l8 4.5L20 12M4 16.5L12 21l8-4.5',
    translate: 'M4 5h8M8 5v14M5 9h6M13 19l4-10 4 10M14.5 15h5',
  }[type]

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function StatsGrid({ total, active }: { total: number; active: number }) {
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
      description: 'Currently enabled',
      icon: 'check',
    },
    {
      label: 'Concepts Linked',
      value: '128',
      description: 'Across all languages',
      icon: 'layers',
    },
    {
      label: 'Translations',
      value: '2,456',
      description: 'Total translation records',
      icon: 'translate',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Language summary">
      {stats.map((stat) => (
        <StatsCard
          key={stat.label}
          icon={<StatIcon type={stat.icon} />}
          label={stat.label}
          value={stat.value}
          description={stat.description}
          variant={stat.icon === 'check' ? 'green' : stat.icon === 'translate' ? 'warm' : 'default'}
        />
      ))}
    </section>
  )
}

function BottomInsights() {
  const usage = [
    { label: 'Médumba', percent: 48, count: '62 items' },
    { label: 'English', percent: 32, count: '41 items' },
    { label: 'French', percent: 20, count: '25 items' },
  ]

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="relative overflow-hidden rounded-2xl border border-sand-200 bg-[linear-gradient(135deg,rgba(31,90,61,0.05),rgba(255,253,247,0.94))] p-7 shadow-soft">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[28px] border-forest-accent/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-cocoa-800">Language Usage Overview</h2>
            <p className="mt-1 text-sm text-forest-600/75">
              Distribution of lessons, stories, and concepts by language.
            </p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#0F6B3A_0_48%,#D8A441_48%_80%,#C46A32_80%_100%)] p-2 shadow-[0_12px_26px_rgba(31,90,61,0.14)]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-cream-50 text-xs font-bold text-forest-700">
              100%
            </div>
          </div>
        </div>

        <div className="relative mt-7 space-y-4">
          {usage.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-cocoa-800">{item.label}</span>
                <span className="font-medium text-forest-600/75">
                  {item.percent}% · {item.count}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-cream-100 ring-1 ring-sand-100">
                <div
                  className="h-2.5 rounded-full bg-forest-accent shadow-[0_4px_12px_rgba(31,90,61,0.18)]"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="relative overflow-hidden rounded-2xl border border-sand-200 bg-[linear-gradient(135deg,rgba(255,253,247,0.96),rgba(31,90,61,0.045))] p-7 shadow-soft">
        <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 opacity-[0.08]">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} className="h-4 w-4 rotate-45 rounded-sm bg-forest-accent" />
            ))}
          </div>
        </div>
        <div className="absolute right-7 top-7 flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/20 text-gold-500 ring-1 ring-gold-400/20">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-7M8 20h8M9 13h6l1-6H8l1 6zM10 7c0-2 1-3 2-4 1 1 2 2 2 4" />
          </svg>
        </div>
        <h2 className="pr-16 text-lg font-semibold text-cocoa-800">Quick Tips</h2>
        <ul className="mt-6 space-y-4 pr-4 text-sm leading-6 text-cocoa-body">
          <li className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-forest-accent" />
            <span>Set the default language for new content in Settings.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
            <span>Changing a language code may affect existing translations.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta-500" />
            <span>Disable a language to hide it from the public interface.</span>
          </li>
        </ul>
      </article>
    </section>
  )
}

export function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<LanguageStatus | 'all'>('all')
  const [sort, setSort] = useState<LanguageSort>('name')
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
      const response = await getLanguages({ search, status, page: 1, pageSize: 50 })
      setLanguages(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load languages.')
    } finally {
      setLoading(false)
    }
  }, [search, status])

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
        setFieldErrors(requestError.fields)
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

      <StatsGrid total={total} active={activeCount} />

      <LanguageFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
      />

      <LanguageTable
        languages={sortedLanguages}
        loading={loading}
        total={total}
        onEdit={openEditForm}
        onToggleStatus={setStatusTarget}
      />

      <BottomInsights />

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
