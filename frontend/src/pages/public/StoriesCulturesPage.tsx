import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { StoryCard } from '../../components/public/StoryCard'
import { LANDING_STORIES } from '../../content/stories'
import { useI18n } from '../../i18n'

export function StoriesCulturesPage() {
  const { t } = useI18n()
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div className="min-w-0 bg-cream-50 pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="section">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('stories.page.title')}</h1>
        <p className="mt-3 max-w-measure text-cocoa-700">
          {t('stories.page.description')}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {LANDING_STORIES.map((story) => (
            <div key={story.id} id={story.id} className="scroll-mt-28">
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
