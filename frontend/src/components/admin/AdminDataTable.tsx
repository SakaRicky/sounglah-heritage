import type { ReactNode } from 'react'

type EmptyState = {
  title: string
  description: string
  action?: ReactNode
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

type AdminDataTableProps = {
  title: string
  subtitle?: string
  loading: boolean
  loadingLabel: string
  isEmpty: boolean
  emptyState: EmptyState
  children: ReactNode
  pagination?: Pagination
  scrollMaxHeight?: string
}

export function AdminDataTable({
  title,
  subtitle,
  loading,
  loadingLabel,
  isEmpty,
  emptyState,
  children,
  pagination,
  scrollMaxHeight,
}: AdminDataTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-forest-50/20 p-8 text-center text-sm text-cocoa-body shadow-soft">
        {loadingLabel}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-forest-50/20 p-8 text-center shadow-soft">
        <h2 className="text-base font-semibold text-cocoa-800">{emptyState.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-cocoa-body">{emptyState.description}</p>
        {emptyState.action ? <div className="mt-5">{emptyState.action}</div> : null}
      </div>
    )
  }

  const totalPages = pagination ? Math.max(Math.ceil(pagination.total / pagination.pageSize), 1) : 1
  const pageStart = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0
  const pageEnd = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-[rgba(31,90,61,0.025)] shadow-soft">
      <div className="flex items-center justify-between gap-4 border-b border-sand-200/60 px-6 py-5">
        <p className="text-sm font-semibold text-cocoa-800">{title}</p>
        {subtitle ? <p className="text-xs font-medium text-forest-600/80">{subtitle}</p> : null}
      </div>
      <div
        className="overflow-x-auto overflow-y-auto"
        style={scrollMaxHeight ? { maxHeight: scrollMaxHeight } : undefined}
      >
        {children}
      </div>
      {pagination ? (
        <div className="flex flex-col gap-4 border-t border-sand-200/60 bg-white/75 px-5 py-4 text-sm text-cocoa-body sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium">
            {pagination.total > 0 ? `${pageStart}-${pageEnd} of ${pagination.total}` : '0 records'}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-forest-600/75">Rows</span>
              <select
                value={pagination.pageSize}
                onChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}
                className="rounded-lg border border-sand-200 bg-white px-2 py-1.5 text-sm font-semibold text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              >
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>

            <div className="font-medium text-cocoa-body">
              Page {pagination.page} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-sand-200 bg-white px-3 py-1.5 font-semibold text-forest-700 transition hover:border-forest-300 hover:bg-forest-50/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="rounded-lg border border-sand-200 bg-white px-3 py-1.5 font-semibold text-forest-700 transition hover:border-forest-300 hover:bg-forest-50/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
