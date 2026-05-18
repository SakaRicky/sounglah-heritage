import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { AdminTable } from '../../../components/admin/AdminTable'
import { LanguageStatusBadge } from './LanguageStatusBadge'
import type { Language } from '../types/language.types'

type Props = {
  languages: Language[]
  loading: boolean
  total: number
  onEdit: (language: Language) => void
  onToggleStatus: (language: Language) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function LanguageMark({ name }: { name: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-forest-accent/15 bg-[rgba(31,90,61,0.06)] text-sm font-bold text-forest-700">
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

function MoreIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75h.01M12 12h.01M12 17.25h.01" />
    </svg>
  )
}

export function LanguageTable({ languages, loading, total, onEdit, onToggleStatus }: Props) {
  const columns = useMemo<ColumnDef<Language>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const language = row.original

          return (
            <div className="flex items-center gap-3">
              <LanguageMark name={language.name} />
              <div>
                <p className="font-semibold text-cocoa-800">{language.name}</p>
                <p className="text-xs font-medium text-forest-600/75">Content language</p>
              </div>
            </div>
          )
        },
        meta: { cellClassName: 'py-5' },
      },
      {
        accessorKey: 'nativeName',
        header: 'Native Name',
        cell: ({ getValue }) => getValue<string | null>() || '-',
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ getValue }) => (
          <span className="rounded-md bg-stone-100 px-2 py-1 font-mono text-xs text-cocoa-700 ring-1 ring-sand-100">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'direction',
        header: 'Direction',
        cell: ({ getValue }) => <span className="uppercase">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <LanguageStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'sortOrder',
        header: 'Sort Order',
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ getValue }) => (
          <div>
            <div>{formatDate(getValue<string>())}</div>
            <div className="text-xs font-medium text-forest-600/65">by Boris E.</div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const language = row.original

          return (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(language)}
                className="rounded-xl border border-forest-accent/35 bg-white px-3 py-1.5 text-sm font-semibold text-forest-700 transition hover:border-forest-accent hover:bg-forest-50/30 hover:shadow-[0_8px_22px_rgba(31,90,61,0.08)] focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onToggleStatus(language)}
                className="rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa-body transition hover:border-terracotta-500/50 hover:bg-cream-100/60 hover:text-terracotta-600 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                {language.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-sand-200 bg-white text-cocoa-body transition hover:border-forest-accent/40 hover:bg-forest-50/30 hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
                aria-label={`More actions for ${language.name}`}
              >
                <MoreIcon />
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
      data={languages}
      getRowId={(language) => language.id}
      title={`${total} language records`}
      subtitle="Managed content foundation"
      loading={loading}
      loadingLabel="Loading languages..."
      emptyState={{
        title: 'No languages found',
        description: 'Add a language or adjust the search and status filters.',
      }}
    />
  )
}
