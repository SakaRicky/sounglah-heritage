import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { AdminTable } from '../../../components/admin/AdminTable'
import { AudioPreview } from '../../../components/admin/MediaPreview'
import { formatDate } from '../../../lib/date'
import { ConceptTextReviewBadge } from './ConceptTextReviewBadge'
import { ConceptTextStatusBadge } from './ConceptTextStatusBadge'
import type { ConceptText } from '../types/conceptText.types'

type Props = {
  conceptTexts: ConceptText[]
  loading: boolean
  total: number
  filtered: boolean
  onCreate: () => void
  onEdit: (conceptText: ConceptText) => void
  onToggleStatus: (conceptText: ConceptText) => void
}

function ConceptMark({ title }: { title: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest-accent/15 bg-[rgba(31,90,61,0.06)] text-sm font-bold text-forest-700">
      {title.slice(0, 1).toUpperCase()}
    </span>
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
}: Props) {
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
                <p className="font-semibold text-cocoa-800">{title}</p>
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
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-cocoa-800">{row.original.language?.name ?? 'Unknown language'}</p>
            <p className="font-mono text-xs text-cocoa-body/65">{row.original.language?.code ?? row.original.languageId}</p>
          </div>
        ),
      },
      {
        accessorKey: 'text',
        header: 'Text',
        cell: ({ row }) => (
          <div>
            <p className="max-w-sm truncate font-semibold text-cocoa-800">{row.original.text}</p>
            {row.original.pronunciation ? (
              <p className="max-w-sm truncate text-xs text-cocoa-body/65">{row.original.pronunciation}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'audioUrl',
        header: 'Audio',
        cell: ({ row }) => (
          <div className="space-y-1">
            <AudioPreview src={row.original.audioUrl} />
            {row.original.pronunciationNote ? (
              <p className="max-w-44 truncate text-xs text-cocoa-body/60">{row.original.pronunciationNote}</p>
            ) : null}
          </div>
        ),
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
        cell: ({ getValue }) => formatDate(getValue<string | null>()),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const conceptText = row.original

          return (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(conceptText)}
                className="rounded-xl border border-forest-accent/35 bg-white px-3 py-1.5 text-sm font-semibold text-forest-700 transition hover:border-forest-accent hover:bg-forest-50/30 hover:shadow-[0_8px_22px_rgba(31,90,61,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onToggleStatus(conceptText)}
                className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa-body transition hover:border-terracotta-500/50 hover:bg-cream-100/60 hover:text-terracotta-600 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {conceptText.status === 'active' ? 'Disable' : 'Enable'}
              </button>
            </div>
          )
        },
      },
    ],
    [onEdit, onToggleStatus],
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
    />
  )
}
