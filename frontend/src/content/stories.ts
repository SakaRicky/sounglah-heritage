import type { TranslationKey } from '../i18n'

export type LandingStory = {
  id: string
  titleKey: TranslationKey
  categoryKey: TranslationKey
  readMinutes: number
  image: string
  altKey: TranslationKey
  /** Tailwind object-* utility for image crop */
  objectPosition?: string
}

/** Thumbnail on the middle “Stories & Culture” card; change to highlight a different story. */
export const FEATURED_STORY_ID = 'grandmas-advice'

export function formatStoryMeta(
  story: LandingStory,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string {
  return t('stories.meta', {
    category: t(story.categoryKey),
    minutes: story.readMinutes,
  })
}

export function getFeaturedStory(): LandingStory {
  const match = LANDING_STORIES.find((s) => s.id === FEATURED_STORY_ID)
  return match ?? LANDING_STORIES[0]
}

/** Rows in the middle card short list (first N stories). */
export function getStoriesPreview(count = 3): LandingStory[] {
  return LANDING_STORIES.slice(0, count)
}

export const LANDING_STORIES: LandingStory[] = [
  {
    id: 'grandmas-advice',
    titleKey: 'stories.grandmasAdvice.title',
    categoryKey: 'stories.grandmasAdvice.category',
    readMinutes: 5,
    image: '/images/hero/hero-family.png',
    altKey: 'stories.grandmasAdvice.alt',
    objectPosition: 'object-center',
  },
  {
    id: 'day-at-market',
    titleKey: 'stories.dayAtMarket.title',
    categoryKey: 'stories.dayAtMarket.category',
    readMinutes: 4,
    image: '/images/stories/story-market.png',
    altKey: 'stories.dayAtMarket.alt',
    objectPosition: 'object-center',
  },
  {
    id: 'talking-drum',
    titleKey: 'stories.talkingDrum.title',
    categoryKey: 'stories.talkingDrum.category',
    readMinutes: 6,
    image: '/images/stories/story-song.png',
    altKey: 'stories.talkingDrum.alt',
    objectPosition: 'object-center',
  },
  {
    id: 'why-the-moon-follows-us',
    titleKey: 'stories.moon.title',
    categoryKey: 'stories.moon.category',
    readMinutes: 5,
    image: '/images/stories/story-moon-transparent.png',
    altKey: 'stories.moon.alt',
    objectPosition: 'object-center',
  },
]
