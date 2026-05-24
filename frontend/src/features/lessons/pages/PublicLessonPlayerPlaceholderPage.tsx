import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Headphones, Play, Check } from 'lucide-react'

import { useI18n } from '../../../i18n'
import { getPublicLessonBySlug } from '../api/publicLessonsApi'
import type { PublicLessonDetail } from '../types/publicLesson.types'

export function PublicLessonPlayerPlaceholderPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useI18n()
  const [lesson, setLesson] = useState<PublicLessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLesson() {
      if (!slug) return
      setLoading(true)
      setError(null)
      try {
        const data = await getPublicLessonBySlug(slug)
        setLesson(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load lesson')
      } finally {
        setLoading(false)
      }
    }
    void loadLesson()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
        <p className="text-cocoa-700 animate-pulse">{t('public.lessons.intro.loading')}</p>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 p-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-cocoa-800">{t('public.lessons.intro.notFoundTitle')}</h1>
        <p className="mt-3 text-cocoa-700 max-w-md">{t('public.lessons.intro.notFoundDescription')}</p>
        <Link to="/lessons" className="btn-secondary mt-6">
          {t('public.lessons.intro.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      {/* Top Bar / Chrome */}
      <header className="border-b border-sand-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            to={`/lessons/${lesson.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-accent hover:text-forest-accent-hover transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('public.lessons.intro.back')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-cocoa-700">{lesson.title}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-accent mb-6 shadow-sm">
            <Play className="h-8 w-8 fill-current" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-cocoa-800 sm:text-4xl md:text-5xl">
            {lesson.title}
          </h1>

          <div className="card mt-8 p-8 max-w-md mx-auto text-left border border-sand-100 shadow-soft">
            <h2 className="text-xl font-bold text-cocoa-800 border-b border-sand-100 pb-3 flex items-center gap-2">
              <Headphones className="h-5 w-5 text-forest-accent" />
              <span>Player Shell Placeholder</span>
            </h2>
            
            <p className="mt-4 text-sm leading-relaxed text-cocoa-700">
              Welcome to the player shell! Here, you and your family will walk through this lesson step by step.
            </p>

            <ul className="mt-6 space-y-3">
              {lesson.items.map((item, index) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm text-cocoa-700">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-accent">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>
                    Step {index + 1}: <strong className="font-medium text-cocoa-800">{item.title}</strong> ({item.type})
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-sand-100 text-center text-xs text-cocoa-700/60">
              Player screens (S023.10 – S023.14) are coming in the next slice.
            </div>
          </div>

          <div className="mt-8">
            <Link to={`/lessons/${lesson.slug}`} className="btn-secondary">
              Exit to Lesson Overview
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
