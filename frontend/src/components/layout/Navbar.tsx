import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="border-b border-sounglah-earth-100/90 bg-sounglah-cream-50/95 backdrop-blur-sm">
      <nav className="section flex flex-wrap items-center justify-between gap-4 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-card bg-sounglah-green-600 text-lg font-bold text-white"
            aria-hidden
          >
            S
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-sounglah-green-600">
              Sounglah
            </p>
            <p className="text-xs text-sounglah-ink-500">
              Speak it. Live it. Keep it alive.
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 font-medium text-sounglah-ink-700 md:flex">
          <Link to="/" className="hover:text-sounglah-green-600">
            Home
          </Link>
          <a href="#languages" className="hover:text-sounglah-green-600">
            Languages
          </a>
          <a href="#stories" className="hover:text-sounglah-green-600">
            Stories
          </a>
          <a href="#about" className="hover:text-sounglah-green-600">
            About Us
          </a>
          <a href="#blog" className="hover:text-sounglah-green-600">
            Blog
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/login"
            className="btn-secondary px-4 py-2 text-sm"
          >
            Log in
          </Link>
          <Link
            to="/login"
            className="btn-primary px-4 py-2 text-sm"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  )
}
