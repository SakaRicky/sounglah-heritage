import { Link } from 'react-router-dom'

import { useI18n } from '../../../i18n'
import { resolveMediaUrl } from '../../../lib/media'
import type { PublicLessonListItem } from '../types/publicLesson.types'

const FALLBACK_COVER = '/images/languages/medumba.png'

type PublicLessonCardProps = {
  lesson: PublicLessonListItem
}

function DifficultyIcon() {
  return (
    <svg aria-hidden className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="10" width="3" height="5" rx="0.5" fill="currentColor" opacity="0.45" />
      <rect x="6" y="7" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="11" y="4" width="3" height="11" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg aria-hidden className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ItemsIcon() {
  return (
    <svg aria-hidden className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 4.5h10M3 8h10M3 11.5h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PublicLessonCard({ lesson }: PublicLessonCardProps) {
  const { t } = useI18n()

  const coverAlt =
    lesson.coverImageAltText?.trim() ||
    t('public.lessons.card.coverFallbackAlt', { title: lesson.title })

  const difficultyLabel = t(`admin.lessons.difficulty.${lesson.difficulty}`)

  const timeLabel =
    lesson.estimatedMinutes != null
      ? t('public.lessons.card.estimatedMinutes', { count: lesson.estimatedMinutes })
      : t('public.lessons.card.timeUnknown')

  const itemsLabel =
    lesson.activeItemCount === 1
      ? t('public.lessons.card.oneItem')
      : t('public.lessons.card.itemCount', { count: lesson.activeItemCount })

  return (
    <article className="card flex h-full flex-col overflow-hidden transition hover:shadow-soft">
      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-cream-100">
        <img
          src={resolveMediaUrl(lesson.coverImageUrl) ?? FALLBACK_COVER}
          alt={coverAlt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-bold leading-snug text-cocoa-800">{lesson.title}</h2>

        {lesson.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cocoa-700">{lesson.description}</p>
        ) : null}

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-cocoa-700">
          <li className="inline-flex items-center gap-1.5">
            <DifficultyIcon />
            <span>{difficultyLabel}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <ClockIcon />
            <span>{timeLabel}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <ItemsIcon />
            <span>{itemsLabel}</span>
          </li>
        </ul>

        <div className="mt-5">
          <Link
            to={`/lessons/${lesson.slug}`}
            className="btn-primary inline-flex w-full items-center justify-center rounded-cta px-5 py-2.5 text-sm"
          >
            {t('public.lessons.card.open')}
          </Link>
        </div>
      </div>
    </article>
  )
}
