import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type NavIconProps = {
  className?: string
}

function DashboardIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z" />
    </svg>
  )
}

function BookIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5v11M7 4.5h10a2 2 0 012 2v13l-7-3.5L5 19.5v-13a2 2 0 012-2z" />
    </svg>
  )
}

function LayersIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    </svg>
  )
}

function DocumentIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l4 4v12H8V4zm8 0v4h4" />
    </svg>
  )
}

function ListIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h12M9 12h12M9 18h12M5 6h.01M5 12h.01M5 18h.01" />
    </svg>
  )
}

function UsersIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 18v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  )
}

function SettingsIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852 1 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

type EnabledLink = {
  type: 'link'
  label: string
  to: string
  icon: ReactNode
  end?: boolean
}

type DisabledLink = {
  type: 'disabled'
  label: string
  icon: ReactNode
}

type NavItem = EnabledLink | DisabledLink

type NavSection = {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { type: 'link', label: 'Dashboard', to: '/admin', icon: <DashboardIcon />, end: true },
    ],
  },
  {
    title: 'Content Management',
    items: [
      { type: 'link', label: 'Languages', to: '/admin/languages', icon: <BookIcon /> },
      { type: 'link', label: 'Concepts', to: '/admin/concepts', icon: <LayersIcon /> },
      { type: 'link', label: 'Concept Texts', to: '/admin/concept-texts', icon: <DocumentIcon /> },
      { type: 'link', label: 'Lessons', to: '/admin/lessons', icon: <BookIcon /> },
      { type: 'link', label: 'Lesson Items', to: '/admin/lesson-items', icon: <ListIcon /> },
      { type: 'disabled', label: 'Stories', icon: <DocumentIcon /> },
      { type: 'disabled', label: 'Vocabulary', icon: <ListIcon /> },
      { type: 'disabled', label: 'Culture & Media', icon: <LayersIcon /> },
    ],
  },
  {
    title: 'Community',
    items: [
      { type: 'disabled', label: 'Users', icon: <UsersIcon /> },
      { type: 'disabled', label: 'Families', icon: <UsersIcon /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { type: 'disabled', label: 'Reports', icon: <DocumentIcon /> },
      { type: 'disabled', label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
]

function navLinkClass(isActive: boolean) {
  return [
    'flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-forest-accent text-white shadow-button'
      : 'text-cocoa-body hover:bg-cream-200/60',
  ].join(' ')
}

function SidebarNavItem({ item }: { item: NavItem }) {
  if (item.type === 'disabled') {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 rounded-soft px-3 py-2.5 text-sm text-cocoa-body/45"
        aria-disabled="true"
      >
        <span className="opacity-50">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        <span className="rounded-full bg-sand-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cocoa-body/55">
          Coming soon
        </span>
      </div>
    )
  }

  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  )
}

export function AdminSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sand-200/60 bg-cream-hero md:sticky md:top-0 md:h-screen md:w-80 md:flex-row md:border-b-0 md:border-r md:border-sand-200/50">
      <div className="admin-sidebar-pattern" aria-hidden>
        <div className="admin-sidebar-pattern__tile" />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-sand-200/50 px-5 py-6 md:border-b-0 md:px-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/brand/logo-placeholder.png"
              alt=""
              className="h-11 w-11 rounded-full border border-sand-200 bg-cream-100 object-cover"
            />
            <div>
              <p className="font-serif text-lg font-bold leading-tight text-forest-700">Sounglah</p>
              <p className="text-xs font-medium text-terracotta-500">Our language. Our heritage.</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 md:px-2" aria-label="Admin">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-cocoa-body/55">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <SidebarNavItem item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
