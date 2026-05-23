import { useEffect, useRef, useState } from 'react'
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
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            aria-label={`Select ${row.title}`}
            className="h-4.5 w-4.5 rounded border-sand-300 text-forest-accent focus:ring-forest-200 transition"
          />
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
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 sm:p-6 text-center sm:text-left">
          {/* Avatar and Quick Review Block */}
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

          {/* Details & Info Block */}
          <div className="min-w-0 flex-1 w-full">
            <h3 className="text-xl font-bold leading-snug tracking-tight text-cocoa-800 sm:text-[1.5rem]">
              {row.title}
            </h3>
            {row.description || row.category ? (
              <p className="mt-1 text-sm leading-relaxed text-cocoa-body/70 max-w-xl whitespace-normal break-words mx-auto sm:mx-0">
                {row.description || row.category}
              </p>
            ) : null}

            {/* Content Details section */}
            <div className="mt-5 space-y-4">
              {/* Languages Checklist */}
              <div className="space-y-2">
                <p className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-bold uppercase tracking-widest text-forest-700">
                  <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Required languages
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {languages.map((language) => (
                    <div key={language.languageCode} className="space-y-1.5">
                      <ConceptCompletionLanguageBadge
                        language={language}
                        showCode
                        showCheckIcon={isLanguageCompletionSatisfied(language)}
                        compact
                      />
                      {showTextPreviews && language.hasText && language.text ? (
                        <p className="px-1.5 text-xs text-cocoa-ink/80 text-left border-l-2 border-sand-200/60 pl-2 py-0.5 max-w-xs">{language.text}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons section */}
              <div className="pt-3 border-t border-sand-100/60">
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      {isPublished ? (
                        <div className="flex-1 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-forest-accent/20 bg-forest-accent/5 px-4 py-2 text-xs font-semibold text-forest-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
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
                            'flex-1 flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold shadow-soft transition-all duration-200 hover:scale-[1.01] active:scale-95 disabled:scale-100',
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

                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewOpen(true)}
                          className="flex-1 sm:flex-initial inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-sand-200 bg-white px-4 py-2 text-xs font-semibold text-cocoa-body transition hover:border-forest-accent/35 hover:bg-forest-50/30 active:scale-95 shadow-sm"
                        >
                          <Eye className="h-4 w-4 shrink-0" />
                          <span>Preview</span>
                        </button>
                        <Link
                          to={editPath}
                          className="flex-1 sm:flex-initial inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-forest-accent/25 bg-white px-4 py-2 text-xs font-semibold text-forest-700 transition hover:border-forest-accent hover:bg-forest-50/50 active:scale-95 shadow-sm"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          <span>{primaryFix ? primaryFix.label : 'Edit'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={editPath}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-forest-accent bg-forest-accent px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover active:scale-98"
                  >
                    <Pencil className="h-4 w-4 shrink-0" />
                    <span>{primaryFix?.label ?? 'Edit texts'}</span>
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
