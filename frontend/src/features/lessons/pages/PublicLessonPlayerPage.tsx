import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Play, Pause, X, ChevronLeft, ChevronRight, Sparkles, Trophy, Check } from 'lucide-react'

import { useI18n } from '../../../i18n'
import { getPublicLessonBySlug } from '../api/publicLessonsApi'
import type { PublicLessonDetail, PublicLessonItem } from '../types/publicLesson.types'
import { resolveMediaUrl, resolveConceptPlaceholderUrl } from '../../../lib/media'

// Define CSS keyframes for custom wave animation
const waveAnimationStyles = `
  @keyframes wave-bounce {
    0%, 100% {
      transform: scaleY(0.3);
    }
    50% {
      transform: scaleY(1);
    }
  }
  .animate-wave-bar {
    transform-origin: center;
    animation: wave-bounce 1.2s ease-in-out infinite;
  }
`;

export function PublicLessonPlayerPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<PublicLessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Celebration state
  const [isCompleted, setIsCompleted] = useState(false)

  // Load lesson details
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

  // Handle slide transitions - pause audio when moving
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (!lesson) return
    stopAudio()
    if (currentItemIndex < lesson.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    stopAudio()
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    } else {
      // If on the first slide, go back to overview
      navigate(`/lessons/${lesson?.slug}`)
    }
  }

  // Toggle Audio Playback
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    setAudioError(null)

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.error('Playback failed', err)
        setAudioError('Unable to play audio')
        setIsPlaying(false)
      })
    }
  }

  // Trigger audio on item load (optional / auto-play or clean reset)
  useEffect(() => {
    stopAudio()
  }, [currentItemIndex])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-sand-100 border-t-forest-accent animate-spin" />
            <Sparkles className="absolute h-5 w-5 text-forest-accent animate-pulse" />
          </div>
          <p className="text-cocoa-700 font-medium animate-pulse">{t('public.lessons.intro.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !lesson || lesson.items.length === 0) {
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

  // Celebration state render
  if (isCompleted) {
    return (
      <div className="flex min-h-screen flex-col bg-cream-50">
        {/* Style block for waves */}
        <style>{waveAnimationStyles}</style>

        {/* Celebration header */}
        <header className="border-b border-sand-100/50 bg-white px-6 py-4 shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <button
              onClick={() => setIsCompleted(false)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-accent hover:text-forest-accent-hover transition active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to player</span>
            </button>
            <span className="text-sm font-bold text-forest-accent uppercase tracking-wider">Lesson Complete!</span>
          </div>
        </header>

        {/* Celebration content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
          {/* Subtle background graphics */}
          <div className="pointer-events-none absolute left-0 bottom-0 h-44 w-44 bg-[url('/images/artifacts/sounglah_corner_decor_03.png')] bg-contain bg-no-repeat opacity-[0.08]" />
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 bg-[url('/images/artifacts/sounglah_corner_decor_04.png')] bg-contain bg-no-repeat opacity-[0.08]" />

          <div className="card max-w-lg w-full bg-white border border-sand-100 p-8 text-center shadow-card rounded-card transform scale-100 transition-all duration-300">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-forest-50 text-forest-accent mb-6 shadow-soft relative">
              <Trophy className="h-12 w-12" />
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-gold-star rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="h-3 w-3 text-white fill-current" />
              </div>
            </div>

            <h1 className="font-serif text-3xl font-extrabold text-cocoa-800 md:text-4xl">
              Mebwô! Well done!
            </h1>
            <p className="mt-4 text-base leading-relaxed text-cocoa-700 max-w-sm mx-auto">
              You and your family have successfully completed the <strong className="text-forest-accent font-semibold">"{lesson.title}"</strong> lesson together!
            </p>

            {/* Achievement card */}
            <div className="mt-8 rounded-2xl bg-forest-50/50 border border-forest-200/30 p-6 flex items-center justify-around text-left">
              <div>
                <span className="text-xs text-cocoa-700/60 font-bold uppercase tracking-wider block">Items Practiced</span>
                <span className="text-3xl font-extrabold text-forest-700 block mt-0.5">{lesson.items.length} words</span>
              </div>
              <div className="h-10 w-[1px] bg-sand-200/50" />
              <div>
                <span className="text-xs text-cocoa-700/60 font-bold uppercase tracking-wider block">Language Focus</span>
                <span className="text-3xl font-extrabold text-[#A94F25] block mt-0.5">Médumba</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Link
                to="/lessons"
                className="btn-primary w-full py-4.5 rounded-cta flex items-center justify-center gap-2 hover:bg-forest-accent-hover transition shadow-button active:scale-[0.98] font-bold text-base"
              >
                <span>Continue Learning</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
              <button
                onClick={() => {
                  stopAudio()
                  setCurrentItemIndex(0)
                  setIsCompleted(false)
                }}
                className="w-full py-3.5 border-2 border-sand-200 hover:bg-cream-100 text-cocoa-700 font-bold text-sm rounded-cta transition active:scale-[0.98]"
              >
                Practice Again
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Retrieve current active item
  const currentItem = lesson.items[currentItemIndex]
  const conceptPayload = currentItem.conceptPayload

  // Dynamic values with elegant fallbacks
  const displayTitle = currentItem.title
  const medText = conceptPayload?.texts?.med?.text || currentItem.title
  const enText = conceptPayload?.texts?.en?.text || (currentItem.contentJson?.textEn as string) || displayTitle
  const frText = conceptPayload?.texts?.fr?.text || (currentItem.contentJson?.textFr as string) || ''
  
  // Custom context/usage notes logic
  const usageNoteRaw = (currentItem.contentJson?.usageNote as string) || currentItem.instructionText || ''
  const hasUsageNote = usageNoteRaw && usageNoteRaw.trim().length > 0 && usageNoteRaw !== 'Listen, look, and say it with someone at home.'
  const usageNote = hasUsageNote ? usageNoteRaw.trim() : 'Use this when greeting an elder in the morning.' // premium default context if missing

  // Illustration URL logic
  const imageUrl = conceptPayload?.imageUrl 
    ? resolveMediaUrl(conceptPayload.imageUrl)
    : resolveConceptPlaceholderUrl(conceptPayload?.key)

  // Audio URL logic
  const audioUrl = conceptPayload?.texts?.med?.audioUrl 
    ? resolveMediaUrl(conceptPayload.texts.med.audioUrl)
    : null

  // Progress calculations
  const progressPercent = ((currentItemIndex + 1) / lesson.items.length) * 100

  // Standard heights for the symmetric waveform bars (6 bars)
  const leftWaveformBars = [
    { height: '16px', delay: '0.1s' },
    { height: '28px', delay: '0.4s' },
    { height: '36px', delay: '0.2s' },
    { height: '24px', delay: '0.6s' },
    { height: '16px', delay: '0.3s' },
    { height: '10px', delay: '0.5s' }
  ]

  const rightWaveformBars = [
    { height: '10px', delay: '0.5s' },
    { height: '16px', delay: '0.3s' },
    { height: '24px', delay: '0.6s' },
    { height: '36px', delay: '0.2s' },
    { height: '28px', delay: '0.4s' },
    { height: '16px', delay: '0.1s' }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 pb-28">
      {/* Wave animation styles injected directly */}
      <style>{waveAnimationStyles}</style>

      {/* Top Bar / Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-sand-100/50 px-4 py-3 md:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between relative">
          
          {/* Back button */}
          <button
            onClick={handlePrevious}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-sand-100/30 text-cocoa-800 shadow-sm active:scale-95 transition hover:bg-cream-50"
            aria-label={currentItemIndex === 0 ? "Back to lesson details" : "Previous slide"}
          >
            <ChevronLeft className="h-5 w-5 text-cocoa-700" />
          </button>

          {/* Lesson title and slide indicator */}
          <div className="text-center flex-1 mx-4">
            <h2 className="text-xs font-bold text-cocoa-700/60 uppercase tracking-widest block truncate max-w-[200px] md:max-w-md mx-auto">
              {lesson.title}
            </h2>
            <span className="text-sm font-extrabold text-forest-700 font-sans block mt-0.5">
              {currentItemIndex + 1} / {lesson.items.length}
            </span>
          </div>

          {/* Close button */}
          <Link
            to={`/lessons/${lesson.slug}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-sand-100/30 text-cocoa-800 shadow-sm active:scale-95 transition hover:bg-cream-50"
            aria-label="Exit lesson"
            onClick={stopAudio}
          >
            <X className="h-5 w-5 text-cocoa-700" />
          </Link>

          {/* Glowing Green Progress Bar directly below top bar */}
          <div className="absolute left-0 bottom-[-13px] right-0 h-1.5 w-full bg-cream-200 overflow-hidden">
            <div 
              className="h-full bg-forest-accent rounded-r-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(15,107,58,0.5)]" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main interactive area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-8 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* COLUMN 1: Image, Word, and Custom Pulsing Audio Player (Left side on larger screens, top on mobile) */}
          <div className="md:col-span-7 flex flex-col items-center text-center">
            
            {/* Main Illustration container */}
            <div className="relative aspect-[4/3] w-full max-w-lg md:max-w-none overflow-hidden rounded-[2rem] bg-cream-100 border border-sand-100/35 shadow-card transform hover:scale-[1.01] transition-transform duration-300">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={conceptPayload?.imageAltText || displayTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-cocoa-700 bg-sand-100/30">
                  No image available
                </div>
              )}
            </div>

            {/* Médumba word */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold text-cocoa-800 leading-tight mt-6 md:mt-8 tracking-wide">
              {medText}
            </h1>
            <span className="text-sm font-bold text-cocoa-700/60 uppercase tracking-widest mt-1 block">
              (Médumba)
            </span>

            {/* Custom interactive Audio Player with symmetric pulsing waveforms */}
            {audioUrl ? (
              <div className="mt-6 md:mt-8 flex items-center justify-center gap-6 w-full max-w-md px-4">
                
                {/* Left Waveform bars */}
                <div className="flex items-center gap-1.5 h-10 select-none">
                  {leftWaveformBars.map((bar, idx) => (
                    <span
                      key={`left-bar-${idx}`}
                      className={`w-1 rounded-full bg-forest-200 transition-colors ${
                        isPlaying ? 'bg-forest-accent animate-wave-bar' : ''
                      }`}
                      style={{ 
                        height: bar.height,
                        animationDelay: bar.delay
                      }}
                      aria-hidden
                    />
                  ))}
                </div>

                {/* Main Circular play/pause button */}
                <button
                  onClick={togglePlay}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-forest-accent text-white flex items-center justify-center transition shadow-button transform hover:scale-105 active:scale-95 cursor-pointer relative"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 md:h-8 md:w-8 fill-current text-white" />
                  ) : (
                    <Play className="h-6 w-6 md:h-8 md:w-8 fill-current text-white ml-1" />
                  )}
                  {/* Subtle pulsing outer ring when active */}
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border-4 border-forest-300 animate-ping opacity-25" />
                  )}
                </button>

                {/* Right Waveform bars */}
                <div className="flex items-center gap-1.5 h-10 select-none">
                  {rightWaveformBars.map((bar, idx) => (
                    <span
                      key={`right-bar-${idx}`}
                      className={`w-1 rounded-full bg-forest-200 transition-colors ${
                        isPlaying ? 'bg-forest-accent animate-wave-bar' : ''
                      }`}
                      style={{ 
                        height: bar.height,
                        animationDelay: bar.delay
                      }}
                      aria-hidden
                    />
                  ))}
                </div>

                {/* Embedded HTML5 Audio element */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  preload="auto"
                  className="sr-only"
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error('Audio load error', e)
                    setIsPlaying(false)
                  }}
                />
              </div>
            ) : (
              <div className="mt-6 md:mt-8 py-3 px-6 rounded-full bg-sand-100/40 text-xs font-semibold text-cocoa-700/60 select-none uppercase tracking-wide">
                No audio available for this word
              </div>
            )}

            {audioError && (
              <p className="mt-2 text-xs font-bold text-terracotta-600">
                {audioError}
              </p>
            )}

          </div>

          {/* COLUMN 2: Translation Cards Stack (Right side on larger screens, bottom on mobile) */}
          <div className="md:col-span-5 flex flex-col gap-4.5 w-full">
            
            {/* English Card */}
            <div className="flex items-center gap-5 rounded-[1.25rem] border border-[#E3ECE3] bg-[#F4F7F4]/90 p-5 shadow-soft hover:shadow-md transition duration-300">
              <div className="h-12 w-12 rounded-full bg-[#EAF0EB] text-forest-accent flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-forest-accent font-extrabold uppercase tracking-widest block">
                  English
                </span>
                <p className="text-cocoa-800 font-extrabold text-lg md:text-xl block mt-0.5 leading-snug truncate">
                  {enText}
                </p>
              </div>
            </div>

            {/* French Card */}
            {frText && (
              <div className="flex items-center gap-5 rounded-[1.25rem] border border-[#F5EAD6] bg-[#FCF5EB]/95 p-5 shadow-soft hover:shadow-md transition duration-300">
                <div className="h-12 w-12 rounded-full bg-[#F6EEE0] text-[#A94F25] flex items-center justify-center shrink-0 shadow-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#A94F25] font-extrabold uppercase tracking-widest block">
                    French
                  </span>
                  <p className="text-cocoa-800 font-extrabold text-lg md:text-xl block mt-0.5 leading-snug truncate">
                    {frText}
                  </p>
                </div>
              </div>
            )}

            {/* When to use it Card */}
            <div className="flex items-start gap-5 rounded-[1.25rem] border border-[#DCE6F2] bg-[#F0F5FA]/90 p-5 shadow-soft hover:shadow-md transition duration-300">
              <div className="h-12 w-12 rounded-full bg-[#E1ECF7] text-[#2B6CB0] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#2B6CB0] font-extrabold uppercase tracking-widest block">
                  When to use it
                </span>
                <p className="text-cocoa-700 text-sm font-medium mt-1 leading-relaxed">
                  {usageNote}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Fixed Sticky Footer for mobile, bottom nav for larger screens */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sand-100/50 p-4 md:p-6 z-30 shadow-[0_-8px_30px_rgba(74,42,24,0.04)]">
        <div className="mx-auto max-w-5xl flex gap-4 w-full">
          
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            className="flex-1 border-2 border-forest-accent text-forest-accent bg-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-forest-50 transition active:scale-[0.98] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          {/* Next / Finish button */}
          <button
            onClick={handleNext}
            className="flex-1 bg-forest-accent hover:bg-forest-accent-hover text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-button"
          >
            <span>{currentItemIndex === lesson.items.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>

        </div>
      </footer>
    </div>
  )
}
