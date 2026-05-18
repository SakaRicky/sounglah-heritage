import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { LanguageHeritageCard } from '../../components/public/LanguageHeritageCard'
import { HERITAGE_LANGUAGES } from '../../content/languages'

export function LanguagesPage() {
  const location = useLocation()

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '')
    if (!raw) return
    requestAnimationFrame(() => {
      document.getElementById(raw)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [location.hash])

  return (
    <div className="section py-12 sm:py-14 lg:py-20">
      <h1 className="text-3xl font-bold sm:text-4xl">Heritage languages</h1>
      <p className="mt-3 max-w-measure text-cocoa-700">
        Sounglah is starting with Médumba and will welcome more heritage languages
        over time. Browse the roadmap below.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HERITAGE_LANGUAGES.map((language) => {
          const { id, ...card } = language
          return (
            <div key={id} id={id} className="scroll-mt-28">
              <LanguageHeritageCard {...card} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
