export type HeritageLanguageAvailability = 'available' | 'coming_soon'

export type HeritageLanguage = {
  id: string
  name: string
  nativeName: string
  image: string
  alt: string
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
    alt: 'A family moment representing Médumba language learning',
    objectPosition: 'object-center',
    availability: 'available',
    ctaHref: '/languages#medumba',
  },
  {
    id: 'fefe',
    name: 'Fe’efe’e',
    nativeName: '(Nufi)',
    image: '/images/languages/fefe.png',
    alt: 'Children practicing Fe’efe’e together',
    objectPosition: 'object-[center_35%]',
    availability: 'coming_soon',
  },
  {
    id: 'yemba',
    name: 'Yemba',
    nativeName: '(Dschang)',
    image: '/images/languages/yemba.png',
    alt: 'Community heritage scene representing Yemba language',
    objectPosition: 'object-[center_40%]',
    availability: 'coming_soon',
  },
  {
    id: 'duala',
    name: 'Duala',
    nativeName: '(Mundu)',
    image: '/images/languages/duala.png',
    alt: 'Family learning setup for Duala language',
    objectPosition: 'object-center',
    availability: 'coming_soon',
  },
  {
    id: 'bassa',
    name: 'Bassa',
    nativeName: '(Ɓasaá)',
    image: '/images/languages/bassa.png',
    alt: 'Cultural learning visuals for Bassa language lessons',
    objectPosition: 'object-[center_42%]',
    availability: 'coming_soon',
  },
]
