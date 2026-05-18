import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef, RowData, SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { AdminDataTable } from './AdminDataTable'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'right'
    headerClassName?: string
    cellClassName?: string
  }
}

type EmptyState = {
  title: string
  description: string
  action?: ReactNode
}

type AdminTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  title: string
  subtitle?: string
  loading: boolean
  loadingLabel: string
  emptyState: EmptyState
  getRowId?: (row: TData) => string
}

function SortIndicator({ direction }: { direction: false | 'asc' | 'desc' }) {
  return (
    <svg
      className={[
        'h-3.5 w-3.5 transition',
        direction ? 'opacity-90' : 'opacity-40 group-hover:opacity-75',
      ].join(' ')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {direction === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14l4-4 4 4" />
      ) : direction === 'desc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10l4 4 4-4" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10l4-4 4 4M16 14l-4 4-4-4" />
      )}
    </svg>
  )
}

export function AdminTable<TData>({
  columns,
  data,
  title,
  subtitle,
  loading,
  loadingLabel,
  emptyState,
  getRowId,
}: AdminTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  })

  return (
    <AdminDataTable
      title={title}
      subtitle={subtitle}
      loading={loading}
      loadingLabel={loadingLabel}
      isEmpty={data.length === 0}
      emptyState={emptyState}
    >
      <table className="min-w-full divide-y divide-sand-100 text-left text-sm">
        <thead className="bg-forest-50/30 text-xs uppercase tracking-wide text-forest-700/75">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = header.column.columnDef.meta?.align
                const canSort = header.column.getCanSort()

                return (
                  <th
                    key={header.id}
                    className={[
                      'group px-5 py-4 font-semibold',
                      align === 'right' ? 'text-right' : '',
                      header.column.columnDef.meta?.headerClassName ?? '',
                    ].join(' ')}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        disabled={!canSort}
                        onClick={header.column.getToggleSortingHandler()}
                        className={[
                          'inline-flex items-center gap-1.5',
                          align === 'right' ? 'justify-end' : '',
                          canSort ? 'cursor-pointer hover:text-forest-700' : 'cursor-default',
                        ].join(' ')}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort ? <SortIndicator direction={header.column.getIsSorted()} /> : null}
                      </button>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-sand-100/80 bg-white/70">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="align-middle transition-all duration-200 hover:bg-forest-50/30">
              {row.getVisibleCells().map((cell) => {
                const align = cell.column.columnDef.meta?.align

                return (
                  <td
                    key={cell.id}
                    className={[
                      'px-5 py-4 text-cocoa-body',
                      align === 'right' ? 'text-right' : '',
                      cell.column.columnDef.meta?.cellClassName ?? '',
                    ].join(' ')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </AdminDataTable>
  )
}
