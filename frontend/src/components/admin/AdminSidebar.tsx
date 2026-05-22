import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { clearToken } from '../../lib/auth'

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

function HomeIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  )
}

function MenuIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
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

function TextReviewIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 10h8M8 14h5M6 4h12a2 2 0 012 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
    </svg>
  )
}

function AudioIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8v8m4-11v14m4-9v4M5 11v2" />
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

function LogoutIcon({ className = 'h-5 w-5' }: NavIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-1.5M10 12h10m0 0l-3-3m3 3l-3 3" />
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
      { type: 'link', label: 'View Public Site', to: '/', icon: <HomeIcon />, end: true },
    ],
  },
  {
    title: 'Content Management',
    items: [
      { type: 'link', label: 'Languages', to: '/admin/content/languages', icon: <BookIcon /> },
      { type: 'link', label: 'Concepts', to: '/admin/content/concepts', icon: <LayersIcon /> },
      { type: 'link', label: 'Concept Texts', to: '/admin/content/concept-texts', icon: <DocumentIcon /> },
      { type: 'link', label: 'Text Review', to: '/admin/text-review', icon: <TextReviewIcon /> },
      { type: 'link', label: 'Audio Review', to: '/admin/audio-review', icon: <AudioIcon /> },
      { type: 'link', label: 'Lessons', to: '/admin/content/lessons', icon: <BookIcon /> },
      { type: 'link', label: 'Lesson Items', to: '/admin/content/lesson-items', icon: <ListIcon /> },
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
    'flex items-center gap-3 rounded-cta px-3 py-2.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-forest-accent text-white shadow-button'
      : 'text-cocoa-body hover:bg-forest-50/45 hover:text-forest-700',
  ].join(' ')
}

function SidebarNavItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  if (item.type === 'disabled') {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 rounded-cta px-3 py-2.5 text-sm text-cocoa-body/45 transition-colors hover:bg-cream-100/35"
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
    <NavLink to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => navLinkClass(isActive)}>
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  )
}

export function AdminSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sticky top-0 z-30 flex w-full shrink-0 flex-col border-b border-sand-200/60 bg-cream-hero md:h-screen md:w-80 md:flex-row md:border-b-0 md:border-r md:border-sand-200/50">
      <div className="admin-sidebar-pattern" aria-hidden>
        <div className="admin-sidebar-pattern__tile" />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-sand-200/50 px-4 py-3 md:hidden">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-cta border border-sand-200 bg-cream-50 text-forest-700 shadow-soft transition hover:border-forest-accent/30 hover:bg-forest-50/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream-hero"
            aria-label={isMenuOpen ? 'Close admin menu' : 'Open admin menu'}
            aria-controls="admin-mobile-menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/brand/logo-placeholder.png"
              alt=""
              className="h-10 w-10 shrink-0 rounded-full border border-sand-200 bg-cream-100 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-serif text-base font-bold leading-tight text-forest-700">Sounglah</p>
              <p className="truncate text-xs font-medium text-terracotta-500">Admin dashboard</p>
            </div>
          </div>
        </div>

        <div className="hidden border-b border-sand-200/50 px-5 py-7 md:block md:border-b-0 md:px-4">
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

        <div
          id="admin-mobile-menu"
          className={[
            isMenuOpen ? 'block' : 'hidden',
            'max-h-[calc(100svh-4.5rem)] overflow-y-auto md:flex md:max-h-none md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden',
          ].join(' ')}
        >
          <nav className="px-3 py-5 md:flex-1 md:overflow-y-auto md:px-2 md:py-6" aria-label="Admin">
            {navSections.map((section) => (
              <div key={section.title} className="mb-8 last:mb-0 md:mb-9">
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-cocoa-body/55">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <SidebarNavItem item={item} onNavigate={() => setIsMenuOpen(false)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-sand-200/60 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-cta border border-sand-100 bg-cream-50/80 p-3 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-accent text-sm font-bold text-white">
                  A
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-cocoa-800">Admin</p>
                  <p className="truncate text-xs text-cocoa-body/65">Content manager</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-cta border border-sand-200 bg-white/80 px-3 py-2.5 text-sm font-semibold text-cocoa-body transition hover:border-terracotta-500/50 hover:bg-cream-100/60 hover:text-terracotta-600 focus:outline-none focus:ring-2 focus:ring-forest-200"
              >
                <LogoutIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
