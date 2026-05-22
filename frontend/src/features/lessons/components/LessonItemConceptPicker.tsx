import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getConceptCompletion } from '../../concepts/api/conceptsApi'
import { ConceptCompletionLanguageBadge } from '../../concepts/components/ConceptCompletionLanguageBadge'
import { ConceptCompletionStatusBadge } from '../../concepts/components/ConceptCompletionStatusBadge'
import type { ConceptCompletionRow } from '../../concepts/types/concept.types'
import { useI18n } from '../../../i18n'

type Props = {
  selectedConceptId: string
  selectedConceptRow?: ConceptCompletionRow | null
  initialSearch?: string
  onSelect: (conceptId: string, row: ConceptCompletionRow | null) => void
}

function requiredLanguages(row: ConceptCompletionRow) {
  return row.languages
}

export function LessonItemConceptPicker({
  selectedConceptId,
  selectedConceptRow = null,
  initialSearch = '',
  onSelect,
}: Props) {
  const { t } = useI18n()
  const [search, setSearch] = useState(initialSearch)
  const [rows, setRows] = useState<ConceptCompletionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRow = useMemo(() => {
    if (selectedConceptRow && selectedConceptRow.id === selectedConceptId) {
      return selectedConceptRow
    }

    return rows.find((row) => row.id === selectedConceptId) ?? null
  }, [rows, selectedConceptId, selectedConceptRow])

  const loadConcepts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getConceptCompletion({
        search,
        conceptStatus: 'active',
        isComplete: true,
        page: 1,
        pageSize: 25,
      })
      setRows(response.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('admin.lessons.itemForm.conceptLoadError'))
    } finally {
      setLoading(false)
    }
  }, [search, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConcepts()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadConcepts])

  const showConceptWarning =
    selectedRow !== null && !['complete', 'published'].includes(selectedRow.completionStatus)

  return (
    <div className="space-y-4">
      <p className="text-xs text-cocoa-body/70">{t('admin.lessons.itemForm.conceptReadyOnlyHelp')}</p>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-body/45">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
          </svg>
        </span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-cta border border-sand-200 bg-cream-50/40 py-3 pl-11 pr-4 text-sm text-cocoa-body outline-none transition placeholder:text-cocoa-body/40 focus:border-forest-600 focus:bg-white focus:ring-2 focus:ring-[rgba(31,90,61,0.16)]"
          placeholder={t('admin.lessons.itemForm.conceptSearchPlaceholder')}
          aria-label={t('admin.lessons.itemForm.concept')}
        />
      </div>

      {error ? <p className="text-sm font-medium text-terracotta-600">{error}</p> : null}

      {selectedRow ? (
        <div className="rounded-2xl border-2 border-forest-accent/35 bg-forest-50/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                {t('admin.lessons.itemForm.linkedConceptSelected')}
              </p>
              <p className="mt-1 text-lg font-bold text-cocoa-800">{selectedRow.title}</p>
              <p className="mt-1 font-mono text-xs text-cocoa-body/70">{selectedRow.key}</p>
            </div>
            <ConceptCompletionStatusBadge status={selectedRow.completionStatus} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {requiredLanguages(selectedRow).map((language) => {
              const previewText = language.text?.trim()

              return (
                <div key={language.languageCode} className="rounded-xl border border-sand-200 bg-white px-3 py-2.5">
                  <ConceptCompletionLanguageBadge language={language} showCode />
                  {previewText ? (
                    <p className="mt-2 line-clamp-2 text-sm text-cocoa-body">{previewText}</p>
                  ) : (
                    <p className="mt-2 text-sm italic text-cocoa-body/50">{t('admin.lessons.itemForm.conceptTextMissing')}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-sand-200 bg-cream-50/30 p-2">
        {loading ? (
          <p className="px-3 py-4 text-sm text-cocoa-body">{t('admin.lessons.itemForm.conceptLoading')}</p>
        ) : rows.length === 0 ? (
          <p className="px-3 py-4 text-sm text-cocoa-body">{t('admin.lessons.itemForm.conceptEmptyReadyOnly')}</p>
        ) : (
          rows.map((row) => {
            const selected = row.id === selectedConceptId

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row.id, row)}
                className={[
                  'w-full rounded-xl border px-4 py-3 text-left transition',
                  selected
                    ? 'border-forest-accent bg-white shadow-soft'
                    : 'border-transparent bg-white/80 hover:border-sand-200 hover:bg-white',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-cocoa-800">{row.title}</p>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs text-cocoa-700">
                    {row.key}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {requiredLanguages(row).map((language) => (
                    <ConceptCompletionLanguageBadge key={language.languageCode} language={language} showCode />
                  ))}
                </div>
              </button>
            )
          })
        )}
      </div>

      {showConceptWarning && selectedRow ? (
        <div className="rounded-cta border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-cocoa-body">
          <p className="font-semibold text-cocoa-800">{t('admin.lessons.itemForm.conceptWarningTitle')}</p>
          <p className="mt-1">{t('admin.lessons.itemForm.conceptWarningDescription')}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link to="/admin/content/concept-texts" className="text-forest-700 hover:underline">
              {t('admin.lessons.itemForm.linkConceptTexts')}
            </Link>
            <Link to="/admin/content/concepts/completion" className="text-forest-700 hover:underline">
              {t('admin.lessons.itemForm.linkCompletion')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
