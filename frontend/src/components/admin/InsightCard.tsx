import type { ReactNode } from 'react'

type InsightCardProps = {
  title: string
  description?: string
  children: ReactNode
  accent?: ReactNode
}

export function InsightCard({ title, description, children, accent }: InsightCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-sand-200 bg-[linear-gradient(135deg,rgba(255,253,247,0.96),rgba(242,247,240,0.36))] p-7 shadow-soft">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[28px] border-forest-accent/10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-28 opacity-[0.07]">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="h-4 w-4 rotate-45 rounded-sm bg-forest-accent" />
          ))}
        </div>
      </div>
      {accent ? <div className="absolute right-7 top-7">{accent}</div> : null}
      <div className="relative">
        <h2 className="pr-16 text-lg font-semibold text-cocoa-800">{title}</h2>
        {description ? <p className="mt-1 text-sm text-forest-600/75">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </article>
  )
}
