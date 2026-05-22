import { Link } from 'react-router-dom'
import { Check, Loader2, Pencil, ThumbsDown } from 'lucide-react'

import type { ConceptTextReviewQueueItem } from '../types/conceptText.types'
import { conceptTextReviewEditPath } from '../utils/conceptTextReviewPaths'

type Props = {
  conceptText: ConceptTextReviewQueueItem
  saving?: boolean
  layout?: 'desktop' | 'mobile'
  onApprove: () => void
  onReject: () => void
}

const iconButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-50'

function ApproveIconButton({
  saving,
  onClick,
}: {
  saving?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      title="Approve text"
      aria-label="Approve text"
      className={`${iconButtonClass} border-forest-accent/25 bg-forest-accent text-white shadow-[0_8px_20px_rgba(31,90,61,0.16)] hover:bg-forest-accent-hover`}
    >
      {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Check className="h-5 w-5" aria-hidden />}
    </button>
  )
}

function RejectIconButton({
  saving,
  onClick,
}: {
  saving?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      title="Reject text"
      aria-label="Reject text"
      className={`${iconButtonClass} border-terracotta-500/35 bg-white text-terracotta-600 hover:border-terracotta-500/55 hover:bg-terracotta-400/10`}
    >
      <ThumbsDown className="h-5 w-5" aria-hidden />
    </button>
  )
}

function EditButton({ editPath, compact = false }: { editPath: string; compact?: boolean }) {
  return (
    <Link
      to={editPath}
      className={[
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white font-semibold text-forest-700 transition hover:border-forest-accent/35 hover:bg-forest-50/40 focus:outline-none focus:ring-2 focus:ring-forest-200',
        compact ? 'w-full px-4 py-2.5 text-sm' : 'px-4 py-2 text-sm',
      ].join(' ')}
    >
      <Pencil className="h-4 w-4 shrink-0" aria-hidden />
      Edit
    </Link>
  )
}

function ActionRow({
  canApprove,
  canReject,
  saving,
  editPath,
  compact,
  onApprove,
  onReject,
}: {
  canApprove: boolean
  canReject: boolean
  saving?: boolean
  editPath: string
  compact?: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className={['grid items-center gap-4', compact ? 'grid-cols-[3rem_1fr_3rem]' : 'grid-cols-[2.75rem_1fr_2.75rem]'].join(' ')}>
      <div className="flex justify-start">
        {canApprove ? <ApproveIconButton saving={saving} onClick={onApprove} /> : null}
      </div>
      <EditButton editPath={editPath} compact={compact} />
      <div className="flex justify-end">
        {canReject ? <RejectIconButton saving={saving} onClick={onReject} /> : null}
      </div>
    </div>
  )
}

export function ConceptTextReviewActions({
  conceptText,
  saving = false,
  layout = 'desktop',
  onApprove,
  onReject,
}: Props) {
  const canApprove = conceptText.reviewStatus !== 'approved'
  const canReject = conceptText.reviewStatus !== 'rejected'
  const editPath = conceptTextReviewEditPath(conceptText.id)

  if (layout === 'mobile') {
    return (
      <div className="mt-5 border-t border-sand-100 pt-5 sm:ml-[3.25rem]">
        <ActionRow
          canApprove={canApprove}
          canReject={canReject}
          saving={saving}
          editPath={editPath}
          compact
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>
    )
  }

  return (
    <div className="min-w-[12rem] py-1">
      <ActionRow
        canApprove={canApprove}
        canReject={canReject}
        saving={saving}
        editPath={editPath}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  )
}
