'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import type { AdminUser } from '@/lib/admin/types'

export function AdminShell({
  children,
  admin,
  unreadContactMessages = 0,
  unreadOrders = 0,
}: {
  children: React.ReactNode
  admin: AdminUser | null
  unreadContactMessages?: number
  unreadOrders?: number
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="h-screen bg-[#0E0D0B] overflow-hidden font-sans" dir="rtl">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        admin={admin}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        unreadContactMessages={unreadContactMessages}
        unreadOrders={unreadOrders}
      />

      <div className={`flex flex-col h-screen overflow-hidden transition-all duration-300 ${
        collapsed ? 'lg:mr-16' : 'lg:mr-64'
      }`}>
        <AdminTopbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          onMobileToggle={() => setMobileOpen(o => !o)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

