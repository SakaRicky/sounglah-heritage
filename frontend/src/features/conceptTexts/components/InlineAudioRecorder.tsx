import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Mic, RotateCcw, Send, Square, X } from 'lucide-react'

import { AudioPlayerMini } from './AudioPlayerMini'

type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'preview' | 'submitting'

type Props = {
  conceptName: string
  languageName: string
  text: string
  disabled?: boolean
  isActive: boolean
  recordLabel?: string
  onActivate: () => void
  onCancel: () => void
  onSubmit: (audioBlob: Blob, durationSeconds: number) => Promise<void>
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function supportedMimeType() {
  if (typeof MediaRecorder === 'undefined') {
    return ''
  }

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg']
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? ''
}

export function InlineAudioRecorder({
  conceptName,
  languageName,
  text,
  disabled = false,
  isActive,
  recordLabel = 'Record',
  onActivate,
  onCancel,
  onSubmit,
}: Props) {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const chunksRef = useRef<BlobPart[]>([])
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const cancelStopRef = useRef(false)
  const previewUrlRef = useRef<string | null>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function resetPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setPreviewUrl(null)
    setAudioBlob(null)
    setDurationSeconds(0)
  }

  function resetRecorder() {
    clearTimer()
    stopStream()
    recorderRef.current = null
    chunksRef.current = []
    startedAtRef.current = null
    cancelStopRef.current = false
  }

  async function startRecording() {
    setError('')
    resetPreview()

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record audio. Try a recent version of Chrome, Edge, Firefox, or Safari.')
      return
    }

    onActivate()
    setStatus('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = supportedMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      cancelStopRef.current = false

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        clearTimer()
        stopStream()

        if (cancelStopRef.current) {
          chunksRef.current = []
          cancelStopRef.current = false
          return
        }

        const recordedBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const elapsedSeconds =
          startedAtRef.current === null ? durationSeconds : Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
        const nextPreviewUrl = URL.createObjectURL(recordedBlob)

        previewUrlRef.current = nextPreviewUrl
        setAudioBlob(recordedBlob)
        setPreviewUrl(nextPreviewUrl)
        setDurationSeconds(elapsedSeconds)
        setStatus('preview')
        chunksRef.current = []
      }

      recorder.start()
      startedAtRef.current = Date.now()
      setDurationSeconds(0)
      setStatus('recording')
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current !== null) {
          setDurationSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
        }
      }, 250)
    } catch (requestError) {
      resetRecorder()
      setStatus('idle')
      onCancel()

      if (requestError instanceof DOMException && requestError.name === 'NotAllowedError') {
        setError('Microphone permission was denied. Allow microphone access, then try recording again.')
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Unable to start microphone recording.')
      }
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') {
      recorder.stop()
    }
  }

  function cancelRecording() {
    cancelStopRef.current = true
    const recorder = recorderRef.current

    if (recorder?.state === 'recording') {
      recorder.stop()
    } else {
      cancelStopRef.current = false
    }

    clearTimer()
    stopStream()
    recorderRef.current = null
    chunksRef.current = []
    startedAtRef.current = null
    resetPreview()
    setStatus('idle')
    setError('')
    onCancel()
  }

  async function submitRecording() {
    if (!audioBlob) {
      return
    }

    setStatus('submitting')
    setError('')

    try {
      await onSubmit(audioBlob, durationSeconds)
      resetRecorder()
      resetPreview()
      setStatus('idle')
      onCancel()
    } catch (submitError) {
      setStatus('preview')
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit this recording.')
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  if (!isActive) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-forest-accent/30 bg-white px-3 py-2 text-sm font-semibold text-forest-700 shadow-[0_4px_14px_rgba(47,26,16,0.04)] transition hover:border-forest-accent hover:bg-forest-50/50 focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Mic className="h-4 w-4" aria-hidden />
          {recordLabel}
        </button>
        {error ? <p className="max-w-56 text-xs font-medium text-terracotta-600">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-forest-accent/15 bg-forest-50/30 shadow-[0_8px_28px_rgba(31,90,61,0.08)]">
      <div className="border-b border-forest-accent/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/70">
          {status === 'preview' ? 'Preview recording' : 'Recording'}
        </p>
        <p className="mt-1 text-sm font-semibold text-cocoa-800">{conceptName}</p>
        <p className="text-xs font-medium text-cocoa-body/65">{languageName}</p>
        <p className="mt-2 text-base font-semibold leading-6 text-cocoa-ink">{text}</p>
      </div>

      <div className="space-y-3 px-4 py-3">
        {status === 'idle' ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-cocoa-body/75">Preparing the recorder...</p>
            <button
              type="button"
              onClick={cancelRecording}
              className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-forest-700 transition hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              <X className="h-4 w-4" aria-hidden />
              Cancel
            </button>
          </div>
        ) : null}

        {status === 'requesting' ? (
          <p className="text-sm font-medium text-cocoa-body/75">Waiting for microphone permission...</p>
        ) : null}

        {status === 'recording' ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-terracotta-500" />
              {formatDuration(durationSeconds)}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-xl border border-terracotta-500/25 bg-terracotta-400/10 px-3 py-2 text-sm font-semibold text-terracotta-600 transition hover:bg-terracotta-400/15 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden />
              Stop recording
            </button>
            <button
              type="button"
              onClick={cancelRecording}
              className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-forest-700 transition hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              <X className="h-4 w-4" aria-hidden />
              Cancel
            </button>
          </div>
        ) : null}

        {status === 'preview' || status === 'submitting' ? (
          <div className="min-w-0 space-y-3">
            <div className="min-w-0 w-full">
              <AudioPlayerMini key={previewUrl} src={previewUrl} durationSeconds={durationSeconds} className="w-full min-w-0" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={startRecording}
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-forest-700 transition hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Retake
              </button>
              <button
                type="button"
                onClick={submitRecording}
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden />
                {status === 'submitting' ? 'Submitting...' : 'Submit for review'}
              </button>
              <button
                type="button"
                onClick={cancelRecording}
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="flex max-w-xl items-start gap-2 text-xs font-medium text-terracotta-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
