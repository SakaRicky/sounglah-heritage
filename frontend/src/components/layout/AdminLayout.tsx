import { Outlet } from 'react-router-dom';

import { AdminSidebar } from '../admin/AdminSidebar'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col text-cocoa-800 md:h-screen md:flex-row md:overflow-hidden">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-cream-50">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto min-h-full w-full max-w-6xl px-5 py-8 md:px-10 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
