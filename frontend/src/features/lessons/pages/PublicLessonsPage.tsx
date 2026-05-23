import { useMemo, useState } from 'react'

import { useI18n } from '../../../i18n'
import { PublicLessonCard } from '../components/PublicLessonCard'
import { usePublicLessonsList } from '../hooks/usePublicLessonsList'

function SearchIcon() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0 text-cocoa-700/60" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.75" />
      <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg className="mr-2 inline h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  )
}

const CATEGORIES = [
  { id: 'all', label: 'All lessons' },
  { id: 'greetings', label: 'Greetings', keywords: ['greet', 'hello', 'saying', 'ask', 'respond', 'evening', 'morning', 'welcome', 'how are you'] },
  { id: 'family', label: 'Family', keywords: ['family', 'grandma', 'grandpa', 'father', 'mother', 'child', 'brother', 'sister'] },
  { id: 'numbers', label: 'Numbers', keywords: ['number', 'one', 'two', 'three', 'count', 'digit', 'fruits'] },
  { id: 'daily-life', label: 'Daily life', keywords: ['daily', 'life', 'fruit', 'food', 'market', 'buy', 'sell', 'eat', 'drink'] },
  { id: 'time-dates', label: 'Time & dates', keywords: ['time', 'date', 'day', 'night', 'evening', 'hour', 'minute', 'month', 'year'] },
  { id: 'culture', label: 'Culture', keywords: ['culture', 'tradition', 'heritage', 'music', 'dance', 'history'] },
]

export function PublicLessonsPage() {
  const { t } = useI18n()
  const { lessons, loading, error, reload } = usePublicLessonsList()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredLessons = useMemo(() => {
    let list = lessons

    // Apply category keywords filter
    if (selectedCategory !== 'all') {
      const activeCat = CATEGORIES.find((c) => c.id === selectedCategory)
      if (activeCat && activeCat.keywords) {
        list = list.filter((lesson) => {
          const haystack = [lesson.title, lesson.description ?? '', lesson.slug].join(' ').toLowerCase()
          return activeCat.keywords!.some((keyword) => haystack.includes(keyword))
        })
      }
    }

    // Apply search query filter
    const query = search.trim().toLowerCase()
    if (!query) {
      return list
    }

    return list.filter((lesson) => {
      const haystack = [lesson.title, lesson.description ?? '', lesson.slug].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [lessons, search, selectedCategory])

  const renderTitle = () => {
    const title = t('public.lessons.hero.title')
    if (title.includes('Médumba')) {
      const parts = title.split('Médumba')
      return (
        <>
          {parts[0]}
          <span className="relative inline-block whitespace-nowrap">
            Médumba
            {/* Hand-drawn style decorative sparkles */}
            <span className="absolute -right-7 -top-2.5 h-6 w-6 select-none pointer-events-none z-10 animate-pulse text-terracotta-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                {/* Custom dual hand-drawn curves/sparks matching the design */}
                <path
                  d="M4 11C7 11 9 9 9 5C9 9 11 11 14 11C11 11 9 13 9 17C9 13 7 11 4 11Z"
                  fill="currentColor"
                  className="text-terracotta-400"
                />
                <path
                  d="M15 5C17 5 18 4 18 2C18 4 19 5 21 5C19 5 18 6 18 8C18 6 17 5 15 5Z"
                  fill="currentColor"
                  className="text-gold-star"
                />
              </svg>
            </span>
          </span>
          {parts.slice(1).join('Médumba')}
        </>
      )
    }
    return title
  }

  return (
    <div className="w-full min-w-0 bg-cream-50">
      {/* Redesigned Hero Section */}
      <section
        className="relative overflow-hidden bg-cream-hero pb-8 pt-4"
        aria-labelledby="lessons-hero-heading"
      >
        <div className="section relative flex flex-row items-center justify-between gap-6 py-6 sm:py-8 lg:py-10">
          
          {/* Left Text Column */}
          <div className="relative z-10 flex flex-1 flex-col justify-center pr-2 sm:pr-6 lg:max-w-[55%]">
            <h1
              id="lessons-hero-heading"
              className="font-serif text-3xl font-bold leading-tight text-cocoa-800 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {renderTitle()}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-cocoa-700 sm:mt-4 sm:text-base md:text-lg">
              {t('public.lessons.hero.description')}
            </p>
          </div>

          {/* Right Family & Leaf Illustration Column */}
          <div className="relative shrink-0 w-[42%] sm:w-[38%] md:w-[35%] max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] flex items-center justify-center select-none">
            {/* Seamless Pre-rendered Hero Illustration (containing family, leaves and glow) */}
            <img
              src="/images/lesson-listing-hero.png"
              alt={t('hero.familyAlt')}
              className="relative z-10 w-full h-auto max-h-[180px] sm:max-h-[240px] md:max-h-[300px] lg:max-h-[340px] object-contain select-none pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* Main Listing Section wrapped in the premium white card container */}
      <div className="section relative z-20 -mt-6 pb-16">
        <div className="bg-white border border-sand-100 rounded-card shadow-soft p-5 sm:p-6 lg:p-8">
          
          {/* Search bar & Filter Dropdown */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
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
            
            <button
              type="button"
              className="btn-secondary flex items-center justify-center gap-2 rounded-card border border-sand-200 bg-white px-5 py-3 text-base text-cocoa-800 shadow-soft hover:bg-cream-50/50 shrink-0 font-medium self-stretch sm:self-auto"
            >
              {/* Filter Icon */}
              <svg className="h-5 w-5 text-cocoa-700/60" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M3 5h14M5 10h10M8 15h4" strokeLinecap="round" />
              </svg>
              <span>Filter</span>
              {/* Chevron Down */}
              <svg className="h-4 w-4 text-cocoa-700/60" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Interactive Categories Chips Horizontal Scroller */}
          <div className="relative mt-6 flex items-center">
            <div className="flex-1 overflow-x-auto scrollbar-none flex gap-2.5 pb-1 select-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition shrink-0 ${
                      isActive
                        ? 'bg-forest-700 text-white shadow-sm'
                        : 'bg-white border border-sand-100 text-cocoa-700 hover:bg-cream-100/30'
                    }`}
                  >
                    {cat.id === 'all' && <GridIcon />}
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
            {/* Right Side fading gradient mask */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent" />
            <button
              type="button"
              className="relative z-10 ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-sand-100 text-cocoa-700 shadow-sm hover:bg-cream-50 shrink-0"
              onClick={() => {
                const container = document.querySelector('.scrollbar-none')
                if (container) {
                  container.scrollBy({ left: 140, behavior: 'smooth' })
                }
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6l6 4-6 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Loading, Error & Empty States */}
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

          {/* Lesson Cards Grid */}
          {!loading && !error && filteredLessons.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in">
              {filteredLessons.map((lesson) => (
                <PublicLessonCard key={lesson.slug} lesson={lesson} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
