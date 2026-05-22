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
        <Link
          to={quickAction.to}
          className="text-xs font-semibold text-forest-700 underline-offset-2 hover:underline"
        >
          {quickAction.label}
        </Link>
      ) : null}
    </div>
  )
}
