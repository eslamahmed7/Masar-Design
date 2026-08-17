'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelRight, Bell, Plus, ArrowLeft, Menu } from 'lucide-react'

const breadcrumbMap: Record<string, string> = {
  '/admin': 'الرئيسية',
  '/admin/dashboard': 'الرئيسية',
  '/admin/projects': 'المشاريع',
  '/admin/projects/new': 'مشروع جديد',
  '/admin/settings': 'الإعدادات',
  '/admin/orders': 'الطلبات',
  '/admin/categories': 'التصنيفات',
  '/admin/categories/styles': 'أنماط التصميم',
  '/admin/services': 'الخدمات والأسعار',
  '/admin/services/new': 'خدمة جديدة',
  '/admin/coupons': 'كوبونات الخصم',
  '/admin/promotions': 'العروض العامة',
  '/admin/contact-messages': 'رسائل التواصل',
  '/admin/faqs': 'الأسئلة الشائعة',
}


interface Props {
  collapsed: boolean
  onToggle: () => void
  onMobileToggle: () => void
}

export function AdminTopbar({ collapsed, onToggle, onMobileToggle }: Props) {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let built = ''
  for (const seg of segments) {
    built += `/${seg}`
    crumbs.push({ label: breadcrumbMap[built] ?? seg, href: built })
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-[#C8A96A]/10 bg-[#141310]/80 backdrop-blur-sm flex-shrink-0">
      {/* Left — toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 rounded-lg text-[#666] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-all"
          aria-label="القائمة"
        >
          <Menu size={18} />
        </button>
        <button
          onClick={onToggle}
          className="hidden lg:flex p-2 rounded-lg text-[#666] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-all"
        >
          <PanelRight size={18} />
        </button>
        <nav className="flex items-center gap-1.5 text-sm" aria-label="breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[#444]">/</span>}
              {i === crumbs.length - 1 ? (
                <span className="text-[#F0E6D3] font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-[#666] hover:text-[#C8A96A] transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96A] text-[#0E0D0B] rounded-lg text-xs font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={14} />
          مشروع جديد
        </Link>
        <button className="p-2 rounded-lg text-[#666] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-all relative">
          <Bell size={16} />
        </button>
        <Link
          href="/"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-all border border-[#C8A96A]/20"
        >
          <ArrowLeft size={13} /> العودة إلى الموقع
        </Link>
      </div>
    </header>
  )
}
