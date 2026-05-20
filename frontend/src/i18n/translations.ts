export const supportedLocales = ['en', 'fr'] as const

export type Locale = (typeof supportedLocales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
}

export const defaultLocale: Locale = 'en'

export const translations = {
  en: {
    'common.admin': 'Admin',
    'common.comingSoon': 'Coming soon',
    'common.email': 'Email',
    'common.language': 'Language',
    'common.login': 'Login',
    'common.password': 'Password',
    'common.signUp': 'Sign up',
    'common.startLearning': 'Start learning',
    'common.startLearningArrow': 'Start learning ->',

    'nav.about': 'About Us',
    'nav.account': 'Account',
    'nav.blog': 'Blog',
    'nav.closeMenu': 'Close menu',
    'nav.home': 'Home',
    'nav.languages': 'Languages',
    'nav.logout': 'Log out',
    'nav.openMenu': 'Open menu',
    'nav.primary': 'Primary',
    'nav.primaryPages': 'Primary pages',
    'nav.siteNavigation': 'Site navigation',
    'nav.stories': 'Stories',
    'nav.tagline': 'Speak it. Live it. Keep it alive.',
    'nav.sounglahHome': 'Sounglah home',

    'footer.tagline': 'Sounglah - heritage language learning for families.',

    'hero.desktopTitleLine1': 'Their language.',
    'hero.desktopTitleLine2': 'Their future.',
    'hero.description':
      'Sounglah helps children of the diaspora learn and speak their mother tongue through fun lessons, stories, and everyday conversations.',
    'hero.exploreLanguages': 'Explore languages',
    'hero.familyAlt':
      'A mother, child, and grandfather learning together on a tablet',
    'hero.ratingLabel': '5 out of 5 stars',
    'hero.socialProof': 'Loved by 1,000+ families',

    'languages.explore.title': 'Explore our languages',
    'languages.explore.description': 'Starting with Médumba. Many more coming soon.',
    'languages.explore.viewAll': 'View all languages',
    'languages.scrollLeft': 'Scroll languages left',
    'languages.scrollRight': 'Scroll languages right',
    'languages.region': 'Heritage languages',
    'languages.page.title': 'Heritage languages',
    'languages.page.description':
      'Sounglah is starting with Médumba and will welcome more heritage languages over time. Browse the roadmap below.',
    'languages.medumba.alt':
      'A family moment representing Médumba language learning',
    'languages.fefe.alt': "Children practicing Fe'efe'e together",
    'languages.yemba.alt': 'Community heritage scene representing Yemba language',
    'languages.duala.alt': 'Family learning setup for Duala language',
    'languages.bassa.alt': 'Cultural learning visuals for Bassa language lessons',

    'stories.section.title': 'Stories & Culture',
    'stories.section.description':
      'Discover stories, traditions, and the beauty of our people.',
    'stories.section.explore': 'Explore stories',
    'stories.scrollPrevious': 'Previous stories',
    'stories.scrollNext': 'Next stories',
    'stories.region': 'Story previews',
    'stories.page.title': 'Stories & culture',
    'stories.page.description':
      'Short cultural stories for family learning moments - read together, speak together, and pass on what matters.',
    'stories.meta': '{category} • {minutes} min',
    'stories.grandmasAdvice.title': "Grandma's Advice",
    'stories.grandmasAdvice.category': 'Family & Life',
    'stories.grandmasAdvice.alt':
      'Grandmother and family sharing a quiet moment together outdoors',
    'stories.dayAtMarket.title': 'A Day at the Market',
    'stories.dayAtMarket.category': 'Culture',
    'stories.dayAtMarket.alt': 'Busy marketplace with vendors and families',
    'stories.talkingDrum.title': 'The Talking Drum',
    'stories.talkingDrum.category': 'Folk Tales',
    'stories.talkingDrum.alt':
      'Community gathered with drums, dancing, and music',
    'stories.moon.title': 'Why the Moon Follows Us',
    'stories.moon.category': 'Folk Tales',
    'stories.moon.alt':
      'Elders and children storytelling by firelight under the moon',

    'middle.heading': 'Continue learning, stories, and your daily goal',
    'middle.continue.title': 'Continue learning',
    'middle.continue.lesson': 'Greetings & introductions',
    'middle.continue.progress': 'Your progress',
    'middle.continue.progressLabel': 'Lesson progress',
    'middle.continue.cta': 'Continue lesson',
    'middle.goal.title': 'Daily goal',
    'middle.goal.description': 'Small steps add up for your family.',
    'middle.goal.aria': 'Lessons completed today',
    'middle.goal.lessonsToday': 'Lessons today',
    'middle.goal.remaining': '{count} to go to hit your goal.',
    'middle.goal.cta': "Log today's lesson",

    'why.eyebrow': 'Built for heritage learning',
    'why.title': 'Why Sounglah',
    'why.description':
      'Sounglah helps families pass language, culture, and identity from one generation to the next through simple, joyful lessons made for children and parents.',
    'why.explore': 'Explore languages',
    'why.benefit.culture.title': 'Cultural connection',
    'why.benefit.culture.description':
      'Stories and lessons rooted in heritage, family life, and everyday conversations.',
    'why.benefit.child.title': 'Child-friendly pace',
    'why.benefit.child.description':
      "Short lessons designed to respect children's attention, curiosity, and joy.",
    'why.benefit.family.title': 'Family-centered',
    'why.benefit.family.description':
      'Built for parents, grandparents, and children learning together across generations.',

    'login.title': 'Admin login',
    'login.description': 'Access the Sounglah content management area.',
    'login.error': 'Unable to sign in. Please try again.',
    'login.submitting': 'Signing in...',
  },
  fr: {
    'common.admin': 'Admin',
    'common.comingSoon': 'Bientôt disponible',
    'common.email': 'Adresse courriel',
    'common.language': 'Langue',
    'common.login': 'Connexion',
    'common.password': 'Mot de passe',
    'common.signUp': "S'inscrire",
    'common.startLearning': 'Commencer à apprendre',
    'common.startLearningArrow': 'Commencer à apprendre ->',

    'nav.about': 'À propos',
    'nav.account': 'Compte',
    'nav.blog': 'Blogue',
    'nav.closeMenu': 'Fermer le menu',
    'nav.home': 'Accueil',
    'nav.languages': 'Langues',
    'nav.logout': 'Déconnexion',
    'nav.openMenu': 'Ouvrir le menu',
    'nav.primary': 'Navigation principale',
    'nav.primaryPages': 'Pages principales',
    'nav.siteNavigation': 'Navigation du site',
    'nav.stories': 'Histoires',
    'nav.tagline': 'Parle-la. Vis-la. Garde-la vivante.',
    'nav.sounglahHome': 'Accueil Sounglah',

    'footer.tagline': 'Sounglah - apprentissage des langues héritées en famille.',

    'hero.desktopTitleLine1': 'Leur langue.',
    'hero.desktopTitleLine2': 'Leur avenir.',
    'hero.description':
      'Sounglah aide les enfants de la diaspora à apprendre et parler leur langue maternelle grâce à des leçons amusantes, des histoires et des conversations du quotidien.',
    'hero.exploreLanguages': 'Explorer les langues',
    'hero.familyAlt':
      'Une mère, un enfant et un grand-père apprennent ensemble avec une tablette',
    'hero.ratingLabel': '5 étoiles sur 5',
    'hero.socialProof': 'Aimé par plus de 1 000 familles',

    'languages.explore.title': 'Explorer nos langues',
    'languages.explore.description': 'On commence avec le Médumba. Beaucoup d’autres arrivent bientôt.',
    'languages.explore.viewAll': 'Voir toutes les langues',
    'languages.scrollLeft': 'Faire défiler les langues vers la gauche',
    'languages.scrollRight': 'Faire défiler les langues vers la droite',
    'languages.region': 'Langues héritées',
    'languages.page.title': 'Langues héritées',
    'languages.page.description':
      'Sounglah commence avec le Médumba et accueillera d’autres langues héritées au fil du temps. Parcourez la feuille de route ci-dessous.',
    'languages.medumba.alt':
      'Un moment en famille représentant l’apprentissage du Médumba',
    'languages.fefe.alt': "Des enfants pratiquent le Fe'efe'e ensemble",
    'languages.yemba.alt': 'Scène communautaire représentant la langue Yemba',
    'languages.duala.alt': 'Espace d’apprentissage familial pour la langue Duala',
    'languages.bassa.alt': 'Visuels culturels pour des leçons de langue Bassa',

    'stories.section.title': 'Histoires et culture',
    'stories.section.description':
      'Découvre les histoires, les traditions et la beauté de nos peuples.',
    'stories.section.explore': 'Explorer les histoires',
    'stories.scrollPrevious': 'Histoires précédentes',
    'stories.scrollNext': 'Histoires suivantes',
    'stories.region': 'Aperçu des histoires',
    'stories.page.title': 'Histoires et culture',
    'stories.page.description':
      'De courtes histoires culturelles pour apprendre en famille - lire ensemble, parler ensemble et transmettre ce qui compte.',
    'stories.meta': '{category} • {minutes} min',
    'stories.grandmasAdvice.title': 'Les conseils de grand-mère',
    'stories.grandmasAdvice.category': 'Famille et vie',
    'stories.grandmasAdvice.alt':
      'Une grand-mère et sa famille partagent un moment calme dehors',
    'stories.dayAtMarket.title': 'Une journée au marché',
    'stories.dayAtMarket.category': 'Culture',
    'stories.dayAtMarket.alt': 'Marché animé avec vendeurs et familles',
    'stories.talkingDrum.title': 'Le tambour qui parle',
    'stories.talkingDrum.category': 'Contes',
    'stories.talkingDrum.alt':
      'Communauté réunie avec tambours, danse et musique',
    'stories.moon.title': 'Pourquoi la lune nous suit',
    'stories.moon.category': 'Contes',
    'stories.moon.alt':
      'Aînés et enfants racontant des histoires près du feu sous la lune',

    'middle.heading': 'Continuer, lire des histoires et suivre l’objectif du jour',
    'middle.continue.title': 'Continuer à apprendre',
    'middle.continue.lesson': 'Salutations et présentations',
    'middle.continue.progress': 'Ta progression',
    'middle.continue.progressLabel': 'Progression de la leçon',
    'middle.continue.cta': 'Continuer la leçon',
    'middle.goal.title': 'Objectif du jour',
    'middle.goal.description': 'De petits pas construisent beaucoup pour ta famille.',
    'middle.goal.aria': 'Leçons terminées aujourd’hui',
    'middle.goal.lessonsToday': 'Leçons aujourd’hui',
    'middle.goal.remaining': 'Encore {count} pour atteindre ton objectif.',
    'middle.goal.cta': 'Noter la leçon du jour',

    'why.eyebrow': 'Pensé pour les langues héritées',
    'why.title': 'Pourquoi Sounglah',
    'why.description':
      'Sounglah aide les familles à transmettre la langue, la culture et l’identité d’une génération à l’autre grâce à des leçons simples et joyeuses faites pour les enfants et les parents.',
    'why.explore': 'Explorer les langues',
    'why.benefit.culture.title': 'Lien culturel',
    'why.benefit.culture.description':
      'Des histoires et des leçons ancrées dans l’héritage, la vie de famille et les conversations du quotidien.',
    'why.benefit.child.title': 'Rythme adapté aux enfants',
    'why.benefit.child.description':
      'De courtes leçons qui respectent l’attention, la curiosité et la joie des enfants.',
    'why.benefit.family.title': 'Centré sur la famille',
    'why.benefit.family.description':
      'Conçu pour les parents, les grands-parents et les enfants qui apprennent ensemble à travers les générations.',

    'login.title': 'Connexion admin',
    'login.description': 'Accéder à l’espace de gestion de contenu Sounglah.',
    'login.error': 'Connexion impossible. Veuillez réessayer.',
    'login.submitting': 'Connexion en cours...',
  },
} as const

export type TranslationKey = keyof typeof translations.en
