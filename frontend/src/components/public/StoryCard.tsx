import { Link } from 'react-router-dom'

import { formatStoryMeta, type LandingStory } from '../../content/stories'
import { useI18n } from '../../i18n'

type StoryCardProps = {
  story: LandingStory
  variant?: 'default' | 'carousel'
}

export function StoryCard({ story, variant = 'default' }: StoryCardProps) {
  const { t } = useI18n()
  const objectPosition = story.objectPosition ?? 'object-center'

  if (variant === 'carousel') {
    return (
      <Link
        to={`/stories-cultures#${story.id}`}
        className="block w-[300px] overflow-hidden rounded-2xl border border-sand-100 bg-cream-50 transition hover:border-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-accent focus-visible:ring-offset-2 focus-visible:ring-offset-mint-band"
      >
        <img
          src={story.image}
          alt={t(story.altKey)}
          loading="lazy"
          className={`h-[8.4375rem] w-full object-cover ${objectPosition}`}
        />
        <div className="px-5 py-4">
          <h3 className="font-sans text-lg font-bold leading-tight text-cocoa-ink">
            {t(story.titleKey)}
          </h3>
          <p className="mt-2 text-sm text-cocoa-body">
            {t(story.categoryKey)}
            <span className="mx-2" aria-hidden>
              •
            </span>
            {story.readMinutes} min
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className="card overflow-hidden transition hover:shadow-card">
      <div className="aspect-[16/10] w-full overflow-hidden bg-cream-100">
        <img
          src={story.image}
          alt={t(story.altKey)}
          loading="lazy"
          className={`h-full w-full object-cover ${objectPosition}`}
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold">{t(story.titleKey)}</h3>
        <p className="text-sm text-cocoa-700">{formatStoryMeta(story, t)}</p>
      </div>
    </div>
  )
}
