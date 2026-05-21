import { Volume2, VolumeX } from 'lucide-react'

import { AudioPlayerMini } from './AudioPlayerMini'
import { InlineAudioRecorder } from './InlineAudioRecorder'
import type { ConceptTextAudioSummary, ConceptTextAudioStatus } from '../types/conceptText.types'

type ConceptTextAudioCellProps = {
  conceptTextId: string
  languageName: string
  conceptName: string
  text: string
  audioSummary: ConceptTextAudioSummary
  fallbackAudioUrl?: string | null
  pronunciationNote?: string | null
  canRecord: boolean
  canReview: boolean
  activeRecorderId: string | null
  onRecorderActivate: (conceptTextId: string) => void
  onRecorderCancel: () => void
  onAudioSubmit: (audioBlob: Blob, durationSeconds: number) => Promise<void>
}

const statusLabel: Record<ConceptTextAudioStatus, string> = {
  missing: 'No audio',
  pending_review: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const statusClass: Record<ConceptTextAudioStatus, string> = {
  missing: 'border-sand-200 bg-cream-100 text-cocoa-body/65',
  pending_review: 'border-gold-500/25 bg-gold-400/15 text-cocoa-700',
  approved: 'border-forest-accent/25 bg-forest-accent/10 text-forest-700',
  rejected: 'border-terracotta-500/20 bg-terracotta-400/10 text-terracotta-600',
}

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return null
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function StatusBadge({ status, hasAudio }: { status: ConceptTextAudioStatus; hasAudio: boolean }) {
  return (
    <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', statusClass[status]].join(' ')}>
      {hasAudio ? <Volume2 className="h-3.5 w-3.5" aria-hidden /> : <VolumeX className="h-3.5 w-3.5" aria-hidden />}
      {statusLabel[status]}
    </span>
  )
}

export function ConceptTextAudioCell({
  conceptTextId,
  languageName,
  conceptName,
  text,
  audioSummary,
  fallbackAudioUrl,
  pronunciationNote,
  canRecord,
  activeRecorderId,
  onRecorderActivate,
  onRecorderCancel,
  onAudioSubmit,
}: ConceptTextAudioCellProps) {
  const status = audioSummary.status
  const audioUrl = audioSummary.currentAudioUrl ?? fallbackAudioUrl ?? null
  const durationLabel = formatDuration(audioSummary.durationSeconds)
  const isRecorderActive = activeRecorderId === conceptTextId
  const recorderDisabled = activeRecorderId !== null && !isRecorderActive
  const hasAudio = Boolean(audioUrl)
  const showRecorder = canRecord && (status === 'missing' || status === 'rejected' || status === 'pending_review' || status === 'approved')
  const recordLabel =
    status === 'approved' || status === 'pending_review' ? 'Replace' : status === 'rejected' ? 'Record again' : 'Record'

  return (
    <div className="space-y-2">
      {status === 'missing' ? (
        <div className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-cocoa-body/55">
          <VolumeX className="h-4 w-4 text-cocoa-body/45" aria-hidden />
          <span>{statusLabel[status]}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} hasAudio={hasAudio} />
          {durationLabel ? <span className="text-xs font-medium text-cocoa-body/55">{durationLabel}</span> : null}
        </div>
      )}

      <AudioPlayerMini
        key={audioUrl}
        src={audioUrl}
        durationSeconds={audioSummary.durationSeconds}
        canReview={audioSummary.status === 'pending_review'}
      />

      {showRecorder ? (
        <InlineAudioRecorder
          conceptName={conceptName}
          languageName={languageName}
          text={text}
          disabled={recorderDisabled}
          isActive={isRecorderActive}
          recordLabel={recordLabel}
          onActivate={() => onRecorderActivate(conceptTextId)}
          onCancel={onRecorderCancel}
          onSubmit={onAudioSubmit}
        />
      ) : null}

      {pronunciationNote ? <p className="max-w-44 truncate text-xs text-cocoa-body/60">{pronunciationNote}</p> : null}
    </div>
  )
}
