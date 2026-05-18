import type { ReactNode } from 'react'

type EmptyState = {
  title: string
  description: string
  action?: ReactNode
}

type AdminDataTableProps = {
  title: string
  subtitle?: string
  loading: boolean
  loadingLabel: string
  isEmpty: boolean
  emptyState: EmptyState
  children: ReactNode
}

export function AdminDataTable({
  title,
  subtitle,
  loading,
  loadingLabel,
  isEmpty,
  emptyState,
  children,
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

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-[rgba(31,90,61,0.025)] shadow-soft">
      <div className="flex items-center justify-between gap-4 border-b border-sand-200/60 px-6 py-5">
        <p className="text-sm font-semibold text-cocoa-800">{title}</p>
        {subtitle ? <p className="text-xs font-medium text-forest-600/80">{subtitle}</p> : null}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
