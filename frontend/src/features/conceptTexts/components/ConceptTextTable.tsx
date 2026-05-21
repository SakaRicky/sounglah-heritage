import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Pencil, Power, PowerOff, Volume2, VolumeX } from 'lucide-react'

import { AdminTable } from '../../../components/admin/AdminTable'
import { formatDate } from '../../../lib/date'
import { ConceptTextReviewBadge } from './ConceptTextReviewBadge'
import { ConceptTextStatusBadge } from './ConceptTextStatusBadge'
import type { ConceptText, ConceptTextAudioStatus } from '../types/conceptText.types'

type Props = {
  conceptTexts: ConceptText[]
  loading: boolean
  total: number
  filtered: boolean
  onCreate: () => void
  onEdit: (conceptText: ConceptText) => void
  onToggleStatus: (conceptText: ConceptText) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const conceptMarkColors = [
  'border-forest-accent/15 bg-forest-accent/10 text-forest-700',
  'border-gold-500/20 bg-gold-400/15 text-cocoa-700',
  'border-terracotta-500/15 bg-terracotta-400/10 text-terracotta-600',
  'border-forest-300/20 bg-forest-50 text-forest-600',
]

const languageFlags: Record<string, string> = {
  med: '🇨🇲',
  fr: '🇫🇷',
  en: '🇺🇸',
}

function ConceptMark({ title }: { title: string }) {
  const initial = title.slice(0, 1).toUpperCase()
  const colorClass = conceptMarkColors[initial.charCodeAt(0) % conceptMarkColors.length]

  return (
    <span
      className={[
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-base font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
        colorClass,
      ].join(' ')}
    >
      {initial}
    </span>
  )
}

function LanguageFlag({ code }: { code?: string }) {
  const normalizedCode = code?.toLowerCase() ?? ''
  const flag = languageFlags[normalizedCode] ?? '🌍'

  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-[0_0_0_1px_rgba(221,187,136,0.45)]">
      {flag}
    </span>
  )
}

function AudioCell({ conceptText }: { conceptText: ConceptText }) {
  const summary = conceptText.audioSummary
  const status = summary?.status ?? (conceptText.audioUrl ? 'approved' : 'missing')
  const audioUrl = summary?.currentAudioUrl ?? conceptText.audioUrl
  const durationLabel = summary?.durationSeconds ? `${summary.durationSeconds}s` : null
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

  if (status === 'missing') {
    return (
      <div className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-cocoa-body/55">
        <VolumeX className="h-4 w-4 text-cocoa-body/45" aria-hidden />
        <span>{statusLabel[status]}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', statusClass[status]].join(' ')}>
          {audioUrl ? <Volume2 className="h-3.5 w-3.5" aria-hidden /> : <VolumeX className="h-3.5 w-3.5" aria-hidden />}
          {statusLabel[status]}
        </span>
        {durationLabel ? <span className="text-xs font-medium text-cocoa-body/55">{durationLabel}</span> : null}
      </div>
      {audioUrl ? (
        <audio src={audioUrl} controls className="h-8 w-40 max-w-full" preload="none">
          <a href={audioUrl}>Audio</a>
        </audio>
      ) : null}
      {conceptText.pronunciationNote ? (
        <p className="max-w-44 truncate text-xs text-cocoa-body/60">{conceptText.pronunciationNote}</p>
      ) : null}
    </div>
  )
}

export function ConceptTextTable({
  conceptTexts,
  loading,
  total,
  filtered,
  onCreate,
  onEdit,
  onToggleStatus,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const [openActionId, setOpenActionId] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<ConceptText>[]>(
    () => [
      {
        accessorKey: 'concept',
        header: 'Concept',
        cell: ({ row }) => {
          const concept = row.original.concept
          const title = concept?.title ?? 'Unknown concept'

          return (
            <div className="flex items-center gap-3">
              <ConceptMark title={title} />
              <div>
                <p className="font-semibold leading-5 text-cocoa-800">{title}</p>
                <p className="font-mono text-xs text-cocoa-body/65">{concept?.key ?? row.original.conceptId}</p>
              </div>
            </div>
          )
        },
        meta: { cellClassName: 'py-5' },
      },
      {
        accessorKey: 'language',
        header: 'Language',
        cell: ({ row }) => {
          const language = row.original.language

          return (
            <div className="flex items-center gap-3">
              <LanguageFlag code={language?.code} />
              <div>
                <p className="font-semibold leading-5 text-cocoa-800">{language?.name ?? 'Unknown language'}</p>
                <p className="font-mono text-xs text-cocoa-body/65">{language?.code ?? row.original.languageId}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'text',
        header: 'Text',
        cell: ({ row }) => {
          const conceptText = row.original

          return (
            <div className="max-w-sm">
              <p className="truncate text-sm font-semibold text-cocoa-ink">{conceptText.text}</p>
              {conceptText.pronunciation ? (
                <p className="mt-1 truncate text-xs text-cocoa-body/65">{conceptText.pronunciation}</p>
              ) : null}
              {conceptText.literalMeaning ? (
                <p className="mt-1 truncate text-xs italic text-forest-600/70">{conceptText.literalMeaning}</p>
              ) : null}
            </div>
          )
        },
      },
      {
        accessorKey: 'audioSummary',
        header: 'Audio',
        cell: ({ row }) => <AudioCell conceptText={row.original} />,
      },
      {
        accessorKey: 'reviewStatus',
        header: 'Review',
        cell: ({ row }) => <ConceptTextReviewBadge reviewStatus={row.original.reviewStatus} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ConceptTextStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ getValue }) => <span className="font-medium text-cocoa-body/75">{formatDate(getValue<string | null>())}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const conceptText = row.original
          const isActive = conceptText.status === 'active'

          return (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(conceptText)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white px-3 py-2 text-sm font-semibold text-forest-700 shadow-[0_4px_14px_rgba(47,26,16,0.04)] transition hover:border-forest-accent hover:bg-forest-50/50 hover:shadow-[0_8px_22px_rgba(31,90,61,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Edit
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenActionId((currentId) => (currentId === conceptText.id ? null : conceptText.id))}
                  aria-expanded={openActionId === conceptText.id}
                  aria-label="More actions"
                  title="More actions"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sand-200 bg-white text-cocoa-body/65 shadow-[0_4px_14px_rgba(47,26,16,0.04)] transition hover:border-forest-300 hover:bg-forest-50/40 hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
                >
                  <MoreVertical className="h-4 w-4" aria-hidden />
                </button>
                {openActionId === conceptText.id ? (
                  <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-sand-200 bg-white p-1.5 text-left shadow-card">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionId(null)
                        onToggleStatus(conceptText)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 hover:text-terracotta-600 focus:outline-none focus:ring-2 focus:ring-forest-200"
                    >
                      {isActive ? <PowerOff className="h-4 w-4" aria-hidden /> : <Power className="h-4 w-4" aria-hidden />}
                      {isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        },
      },
    ],
    [onEdit, onToggleStatus, openActionId],
  )

  return (
    <AdminTable
      columns={columns}
      data={conceptTexts}
      getRowId={(conceptText) => conceptText.id}
      title={`${total} concept text records`}
      subtitle="One primary expression per concept and language"
      loading={loading}
      loadingLabel="Loading concept texts..."
      emptyState={{
        title: filtered ? 'No matching concept texts' : 'No concept texts yet',
        description: filtered
          ? 'Try changing the selected concept, language, status, review status, or search term.'
          : 'Add your first translated text by choosing a concept, a language, and the text used for that concept.',
        action: !filtered ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            Add concept text
          </button>
        ) : undefined,
      }}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
      }}
    />
  )
}
