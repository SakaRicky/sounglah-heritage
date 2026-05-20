import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { HERITAGE_LANGUAGES } from '../../content/languages'
import { useI18n } from '../../i18n'
import { LanguageHeritageCard } from './LanguageHeritageCard'

const SCROLLER_ID = 'explore-languages-scroll'

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {direction === 'left' ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  )
}

export function ExploreLanguagesSection() {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const max = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft < max - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-language-card]')
    const delta = card?.offsetWidth
      ? card.offsetWidth + 16
      : Math.min(el.clientWidth * 0.85, 320)
    el.scrollBy({ left: direction * delta, behavior: 'smooth' })
  }

  return (
    <section
      id="languages"
      aria-labelledby="explore-languages-heading"
      className="section pb-6 sm:py-14 lg:py-20"
    >
      <div className="mx-auto max-w-measure text-center">
        <h2
          id="explore-languages-heading"
          className="text-2xl font-bold sm:text-3xl"
        >
          {t('languages.explore.title')}
        </h2>
        <p className="mt-2 text-cocoa-700">
          {t('languages.explore.description')}
        </p>
        <div className="mt-4">
          <Link
            to="/languages"
            className="text-sm font-semibold text-forest-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            {t('languages.explore.viewAll')}
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-stretch gap-2 sm:mt-10 md:gap-3">
        <button
          type="button"
          aria-label={t('languages.scrollLeft')}
          aria-controls={SCROLLER_ID}
          disabled={!canScrollLeft}
          onClick={() => scrollByAmount(-1)}
          className="hidden min-h-[44px] min-w-[44px] shrink-0 items-center justify-center self-center rounded-full border border-sand-100 bg-cream-50/95 text-cocoa-800 shadow-soft transition hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-35 md:flex"
        >
          <ChevronIcon direction="left" />
        </button>

        <div className="min-w-0 flex-1">
          <div
            ref={scrollRef}
            id={SCROLLER_ID}
            role="region"
            aria-label={t('languages.region')}
            tabIndex={0}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollPaddingInline: '0.25rem' }}
          >
            {HERITAGE_LANGUAGES.map((language) => {
              const { id, ...card } = language
              return (
                <div
                  key={id}
                  data-language-card
                  className="snap-start shrink-0 flex-none basis-[85vw] max-w-[20rem] sm:basis-[min(22rem,calc(100vw-5rem))] md:basis-[calc((100%-3rem)/4)] md:max-none lg:basis-[calc((100%-4rem)/5)]"
                >
                  <LanguageHeritageCard {...card} />
                </div>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label={t('languages.scrollRight')}
          aria-controls={SCROLLER_ID}
          disabled={!canScrollRight}
          onClick={() => scrollByAmount(1)}
          className="hidden min-h-[44px] min-w-[44px] shrink-0 items-center justify-center self-center rounded-full border border-sand-100 bg-cream-50/95 text-cocoa-800 shadow-soft transition hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-35 md:flex"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </section>
  )
}
