import type { TranslationKey } from '../i18n'

export type HeritageLanguageAvailability = 'available' | 'coming_soon'

export type HeritageLanguage = {
  id: string
  name: string
  nativeName: string
  image: string
  altKey: TranslationKey
  objectPosition: string
  availability: HeritageLanguageAvailability
  /** Present when `availability` is `available` (e.g. in-app destination). */
  ctaHref?: string
}

export const HERITAGE_LANGUAGES: HeritageLanguage[] = [
  {
    id: 'medumba',
    name: 'Médumba',
    nativeName: '(Yédùmba)',
    image: '/images/languages/medumba.png',
    altKey: 'languages.medumba.alt',
    objectPosition: 'object-center',
    availability: 'available',
    ctaHref: '/lessons',
  },
  {
    id: 'fefe',
    name: 'Fe’efe’e',
    nativeName: '(Nufi)',
    image: '/images/languages/fefe.png',
    altKey: 'languages.fefe.alt',
    objectPosition: 'object-[center_35%]',
    availability: 'coming_soon',
  },
  {
    id: 'yemba',
    name: 'Yemba',
    nativeName: '(Dschang)',
    image: '/images/languages/yemba.png',
    altKey: 'languages.yemba.alt',
    objectPosition: 'object-[center_40%]',
    availability: 'coming_soon',
  },
  {
    id: 'duala',
    name: 'Duala',
    nativeName: '(Mundu)',
    image: '/images/languages/duala.png',
    altKey: 'languages.duala.alt',
    objectPosition: 'object-center',
    availability: 'coming_soon',
  },
  {
    id: 'bassa',
    name: 'Bassa',
    nativeName: '(Ɓasaá)',
    image: '/images/languages/bassa.png',
    altKey: 'languages.bassa.alt',
    objectPosition: 'object-[center_42%]',
    availability: 'coming_soon',
  },
]
