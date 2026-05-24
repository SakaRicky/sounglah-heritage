import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Eye, Globe, Loader2, MoreVertical, Pencil, Rocket, Sparkles, ChevronDown } from 'lucide-react'

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
import { resolveMediaUrl, resolveConceptPlaceholderUrl } from '../../../lib/media'

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
  onQuickAddText?: (conceptId: string, languageId: string, textId?: string | null) => void
}

function ConceptAvatar({ row }: { row: ConceptCompletionRow }) {
  const glow = (
    <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-tr from-forest-accent/20 to-gold-400/20 blur-xl opacity-75 animate-pulse" />
  )

  const imageUrl = row.image_url ? resolveMediaUrl(row.image_url) : resolveConceptPlaceholderUrl(row.key)

  return (
    <div className="relative">
      {glow}
      <img
        src={imageUrl ?? undefined}
        alt={row.image_alt_text || row.title}
        className="relative z-10 h-24 w-24 rounded-full border-4 border-white bg-cream-100 object-cover shadow-[0_12px_28px_rgba(31,90,61,0.14)]"
        loading="lazy"
      />
      <Sparkles className="absolute -right-2 top-1 z-10 h-4 w-4 rotate-12 text-gold-500" aria-hidden />
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
  onQuickAddText,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

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
      <article className="overflow-hidden rounded-[28px] border border-sand-200/80 bg-white/95 shadow-[0_12px_28px_rgba(47,26,16,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(47,26,16,0.09)]">
        {/* Header Top Bar */}
        <div className="flex items-center justify-between border-b border-sand-100/75 bg-cream-50/30 px-5 py-3.5">
          {/* Custom vector checkbox */}
          <label className="relative flex items-center justify-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelected}
              aria-label={`Select ${row.title}`}
              className="sr-only"
            />
            <span className={[
              'flex h-6 w-6 items-center justify-center rounded-lg border transition-all duration-300',
              selected
                ? 'border-forest-accent bg-forest-accent text-white shadow-[0_4px_12px_rgba(31,90,61,0.25)] scale-105'
                : 'border-sand-300 bg-white hover:border-forest-300'
            ].join(' ')}>
              {selected ? (
                <Check className="h-4.5 w-4.5 stroke-[3]" />
              ) : null}
            </span>
          </label>
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <ConceptCompletionStatusBadge status={row.completionStatus} />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sand-200 bg-white text-cocoa-body/60 transition hover:border-forest-accent/35 hover:text-cocoa-body shadow-sm"
              aria-label={`More actions for ${row.title}`}
            >
              <MoreVertical className="h-4 w-4" aria-hidden />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-sand-200 bg-white py-1.5 shadow-card animate-in fade-in duration-100">
                <Link
                  to={`/admin/content/concept-texts?conceptId=${encodeURIComponent(row.id)}`}
                  className="block px-4 py-2.5 text-sm font-semibold text-cocoa-body hover:bg-cream-100/70 hover:text-forest-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Open Concept Texts
                </Link>
                <Link
                  to="/admin/content/concepts"
                  className="block px-4 py-2.5 text-sm font-semibold text-cocoa-body hover:bg-cream-100/70 hover:text-forest-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Manage concepts
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Card Content body */}
        <div className="p-5 sm:p-6">
          {/* Top Section: Avatar + Title & Description (Side-by-Side on desktop/tablet, stacked on mobile) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar & Quick Review Block */}
            <div className="flex flex-col items-center gap-3.5 shrink-0">
              <ConceptAvatar row={row} />
              {quickReviewLanguage && quickReviewLanguage.textStatus ? (
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <ConceptTextQuickReviewButtons
                    reviewStatus={quickReviewLanguage.textStatus}
                    saving={quickReviewSaving}
                    compact
                    onApprove={() => onReviewStatusChange?.(quickReviewLanguage.textId!, 'approved')}
                    onReject={() => onReviewStatusChange?.(quickReviewLanguage.textId!, 'rejected')}
                  />
                  <p className="text-[9px] font-bold uppercase tracking-wider text-cocoa-body/45">Quick Review</p>
                </div>
              ) : null}
            </div>

            {/* Info Block */}
            <div className="min-w-0 flex-1 w-full">
              <h3 className="text-xl font-bold leading-snug tracking-tight text-cocoa-800 sm:text-[1.5rem]">
                {row.title}
              </h3>
              {row.description || row.category ? (
                <p className="mt-1.5 text-sm leading-relaxed text-cocoa-body/70 max-w-xl whitespace-normal break-words mx-auto sm:mx-0">
                  {row.description || row.category}
                </p>
              ) : null}
            </div>
          </div>

          {/* Bottom Section: Spacious Details & Actions at Full Card Width */}
          <div className="mt-5 space-y-5 border-t border-sand-100/60 pt-4 text-left">
            {/* Languages Checklist */}
            <div className="space-y-2.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-forest-700">
                <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Required languages
              </p>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => {
                  const badgeElement = (
                    <ConceptCompletionLanguageBadge
                      language={language}
                      showCode
                      showCheckIcon={isLanguageCompletionSatisfied(language)}
                      compact
                    />
                  )

                  return (
                    <div key={language.languageCode} className="space-y-1.5">
                      {onQuickAddText && language.languageId ? (
                        <button
                          type="button"
                          onClick={() => onQuickAddText(row.id, language.languageId!, language.textId)}
                          className="rounded-full transition duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-forest-200"
                        >
                          {badgeElement}
                        </button>
                      ) : (
                        badgeElement
                      )}
                      {showTextPreviews && language.hasText && language.text ? (
                        <p className="px-1.5 text-xs text-cocoa-ink/80 border-l-2 border-sand-200/60 pl-2 py-0.5 max-w-xs">{language.text}</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Expandable Metadata Drawer */}
            <div>
              <button
                type="button"
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sand-200/50 bg-sand-50/20 py-2 text-[11px] font-semibold text-cocoa-body/65 transition hover:bg-cream-100/40 hover:text-cocoa-body active:scale-[0.99] shadow-sm"
              >
                <span>{detailsExpanded ? 'Hide Technical Details' : 'Show Technical Details'}</span>
                <ChevronDown className={['h-3.5 w-3.5 transition-transform duration-200 text-cocoa-body/55', detailsExpanded ? 'rotate-180' : ''].join(' ')} />
              </button>
              {detailsExpanded ? (
                <div className="mt-2.5 rounded-2xl border border-sand-200/60 bg-cream-50/20 p-3 text-left text-xs space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between gap-2 border-b border-sand-100/40 pb-2">
                    <span className="font-bold text-cocoa-body/55">Concept Key:</span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-cocoa-ink ring-1 ring-sand-100">
                      {row.key || 'n/a'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-b border-sand-100/40 pb-2">
                    <span className="font-bold text-cocoa-body/55">URL Slug:</span>
                    <span className="font-mono text-cocoa-body/75">{row.slug || 'n/a'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-cocoa-body/55">Category:</span>
                    <span className="font-semibold text-forest-700">{row.category || 'Uncategorized'}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Action Buttons section */}
            <div className="pt-2">
              {onPublish ? (
                <div className="flex flex-col gap-3">
                  {/* Status header */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-widest text-cocoa-body/40 text-[9px]">Stewardship</span>
                    <span className={[
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                      isPublished
                        ? 'border-forest-accent/25 bg-forest-accent/10 text-forest-700'
                        : 'border-gold-500/25 bg-gold-400/10 text-gold-700'
                    ].join(' ')}>
                      <span className={['h-1.5 w-1.5 rounded-full', isPublished ? 'bg-forest-accent' : 'bg-gold-500'].join(' ')} />
                      {isPublished ? 'Published' : 'Needs review'}
                    </span>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-col gap-2.5 w-full">
                    {isPublished ? (
                      <div className="w-full flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-forest-accent/20 bg-forest-accent/5 px-4 py-2 text-xs font-semibold text-forest-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                        <Check className="h-4 w-4 shrink-0 text-forest-600" />
                        <span>Published to Curriculum</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canPublish || publishing}
                        title={disabledReason ?? 'Publish concept'}
                        onClick={() => onPublish(row.id)}
                        className={[
                          'w-full flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold shadow-soft transition-all duration-200 hover:scale-[1.01] active:scale-95 disabled:scale-100',
                          canPublish
                            ? 'border-forest-accent/35 bg-forest-600 text-white shadow-[0_8px_24px_rgba(31,90,61,0.14)] hover:bg-forest-700'
                            : 'cursor-not-allowed border-sand-200 bg-stone-100 text-cocoa-body/45',
                        ].join(' ')}
                      >
                        {publishing ? (
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        ) : (
                          <Rocket className="h-4 w-4 shrink-0" />
                        )}
                        <span>{publishing ? 'Publishing…' : 'Publish Concept'}</span>
                      </button>
                    )}

                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-sand-200 bg-white px-4 py-2 text-xs font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 active:scale-95 shadow-sm min-w-0"
                      >
                        <Eye className="h-4 w-4 shrink-0" />
                        <span className="truncate">Preview</span>
                      </button>
                      {onQuickAddText ? (
                        <button
                          type="button"
                          onClick={() => {
                            const targetLang = languages.find(lang => !isLanguageCompletionSatisfied(lang)) ?? languages[0]
                            if (targetLang && targetLang.languageId) {
                              onQuickAddText(row.id, targetLang.languageId, targetLang.textId)
                            }
                          }}
                          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-forest-accent/25 bg-white px-4 py-2 text-xs font-semibold text-forest-700 transition hover:border-forest-accent hover:bg-forest-50/50 active:scale-95 shadow-sm min-w-0"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          <span className="truncate">{primaryFix ? primaryFix.label : 'Edit'}</span>
                        </button>
                      ) : (
                        <Link
                          to={editPath}
                          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-forest-accent/25 bg-white px-4 py-2 text-xs font-semibold text-forest-700 transition hover:border-forest-accent hover:bg-forest-50/50 active:scale-95 shadow-sm min-w-0"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          <span className="truncate">{primaryFix ? primaryFix.label : 'Edit'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                onQuickAddText ? (
                  <button
                    type="button"
                    onClick={() => {
                      const targetLang = languages.find(lang => !isLanguageCompletionSatisfied(lang)) ?? languages[0]
                      if (targetLang && targetLang.languageId) {
                        onQuickAddText(row.id, targetLang.languageId, targetLang.textId)
                      }
                    }}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-forest-accent bg-forest-accent px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover active:scale-98"
                  >
                    <Pencil className="h-4 w-4 shrink-0" />
                    <span>{primaryFix?.label ?? 'Edit texts'}</span>
                  </button>
                ) : (
                  <Link
                    to={editPath}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-forest-accent bg-forest-accent px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover active:scale-98"
                  >
                    <Pencil className="h-4 w-4 shrink-0" />
                    <span>{primaryFix?.label ?? 'Edit texts'}</span>
                  </Link>
                )
              )}
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
