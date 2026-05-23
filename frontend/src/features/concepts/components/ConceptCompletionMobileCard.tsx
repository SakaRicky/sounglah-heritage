import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Eye, Globe, Loader2, MoreVertical, Pencil, Rocket, Sparkles } from 'lucide-react'

import { ConceptTextQuickReviewButtons } from '../../conceptTexts/components/ConceptTextQuickReviewButtons'
import type { ConceptTextReviewStatus } from '../../conceptTexts/types/conceptText.types'
import {
  isHeritageReviewRequired,
  isLanguageCompletionSatisfied,
} from '../utils/conceptCompletionLanguage'
import {
  buildConceptTextListPath,
  getPrimaryFixAction,
  getPublishDisabledReason,
} from '../utils/conceptCompletionQuickActions'
import { ConceptCompletionLanguageBadge } from './ConceptCompletionLanguageBadge'
import { ConceptCompletionStatusBadge } from './ConceptCompletionStatusBadge'
import { ConceptTextsPreviewDialog } from './ConceptTextsPreviewDialog'
import type { ConceptCompletionLanguage, ConceptCompletionRow } from '../types/concept.types'
import { resolveMediaUrl } from '../../../lib/media'

type Props = {
  row: ConceptCompletionRow
  languages: ConceptCompletionLanguage[]
  showTextPreviews?: boolean
  reviewingTextId?: string | null
  onReviewStatusChange?: (textId: string, reviewStatus: ConceptTextReviewStatus) => void
  selected: boolean
  onToggleSelected: () => void
  publishingConceptId?: string | null
  onPublish?: (conceptId: string) => void
}

function ConceptAvatar({ row }: { row: ConceptCompletionRow }) {
  if (row.image_url) {
    return (
      <div className="relative">
        <img
          src={resolveMediaUrl(row.image_url) ?? undefined}
          alt={row.image_alt_text || row.title}
          className="h-24 w-24 rounded-full border-4 border-white bg-cream-100 object-cover shadow-[0_12px_28px_rgba(31,90,61,0.14)]"
          loading="lazy"
        />
        <Sparkles className="absolute -right-2 top-1 h-4 w-4 rotate-12 text-gold-500" aria-hidden />
      </div>
    )
  }

  return (
    <div className="relative">
      <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[linear-gradient(180deg,rgba(31,90,61,0.12),rgba(31,90,61,0.06))] text-3xl font-bold text-forest-700 shadow-[0_12px_28px_rgba(31,90,61,0.14)]">
        {row.title.slice(0, 1).toUpperCase()}
      </span>
      <Sparkles className="absolute -right-2 top-1 h-4 w-4 rotate-12 text-gold-500" aria-hidden />
    </div>
  )
}

export function ConceptCompletionMobileCard({
  row,
  languages,
  showTextPreviews = false,
  reviewingTextId = null,
  onReviewStatusChange,
  selected,
  onToggleSelected,
  publishingConceptId = null,
  onPublish,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const quickReviewLanguage = languages.find(
    (language) =>
      language.textId &&
      language.textStatus &&
      isHeritageReviewRequired(language) &&
      onReviewStatusChange &&
      (language.textStatus === 'needs_review' || language.textStatus === 'draft'),
  )
  const quickReviewSaving = Boolean(
    quickReviewLanguage?.textId && reviewingTextId === quickReviewLanguage.textId,
  )

  const primaryFix = getPrimaryFixAction(row)
  const fallbackLanguageId = languages.find((language) => language.languageId)?.languageId ?? ''
  const editPath =
    primaryFix?.to ??
    buildConceptTextListPath({
      conceptId: row.id,
      languageId: fallbackLanguageId,
    })
  const isPublished = row.completionStatus === 'published'
  const canPublish = row.isReadyToPublish
  const disabledReason = getPublishDisabledReason(row)
  const publishing = publishingConceptId === row.id

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-sand-100 bg-white/95 shadow-[0_14px_34px_rgba(47,26,16,0.08)]">
        <div className="flex items-start justify-between gap-3 border-b border-sand-100/75 bg-cream-50/45 px-4 py-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            aria-label={`Select ${row.title}`}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-300 text-forest-accent focus:ring-forest-200"
          />
          <div className="relative flex items-start gap-2">
            <ConceptCompletionStatusBadge status={row.completionStatus} />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-cocoa-body/60 transition hover:bg-sand-100/80 hover:text-cocoa-body"
              aria-label={`More actions for ${row.title}`}
            >
              <MoreVertical className="h-5 w-5" aria-hidden />
            </button>
            {menuOpen ? (
              <div className="absolute right-4 top-12 z-10 w-44 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-soft">
                <Link
                  to={`/admin/content/concept-texts?conceptId=${encodeURIComponent(row.id)}`}
                  className="block px-3 py-2 text-sm font-medium text-cocoa-body hover:bg-cream-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Open Concept Texts
                </Link>
                <Link
                  to="/admin/content/concepts"
                  className="block px-3 py-2 text-sm font-medium text-cocoa-body hover:bg-cream-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Manage concepts
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <ConceptAvatar row={row} />
            {quickReviewLanguage && quickReviewLanguage.textStatus ? (
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <ConceptTextQuickReviewButtons
                  reviewStatus={quickReviewLanguage.textStatus}
                  saving={quickReviewSaving}
                  compact
                  onApprove={() => onReviewStatusChange?.(quickReviewLanguage.textId!, 'approved')}
                  onReject={() => onReviewStatusChange?.(quickReviewLanguage.textId!, 'rejected')}
                />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-cocoa-body/55">Quick Review</p>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 self-center">
            <h3 className="text-[1.55rem] font-bold leading-tight tracking-tight text-cocoa-800 sm:text-2xl">
              {row.title}
            </h3>
            <p className="mt-1 text-[0.92rem] leading-6 text-cocoa-body/72 sm:text-sm">
              {row.description || row.category || 'Concept'}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_1px_minmax(0,17rem)] sm:items-start">
              <div className="min-w-0 space-y-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-forest-700">
                  <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Required languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <div key={language.languageCode} className="space-y-1.5">
                      <ConceptCompletionLanguageBadge
                        language={language}
                        showCode
                        showCheckIcon={isLanguageCompletionSatisfied(language)}
                        compact
                      />
                      {showTextPreviews && language.hasText && language.text ? (
                        <p className="px-1 text-sm leading-6 text-cocoa-800">{language.text}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden bg-sand-200/70 sm:block" aria-hidden />

              <div className="min-w-0 sm:pt-0.5">
                {onPublish ? (
                  <>
                    <div className="mb-3 inline-flex rounded-full border border-gold-500/25 bg-gold-400/10 px-3 py-1.5 text-xs font-semibold text-gold-700">
                      {isPublished ? 'Published' : 'Needs review'}
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        aria-label="Preview concept texts"
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-sand-200 bg-white px-2 py-2 text-[11px] font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200 max-sm:px-2.5"
                      >
                        <Eye className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <Link
                        to={editPath}
                        aria-label={primaryFix ? primaryFix.label : 'Edit concept texts'}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-forest-accent bg-forest-accent px-2 py-2 text-[11px] font-semibold text-white shadow-[0_6px_18px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover focus:outline-none focus:ring-2 focus:ring-forest-200 max-sm:px-2.5"
                      >
                        <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="hidden sm:inline">{primaryFix ? primaryFix.label : 'Edit'}</span>
                      </Link>
                      {isPublished ? (
                        <span
                          aria-label="Published"
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-forest-accent/25 bg-forest-accent/10 px-2 py-2 text-[11px] font-semibold text-forest-700 max-sm:px-2.5"
                        >
                          <Check className="h-4 w-4 shrink-0 sm:hidden" aria-hidden />
                          <span className="hidden sm:inline">Published</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!canPublish || publishing}
                          title={disabledReason ?? 'Publish concept'}
                          aria-label={
                            publishing
                              ? 'Publishing concept'
                              : (disabledReason ?? 'Publish concept')
                          }
                          aria-busy={publishing}
                          onClick={() => onPublish(row.id)}
                          className={[
                            'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-forest-200 max-sm:px-2.5',
                            canPublish
                              ? 'border-forest-accent/35 bg-white text-forest-700 hover:bg-forest-50/40'
                              : 'cursor-not-allowed border-sand-200 bg-stone-100 text-cocoa-body/45',
                          ].join(' ')}
                        >
                          {publishing ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin sm:hidden" aria-hidden />
                          ) : (
                            <Rocket className="h-4 w-4 shrink-0" aria-hidden />
                          )}
                          <span className="hidden sm:inline">{publishing ? 'Publishing…' : 'Publish'}</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <Link
                    to={editPath}
                    aria-label={primaryFix?.label ?? 'Edit concept texts'}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-forest-accent bg-forest-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover"
                  >
                    <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">{primaryFix?.label ?? 'Edit texts'}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      <ConceptTextsPreviewDialog
        concept={previewOpen ? row : null}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
