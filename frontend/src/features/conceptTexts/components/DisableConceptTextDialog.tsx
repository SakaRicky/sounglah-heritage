import type { ConceptText } from '../types/conceptText.types'

type Props = {
  conceptText: ConceptText | null
  saving: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DisableConceptTextDialog({ conceptText, saving, onCancel, onConfirm }: Props) {
  if (!conceptText) {
    return null
  }

  const isActive = conceptText.status === 'active'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-ink/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-sand-200 bg-cream-50 p-6 shadow-card">
        <h2 className="text-xl font-bold text-cocoa-800">
          {isActive ? 'Disable this concept text?' : 'Enable this concept text?'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-cocoa-body">
          {isActive
            ? 'This text will remain in the system, but it will not be used in learner-facing content by default.'
            : 'This text will become available for learner-facing content again.'}
        </p>
        <div className="mt-5 rounded-cta border border-sand-100 bg-white/80 p-3">
          <p className="font-semibold text-cocoa-800">{conceptText.text}</p>
          <p className="mt-1 text-sm text-cocoa-body/70">
            {conceptText.concept?.title ?? 'Concept'} · {conceptText.language?.name ?? 'Language'}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-cta border border-sand-200 bg-white/80 px-4 py-2 text-sm font-semibold text-cocoa-body transition hover:border-forest-accent/30 hover:bg-[rgba(31,90,61,0.05)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="rounded-cta bg-forest-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,61,0.18)] transition hover:bg-forest-accent-hover disabled:opacity-60"
          >
            {saving ? 'Saving...' : isActive ? 'Disable text' : 'Enable text'}
          </button>
        </div>
      </div>
    </div>
  )
}
