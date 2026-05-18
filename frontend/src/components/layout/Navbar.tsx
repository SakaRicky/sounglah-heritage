import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6 text-cocoa-800"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  )
}

export function Navbar() {
  const location = useLocation()
  const activeHash = location.hash
  const headerRef = useRef<HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuTopPx, setMenuTopPx] = useState(0)

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Languages', href: '#languages' },
    { label: 'Stories', href: '/stories-cultures' },
    { label: 'About Us', href: '#about' },
    { label: 'Blog', href: '#blog' },
  ] as const

  const isItemActive = (href: (typeof navItems)[number]['href']) => {
    if (href === '/') {
      return location.pathname === '/' && !activeHash
    }
    if (href.startsWith('/')) {
      return location.pathname === href
    }
    return activeHash === href
  }

  const navItemTo = (href: (typeof navItems)[number]['href']) => {
    if (href === '/') return '/'
    if (href.startsWith('/')) return href
    return `/${href}`
  }

  const linkClass = (active: boolean) =>
    `whitespace-nowrap px-1 pb-2 text-sm font-semibold transition ${
      active
        ? 'border-b-2 border-[#0F6B3A] text-cocoa-800'
        : 'border-b-2 border-transparent text-cocoa-700 hover:text-[#0F6B3A]'
    }`

  const mobileRowClass = (active: boolean) =>
    `block w-full border-b border-cocoa-800/10 px-4 py-3.5 text-left text-base font-semibold transition ${
      active
        ? 'bg-forest-accent/12 text-forest-accent'
        : 'text-cocoa-body hover:bg-cream-200/90 active:bg-cream-200'
    }`

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => setMenuTopPx(el.getBoundingClientRect().bottom)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      closeMobileMenu()
    })
    return () => cancelAnimationFrame(id)
  }, [location.pathname, location.hash, closeMobileMenu])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen, closeMobileMenu])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  const mobileMenu =
    mobileMenuOpen &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[90] bg-forest-700/40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
        <div
          id="primary-navigation-mobile"
          className="fixed inset-x-0 z-[95] isolate max-h-[min(78vh,calc(100dvh-4rem))] overflow-y-auto border-b border-sand-100/80 bg-cream-100 shadow-[0_16px_48px_rgba(15,51,35,0.12)] lg:hidden"
          style={{ top: menuTopPx }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav className="section py-1" aria-label="Primary pages">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={navItemTo(item.href)}
                className={mobileRowClass(isItemActive(item.href))}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div
            role="region"
            aria-label="Account"
            className="section border-t border-sand-100/90 bg-cream-200/35 px-4 py-4"
          >
            <div className="flex min-w-0 flex-row gap-2 sm:gap-3">
              <Link
                to="/login"
                className="flex min-w-0 flex-1 items-center justify-center rounded-button border-2 border-[#0F6B3A] bg-transparent px-2 py-3 text-center text-sm font-semibold text-[#0F6B3A] transition hover:bg-cream-100 sm:px-3"
                onClick={closeMobileMenu}
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="flex min-w-0 flex-1 items-center justify-center rounded-button border-2 border-transparent bg-[#0F6B3A] px-2 py-3 text-center text-sm font-semibold text-white shadow-button transition hover:bg-[#0c5630] sm:px-3"
                onClick={closeMobileMenu}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </>,
      document.body,
    )

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-[100] shrink-0 min-w-0 border-b border-sand-100/70 bg-cream-100/95 shadow-sm backdrop-blur-md"
      >
        <nav
          className="section flex min-h-[72px] min-w-0 items-center justify-between gap-2 py-2 sm:gap-6 sm:py-2.5 lg:gap-8"
          aria-label="Primary"
        >
          <Link
            to="/"
            aria-label="Sounglah home"
            className="mr-2 flex min-w-0 flex-1 items-center gap-2.5 sm:mr-8 sm:gap-4 lg:mr-12 lg:flex-none"
          >
            <img
              src="/images/brand/logo-placeholder.png"
              alt=""
              className="h-12 w-auto shrink-0 sm:h-16 lg:h-20"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="truncate font-serif text-2xl font-bold leading-tight text-forest-700 sm:text-3xl lg:text-4xl">
                Sounglah
              </p>
              <p className="truncate text-[11px] font-semibold leading-snug text-cocoa-body sm:text-xs sm:font-medium lg:text-sm">
                Speak it. Live it. Keep it alive.
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={navItemTo(item.href)}
                className={linkClass(isItemActive(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-button border-2 border-cocoa-800/15 bg-white/70 text-cocoa-ink shadow-sm backdrop-blur-sm transition hover:bg-white/90 lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls={
                mobileMenuOpen ? 'primary-navigation-mobile' : undefined
              }
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <span className="sr-only">
                {mobileMenuOpen ? 'Close menu' : 'Open menu'}
              </span>
              <MenuIcon open={mobileMenuOpen} />
            </button>
            <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
              <Link
                to="/login"
                className="rounded-button border-2 border-[#0F6B3A] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#0F6B3A] transition hover:bg-cream-100 sm:px-5"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="rounded-button border-2 border-transparent bg-[#0F6B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-button transition hover:bg-[#0c5630] sm:px-5"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      </header>
      {mobileMenu}
    </>
  )
}
