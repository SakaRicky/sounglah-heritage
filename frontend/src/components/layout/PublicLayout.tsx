import { Outlet } from 'react-router-dom'

import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen min-w-full w-full max-w-none flex-col bg-cream-50 text-cocoa-800">
      <Navbar />
      <main className="w-full min-w-0 flex-1 max-w-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
