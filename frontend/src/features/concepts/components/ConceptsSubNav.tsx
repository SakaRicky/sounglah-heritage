import { NavLink } from 'react-router-dom'

function subNavClass(isActive: boolean) {
  return [
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-forest-accent text-white shadow-button'
      : 'text-cocoa-body hover:bg-forest-50/45 hover:text-forest-700',
  ].join(' ')
}

export function ConceptsSubNav() {
  return (
    <nav
      className="inline-flex flex-wrap gap-2 rounded-2xl border border-sand-200 bg-cream-50/80 p-1.5 shadow-soft"
      aria-label="Concept views"
    >
      <NavLink to="/admin/content/concepts" end className={({ isActive }) => subNavClass(isActive)}>
        All concepts
      </NavLink>
      <NavLink to="/admin/content/concepts/completion" className={({ isActive }) => subNavClass(isActive)}>
        Completion
      </NavLink>
    </nav>
  )
}
