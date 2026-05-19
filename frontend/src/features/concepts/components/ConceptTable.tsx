import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { AdminTable } from '../../../components/admin/AdminTable'
import { ImagePreview } from '../../../components/admin/MediaPreview'
import { formatDate } from '../../../lib/date'
import { ConceptDifficultyBadge } from './ConceptDifficultyBadge'
import { ConceptStatusBadge } from './ConceptStatusBadge'
import type { Concept } from '../types/concept.types'

type Props = {
  concepts: Concept[]
  loading: boolean
  total: number
  filtered: boolean
  onCreate: () => void
  onEdit: (concept: Concept) => void
  onToggleStatus: (concept: Concept) => void
}

function ConceptMark({ title }: { title: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-forest-accent/15 bg-[rgba(31,90,61,0.06)] text-sm font-bold text-forest-700">
      {title.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function ConceptTable({ concepts, loading, total, filtered, onCreate, onEdit, onToggleStatus }: Props) {
  const columns = useMemo<ColumnDef<Concept>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
          const concept = row.original

          return (
            <div className="flex items-center gap-3">
              <ConceptMark title={concept.title} />
              <div>
                <p className="font-semibold text-cocoa-800">{concept.title}</p>
                <p className="max-w-xs truncate text-sm text-cocoa-body/70">
                  {concept.description || 'Concept'}
                </p>
              </div>
            </div>
          )
        },
        meta: { cellClassName: 'py-5' },
      },
      {
        accessorKey: 'defaultImageUrl',
        header: 'Image',
        cell: ({ row }) => <ImagePreview src={row.original.defaultImageUrl} alt={row.original.title} />,
      },
      {
        accessorKey: 'key',
        header: 'Key',
        cell: ({ getValue }) => (
          <span className="rounded-md bg-stone-100 px-2 py-1 font-mono text-xs text-cocoa-700 ring-1 ring-sand-100">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => getValue<string | null>() || '-',
      },
      {
        accessorKey: 'difficultyLevel',
        header: 'Difficulty',
        cell: ({ row }) => <ConceptDifficultyBadge difficulty={row.original.difficultyLevel} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ConceptStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'sortOrder',
        header: 'Sort',
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
          const concept = row.original

          return (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(concept)}
                className="rounded-xl border border-forest-accent/35 bg-white px-3 py-1.5 text-sm font-semibold text-forest-700 transition hover:border-forest-accent hover:bg-forest-50/30 hover:shadow-[0_8px_22px_rgba(31,90,61,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onToggleStatus(concept)}
                className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa-body transition hover:border-terracotta-500/50 hover:bg-cream-100/60 hover:text-terracotta-600 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {concept.status === 'active' ? 'Disable' : 'Enable'}
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
      data={concepts}
      getRowId={(concept) => concept.id}
      title={`${total} concept records`}
      subtitle="Language-independent learning ideas"
      loading={loading}
      loadingLabel="Loading concepts..."
      emptyState={{
        title: filtered ? 'No matching concepts' : 'No concepts yet',
        description: filtered
          ? 'Try adjusting your search, category, difficulty, or status filters.'
          : 'Create your first learning concept. Concepts are language-independent ideas such as greeting, mother, water, or thank you.',
        action: !filtered ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.15)] transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            Add concept
          </button>
        ) : undefined,
      }}
    />
  )
}
