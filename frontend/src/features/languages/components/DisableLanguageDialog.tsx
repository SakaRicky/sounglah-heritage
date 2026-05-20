import { ModalPortal } from '../../../components/common/ModalPortal'
import type { Language } from '../types/language.types'

type Props = {
  language: Language | null
  saving: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DisableLanguageDialog({ language, saving, onCancel, onConfirm }: Props) {
  if (!language) {
    return null
  }

  const disabling = language.status === 'active'

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa-ink/35 p-4" role="presentation" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-soft bg-white p-6 shadow-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disable-language-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="disable-language-title" className="text-xl font-bold text-cocoa-800">
          {disabling ? `Disable ${language.name}?` : `Enable ${language.name}?`}
        </h2>
        <p className="mt-3 text-sm leading-6 text-cocoa-body">
          {disabling
            ? 'This language will stay in the system but will no longer be available for new content creation.'
            : 'This language will be available again for content creation flows that use active languages.'}
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
            {saving ? 'Saving...' : disabling ? 'Disable language' : 'Enable language'}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
