import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ConceptTextQuickReviewButtons } from '../../conceptTexts/components/ConceptTextQuickReviewButtons'
import type { ConceptTextReviewStatus } from '../../conceptTexts/types/conceptText.types'
import { isHeritageReviewRequired } from '../utils/conceptCompletionLanguage'
import { getLanguageQuickAction } from '../utils/conceptCompletionQuickActions'
import { ConceptCompletionLanguageBadge } from './ConceptCompletionLanguageBadge'
import type { ConceptCompletionLanguage } from '../types/concept.types'

type Props = {
  conceptId: string
  language: ConceptCompletionLanguage
  showCode?: boolean
  showTextPreviews?: boolean
  reviewingTextId?: string | null
  onReviewStatusChange?: (textId: string, reviewStatus: ConceptTextReviewStatus) => void
  onQuickAddText?: (conceptId: string, languageId: string, textId?: string | null) => void
}

function ConceptCompletionTextPreview({ language }: { language: ConceptCompletionLanguage }) {
  if (!language.hasText || !language.text) {
    return (
      <p className="max-w-[14rem] text-left text-xs leading-5 text-cocoa-body/65 italic">
        No {language.languageName} text added yet.
      </p>
    )
  }

  return (
    <div className="max-w-[14rem] space-y-1 text-left">
      <p className="text-sm leading-6 text-cocoa-800">{language.text}</p>
      {language.pronunciation ? (
        <p className="text-xs leading-5 text-cocoa-body/70">
          Pronunciation: <span className="font-medium text-cocoa-body">{language.pronunciation}</span>
        </p>
      ) : null}
    </div>
  )
}

export function ConceptCompletionLanguageCell({
  conceptId,
  language,
  showCode = false,
  showTextPreviews = false,
  reviewingTextId = null,
  onReviewStatusChange,
  onQuickAddText,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const previewVisible = showTextPreviews || expanded
  const canQuickReview = Boolean(
    language.textId &&
      language.textStatus &&
      isHeritageReviewRequired(language) &&
      onReviewStatusChange,
  )
  const saving = Boolean(language.textId && reviewingTextId === language.textId)
  const quickAction = getLanguageQuickAction(language, conceptId)

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={previewVisible}
          aria-label={
            previewVisible
              ? `Hide ${language.languageName} translation preview`
              : `Show ${language.languageName} translation preview`
          }
          className="rounded-full transition hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-forest-200"
        >
          <ConceptCompletionLanguageBadge language={language} showCode={showCode} />
        </button>

        {onQuickAddText && language.languageId && (
          <button
            type="button"
            onClick={() => onQuickAddText(conceptId, language.languageId!, language.textId)}
            title={language.hasText ? 'Edit translation' : 'Quick-add translation'}
            className={[
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-150 active:scale-90 focus:outline-none focus:ring-2 focus:ring-forest-200',
              language.hasText
                ? 'border-sand-200 bg-white text-cocoa-body/70 hover:border-forest-accent/35 hover:bg-forest-50/20 hover:text-forest-700'
                : 'border-terracotta-200 bg-terracotta-50/20 text-terracotta-600 hover:border-terracotta-300 hover:bg-terracotta-50'
            ].join(' ')}
          >
            {language.hasText ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>
        )}
      </div>

      {previewVisible ? <ConceptCompletionTextPreview language={language} /> : null}

      {canQuickReview && language.textStatus ? (
        <ConceptTextQuickReviewButtons
          reviewStatus={language.textStatus}
          saving={saving}
          compact
          onApprove={() => onReviewStatusChange?.(language.textId!, 'approved')}
          onReject={() => onReviewStatusChange?.(language.textId!, 'rejected')}
        />
      ) : null}

      {quickAction ? (
        onQuickAddText && language.languageId ? (
          <button
            type="button"
            onClick={() => onQuickAddText(conceptId, language.languageId!, language.textId)}
            className="text-xs font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800 transition active:scale-98 focus:outline-none"
          >
            {quickAction.label}
          </button>
        ) : (
          <Link
            to={quickAction.to}
            className="text-xs font-semibold text-forest-700 underline-offset-2 hover:underline"
          >
            {quickAction.label}
          </Link>
        )
      ) : null}
    </div>
  )
}
