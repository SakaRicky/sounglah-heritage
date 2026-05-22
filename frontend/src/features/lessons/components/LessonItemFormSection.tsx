import type { ReactNode } from 'react'

type Props = {
  number: number
  title: string
  description?: string
  children: ReactNode
}

export function LessonItemFormSection({ number, title, description, children }: Props) {
  return (
    <section className="rounded-2xl border border-sand-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(74,42,24,0.06)] md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-400 text-sm font-bold text-white shadow-[0_4px_12px_rgba(196,106,50,0.35)]">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-bold text-cocoa-800">{title}</h2>
          {description ? <p className="mt-1 text-sm text-cocoa-body/75">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}
