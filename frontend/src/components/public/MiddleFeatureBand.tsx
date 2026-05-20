import { Link } from 'react-router-dom'

import {
  formatStoryMeta,
  getFeaturedStory,
  getStoriesPreview,
} from '../../content/stories'
import { useI18n } from '../../i18n'

const CONTINUE_PROGRESS = 60
const DAILY_DONE = 3
const DAILY_TARGET = 5
const DAILY_PERCENT = Math.round((DAILY_DONE / DAILY_TARGET) * 100)
/** Circumference for SVG circle r=15.5 (viewBox 36×36) */
const DAILY_RING_C = 2 * Math.PI * 15.5

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 6v14" />
    </svg>
  )
}

export function MiddleFeatureBand() {
  const { t } = useI18n()
  const featured = getFeaturedStory()
  const preview = getStoriesPreview(3)
  const thumbPosition = featured.objectPosition ?? 'object-center'

  return (
    <section
      className="w-full bg-mint-band py-12 sm:py-14 lg:py-16"
      aria-labelledby="middle-feature-heading"
    >
      <div className="section">
        <h2 id="middle-feature-heading" className="sr-only">
          {t('middle.heading')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Continue Learning */}
          <div className="card flex flex-col p-5 sm:p-6">
            <h3 className="text-lg font-bold text-cocoa-ink sm:text-xl">
              {t('middle.continue.title')}
            </h3>
            <p className="mt-1 text-sm font-semibold text-cocoa-body">
              {t('middle.continue.lesson')}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-cocoa-700">
                <span>{t('middle.continue.progress')}</span>
                <span>{CONTINUE_PROGRESS}%</span>
              </div>
              <div
                className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-sand-100"
                role="progressbar"
                aria-valuenow={CONTINUE_PROGRESS}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('middle.continue.progressLabel')}
              >
                <div
                  className="h-full rounded-full bg-forest-accent transition-[width]"
                  style={{ width: `${CONTINUE_PROGRESS}%` }}
                />
              </div>
            </div>
            <div className="mt-auto pt-6">
              <Link
                to="/login"
                className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-cta py-3 text-sm font-semibold no-underline"
              >
                {t('middle.continue.cta')}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Stories & Culture */}
          <div className="card flex flex-col overflow-hidden p-0 sm:p-0">
            <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-cream-100">
              <img
                src={featured.image}
                alt={t(featured.altKey)}
                loading="lazy"
                className={`h-full w-full object-cover ${thumbPosition}`}
              />
            </div>
            <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <h3 className="text-lg font-bold text-cocoa-ink sm:text-xl">
                {t('stories.section.title')}
              </h3>
              <p className="mt-1 text-sm text-cocoa-700">
                {t('stories.section.description')}
              </p>
              <ul className="mt-4 flex flex-col gap-2 border-t border-sand-100/80 pt-4">
                {preview.map((story) => (
                  <li key={story.id}>
                    <Link
                      to={`/stories-cultures#${story.id}`}
                      className="group block rounded-soft px-1 py-1 transition hover:bg-cream-100/80"
                    >
                      <span className="block font-semibold text-cocoa-ink group-hover:text-forest-accent">
                        {t(story.titleKey)}
                      </span>
                      <span className="text-xs text-cocoa-700">
                        {formatStoryMeta(story, t)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <Link
                  to="/stories-cultures"
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-cta py-3 text-sm font-semibold no-underline"
                >
                  <BookIcon className="shrink-0 text-white" />
                  {t('stories.section.explore')}
                </Link>
              </div>
            </div>
          </div>

          {/* Daily goal */}
          <div className="card flex flex-col p-5 sm:p-6">
            <h3 className="text-lg font-bold text-cocoa-ink sm:text-xl">
              {t('middle.goal.title')}
            </h3>
            <p className="mt-1 text-sm text-cocoa-700">
              {t('middle.goal.description')}
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div
                className="relative grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center"
                role="progressbar"
                aria-valuenow={DAILY_DONE}
                aria-valuemin={0}
                aria-valuemax={DAILY_TARGET}
                aria-label={t('middle.goal.aria')}
              >
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 36 36"
                  aria-hidden
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-sand-100"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-forest-accent"
                    strokeWidth="3"
                    strokeDasharray={`${
                      (DAILY_DONE / DAILY_TARGET) * DAILY_RING_C
                    } ${DAILY_RING_C}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="relative text-center text-sm font-bold text-cocoa-ink">
                  {DAILY_DONE}/{DAILY_TARGET}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-cocoa-body">
                  {t('middle.goal.lessonsToday')}
                </p>
                <p className="mt-1 text-xs text-cocoa-700">
                  {t('middle.goal.remaining', { count: DAILY_TARGET - DAILY_DONE })}
                </p>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-forest-accent"
                    style={{ width: `${DAILY_PERCENT}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <Link
                to="/login"
                className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-cta py-3 text-sm font-semibold no-underline"
              >
                {t('middle.goal.cta')}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
