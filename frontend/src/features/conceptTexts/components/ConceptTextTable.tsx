import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Pencil, Power, PowerOff } from 'lucide-react'

import { AdminTable } from '../../../components/admin/AdminTable'
import { formatDate } from '../../../lib/date'
import { ConceptTextAudioCell } from './ConceptTextAudioCell'
import { ConceptTextReviewBadge } from './ConceptTextReviewBadge'
import { ConceptTextStatusBadge } from './ConceptTextStatusBadge'
import type { ConceptText, ConceptTextReviewStatus } from '../types/conceptText.types'
import { canRecordConceptTextAudio } from '../utils/conceptTextAudioPermissions'
import { ConceptTextQuickReviewButtons } from './ConceptTextQuickReviewButtons'

type Props = {
  conceptTexts: ConceptText[]
  loading: boolean
  total: number
  filtered: boolean
  onCreate: () => void
  onEdit: (conceptText: ConceptText) => void
  onToggleStatus: (conceptText: ConceptText) => void
  onReviewStatusChange: (conceptText: ConceptText, reviewStatus: ConceptTextReviewStatus) => Promise<void>
  reviewingTextId: string | null
  selectedIds: Set<string>
  onToggleSelected: (id: string) => void
  onToggleSelectAll: () => void
  onAudioSubmitted: (conceptText: ConceptText, audioBlob: Blob, durationSeconds: number) => Promise<void>
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

type ConceptTextTableContextValue = {
  activeRecorderId: string | null
  setActiveRecorderId: Dispatch<SetStateAction<string | null>>
  openActionId: string | null
  setOpenActionId: Dispatch<SetStateAction<string | null>>
  onEdit: (conceptText: ConceptText) => void
  onToggleStatus: (conceptText: ConceptText) => void
  onReviewStatusChange: (conceptText: ConceptText, reviewStatus: ConceptTextReviewStatus) => Promise<void>
  reviewingTextId: string | null
  onAudioSubmitted: (conceptText: ConceptText, audioBlob: Blob, durationSeconds: number) => Promise<void>
}

const ConceptTextTableContext = createContext<ConceptTextTableContextValue | null>(null)

function useConceptTextTableContext() {
  const context = useContext(ConceptTextTableContext)

  if (!context) {
    throw new Error('ConceptTextTableContext must be used inside ConceptTextTable.')
  }

  return context
}

const conceptMarkColors = [
  'border-forest-accent/20 bg-gradient-to-br from-forest-accent/15 to-forest-accent/5 text-forest-700 shadow-sm',
  'border-gold-500/30 bg-gradient-to-br from-gold-400/20 to-gold-400/5 text-cocoa-700 shadow-sm',
  'border-terracotta-500/25 bg-gradient-to-br from-terracotta-400/15 to-terracotta-400/5 text-terracotta-600 shadow-sm',
  'border-forest-300/30 bg-gradient-to-br from-forest-100 to-forest-50 text-forest-600 shadow-sm',
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
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-base shadow-[0_2px_6px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(221,187,136,0.5)] transform hover:scale-110 transition-transform duration-200">
      {flag}
    </span>
  )
}

function AudioCell({ conceptText }: { conceptText: ConceptText }) {
  const { activeRecorderId, setActiveRecorderId, onAudioSubmitted } = useConceptTextTableContext()
  const audioSummary = conceptText.audioSummary ?? {
    status: conceptText.audioUrl ? 'approved' : 'missing',
    currentAudioId: null,
    currentAudioUrl: conceptText.audioUrl ?? null,
    pendingAudioId: null,
    pendingAudioUrl: null,
    durationSeconds: null,
  }
  const canRecordAudio = canRecordConceptTextAudio(conceptText.language?.code)

  return (
    <ConceptTextAudioCell
      conceptTextId={conceptText.id}
      languageName={conceptText.language?.name ?? 'Unknown language'}
      conceptName={conceptText.concept?.title ?? 'Unknown concept'}
      text={conceptText.text}
      audioSummary={audioSummary}
      fallbackAudioUrl={conceptText.audioUrl}
      pronunciationNote={conceptText.pronunciationNote}
      canRecord={canRecordAudio}
      canReview={false}
      activeRecorderId={activeRecorderId}
      onRecorderActivate={setActiveRecorderId}
      onRecorderCancel={() => setActiveRecorderId(null)}
      onAudioSubmit={(audioBlob, durationSeconds) => onAudioSubmitted(conceptText, audioBlob, durationSeconds)}
    />
  )
}

function ReviewCell({ conceptText }: { conceptText: ConceptText }) {
  const { onReviewStatusChange, reviewingTextId } = useConceptTextTableContext()
  const saving = reviewingTextId === conceptText.id

  return (
    <div className="flex items-center gap-2.5">
      <ConceptTextReviewBadge reviewStatus={conceptText.reviewStatus} />
      {conceptText.status === 'active' ? (
        <ConceptTextQuickReviewButtons
          reviewStatus={conceptText.reviewStatus}
          saving={saving}
          onApprove={() => onReviewStatusChange(conceptText, 'approved')}
          onReject={() => onReviewStatusChange(conceptText, 'rejected')}
        />
      ) : null}
    </div>
  )
}

function ActionsCell({ conceptText }: { conceptText: ConceptText }) {
  const { openActionId, setOpenActionId, onEdit, onToggleStatus } = useConceptTextTableContext()
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
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setOpenActionId((currentId) => (currentId === conceptText.id ? null : conceptText.id))
          }}
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
}

export function ConceptTextTable({
  conceptTexts,
  loading,
  total,
  filtered,
  onCreate,
  onEdit,
  onToggleStatus,
  onReviewStatusChange,
  reviewingTextId,
  selectedIds,
  onToggleSelected,
  onToggleSelectAll,
  onAudioSubmitted,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [activeRecorderId, setActiveRecorderId] = useState<string | null>(null)

  useEffect(() => {
    if (openActionId === null) {
      return
    }

    const handleDocumentClick = () => {
      setOpenActionId(null)
    }

    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [openActionId])

  const tableContextValue = useMemo(
    () => ({
      activeRecorderId,
      setActiveRecorderId,
      openActionId,
      setOpenActionId,
      onEdit,
      onToggleStatus,
      onReviewStatusChange,
      reviewingTextId,
      onAudioSubmitted,
    }),
    [activeRecorderId, onAudioSubmitted, onEdit, onReviewStatusChange, onToggleStatus, openActionId, reviewingTextId],
  )

  const selectableIds = useMemo(
    () => conceptTexts.filter((conceptText) => conceptText.status === 'active').map((conceptText) => conceptText.id),
    [conceptTexts],
  )
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id))
  const someSelected = selectableIds.some((id) => selectedIds.has(id))

  const columns = useMemo<ColumnDef<ConceptText>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = !allSelected && someSelected
              }
            }}
            onChange={onToggleSelectAll}
            disabled={selectableIds.length === 0}
            aria-label="Select all concept texts on this page"
            className="h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-200"
          />
        ),
        cell: ({ row }) => {
          const conceptText = row.original
          const selectable = conceptText.status === 'active'

          return (
            <input
              type="checkbox"
              checked={selectedIds.has(conceptText.id)}
              disabled={!selectable}
              onChange={() => onToggleSelected(conceptText.id)}
              aria-label={`Select ${conceptText.concept?.title ?? 'concept text'}`}
              className="h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-200 disabled:cursor-not-allowed disabled:opacity-40"
            />
          )
        },
        meta: { cellClassName: 'w-12' },
      },
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
            <div className="max-w-md space-y-1.5 py-1">
              <p className="whitespace-normal break-words text-sm font-semibold text-cocoa-ink leading-relaxed">
                {conceptText.text}
              </p>
              {conceptText.pronunciation ? (
                <div className="pt-0.5">
                  <p className="whitespace-normal break-words text-xs text-cocoa-body/75 font-medium leading-relaxed bg-sand-100/50 px-2.5 py-1 rounded-lg border border-sand-200/40 inline-flex items-center gap-1.5">
                    <span className="text-sm">🗣️</span> {conceptText.pronunciation}
                  </p>
                </div>
              ) : null}
              {conceptText.literalMeaning ? (
                <div className="pt-0.5">
                  <p className="whitespace-normal break-words text-xs text-forest-700/80 bg-forest-50/40 px-2.5 py-1 rounded-lg border border-forest-100/20 italic inline-flex items-center gap-1.5">
                    <span>💡</span> Literal: "{conceptText.literalMeaning}"
                  </p>
                </div>
              ) : null}
            </div>
          )
        },
      },
      {
        accessorKey: 'audioSummary',
        header: 'Audio',
        cell: ({ row }) => <AudioCell conceptText={row.original} />,
        meta: {
          headerClassName: 'min-w-[22rem] w-[24rem]',
          cellClassName: 'min-w-[22rem] w-[24rem]',
        },
      },
      {
        accessorKey: 'reviewStatus',
        header: 'Review',
        cell: ({ row }) => <ReviewCell conceptText={row.original} />,
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
        cell: ({ row }) => <ActionsCell conceptText={row.original} />,
      },
    ],
    [allSelected, onToggleSelectAll, onToggleSelected, selectableIds.length, selectedIds, someSelected],
  )

  return (
    <ConceptTextTableContext.Provider value={tableContextValue}>
      <AdminTable
        columns={columns}
        data={conceptTexts}
        getRowId={(conceptText) => conceptText.id}
        getRowClassName={(conceptText) =>
          conceptText.status === 'disabled'
            ? 'opacity-55 bg-sand-50/40 hover:bg-sand-50/60 transition-all duration-200'
            : 'transition-all duration-200'
        }
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
        scrollMaxHeight="32rem"
      />
    </ConceptTextTableContext.Provider>
  )
}
