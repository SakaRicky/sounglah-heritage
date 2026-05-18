export type LandingStory = {
  id: string
  title: string
  category: string
  readMinutes: number
  image: string
  alt: string
  /** Tailwind object-* utility for image crop */
  objectPosition?: string
}

/** Thumbnail on the middle “Stories & Culture” card; change to highlight a different story. */
export const FEATURED_STORY_ID = 'grandmas-advice'

export function formatStoryMeta(story: LandingStory): string {
  return `${story.category} • ${story.readMinutes} min`
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
    title: "Grandma's Advice",
    category: 'Family & Life',
    readMinutes: 5,
    image: '/images/hero/hero-family.png',
    alt: 'Grandmother and family sharing a quiet moment together outdoors',
    objectPosition: 'object-center',
  },
  {
    id: 'day-at-market',
    title: 'A Day at the Market',
    category: 'Culture',
    readMinutes: 4,
    image: '/images/stories/story-market.png',
    alt: 'Busy marketplace with vendors and families',
    objectPosition: 'object-center',
  },
  {
    id: 'talking-drum',
    title: 'The Talking Drum',
    category: 'Folk Tales',
    readMinutes: 6,
    image: '/images/stories/story-song.png',
    alt: 'Community gathered with drums, dancing, and music',
    objectPosition: 'object-center',
  },
  {
    id: 'why-the-moon-follows-us',
    title: 'Why the Moon Follows Us',
    category: 'Folk Tales',
    readMinutes: 5,
    image: '/images/stories/story-moon-transparent.png',
    alt: 'Elders and children storytelling by firelight under the moon',
    objectPosition: 'object-center',
  },
]
