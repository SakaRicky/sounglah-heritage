import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ModalPortal } from '../../../components/common/ModalPortal'
import { getConceptCompletionById } from '../api/conceptsApi'
import { ConceptCompletionLanguageBadge } from './ConceptCompletionLanguageBadge'
import { buildConceptTextListPath } from '../utils/conceptCompletionQuickActions'
import type { Concept, ConceptCompletionRow } from '../types/concept.types'

type Props = {
  concept: Concept | null
  onClose: () => void
}

function ConceptTextPreviewRow({
  conceptId,
  language,
}: {
  conceptId: string
  language: ConceptCompletionRow['languages'][number]
}) {
  const editPath =
    language.hasText && language.textId
      ? buildConceptTextListPath({
          conceptId,
          languageId: language.languageId,
          action: 'edit',
          textId: language.textId,
        })
      : buildConceptTextListPath({
          conceptId,
          languageId: language.languageId,
          action: 'create',
        })

  return (
    <article className="rounded-xl border border-sand-200 bg-cream-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-cocoa-800">{language.languageName}</p>
          <p className="text-xs uppercase tracking-wide text-cocoa-body/60">{language.languageCode}</p>
        </div>
        <ConceptCompletionLanguageBadge language={language} />
      </div>

      <div className="mt-3">
        {!language.hasText || !language.text ? (
          <p className="text-sm italic leading-6 text-cocoa-body/65">
            No {language.languageName} text added yet.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-base leading-7 text-cocoa-800">{language.text}</p>
            {language.pronunciation ? (
              <p className="text-sm leading-6 text-cocoa-body/75">
                Pronunciation:{' '}
                <span className="font-medium text-cocoa-body">{language.pronunciation}</span>
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link
          to={editPath}
          className="text-sm font-semibold text-forest-700 underline-offset-2 hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {language.hasText ? 'Edit in Concept Texts' : 'Add in Concept Texts'}
        </Link>
      </div>
    </article>
  )
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function ConceptTextsPreviewDialog({ concept, onClose }: Props) {
  const [row, setRow] = useState<ConceptCompletionRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!concept) {
      return
    }

    const conceptId = concept.id
    let cancelled = false

    async function loadPreview() {
      setLoading(true)
      setError('')

      try {
        const response = await getConceptCompletionById(conceptId)
        if (!cancelled) {
          setRow(response.data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setRow(null)
          setError(requestError instanceof Error ? requestError.message : 'Unable to load concept texts.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadPreview()
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [concept])

  if (!concept) {
    return null
  }

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-ink/35 p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="flex max-h-[min(90vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-soft bg-white shadow-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="concept-texts-preview-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-b border-sand-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="concept-texts-preview-title" className="truncate text-xl font-bold text-cocoa-800">
                  {concept.title}
                </h2>
                <p className="mt-1 font-mono text-xs text-cocoa-body/70">{concept.key}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-cocoa-body/70 transition hover:bg-cream-100 hover:text-cocoa-800 focus:outline-none focus:ring-2 focus:ring-forest-200"
                aria-label="Close concept texts preview"
              >
                <span aria-hidden className="text-xl leading-none">
                  ×
                </span>
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-cocoa-body">
              A quick look at the translations linked to this concept across each language.
            </p>
          </div>

          <div className="overflow-y-auto px-6 py-5">
            {loading ? (
              <p className="text-sm text-cocoa-body" role="status">
                Loading concept texts...
              </p>
            ) : null}

            {!loading && error ? (
              <p className="rounded-xl border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm text-terracotta-600">
                {error}
              </p>
            ) : null}

            {!loading && !error && row ? (
              <div className="space-y-4">
                {row.languages.map((language) => (
                  <ConceptTextPreviewRow key={language.languageId} conceptId={row.id} language={language} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-t border-sand-100 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/admin/content/concept-texts?conceptId=${encodeURIComponent(concept.id)}`}
                className="text-sm font-semibold text-forest-700 underline-offset-2 hover:underline"
              >
                Open all in Concept Texts
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-cta border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

export function ConceptTextsPreviewButton({
  concept,
  onPreview,
}: {
  concept: Concept
  onPreview: (concept: Concept) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onPreview(concept)}
      className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
      title="Preview concept texts"
      aria-label={`Preview texts for ${concept.title}`}
    >
      <EyeIcon />
    </button>
  )
}
