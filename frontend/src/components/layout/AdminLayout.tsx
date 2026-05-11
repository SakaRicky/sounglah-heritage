import { Link, Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-sounglah-cream-100 text-sounglah-ink-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sounglah-earth-100 bg-white p-6 md:block">
        <h1 className="text-xl font-bold">Sounglah Admin</h1>
        <nav className="mt-8 flex flex-col gap-3 text-sm">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/languages">Languages</Link>
          <Link to="/admin/concepts">Concepts</Link>
          <Link to="/admin/lessons">Lessons</Link>
        </nav>
      </aside>

      <main className="md:pl-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
