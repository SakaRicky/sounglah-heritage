import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef, RowData } from '@tanstack/react-table'
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
  getRowClassName?: (row: TData) => string
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  scrollMaxHeight?: string
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
  getRowClassName,
  pagination,
  scrollMaxHeight,
}: AdminTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      pagination={pagination}
      scrollMaxHeight={scrollMaxHeight}
    >
      <table className="min-w-full divide-y divide-sand-100 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-forest-50/95 text-xs uppercase tracking-wide text-forest-700/75 backdrop-blur-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = header.column.columnDef.meta?.align

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
                      <div
                        className={[
                          'inline-flex items-center gap-1.5',
                          align === 'right' ? 'justify-end' : '',
                        ].join(' ')}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-sand-100/80 bg-white/70">
          {table.getRowModel().rows.map((row) => {
            const customRowClass = getRowClassName ? getRowClassName(row.original) : ''
            return (
              <tr
                key={row.id}
                className={[
                  'align-middle transition-all duration-200 hover:bg-forest-50/30',
                  customRowClass,
                ].join(' ')}
              >
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
            )
          })}
        </tbody>
      </table>
    </AdminDataTable>
  )
}
