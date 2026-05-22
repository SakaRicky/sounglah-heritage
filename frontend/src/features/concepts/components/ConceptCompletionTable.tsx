import { AdminDataTable } from '../../../components/admin/AdminDataTable'
import { ImagePreview } from '../../../components/admin/MediaPreview'
import { ConceptCompletionActionsCell } from './ConceptCompletionActionsCell'
import { ConceptCompletionLanguageCell } from './ConceptCompletionLanguageCell'
import { ConceptCompletionStatusBadge } from './ConceptCompletionStatusBadge'
import type { ConceptCompletionLanguage, ConceptCompletionRow } from '../types/concept.types'
import type { ConceptTextReviewStatus } from '../../conceptTexts/types/conceptText.types'

type RequiredLanguageColumn = {
  languageId: string
  languageCode: string
  languageName: string
  requiresConceptTextReview: boolean
}

type Props = {
  rows: ConceptCompletionRow[]
  requiredLanguages: RequiredLanguageColumn[]
  loading: boolean
  total: number
  filtered: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  showTextPreviews?: boolean
  reviewingTextId?: string | null
  onReviewStatusChange?: (textId: string, reviewStatus: ConceptTextReviewStatus) => void
  selectedConceptIds: Set<string>
  onToggleConceptSelected: (conceptId: string) => void
  onToggleSelectAllConcepts: () => void
  publishingConceptId?: string | null
  onPublish?: (conceptId: string) => void
}

function ConceptMark({ title }: { title: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-forest-accent/15 bg-[rgba(31,90,61,0.06)] text-sm font-bold text-forest-700">
      {title.slice(0, 1).toUpperCase()}
    </span>
  )
}

function ConceptCell({
  row,
  selected,
  onToggleSelected,
}: {
  row: ConceptCompletionRow
  selected: boolean
  onToggleSelected: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelected}
        aria-label={`Select ${row.title}`}
        className="h-4 w-4 shrink-0 rounded border-sand-300 text-forest-accent focus:ring-forest-200"
      />
      {row.image_url ? (
        <ImagePreview src={row.image_url} alt={row.image_alt_text || row.title} />
      ) : (
        <ConceptMark title={row.title} />
      )}
      <div>
        <p className="font-semibold text-cocoa-800">{row.title}</p>
        <p className="max-w-xs truncate text-sm text-cocoa-body/70">
          {row.description || row.category || 'Concept'}
        </p>
      </div>
    </div>
  )
}

function languageForColumn(
  row: ConceptCompletionRow,
  column: RequiredLanguageColumn,
): ConceptCompletionLanguage {
  return (
    row.languages.find((language) => language.languageCode === column.languageCode) ?? {
      languageId: column.languageId,
      languageCode: column.languageCode,
      languageName: column.languageName,
      requiresConceptTextReview: column.requiresConceptTextReview,
      hasText: false,
      textStatus: null,
      textId: null,
      text: null,
      pronunciation: null,
    }
  )
}

function ConceptCompletionMobileCard({
  row,
  requiredLanguages,
  showTextPreviews = false,
  reviewingTextId = null,
  onReviewStatusChange,
  selectedConceptIds,
  onToggleConceptSelected,
  publishingConceptId = null,
  onPublish,
}: {
  row: ConceptCompletionRow
  requiredLanguages: RequiredLanguageColumn[]
  showTextPreviews?: boolean
  reviewingTextId?: string | null
  onReviewStatusChange?: (textId: string, reviewStatus: ConceptTextReviewStatus) => void
  selectedConceptIds: Set<string>
  onToggleConceptSelected: (conceptId: string) => void
  publishingConceptId?: string | null
  onPublish?: (conceptId: string) => void
}) {
  return (
    <article className="rounded-2xl border border-sand-200 bg-white/80 p-4 shadow-soft">
      <ConceptCell
        row={row}
        selected={selectedConceptIds.has(row.id)}
        onToggleSelected={() => onToggleConceptSelected(row.id)}
      />

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-600/75">Required languages</p>
        <div className="flex flex-col gap-3">
          {requiredLanguages.map((language) => (
            <ConceptCompletionLanguageCell
              key={language.languageCode}
              conceptId={row.id}
              language={languageForColumn(row, language)}
              showCode
              showTextPreviews={showTextPreviews}
              reviewingTextId={reviewingTextId}
              onReviewStatusChange={onReviewStatusChange}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-sand-100 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ConceptCompletionStatusBadge status={row.completionStatus} />
          {onPublish ? (
            <ConceptCompletionActionsCell
              row={row}
              publishingConceptId={publishingConceptId}
              onPublish={onPublish}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function ConceptCompletionTable({
  rows,
  requiredLanguages,
  loading,
  total,
  filtered,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showTextPreviews = false,
  reviewingTextId = null,
  onReviewStatusChange,
  selectedConceptIds,
  onToggleConceptSelected,
  onToggleSelectAllConcepts,
  publishingConceptId = null,
  onPublish,
}: Props) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedConceptIds.has(row.id))
  const someSelected = rows.some((row) => selectedConceptIds.has(row.id))

  return (
    <AdminDataTable
      title={`${total} concept${total === 1 ? '' : 's'}`}
      subtitle="Translation and review status across required languages"
      loading={loading}
      loadingLabel="Loading concept completion..."
      isEmpty={rows.length === 0}
      emptyState={{
        title: filtered ? 'No matching concepts' : 'No concepts to check yet',
        description: filtered
          ? 'Try adjusting your search, status, or required language filters.'
          : 'Add concepts and their required language texts first. This view will show what is ready for lessons.',
      }}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange,
      }}
      scrollMaxHeight="32rem"
    >
      <div className="space-y-4 bg-cream-50/35 p-3 lg:hidden">
        {rows.map((row) => (
          <ConceptCompletionMobileCard
            key={row.id}
            row={row}
            requiredLanguages={requiredLanguages}
            showTextPreviews={showTextPreviews}
            reviewingTextId={reviewingTextId}
            onReviewStatusChange={onReviewStatusChange}
            selectedConceptIds={selectedConceptIds}
            onToggleConceptSelected={onToggleConceptSelected}
            publishingConceptId={publishingConceptId}
            onPublish={onPublish}
          />
        ))}
      </div>

      <table className="hidden min-w-full divide-y divide-sand-100 text-left text-sm lg:table">
        <thead className="sticky top-0 z-10 bg-forest-50/95 text-xs uppercase tracking-wide text-forest-700/75 backdrop-blur-sm">
          <tr>
            <th className="px-5 py-4 font-semibold">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = !allSelected && someSelected
                    }
                  }}
                  onChange={onToggleSelectAllConcepts}
                  disabled={rows.length === 0}
                  aria-label="Select all concepts on this page"
                  className="h-4 w-4 rounded border-sand-300 text-forest-accent focus:ring-forest-200"
                />
                <span>Concept</span>
              </div>
            </th>
            {requiredLanguages.length > 0 ? (
              <th colSpan={requiredLanguages.length} className="border-l border-sand-200/60 px-5 py-4 text-center font-semibold">
                Required languages
              </th>
            ) : null}
            <th className="px-5 py-4 font-semibold">Status</th>
            {onPublish ? <th className="px-5 py-4 font-semibold">Actions</th> : null}
          </tr>
          {requiredLanguages.length > 0 ? (
            <tr className="border-t border-sand-200/60">
              <th className="px-5 py-2" />
              {requiredLanguages.map((language) => (
                <th key={language.languageCode} className="px-5 py-2 text-center font-semibold normal-case tracking-normal">
                  <span className="block text-cocoa-800">{language.languageName}</span>
                  <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-cocoa-body/55">
                    {language.languageCode}
                  </span>
                </th>
              ))}
              <th className="px-5 py-2" />
              {onPublish ? <th className="px-5 py-2" /> : null}
            </tr>
          ) : null}
        </thead>
        <tbody className="divide-y divide-sand-100/80 bg-white/70">
          {rows.map((row) => (
            <tr key={row.id} className="align-middle transition-all duration-200 hover:bg-forest-50/30">
              <td className="px-5 py-4">
                <ConceptCell
                  row={row}
                  selected={selectedConceptIds.has(row.id)}
                  onToggleSelected={() => onToggleConceptSelected(row.id)}
                />
              </td>
              {requiredLanguages.map((language) => (
                <td key={`${row.id}-${language.languageCode}`} className="px-5 py-4 text-center align-top">
                  <ConceptCompletionLanguageCell
                    conceptId={row.id}
                    language={languageForColumn(row, language)}
                    showTextPreviews={showTextPreviews}
                    reviewingTextId={reviewingTextId}
                    onReviewStatusChange={onReviewStatusChange}
                  />
                </td>
              ))}
              <td className="px-5 py-4">
                <ConceptCompletionStatusBadge status={row.completionStatus} />
              </td>
              {onPublish ? (
                <td className="px-5 py-4">
                  <ConceptCompletionActionsCell
                    row={row}
                    publishingConceptId={publishingConceptId}
                    onPublish={onPublish}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </AdminDataTable>
  )
}
