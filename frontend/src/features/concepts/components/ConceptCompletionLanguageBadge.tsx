import { conceptTextReviewStatusLabel } from '../../conceptTexts/utils/conceptTextLabels'
import type { ConceptCompletionLanguage } from '../types/concept.types'
import { isLanguageCompletionSatisfied } from '../utils/conceptCompletionLanguage'

type Props = {
  language: ConceptCompletionLanguage
  showCode?: boolean
}

const reviewBadgeClass = {
  draft: 'border-sand-200 bg-stone-100 text-cocoa-body/70',
  needs_review: 'border-gold-500/30 bg-gold-400/15 text-gold-700',
  approved: 'border-forest-accent/25 bg-forest-accent/10 text-forest-700',
  rejected: 'border-terracotta-500/25 bg-terracotta-400/10 text-terracotta-600',
} as const

const reviewDotClass = {
  draft: 'bg-cocoa-body/45',
  needs_review: 'bg-gold-500',
  approved: 'bg-forest-accent',
  rejected: 'bg-terracotta-500',
} as const

export function ConceptCompletionLanguageBadge({ language, showCode = false }: Props) {
  if (!language.hasText || !language.textStatus) {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-terracotta-500/25 bg-terracotta-400/10 px-3 py-1.5 text-xs font-semibold text-terracotta-600">
        <span className="h-2 w-2 rounded-full bg-terracotta-500" />
        {showCode ? `${language.languageCode}: ` : ''}Missing
      </span>
    )
  }

  if (isLanguageCompletionSatisfied(language)) {
    const label = language.requiresConceptTextReview
      ? conceptTextReviewStatusLabel(language.textStatus!)
      : 'Present'

    return (
      <span
        className={[
          'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold',
          reviewBadgeClass.approved,
        ].join(' ')}
      >
        <span className={['h-2 w-2 rounded-full', reviewDotClass.approved].join(' ')} />
        {showCode ? `${language.languageCode}: ` : ''}
        {label}
      </span>
    )
  }

  if (
    language.requiresAudio &&
    language.textStatus === 'approved' &&
    !language.hasApprovedAudio
  ) {
    const label =
      language.audioStatus === 'pending_review'
        ? 'Audio pending'
        : language.audioStatus === 'rejected'
          ? 'Audio rejected'
          : 'Needs audio'

    return (
      <span
        className={[
          'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold',
          reviewBadgeClass.needs_review,
        ].join(' ')}
      >
        <span className={['h-2 w-2 rounded-full', reviewDotClass.needs_review].join(' ')} />
        {showCode ? `${language.languageCode}: ` : ''}
        {label}
      </span>
    )
  }

  const textStatus = language.textStatus!

  return (
    <span
      className={[
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold',
        reviewBadgeClass[textStatus],
      ].join(' ')}
    >
      <span className={['h-2 w-2 rounded-full', reviewDotClass[textStatus]].join(' ')} />
      {showCode ? `${language.languageCode}: ` : ''}
      {conceptTextReviewStatusLabel(textStatus)}
    </span>
  )
}
