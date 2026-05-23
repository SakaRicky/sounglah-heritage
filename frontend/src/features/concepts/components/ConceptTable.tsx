import { useMemo, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { AdminTable } from '../../../components/admin/AdminTable'
import { ImagePreview } from '../../../components/admin/MediaPreview'
import { formatDate } from '../../../lib/date'
import { ConceptDifficultyBadge } from './ConceptDifficultyBadge'
import { ConceptMobileCard } from './ConceptMobileCard'
import { ConceptStatusBadge } from './ConceptStatusBadge'
import { ConceptTextsPreviewButton } from './ConceptTextsPreviewDialog'
import type { Concept } from '../types/concept.types'

type Props = {
  concepts: Concept[]
  loading: boolean
  total: number
  filtered: boolean
  onCreate: () => void
  onEdit: (concept: Concept) => void
  onPreviewTexts: (concept: Concept) => void
  onQuickImageSelect: (concept: Concept, file: File) => void
  onToggleStatus: (concept: Concept) => void
  quickImageUploadingId: string | null
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  viewMode?: 'list' | 'grid'
}

function ConceptMark({ title }: { title: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-forest-accent/15 bg-[rgba(31,90,61,0.06)] text-sm font-bold text-forest-700">
      {title.slice(0, 1).toUpperCase()}
    </span>
  )
}

function QuickImageUploadButton({
  concept,
  uploading,
  onQuickImageSelect,
}: {
  concept: Concept
  uploading: boolean
  onQuickImageSelect: (concept: Concept, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleFileChange(file: File | null) {
    if (!file) {
      return
    }

    onQuickImageSelect(concept, file)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="inline-flex">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg text-left transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-forest-200 disabled:cursor-wait disabled:opacity-60"
        title={concept.image_url ? 'Change concept image' : 'Upload concept image'}
      >
        {uploading ? (
          <span className="text-xs font-medium text-forest-700">Uploading...</span>
        ) : (
          <ImagePreview
            src={concept.image_url}
            alt={concept.image_alt_text || concept.title}
          />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
      />
    </div>
  )
}

export function ConceptTable({
  concepts,
  loading,
  total,
  filtered,
  onCreate,
  onEdit,
  onPreviewTexts,
  onQuickImageSelect,
  onToggleStatus,
  quickImageUploadingId,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  viewMode = 'list',
}: Props) {
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
        accessorKey: 'image_url',
        header: 'Image',
        cell: ({ row }) => (
          <QuickImageUploadButton
            concept={row.original}
            uploading={quickImageUploadingId === row.original.id}
            onQuickImageSelect={onQuickImageSelect}
          />
        ),
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
              <ConceptTextsPreviewButton concept={concept} onPreview={onPreviewTexts} />
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
    [onEdit, onPreviewTexts, onQuickImageSelect, onToggleStatus, quickImageUploadingId],
  )

  return (
    <div>
      {/* Visual Card Grid / Gallery View */}
      <div className={[
        "space-y-4 rounded-3xl border border-sand-200/80 bg-cream-50/25 p-4 sm:p-6 shadow-sm",
        viewMode === 'grid' ? 'block' : 'lg:hidden'
      ].join(' ')}>
        {loading ? (
          <div className="p-8 text-center text-sm text-cocoa-body">
            Loading concepts...
          </div>
        ) : concepts.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-base font-semibold text-cocoa-800">
              {filtered ? 'No matching concepts' : 'No concepts yet'}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-cocoa-body">
              {filtered
                ? 'Try adjusting your search, category, difficulty, or status filters.'
                : 'Create your first learning concept.'}
            </p>
            {!filtered ? (
              <button
                type="button"
                onClick={onCreate}
                className="mt-5 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-forest-700 focus:outline-none"
              >
                Add concept
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {concepts.map((concept) => (
                <ConceptMobileCard
                  key={concept.id}
                  concept={concept}
                  onEdit={onEdit}
                  onPreviewTexts={onPreviewTexts}
                  onToggleStatus={onToggleStatus}
                  onQuickImageSelect={onQuickImageSelect}
                  uploading={quickImageUploadingId === concept.id}
                />
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-sand-200/60 pt-4 text-sm text-cocoa-body">
              <span className="font-medium">
                Page {page} of {Math.max(Math.ceil(total / pageSize), 1)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className="rounded-lg border border-sand-200 bg-white px-3 py-1.5 font-semibold text-forest-700 transition hover:bg-forest-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= Math.ceil(total / pageSize)}
                  onClick={() => onPageChange(page + 1)}
                  className="rounded-lg border border-sand-200 bg-white px-3 py-1.5 font-semibold text-forest-700 transition hover:bg-forest-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop List / Table View Layout */}
      <div className={viewMode === 'list' ? 'hidden lg:block' : 'hidden'}>
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
          pagination={{
            page,
            pageSize,
            total,
            onPageChange,
            onPageSizeChange,
          }}
          scrollMaxHeight="32rem"
        />
      </div>
    </div>
  )
}
