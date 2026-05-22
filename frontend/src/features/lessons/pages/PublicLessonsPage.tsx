import { useMemo, useState } from 'react'

import { useI18n } from '../../../i18n'
import { PublicLessonCard } from '../components/PublicLessonCard'
import { usePublicLessonsList } from '../hooks/usePublicLessonsList'

const HERO_BG = '#FFF8EC'
const HERO_IMAGE_FADE = `linear-gradient(to right, rgba(255,248,236,0.96) 0%, rgba(255,248,236,0.72) 18%, rgba(255,248,236,0.34) 34%, rgba(255,248,236,0) 56%)`
const HERO_IMAGE_FADE_MOBILE = `linear-gradient(to bottom, ${HERO_BG} 0%, rgba(255,248,236,0.34) 38%, rgba(255,248,236,0) 92%)`

function SearchIcon() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0 text-cocoa-700/60" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.75" />
      <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function PublicLessonsPage() {
  const { t } = useI18n()
  const { lessons, loading, error, reload } = usePublicLessonsList()
  const [search, setSearch] = useState('')

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return lessons
    }

    return lessons.filter((lesson) => {
      const haystack = [lesson.title, lesson.description ?? '', lesson.slug].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [lessons, search])

  return (
    <div className="w-full min-w-0">
      <section
        className="relative overflow-hidden bg-cream-hero"
        aria-labelledby="lessons-hero-heading"
      >
        <div className="section relative flex flex-col lg:min-h-[280px] lg:flex-row lg:items-stretch lg:gap-6">
          <div className="relative z-10 flex w-full min-w-0 shrink-0 flex-col py-8 sm:py-10 lg:w-[min(55%,42rem)] lg:flex-none lg:justify-center lg:py-12">
            <h1
              id="lessons-hero-heading"
              className="font-serif text-4xl font-bold leading-tight text-cocoa-800 sm:text-5xl"
            >
              {t('public.lessons.hero.title')}
            </h1>
            <p className="mt-4 max-w-measure text-lg leading-relaxed text-cocoa-700">
              {t('public.lessons.hero.description')}
            </p>
          </div>

          <div className="relative z-0 hidden min-h-[220px] min-w-0 flex-1 lg:flex">
            <img
              src="/images/hero/hero-family.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{ backgroundImage: HERO_IMAGE_FADE }}
              aria-hidden
            />
          </div>

          <div className="relative z-0 -mt-2 block min-h-[200px] w-full min-w-0 lg:hidden">
            <img
              src="/images/hero/hero-family.png"
              alt={t('hero.familyAlt')}
              className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: HERO_IMAGE_FADE_MOBILE }}
              aria-hidden
            />
          </div>
        </div>
      </section>

      <div className="section py-8 sm:py-10 lg:py-12">
        <div className="max-w-3xl">
          <label htmlFor="lessons-search" className="sr-only">
            {t('public.lessons.search.label')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              id="lessons-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('public.lessons.search.placeholder')}
              className="w-full rounded-card border border-sand-200 bg-white py-3 pl-11 pr-4 text-base text-cocoa-800 shadow-soft placeholder:text-cocoa-700/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-cocoa-700" role="status">
            {t('public.lessons.loading')}
          </p>
        ) : null}

        {!loading && error ? (
          <div className="mt-10 rounded-card border border-sand-200 bg-cream-50/90 p-6 shadow-soft">
            <p className="text-cocoa-800">{error}</p>
            <button type="button" onClick={reload} className="btn-secondary mt-4 text-sm">
              {t('public.lessons.error.retry')}
            </button>
          </div>
        ) : null}

        {!loading && !error && lessons.length === 0 ? (
          <div className="mt-10 rounded-card border border-sand-200 bg-cream-50/90 p-8 text-center shadow-soft">
            <h2 className="text-2xl font-bold text-cocoa-800">{t('public.lessons.empty.title')}</h2>
            <p className="mt-3 text-cocoa-700">{t('public.lessons.empty.description')}</p>
          </div>
        ) : null}

        {!loading && !error && lessons.length > 0 && filteredLessons.length === 0 ? (
          <div className="mt-10 rounded-card border border-sand-200 bg-cream-50/90 p-8 text-center shadow-soft">
            <h2 className="text-2xl font-bold text-cocoa-800">{t('public.lessons.search.emptyTitle')}</h2>
            <p className="mt-3 text-cocoa-700">{t('public.lessons.search.emptyDescription')}</p>
          </div>
        ) : null}

        {!loading && !error && filteredLessons.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <PublicLessonCard key={lesson.slug} lesson={lesson} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
