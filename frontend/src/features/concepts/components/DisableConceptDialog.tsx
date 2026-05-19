import type { Concept } from '../types/concept.types'

type Props = {
  concept: Concept | null
  saving: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DisableConceptDialog({ concept, saving, onCancel, onConfirm }: Props) {
  if (!concept) {
    return null
  }

  const disabling = concept.status === 'active'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-ink/35 p-4">
      <div className="w-full max-w-md rounded-soft bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-cocoa-800">
          {disabling ? `Disable ${concept.title}?` : `Enable ${concept.title}?`}
        </h2>
        <p className="mt-3 text-sm leading-6 text-cocoa-body">
          {disabling
            ? 'This concept will remain in the system, but it will no longer be available for new content creation by default.'
            : 'This concept will become available again for content creation.'}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-cta border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="rounded-cta bg-forest-accent px-4 py-2 text-sm font-semibold text-white shadow-button transition hover:bg-forest-accent-hover disabled:opacity-60"
          >
            {saving ? 'Saving...' : disabling ? 'Disable concept' : 'Enable concept'}
          </button>
        </div>
      </div>
    </div>
  )
}
