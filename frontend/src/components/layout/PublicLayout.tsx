import { Outlet } from 'react-router-dom'

import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-sounglah-cream-50 text-sounglah-ink-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
