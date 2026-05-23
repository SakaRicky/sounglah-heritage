import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Loader2, Pause, Play } from 'lucide-react'

import { resolveMediaUrl } from '../../../lib/media'

type AudioPlayerMiniProps = {
  src?: string | null
  durationSeconds?: number | null
  canReview?: boolean
  className?: string
}

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'error'

const WAVEFORM_BAR_COUNT = 28

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) {
    return null
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function AudioPlayerMini({ src, durationSeconds, canReview = false, className }: AudioPlayerMiniProps) {
  const resolvedSrc = resolveMediaUrl(src)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [error, setError] = useState('')
  const [metadataDuration, setMetadataDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const waveformBars = useMemo(
    () =>
      Array.from({ length: WAVEFORM_BAR_COUNT }, (_, index) => {
        const wave = Math.sin(index * 0.85) * 12
        const accent = index % 5 === 0 ? 10 : 0
        return Math.round(18 + Math.abs(wave) + accent)
      }),
    [],
  )

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
    }
  }, [])

  const displayDuration = formatDuration(durationSeconds ?? metadataDuration)
  const activeDuration = durationSeconds ?? metadataDuration ?? 0
  const progress = activeDuration > 0 ? Math.min(currentTime / activeDuration, 1) : 0
  const activeBars = Math.round(progress * WAVEFORM_BAR_COUNT)

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !resolvedSrc) {
      return
    }

    setError('')

    if (!audio.paused) {
      audio.pause()
      setStatus('idle')
      return
    }

    // Force initialization of the audio pipeline on mobile
    if (audio.currentTime === 0) {
      audio.load()
    }

    try {
      // Trigger play synchronously in the click handler to guarantee user gesture context is preserved
      const playPromise = audio.play()
      setStatus('playing')
      await playPromise
    } catch (playError) {
      setStatus('error')
      setError(playError instanceof Error ? playError.message : 'Unable to play this audio.')
    }
  }

  if (!resolvedSrc) {
    return null
  }

  const buttonLabel = status === 'loading' ? 'Loading...' : status === 'playing' ? 'Pause audio' : canReview ? 'Play audio' : 'Play audio'

  return (
    <div className={['flex w-full min-w-0 max-w-full flex-col gap-1', className ?? ''].join(' ')}>
      <div className="flex min-w-0 w-full max-w-full items-center gap-2 rounded-xl border border-forest-accent/15 bg-white px-2.5 py-1.5 shadow-[0_4px_14px_rgba(47,26,16,0.04)]">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={buttonLabel}
          title={buttonLabel}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-accent text-white transition hover:bg-forest-accent-hover focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-wait disabled:opacity-70"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : status === 'playing' ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>

        <button
          type="button"
          onClick={togglePlayback}
          className="group flex min-w-0 flex-1 items-end gap-0.5 overflow-hidden rounded-lg px-1 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-200"
          aria-label={buttonLabel}
        >
          {waveformBars.map((height, index) => {
            const isActive = index < activeBars || (status === 'playing' && activeBars === 0)

            return (
              <span
                key={`${height}-${index}`}
                className={[
                  'w-1 rounded-full transition-colors',
                  isActive ? 'bg-forest-accent' : 'bg-sand-200/70 group-hover:bg-forest-300/55',
                ].join(' ')}
                style={{ height: `${height}px` }}
                aria-hidden
              />
            )
          })}
        </button>

        {displayDuration ? (
          <span className="min-w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-cocoa-body/60">
            {displayDuration}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="flex max-w-xl items-start gap-2 text-xs font-medium text-terracotta-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : null}

      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload="auto"
        className="sr-only"
        onLoadedMetadata={(event) => {
          const nextDuration = Number.isFinite(event.currentTarget.duration) ? Math.round(event.currentTarget.duration) : null
          setMetadataDuration(nextDuration)
          if (status === 'loading') {
            setStatus('idle')
          }
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setStatus('playing')}
        onPause={() => setStatus('idle')}
        onEnded={() => {
          setStatus('idle')
          setCurrentTime(0)
        }}
        onError={() => {
          setStatus('error')
          setError('Unable to load this audio.')
        }}
      />
    </div>
  )
}
