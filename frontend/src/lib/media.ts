const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api'

function apiOrigin() {
  return new URL(API_BASE_URL).origin
}

export function resolveMediaUrl(src?: string | null) {
  if (!src) {
    return null
  }

  if (/^[a-z]+:/i.test(src)) {
    return src
  }

  if (src.startsWith('/media/')) {
    return `${apiOrigin()}${src}`
  }

  return src
}

export function resolveConceptPlaceholderUrl(key?: string | null) {
  if (!key) {
    return '/images/artifacts/sounglah_artifact_01.png'
  }

  // Generate a stable index between 1 and 10 based on the key characters
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash % 10) + 1
  const suffix = String(index).padStart(2, '0')
  return `/images/artifacts/sounglah_artifact_${suffix}.png`
}

export function resolveLessonCoverUrl(slug: string, coverImageUrl?: string | null): string {
  if (coverImageUrl) {
    const resolved = resolveMediaUrl(coverImageUrl)
    if (resolved) return resolved
  }

  // Pre-seed fallbacks for local dev based on lesson slugs
  switch (slug) {
    case 'greetings-kindness':
      return '/images/languages/medumba.png' // Family scene
    case 'food-eating':
      return '/images/stories/story-market.png' // Market scene
    case 'home-daily-actions':
      return '/images/languages/fefe.png' // Children scene
    case 'emotions-encouragement':
      return '/images/languages/yemba.png'
    case 'numbers-counting':
      return '/images/languages/bassa.png'
    case 'animals-around-us':
      return '/images/stories/story-moon-transparent.png'
    case 'nature-weather':
      return '/images/languages/duala.png'
    case 'school-learning':
      return '/images/lessons-listing-hero.png'
    case 'community-culture':
      return '/images/stories/story-song.png'
    default:
      return '/images/languages/medumba.png'
  }
}

