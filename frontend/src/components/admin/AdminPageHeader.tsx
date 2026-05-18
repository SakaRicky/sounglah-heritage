import type { ReactNode } from 'react'

type AdminPageHeaderProps = {
  breadcrumb: string[]
  title: string
  description: string
  action?: ReactNode
}

export function AdminPageHeader({ breadcrumb, title, description, action }: AdminPageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-sand-200 bg-[linear-gradient(135deg,rgba(255,253,247,0.96),rgba(242,247,240,0.5)_54%,rgba(31,90,61,0.045))] p-6 shadow-soft md:p-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full border-[34px] border-forest-accent/10" />
      <div className="pointer-events-none absolute bottom-4 right-8 hidden h-20 w-32 opacity-[0.08] md:block">
        <div className="h-full w-full bg-[repeating-linear-gradient(135deg,#0F6B3A_0_7px,transparent_7px_15px)]" />
      </div>
      <div className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-forest-50/50 blur-2xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-forest-600/75">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 ? <span className="mx-1 text-sand-300">›</span> : null}
                <span className={index === breadcrumb.length - 1 ? 'font-medium text-cocoa-800' : undefined}>
                  {item}
                </span>
              </span>
            ))}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-cocoa-800 md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-cocoa-body">{description}</p>
        </div>
        {action ? <div className="relative shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}
