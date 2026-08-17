'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, FolderOpen, Plus, Settings,
  LogOut, ChevronRight, Star, Eye,
  ShoppingCart, Tag, Megaphone, Layers,
  Wrench, Grid2X2, MessageSquare, HelpCircle, LayoutTemplate, Mail
} from 'lucide-react'
import { adminLogout } from '@/lib/admin/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { AdminUser } from '@/lib/admin/types'

const navItems = [
  {
    label: 'الرئيسية',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'المشاريع',
    href: '/admin/projects',
    icon: FolderOpen,
    children: [
      { label: 'كل المشاريع', href: '/admin/projects', icon: FolderOpen },
      { label: 'إضافة مشروع', href: '/admin/projects/new', icon: Plus },
      { label: 'المميزة', href: '/admin/projects?filter=featured', icon: Star },
      { label: 'المنشورة', href: '/admin/projects?filter=published', icon: Eye },
    ],
  },
  {
    label: 'الطلبات',
    href: '/admin/orders',
    icon: ShoppingCart,
    badgeKey: 'unreadOrders',
    children: [
      { label: 'كل الطلبات', href: '/admin/orders', icon: ShoppingCart },
      { label: 'قيد الانتظار', href: '/admin/orders?status=pending', icon: ShoppingCart, badgeKey: 'unreadOrders' },
      { label: 'قيد التنفيذ', href: '/admin/orders?status=in_progress', icon: ShoppingCart },
      { label: 'المكتملة', href: '/admin/orders?status=completed', icon: ShoppingCart },
    ],
  },
  {
    label: 'التصنيفات',
    href: '/admin/categories',
    icon: Grid2X2,
    children: [
      { label: 'التصنيفات', href: '/admin/categories', icon: Grid2X2 },
      { label: 'أنماط التصميم', href: '/admin/categories/styles', icon: Layers },
    ],
  },
  {
    label: 'الخدمات والأسعار',
    href: '/admin/services',
    icon: Wrench,
    children: [
      { label: 'الخدمات', href: '/admin/services', icon: Wrench },
      { label: 'إضافة خدمة', href: '/admin/services/new', icon: Plus },
    ],
  },
  {
    label: 'كوبونات الخصم',
    href: '/admin/coupons',
    icon: Tag,
  },
  {
    label: 'العروض العامة',
    href: '/admin/promotions',
    icon: Megaphone,
  },
  {
    label: 'النشرة البريدية',
    href: '/admin/newsletter',
    icon: Mail, // Need to import Mail
  },
  {
    label: 'رسائل التواصل',
    href: '/admin/contact-messages',
    icon: MessageSquare,
    badgeKey: 'contactMessages',
  },
  {
    label: 'الأسئلة الشائعة',
    href: '/admin/faqs',
    icon: HelpCircle,
  },
  {
    label: 'الهيرو',
    href: '/admin/hero',
    icon: LayoutTemplate,
    exact: true,
  },
  {
    label: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

interface Props {
  admin: AdminUser | null
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  unreadContactMessages?: number
  unreadOrders?: number
}

export function AdminSidebar({ admin, collapsed, onToggle, mobileOpen, unreadContactMessages = 0, unreadOrders = 0 }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedGroup, setExpandedGroup] = useState<string | null>(() => {
    // Auto-expand the group matching the current pathname
    for (const item of navItems) {
      if (item.children && pathname.startsWith(item.href)) return item.label
    }
    return null
  })
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await adminLogout()
    router.push('/admin/login')
  }

  return (
    <aside
      className={`fixed top-0 right-0 h-screen z-40 flex flex-col bg-[#141310] border-l border-[#C8A96A]/10 transition-transform duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#C8A96A]/10">
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src="/masar-logo.png"
            alt="شعار مسار"
            className="w-full h-full object-contain"
          />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[#F0E6D3] font-bold text-sm whitespace-nowrap">مسار</p>
              <p className="text-[#666] text-xs whitespace-nowrap">لوحة التحكم</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="py-3 px-2 space-y-0.5 overflow-y-hidden">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          const Icon = item.icon
          const hasChildren = item.children && !collapsed
          const isExpanded = expandedGroup === item.label

          let badge = 0
          if ((item as { badgeKey?: string }).badgeKey === 'contactMessages') {
            badge = unreadContactMessages
          } else if (item.href === '/admin/orders') {
            badge = unreadOrders
          }

          if (hasChildren) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-[#C8A96A]/15 text-[#C8A96A]'
                      : 'text-[#888] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/5'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Icon size={17} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#0E0D0B]">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium flex-1 text-right">{item.label}</span>
                  <ChevronRight
                    size={13}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-0.5 mr-3 border-r border-[#C8A96A]/15 pr-2 space-y-0.5"
                    >
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon
                        const base = child.href.split('?')[0]
                        const query = child.href.split('?')[1]
                        
                        // Check if child is active
                        let childActive = false
                        if (pathname === base) {
                          if (query) {
                            const [key, val] = query.split('=')
                            const currentVal = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get(key)
                            childActive = currentVal === val
                          } else {
                            // Only active if no query params in window
                            const search = typeof window !== 'undefined' ? window.location.search : ''
                            childActive = search === '' || search === '?'
                          }
                        }

                        const childBadge = (child as any).badgeKey === 'contactMessages' ? unreadContactMessages
                          : (child as any).badgeKey === 'unreadOrders' ? unreadOrders
                          : 0

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all ${
                              childActive
                                ? 'text-[#C8A96A] bg-[#C8A96A]/10'
                                : 'text-[#777] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <ChildIcon size={13} className="flex-shrink-0" />
                              {child.label}
                            </div>
                            {childBadge > 0 && (
                              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#0E0D0B]">
                                {childBadge > 99 ? '99+' : childBadge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-[#C8A96A]/15 text-[#C8A96A]'
                  : 'text-[#888] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative flex-shrink-0">
                <Icon size={17} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-[#0E0D0B]">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 items-center justify-between text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                    {badge > 0 && (
                      <span className="ml-auto rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                        {badge}
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}

        {/* Logout */}
        <div className="pt-3 mt-3 border-t border-[#C8A96A]/10">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#888] hover:text-red-400 hover:bg-red-950/20 transition-all duration-200"
            title={collapsed ? 'تسجيل الخروج' : undefined}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm">{loggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
            )}
          </button>
        </div>
      </nav>

      {/* User footer */}
      {!collapsed && admin && (
        <div className="border-t border-[#C8A96A]/10 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-[#C8A96A]/20 border border-[#C8A96A]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#C8A96A] text-xs font-bold">
                {admin.full_name?.[0] ?? admin.email[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[#F0E6D3] text-xs font-medium truncate">
                {admin.full_name ?? admin.email}
              </p>
              <p className="text-[#555] text-[10px] truncate">{admin.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
