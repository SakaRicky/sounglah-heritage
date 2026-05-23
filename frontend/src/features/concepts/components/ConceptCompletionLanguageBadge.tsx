import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { conceptTextReviewStatusLabel } from '../../conceptTexts/utils/conceptTextLabels'
import type { ConceptCompletionLanguage } from '../types/concept.types'
import { isLanguageCompletionSatisfied } from '../utils/conceptCompletionLanguage'

type Props = {
  language: ConceptCompletionLanguage
  showCode?: boolean
  showCheckIcon?: boolean
  fullWidth?: boolean
  compact?: boolean
}

const reviewBadgeClass = {
  draft: 'border-sand-200 bg-stone-50 text-cocoa-body/75 shadow-sm',
  needs_review: 'border-gold-500/35 bg-gradient-to-br from-gold-400/15 to-gold-400/3 text-gold-700 shadow-sm',
  approved: 'border-forest-accent/30 bg-gradient-to-br from-forest-accent/12 to-forest-accent/3 text-forest-700 shadow-sm',
  rejected: 'border-terracotta-500/25 bg-gradient-to-br from-terracotta-400/12 to-terracotta-400/3 text-terracotta-600 shadow-sm',
} as const

const reviewDotClass = {
  draft: 'bg-cocoa-body/45 shadow-[0_0_8px_rgba(74,42,24,0.15)]',
  needs_review: 'bg-gold-500 shadow-[0_0_8px_rgba(221,187,136,0.6)] animate-pulse',
  approved: 'bg-forest-accent shadow-[0_0_8px_rgba(31,90,61,0.6)]',
  rejected: 'bg-terracotta-500 shadow-[0_0_8px_rgba(202,68,54,0.6)]',
} as const

function BadgeShell({
  children,
  className,
  fullWidth,
}: {
  children: ReactNode
  className: string
  fullWidth?: boolean
}) {
  return (
    <span
      className={[
        'items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
        fullWidth ? 'flex w-full justify-between' : 'inline-flex whitespace-nowrap',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export function ConceptCompletionLanguageBadge({
  language,
  showCode = false,
  showCheckIcon = false,
  fullWidth = false,
  compact = false,
}: Props) {
  const codePrefix = showCode ? `${language.languageCode}: ` : ''
  const compactContent = (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={[
          'h-2 w-2 rounded-full',
          !language.hasText || !language.textStatus
            ? reviewDotClass.rejected
            : isLanguageCompletionSatisfied(language)
              ? reviewDotClass.approved
              : language.requiresAudio && language.textStatus === 'approved' && !language.hasApprovedAudio
                ? reviewDotClass.needs_review
                : reviewDotClass[language.textStatus],
        ].join(' ')}
      />
      <span>{language.languageCode}</span>
      {showCheckIcon && isLanguageCompletionSatisfied(language) ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-forest-accent/15 text-forest-700">
          <Check className="h-3 w-3" aria-hidden />
        </span>
      ) : null}
    </span>
  )

  if (compact) {
    return (
      <BadgeShell
        fullWidth={fullWidth}
        className={[
          'px-2 py-[0.35rem] text-[11px]',
          !language.hasText || !language.textStatus
            ? 'border-terracotta-500/25 bg-terracotta-400/10 text-terracotta-600'
            : isLanguageCompletionSatisfied(language)
              ? reviewBadgeClass.approved
              : language.requiresAudio && language.textStatus === 'approved' && !language.hasApprovedAudio
                ? reviewBadgeClass.needs_review
                : reviewBadgeClass[language.textStatus],
        ].join(' ')}
      >
        {compactContent}
      </BadgeShell>
    )
  }

  if (!language.hasText || !language.textStatus) {
    return (
      <BadgeShell fullWidth={fullWidth} className="border-terracotta-500/25 bg-terracotta-400/10 text-terracotta-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-terracotta-500" />
          {codePrefix}
          Missing
        </span>
      </BadgeShell>
    )
  }

  if (isLanguageCompletionSatisfied(language)) {
    const label = compact
      ? (showCode ? language.languageCode : 'Present')
      : language.requiresConceptTextReview
        ? conceptTextReviewStatusLabel(language.textStatus!)
        : 'Present'

    return (
      <BadgeShell fullWidth={fullWidth} className={reviewBadgeClass.approved}>
        <span className="inline-flex items-center gap-2">
          <span className={['h-2 w-2 rounded-full', reviewDotClass.approved].join(' ')} />
          {codePrefix}
          {label}
        </span>
        {showCheckIcon ? (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-forest-accent/15 text-forest-700">
            <Check className="h-3 w-3" aria-hidden />
          </span>
        ) : null}
      </BadgeShell>
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
      <BadgeShell fullWidth={fullWidth} className={reviewBadgeClass.needs_review}>
        <span className="inline-flex items-center gap-2">
          <span className={['h-2 w-2 rounded-full', reviewDotClass.needs_review].join(' ')} />
          {codePrefix}
          {!compact ? label : ''}
        </span>
      </BadgeShell>
    )
  }

  const textStatus = language.textStatus!

  return (
    <BadgeShell fullWidth={fullWidth} className={reviewBadgeClass[textStatus]}>
      <span className="inline-flex items-center gap-2">
        <span className={['h-2 w-2 rounded-full', reviewDotClass[textStatus]].join(' ')} />
        {codePrefix}
        {!compact ? conceptTextReviewStatusLabel(textStatus) : ''}
      </span>
    </BadgeShell>
  )
}
