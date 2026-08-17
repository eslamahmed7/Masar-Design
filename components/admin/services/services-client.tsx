'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Wrench, ChevronRight, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { deleteService, updateService } from '@/lib/admin/actions'
import type { DBService } from '@/lib/admin/types'

interface Props { initialServices: DBService[] }

const pricingTypeLabel: Record<string, string> = {
  per_sqm: 'سعر لكل متر مربع',
  fixed: 'سعر ثابت',
  custom: 'سعر مخصص',
  quote: 'عرض سعر',
}

export function ServicesClient({ initialServices }: Props) {
  const [services, setServices] = useState<DBService[]>(initialServices)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('حذف هذه الخدمة؟')) return
    startTransition(async () => {
      const res = await deleteService(id)
      if (res && res.error) {
        alert('تعذر الحذف: ' + res.error)
        return
      }
      setServices(prev => prev.filter(s => s.id !== id))
    })
  }

  const handleToggleStatus = (svc: DBService) => {
    const newStatus = svc.status === 'active' ? 'hidden' : 'active'
    startTransition(async () => {
      await updateService(svc.id, { status: newStatus })
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, status: newStatus } : s))
    })
  }

  const handleToggleFeatured = (svc: DBService) => {
    startTransition(async () => {
      await updateService(svc.id, { is_featured: !svc.is_featured })
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_featured: !s.is_featured } : s))
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">الخدمات والأسعار</h1>
          <p className="text-[#888] text-sm mt-1">إدارة الخدمات وإعدادات التسعير</p>
        </div>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={15} /> خدمة جديدة
        </Link>
      </div>

      {services.length === 0 && (
        <div className="text-center py-16 text-[#555]">
          <Wrench size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد خدمات بعد.</p>
          <Link href="/admin/services/new" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-xs font-bold hover:bg-[#d4b87a] transition-colors">
            <Plus size={13} /> إضافة خدمة
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl hover:border-[#C8A96A]/20 transition-all"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
              {/* Cover */}
              <div className="w-14 h-14 rounded-xl bg-[#0E0D0B] border border-[#333] overflow-hidden flex-shrink-0">
                {svc.cover_image_url ? (
                  <img src={svc.cover_image_url} alt={svc.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-[#555]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 max-w-full">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-[#F0E6D3] font-semibold">{svc.name}</p>
                  {svc.name_ar && <p className="text-[#888] text-sm">{svc.name_ar}</p>}
                  {svc.is_featured && (
                    <span className="px-2 py-0.5 bg-[#C8A96A]/15 text-[#C8A96A] border border-[#C8A96A]/20 rounded-full text-[10px] flex-shrink-0">مميز</span>
                  )}
                </div>
                {svc.short_description && (
                  <p className="text-[#888] text-sm line-clamp-2 break-words whitespace-normal">{svc.short_description}</p>
                )}
                {/* Pricing info */}
                {svc.pricing && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-[#C8A96A] bg-[#C8A96A]/10 border border-[#C8A96A]/20 px-2 py-0.5 rounded-lg">
                      {pricingTypeLabel[svc.pricing.pricing_type] ?? svc.pricing.pricing_type}
                    </span>
                    {svc.pricing.price_per_sqm && (
                      <span className="text-xs text-[#888] whitespace-nowrap">
                        {svc.pricing.price_per_sqm.toLocaleString('ar-SA')} {svc.pricing.currency} / م²
                      </span>
                    )}
                    {svc.pricing.fixed_price && (
                      <span className="text-xs text-[#888] whitespace-nowrap">
                        {svc.pricing.fixed_price.toLocaleString('ar-SA')} {svc.pricing.currency}
                      </span>
                    )}
                    {svc.options && svc.options.length > 0 && (
                      <span className="text-xs text-[#555] whitespace-nowrap">{svc.options.length} إضافة</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  svc.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-[#333]/60 text-[#888] border-[#444]'
                }`}>
                  {svc.status === 'active' ? 'نشط' : 'مخفي'}
                </span>
                <button onClick={() => handleToggleFeatured(svc)} disabled={isPending}
                  className={`p-1.5 rounded-lg transition-colors ${svc.is_featured ? 'text-[#C8A96A] bg-[#C8A96A]/10' : 'text-[#555] hover:text-[#C8A96A]'}`}
                  title="مميز">
                  <Star size={14} />
                </button>
                <button onClick={() => handleToggleStatus(svc)} disabled={isPending}
                  className="p-1.5 text-[#555] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/5 rounded-lg transition-colors"
                  title={svc.status === 'active' ? 'إخفاء' : 'إظهار'}>
                  {svc.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <Link href={`/admin/services/${svc.id}`}
                  className="p-1.5 text-[#555] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors"
                  title="تعديل">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => handleDelete(svc.id)} disabled={isPending}
                  className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
