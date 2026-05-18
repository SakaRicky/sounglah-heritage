import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { LANDING_STORIES } from '../../content/stories'
import { StoryCard } from './StoryCard'

const SCROLLER_ID = 'stories-culture-scroll'

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

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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

const arrowButtonClass =
  'hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sand-100 bg-cream-50 text-cocoa-ink transition hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-35 md:flex'

export function StoriesCultureSection() {
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
    const card = el.querySelector<HTMLElement>('[data-story-card]')
    const delta = card?.offsetWidth
      ? card.offsetWidth + 24
      : Math.min(el.clientWidth * 0.85, 300)
    el.scrollBy({ left: direction * delta, behavior: 'smooth' })
  }

  return (
    <section
      id="stories"
      aria-labelledby="stories-culture-heading"
      className="w-full bg-mint-band py-8 sm:py-10"
    >
      <div className="mx-auto flex max-w-[90.625rem] flex-col gap-8 px-6 md:flex-row md:items-center md:px-8 lg:px-10">
        <div className="w-full shrink-0 md:w-[250px]">
          <h2
            id="stories-culture-heading"
            className="font-sans text-[1.875rem] font-bold leading-tight text-cocoa-ink"
          >
            Stories &amp; Culture
          </h2>

          <p className="mt-4 max-w-[260px] text-[0.9375rem] leading-7 text-cocoa-body">
            Discover stories, traditions, and the beauty of our people.
          </p>

          <Link
            to="/stories-cultures"
            className="btn-primary mt-6 inline-flex items-center gap-3 rounded-cta px-6 py-4 text-sm font-semibold no-underline"
          >
            <BookIcon className="shrink-0 text-white" />
            Explore Stories
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label="Previous stories"
            aria-controls={SCROLLER_ID}
            disabled={!canScrollLeft}
            onClick={() => scrollByAmount(-1)}
            className={arrowButtonClass}
          >
            <ChevronIcon direction="left" />
          </button>

          <div className="min-w-0 flex-1">
            <div
              ref={scrollRef}
              id={SCROLLER_ID}
              role="region"
              aria-label="Story previews"
              tabIndex={0}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {LANDING_STORIES.map((story) => (
                <div
                  key={story.id}
                  data-story-card
                  className="shrink-0 snap-start"
                >
                  <StoryCard story={story} variant="carousel" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Next stories"
            aria-controls={SCROLLER_ID}
            disabled={!canScrollRight}
            onClick={() => scrollByAmount(1)}
            className={arrowButtonClass}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  )
}
