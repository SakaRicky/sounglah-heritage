import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  MoreVertical,
  Clock,
  BarChart3,
  MessageSquare,
  GraduationCap,
  Check,
  Play,
  Headphones,
  AlertCircle
} from 'lucide-react'

import { useI18n, type TranslationKey } from '../../../i18n'
import { resolveLessonCoverUrl } from '../../../lib/media'
import { getPublicLessonBySlug } from '../api/publicLessonsApi'
import type { PublicLessonDetail } from '../types/publicLesson.types'



type LearningPoint = {
  text: string
  emoji: string
}

export function PublicLessonIntroPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<PublicLessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    async function loadLesson() {
      if (!slug) return
      setLoading(true)
      setError(null)
      try {
        const data = await getPublicLessonBySlug(slug)
        setLesson(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load lesson details.')
      } finally {
        setLoading(false)
      }
    }
    void loadLesson()
  }, [slug])

  // Get learning points based on the mockup or dynamic logic
  const learningPoints = (): LearningPoint[] => {
    if (!lesson) return []

    // If it's one of our seeded lessons or grandma, match the localized checklist items exactly
    const specificKeys = [
      'greetings-kindness',
      'food-eating',
      'home-daily-actions',
      'emotions-encouragement',
      'numbers-counting',
      'animals-around-us',
      'nature-weather',
      'school-learning',
      'community-culture',
      'greeting-grandma'
    ]

    if (specificKeys.includes(lesson.slug)) {
      const getEmoji = (slug: string, idx: number) => {
        if (slug === 'greeting-grandma') return ['👋', '👵', '🎧', '🪘'][idx]
        if (slug === 'greetings-kindness') return ['👋', '☀️', '🙏', '❤️'][idx]
        if (slug === 'food-eating') return ['🍎', '🍽️', '🥛', '🍲'][idx]
        if (slug === 'home-daily-actions') return ['🏠', '🧼', '📢', '💬'][idx]
        if (slug === 'emotions-encouragement') return ['😊', '🤗', '⭐', '❤️'][idx]
        if (slug === 'numbers-counting') return ['🔢', '🍒', '➕', '🎮'][idx]
        if (slug === 'animals-around-us') return ['🐕', '🐓', '🐢', '🐾'][idx]
        if (slug === 'nature-weather') return ['🌧️', '🌳', '🌈', '🌍'][idx]
        if (slug === 'school-learning') return ['✏️', '📖', '❓', '🏫'][idx]
        if (slug === 'community-culture') return ['🎵', '🌳', '👑', '🤝'][idx]
        return '✨'
      }

      return [
        { text: t(`public.lessons.${lesson.slug}.learn1` as TranslationKey), emoji: getEmoji(lesson.slug, 0) },
        { text: t(`public.lessons.${lesson.slug}.learn2` as TranslationKey), emoji: getEmoji(lesson.slug, 1) },
        { text: t(`public.lessons.${lesson.slug}.learn3` as TranslationKey), emoji: getEmoji(lesson.slug, 2) },
        { text: t(`public.lessons.${lesson.slug}.learn4` as TranslationKey), emoji: getEmoji(lesson.slug, 3) },
      ]
    }

    // Otherwise generate dynamically from lesson items
    const points: LearningPoint[] = []
    const hasVocab = lesson.items.some((i) => i.type === 'VOCABULARY')
    const hasPhrase = lesson.items.some((i) => i.type === 'PHRASE')
    const hasListen = lesson.items.some((i) => i.type === 'AUDIO_LISTEN')
    const hasCulture = lesson.items.some((i) => i.type === 'CULTURAL_NOTE')

    if (hasVocab) {
      points.push({ text: 'Practice core vocabulary words', emoji: '👋' })
    }
    if (hasPhrase) {
      points.push({ text: 'Say useful expressions with confidence', emoji: '💬' })
    }
    if (hasListen) {
      points.push({ text: 'Listen and repeat pronunciation', emoji: '🎧' })
    }
    if (hasCulture) {
      points.push({ text: 'Understand the rich cultural context', emoji: '🌍' })
    }

    // Fallback if no items match
    if (points.length === 0) {
      points.push({ text: 'Learn with words, audio, and culture', emoji: '✨' })
    }

    return points
  }


  const handleStart = () => {
    if (!lesson) return
    navigate(`/lessons/${lesson.slug}/play`)
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-6">
        <div className="flex flex-col items-center gap-4">
          {/* Stunning glowing spinner in branding color */}
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-sand-100 border-t-forest-accent animate-spin" />
            <Headphones className="absolute h-5 w-5 text-forest-accent animate-pulse" />
          </div>
          <p className="text-cocoa-700 font-medium animate-pulse">{t('public.lessons.intro.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="h-16 w-16 bg-terracotta-400/10 text-terracotta-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-cocoa-800">{t('public.lessons.intro.notFoundTitle')}</h1>
        <p className="mt-3 text-cocoa-700 max-w-md">{t('public.lessons.intro.notFoundDescription')}</p>
        <Link to="/lessons" className="btn-secondary mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('public.lessons.intro.back')}</span>
        </Link>
      </div>
    )
  }

  const points = learningPoints()
  const coverAlt = lesson.coverImageAltText?.trim() || t('public.lessons.card.coverFallbackAlt', { title: lesson.title })
  const difficultyLabel = t(`admin.lessons.difficulty.${lesson.difficulty}`)
  const timeLabel = lesson.estimatedMinutes != null 
    ? t('public.lessons.card.estimatedMinutes', { count: lesson.estimatedMinutes })
    : t('public.lessons.card.timeUnknown')
  const itemsLabel = lesson.items.length === 1
    ? t('public.lessons.intro.oneItem')
    : t('public.lessons.intro.itemCount', { count: lesson.items.length })

  return (
    <div className="min-h-screen bg-cream-50 pb-16">
      
      {/* 1. MOBILE VIEW (Visible on small screens, hidden on md screens) */}
      <div className="md:hidden block px-6 pt-4">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between py-2 mb-4">
          <Link
            to="/lessons"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-sand-100/40 text-cocoa-800 shadow-sm active:scale-95 transition"
            aria-label={t('public.lessons.intro.back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2.5">
            <button
              onClick={toggleBookmark}
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-sand-100/40 shadow-sm active:scale-95 transition ${
                isBookmarked ? 'bg-forest-accent text-white border-transparent' : 'bg-white text-cocoa-800'
              }`}
              aria-label="Bookmark lesson"
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-sand-100/40 text-cocoa-800 shadow-sm active:scale-95 transition"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cover Image with Difficulty Pill */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-cream-100 border border-sand-100/30 shadow-card">
          <img
            src={resolveLessonCoverUrl(lesson.slug, lesson.coverImageUrl)}
            alt={coverAlt}
            className="h-full w-full object-cover"
          />
          {/* Beginner / Difficulty Badge Floating */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-cocoa-800 shadow-sm">
              <svg className="h-3.5 w-3.5 text-gold-star fill-current" viewBox="0 0 16 16">
                <path d="M8 12.05l-4.11 2.45a.5.5 0 01-.74-.54l1.07-4.7L.58 6.01a.5.5 0 01.29-.88l4.82-.41 1.9-4.51a.5.5 0 01.9 0l1.9 4.51 4.82.41a.5.5 0 01.29.88l-3.64 3.25 1.07 4.7a.5.5 0 01-.74.54L8 12.05z" />
              </svg>
              {difficultyLabel}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="font-serif text-3xl font-extrabold text-cocoa-800 leading-tight mt-6">
          {lesson.title}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-cocoa-700">
          {lesson.description || 'Choose a small lesson and learn with words, audio, and culture — together with family.'}
        </p>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-3 gap-3.5 mt-6">
          <div className="bg-white rounded-2xl border border-sand-100/40 p-4 shadow-soft flex flex-col justify-between">
            <div className="h-10 w-10 rounded-full bg-forest-50 text-forest-accent flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-[10px] text-cocoa-700/60 font-semibold uppercase tracking-wider block">
                {t('public.lessons.intro.timeLabel')}
              </span>
              <span className="text-sm font-extrabold text-cocoa-800 block mt-0.5">
                {timeLabel}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-sand-100/40 p-4 shadow-soft flex flex-col justify-between">
            <div className="h-10 w-10 rounded-full bg-forest-50 text-forest-accent flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-[10px] text-cocoa-700/60 font-semibold uppercase tracking-wider block">
                {t('public.lessons.intro.difficultyLabel')}
              </span>
              <span className="text-sm font-extrabold text-cocoa-800 block mt-0.5">
                {difficultyLabel}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-sand-100/40 p-4 shadow-soft flex flex-col justify-between">
            <div className="h-10 w-10 rounded-full bg-orange-50 text-terracotta-500 flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-[10px] text-cocoa-700/60 font-semibold uppercase tracking-wider block">
                {t('public.lessons.intro.itemsLabel')}
              </span>
              <span className="text-sm font-extrabold text-cocoa-800 block mt-0.5">
                {itemsLabel}
              </span>
            </div>
          </div>
        </div>

        {/* What You'll Learn Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 bg-forest-50 text-forest-accent rounded-full flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-xl font-bold text-forest-accent">
              {t('public.lessons.intro.whatLearn')}
            </h2>
          </div>

          <div className="bg-white border border-sand-100/40 rounded-2xl shadow-soft overflow-hidden">
            <ul className="divide-y divide-sand-100/35">
              {points.map((pt, idx) => (
                <li key={idx} className="flex items-center justify-between p-4.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-forest-accent text-white rounded-full flex items-center justify-center p-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-cocoa-800 leading-snug">{pt.text}</span>
                  </div>
                  <span className="text-xl select-none" role="img" aria-hidden="true">
                    {pt.emoji}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Play Action Area */}
        <div className="mt-8">
          <button
            onClick={handleStart}
            className="btn-primary w-full py-4.5 rounded-cta flex items-center justify-center gap-2 hover:bg-forest-accent-hover transition shadow-button active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-current" />
            <span className="font-bold text-base tracking-wide">{t('public.lessons.intro.start')}</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-forest-accent/80 font-semibold text-sm mt-4 select-none">
            <Headphones className="h-4.5 w-4.5" />
            <span>{t('public.lessons.intro.audioNotice')}</span>
          </div>
        </div>
      </div>

      {/* 2. DESKTOP VIEW (Visible on md screens, hidden on mobile/tablet) */}
      <div className="hidden md:block">
        
        {/* Subtle decorative background heritage artifacts */}
        <div className="pointer-events-none absolute left-0 top-0 h-44 w-44 bg-[url('/images/artifacts/sounglah_corner_decor_03.png')] bg-contain bg-no-repeat opacity-[0.15]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 bg-[url('/images/artifacts/sounglah_corner_decor_04.png')] bg-contain bg-no-repeat opacity-[0.15]" />

        <div className="section pt-8">
          {/* Breadcrumb Back Navigation */}
          <Link
            to="/lessons"
            className="inline-flex items-center gap-2 text-sm font-bold text-forest-accent hover:text-forest-accent-hover transition mb-8 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('public.lessons.intro.back')}</span>
          </Link>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-12 gap-8 items-start relative z-10">
            
            {/* Left Column: Cover Image, Title, Description */}
            <div className="col-span-7 pr-6">
              
              {/* Cover Image card */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-cream-100 border border-sand-100/40 shadow-card">
                <img
                  src={resolveLessonCoverUrl(lesson.slug, lesson.coverImageUrl)}
                  alt={coverAlt}
                  className="h-full w-full object-cover"
                />
                
                {/* Floating Bookmark and Options */}
                <div className="absolute top-4 right-4 flex gap-2.5">
                  <button
                    onClick={toggleBookmark}
                    className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md transition transform hover:scale-105 active:scale-95 ${
                      isBookmarked ? 'bg-forest-accent text-white' : 'bg-white text-cocoa-800'
                    }`}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Floating Difficulty badge */}
                <div className="absolute bottom-6 left-6">
                  <span className="inline-flex items-center gap-1.5 bg-white px-4.5 py-2 rounded-full text-sm font-bold text-cocoa-800 shadow-md">
                    <svg className="h-4 w-4 text-gold-star fill-current" viewBox="0 0 16 16">
                      <path d="M8 12.05l-4.11 2.45a.5.5 0 01-.74-.54l1.07-4.7L.58 6.01a.5.5 0 01.29-.88l4.82-.41 1.9-4.51a.5.5 0 01.9 0l1.9 4.51 4.82.41a.5.5 0 01.29.88l-3.64 3.25 1.07 4.7a.5.5 0 01-.74.54L8 12.05z" />
                    </svg>
                    {difficultyLabel}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="font-serif text-4xl lg:text-5xl font-extrabold text-cocoa-800 leading-tight mt-8">
                {lesson.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-cocoa-700">
                {lesson.description || 'Choose a small lesson and learn with words, audio, and culture — together with family.'}
              </p>
            </div>

            {/* Right Column: Metrics, Learning Checklist, and CTA */}
            <div className="col-span-5">
              <div className="bg-white border border-sand-100 rounded-card shadow-soft p-6 lg:p-8">
                
                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-3.5 mb-8">
                  <div className="bg-cream-hero/40 rounded-2xl border border-sand-100/30 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-full bg-forest-50 text-forest-accent flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-cocoa-700/60 font-semibold uppercase tracking-wider block">
                        {t('public.lessons.intro.timeLabel')}
                      </span>
                      <span className="text-base font-extrabold text-cocoa-800 block mt-0.5">
                        {timeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="bg-cream-hero/40 rounded-2xl border border-sand-100/30 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-full bg-forest-50 text-forest-accent flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-cocoa-700/60 font-semibold uppercase tracking-wider block">
                        {t('public.lessons.intro.difficultyLabel')}
                      </span>
                      <span className="text-base font-extrabold text-cocoa-800 block mt-0.5">
                        {difficultyLabel}
                      </span>
                    </div>
                  </div>

                  <div className="bg-cream-hero/40 rounded-2xl border border-sand-100/30 p-4 flex flex-col justify-between">
                    <div className="h-10 w-10 rounded-full bg-orange-50 text-terracotta-500 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                      <span className="text-[10px] text-cocoa-700/60 font-semibold uppercase tracking-wider block">
                        {t('public.lessons.intro.itemsLabel')}
                      </span>
                      <span className="text-base font-extrabold text-cocoa-800 block mt-0.5">
                        {itemsLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* What You'll Learn Container */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 bg-forest-50 text-forest-accent rounded-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-forest-accent">
                      {t('public.lessons.intro.whatLearn')}
                    </h2>
                  </div>

                  <div className="bg-cream-50/40 border border-sand-100/30 rounded-2xl overflow-hidden">
                    <ul className="divide-y divide-sand-100/25">
                      {points.map((pt, idx) => (
                        <li key={idx} className="flex items-center justify-between p-4.5 px-6 hover:bg-cream-hero/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-5.5 w-5.5 bg-forest-accent text-white rounded-full flex items-center justify-center p-0.5">
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold text-cocoa-800 leading-snug">{pt.text}</span>
                          </div>
                          <span className="text-2xl select-none" role="img" aria-hidden="true">
                            {pt.emoji}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Large Start Button & Notice */}
                <button
                  onClick={handleStart}
                  className="btn-primary w-full py-5 rounded-cta flex items-center justify-center gap-2 text-base font-bold tracking-wide transform hover:scale-[1.01] active:scale-[0.99] transition shadow-button"
                >
                  <Play className="h-5.5 w-5.5 fill-current" />
                  <span>{t('public.lessons.intro.start')}</span>
                </button>
                
                <div className="flex items-center justify-center gap-2 text-forest-accent/80 font-semibold text-sm mt-5 select-none">
                  <Headphones className="h-5 w-5 animate-pulse" />
                  <span>{t('public.lessons.intro.audioNotice')}</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
