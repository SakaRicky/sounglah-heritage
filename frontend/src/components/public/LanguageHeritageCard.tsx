import { Link } from 'react-router-dom'

import type { HeritageLanguage } from '../../content/languages'
import { useI18n } from '../../i18n'

export type LanguageHeritageCardProps = Omit<HeritageLanguage, 'id'>

export function LanguageHeritageCard({
  name,
  nativeName,
  image,
  altKey,
  objectPosition,
  availability,
  ctaHref,
}: LanguageHeritageCardProps) {
  const { t } = useI18n()

  return (
    <article className="card flex h-full flex-col overflow-hidden transition hover:shadow-card">
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-cream-100">
        <img
          src={image}
          alt={t(altKey)}
          loading="lazy"
          className={`h-full w-full object-cover ${objectPosition}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-5 text-center">
        <h3 className="font-bold text-cocoa-800">{name}</h3>
        <p className="text-sm text-cocoa-700">{nativeName}</p>
        <div className="mt-auto pt-3">
          {availability === 'available' && ctaHref ? (
            <Link
              to={ctaHref}
              className="text-sm font-semibold text-forest-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
            >
              {t('common.startLearningArrow')}
            </Link>
          ) : (
            <span className="text-sm text-cocoa-700/75">{t('common.comingSoon')}</span>
          )}
        </div>
      </div>
    </article>
  )
}
