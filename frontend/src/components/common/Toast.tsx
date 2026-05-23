import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastProps = {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  autoCloseDelay?: number
}

export function Toast({ message, type, onClose, autoCloseDelay = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onClose()
    }, autoCloseDelay)

    return () => clearTimeout(timer)
  }, [message, onClose, autoCloseDelay])

  if (!message) return null

  const isSuccess = type === 'success'

  return (
    <div
      role="alert"
      className={[
        'fixed top-6 right-6 z-[9999] flex w-[calc(100%-3rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-[0_16px_40px_rgba(47,26,16,0.14)] backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4',
        isSuccess
          ? 'border-forest-accent/25 bg-white/95 text-forest-800'
          : 'border-terracotta-500/25 bg-white/95 text-terracotta-800',
      ].join(' ')}
    >
      <span className="shrink-0 mt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-forest-accent" />
        ) : (
          <AlertCircle className="h-5 w-5 text-terracotta-500" />
        )}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {isSuccess ? 'Success' : 'Error'}
        </p>
        <p className="mt-1 text-xs font-medium text-cocoa-body/80 leading-relaxed">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="shrink-0 rounded-lg p-1 text-cocoa-body/45 hover:bg-sand-100 hover:text-cocoa-body transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
