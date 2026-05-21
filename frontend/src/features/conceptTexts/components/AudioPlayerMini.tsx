import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, Pause, Play } from 'lucide-react'

type AudioPlayerMiniProps = {
  src?: string | null
  durationSeconds?: number | null
  canReview?: boolean
  className?: string
}

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'error'

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds <= 0) {
    return null
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function AudioPlayerMini({ src, durationSeconds, canReview = false, className }: AudioPlayerMiniProps) {
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [error, setError] = useState('')
  const [metadataDuration, setMetadataDuration] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
    }
  }, [])

  const displayDuration = formatDuration(durationSeconds ?? metadataDuration)

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !src) {
      return
    }

    setError('')

    if (!audio.paused) {
      audio.pause()
      setStatus('idle')
      return
    }

    try {
      setStatus('loading')
      await audio.play()
      setStatus('playing')
    } catch (playError) {
      setStatus('error')
      setError(playError instanceof Error ? playError.message : 'Unable to play this audio.')
    }
  }

  if (!src) {
    return null
  }

  const buttonLabel =
    status === 'loading' ? 'Loading...' : status === 'playing' ? 'Pause' : canReview ? 'Play' : 'Play'

  return (
    <div className={['inline-flex max-w-full flex-col gap-1.5', className ?? ''].join(' ')}>
      <div className="flex max-w-full items-center gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={buttonLabel}
          className="inline-flex items-center gap-2 rounded-xl border border-forest-accent/20 bg-white px-3 py-2 text-sm font-semibold text-forest-700 shadow-[0_4px_14px_rgba(47,26,16,0.04)] transition hover:border-forest-accent hover:bg-forest-50/50 focus:outline-none focus:ring-2 focus:ring-forest-200"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : status === 'playing' ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
          {buttonLabel}
        </button>
        {displayDuration ? <span className="text-xs font-medium text-cocoa-body/55">{displayDuration}</span> : null}
      </div>

      {error ? (
        <p className="flex max-w-xl items-start gap-2 text-xs font-medium text-terracotta-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : null}

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="sr-only"
        onLoadedMetadata={(event) => {
          const nextDuration = Number.isFinite(event.currentTarget.duration) ? Math.round(event.currentTarget.duration) : null
          setMetadataDuration(nextDuration)
          if (status === 'loading') {
            setStatus('idle')
          }
        }}
        onPlay={() => setStatus('playing')}
        onPause={() => setStatus('idle')}
        onEnded={() => setStatus('idle')}
        onError={() => {
          setStatus('error')
          setError('Unable to load this audio.')
        }}
      />
    </div>
  )
}
