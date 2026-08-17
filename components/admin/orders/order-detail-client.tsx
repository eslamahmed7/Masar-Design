'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight, Clock, User, MapPin, Layers, Wrench, FileText,
  Send, Loader2, CheckCircle2, AlertCircle, XCircle, Circle,
  Download, ExternalLink, Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateOrderStatus, addOrderNote, deleteOrder } from '@/lib/admin/actions'
import type { DBOrder, DBOrderNote, DBOrderTimeline, OrderStatus } from '@/lib/admin/types'

interface Props {
  order: DBOrder
  initialNotes: DBOrderNote[]
  initialTimeline: DBOrderTimeline[]
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'قيد الانتظار', color: 'amber' },
  { value: 'under_review', label: 'قيد المراجعة', color: 'blue' },
  { value: 'approved', label: 'تمت الموافقة', color: 'emerald' },
  { value: 'rejected', label: 'مرفوض', color: 'red' },
  { value: 'in_progress', label: 'قيد التنفيذ', color: 'purple' },
  { value: 'completed', label: 'مكتمل', color: 'yellow' },
  { value: 'cancelled', label: 'ملغي', color: 'gray' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  under_review: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  in_progress: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  completed: 'bg-[#C8A96A]/15 text-[#C8A96A] border-[#C8A96A]/30',
  cancelled: 'bg-[#333]/60 text-[#888] border-[#444]',
}

const PROJECT_TYPES_MAP: Record<string, string> = {
  apartment: 'شقة سكنية',
  villa: 'فيلا',
  office: 'مكتب',
  restaurant: 'مطعم',
  cafe: 'كافيه',
  commercial: 'تجاري',
  clinic: 'عيادة',
  hotel: 'فندق',
  other: 'أخرى'
}

export function OrderDetailClient({ order, initialNotes, initialTimeline }: Props) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status)
  const [notes, setNotes] = useState<DBOrderNote[]>(initialNotes)
  const [timeline, setTimeline] = useState<DBOrderTimeline[]>(initialTimeline)
  const [noteContent, setNoteContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'files' | 'notes' | 'timeline'>('info')

  useEffect(() => {
    if (order.status === 'pending') {
      startTransition(async () => {
        const res = await updateOrderStatus(order.id, 'under_review')
        if (res.success) {
          setCurrentStatus('under_review')
        }
      })
    }
  }, [order.status, order.id])

  let whatsapp = ''
  let styles = ''
  let cleanNotes = order.project_notes || ''

  if (cleanNotes) {
    const waMatch = cleanNotes.match(/رقم الواتساب:\s*([^\n]+)/)
    if (waMatch) whatsapp = waMatch[1].trim()

    const stylesMatch = cleanNotes.match(/أنماط التصميم:\s*([^\n]+)/)
    if (stylesMatch) styles = stylesMatch[1].trim()

    cleanNotes = cleanNotes
      .replace(/رقم الواتساب:\s*[^\n]+\n?/, '')
      .replace(/أنماط التصميم:\s*[^\n]+\n?/, '')
      .replace(/وسائل التواصل:\s*[^\n]+\n?/, '')
      .trim()
  }

  const handleStatusChange = (status: OrderStatus) => {
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, status)
      if (!res.error) setCurrentStatus(status)
    })
  }

  const handleAddNote = () => {
    if (!noteContent.trim()) return
    startTransition(async () => {
      const res = await addOrderNote(order.id, noteContent.trim())
      if (res.note) {
        setNotes(prev => [res.note!, ...prev])
        setNoteContent('')
      }
    })
  }

  const handleDeleteOrder = () => {
    if (!confirm('هل أنت متأكد من مسح هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    startTransition(async () => {
      const res = await deleteOrder(order.id)
      if (!res.error) {
        router.push('/admin/orders')
      } else {
        alert('حدث خطأ أثناء مسح الطلب.')
      }
    })
  }

  const sectionCls = 'bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5'
  const labelCls = 'text-[#888] text-xs'
  const valueCls = 'text-[#F0E6D3] text-sm font-medium mt-0.5'
  const tabCls = (t: string) => `px-4 py-2 text-sm rounded-xl transition-all ${
    activeTab === t ? 'bg-[#C8A96A]/15 text-[#C8A96A] font-medium' : 'text-[#888] hover:text-[#F0E6D3]'
  }`

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 rounded-xl text-[#666] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-all">
            <ArrowRight size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#F0E6D3] font-mono">{order.order_number}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs border ${STATUS_COLORS[currentStatus]}`}>
                {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}
              </span>
            </div>
            <p className="text-[#888] text-sm mt-0.5">
              {new Date(order.created_at).toLocaleString('ar-SA')}
            </p>
          </div>
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={isPending || currentStatus === s.value}
              className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                currentStatus === s.value
                  ? STATUS_COLORS[s.value]
                  : 'bg-[#1A1916] text-[#888] border-[#333] hover:border-[#C8A96A]/20 hover:text-[#F0E6D3]'
              } disabled:cursor-default`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={handleDeleteOrder}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl text-xs border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 ml-2"
            title="مسح الطلب"
          >
            <Trash2 size={14} />
            مسح
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#C8A96A]/10 pb-1">
        {([
          ['info', 'معلومات العميل'],
          ['pricing', 'التسعير'],
          ['files', 'الملفات'],
          ['notes', `الملاحظات (${notes.length})`],
          ['timeline', 'السجل'],
        ] as const).map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t)} className={tabCls(t)}>{l}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={sectionCls}>
            <h3 className="text-[#F0E6D3] font-semibold text-sm mb-4 flex items-center gap-2">
              <User size={14} className="text-[#C8A96A]" /> بيانات العميل
            </h3>
            <div className="space-y-3">
              <div><p className={labelCls}>الاسم</p><p className={valueCls}>{order.customer_name}</p></div>
              <div><p className={labelCls}>الهاتف</p><p className={valueCls} dir="ltr">{order.customer_phone}</p></div>
              {whatsapp && <div><p className={labelCls}>الواتساب</p><p className={valueCls} dir="ltr">{whatsapp}</p></div>}
              <div><p className={labelCls}>البريد الإلكتروني</p><p className={valueCls}>{order.customer_email}</p></div>
            </div>
          </div>

          <div className={sectionCls}>
            <h3 className="text-[#F0E6D3] font-semibold text-sm mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-[#C8A96A]" /> معلومات المشروع
            </h3>
            <div className="space-y-3">
              {order.project_name && <div><p className={labelCls}>اسم المشروع</p><p className={valueCls}>{order.project_name}</p></div>}
              <div><p className={labelCls}>التصنيف</p><p className={valueCls}>{(order.categories as any)?.name ?? (order.project_type ? PROJECT_TYPES_MAP[order.project_type] || order.project_type : '—')}</p></div>
              {order.subcategories && <div><p className={labelCls}>التصنيف الفرعي</p><p className={valueCls}>{(order.subcategories as any)?.name}</p></div>}
              <div><p className={labelCls}>النمط</p><p className={valueCls}>{(order.design_styles as any)?.name ?? (styles || '—')}</p></div>
              <div><p className={labelCls}>الخدمة</p><p className={valueCls}>{(order.services as any)?.name ?? '—'}</p></div>
              {order.project_area && <div><p className={labelCls}>المساحة</p><p className={valueCls}>{order.project_area} م²</p></div>}
              {order.city && <div><p className={labelCls}>المدينة</p><p className={valueCls}>{order.city}</p></div>}
              {cleanNotes && (
                <div><p className={labelCls}>ملاحظات</p><p className="text-[#888] text-sm mt-0.5 leading-relaxed whitespace-pre-wrap">{cleanNotes}</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className={sectionCls}>
          <h3 className="text-[#F0E6D3] font-semibold text-sm mb-4 flex items-center gap-2">
            <Wrench size={14} className="text-[#C8A96A]" /> تفاصيل التسعير
          </h3>
          <div className="space-y-3 max-w-md">
            {(() => {
              const servicePricing = (order.services as any)?.pricing;
              const serviceCurrency = Array.isArray(servicePricing) ? servicePricing[0]?.currency : servicePricing?.currency;
              const actualCurrency = serviceCurrency || order.currency || 'SAR';
              const c = actualCurrency === 'SAR' ? 'ريال' : actualCurrency === 'EGP' ? 'جنيه' : actualCurrency === 'USD' ? 'دولار' : actualCurrency;
              return (
                <>
                  {order.price_per_sqm && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888]">سعر المتر المربع</span>
                      <span className="text-[#F0E6D3]">{order.price_per_sqm.toLocaleString('ar-SA')} {c}</span>
                    </div>
                  )}
                  {order.project_area && order.price_per_sqm && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888]">المساحة × السعر</span>
                      <span className="text-[#F0E6D3]">{(order.project_area * order.price_per_sqm).toLocaleString('ar-SA')} {c}</span>
                    </div>
                  )}
                  {order.subtotal != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888]">المجموع الفرعي</span>
                      <span className="text-[#F0E6D3]">{order.subtotal.toLocaleString('ar-SA')} {c}</span>
                    </div>
                  )}
                  {(order.global_discount_value > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888]">خصم عام ({order.global_discount_pct > 0 ? order.global_discount_pct : (order.subtotal ? Math.round((order.global_discount_value / order.subtotal) * 100) : 0)}%)</span>
                      <span className="text-red-400">- {order.global_discount_value.toLocaleString('ar-SA')} {c}</span>
                    </div>
                  )}
                  {order.coupon_code && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#888]">كوبون ({order.coupon_code})</span>
                      <span className="text-emerald-400">- {order.coupon_discount_value.toLocaleString('ar-SA')} {c}</span>
                    </div>
                  )}
                  {order.selected_addons && order.selected_addons.length > 0 && (
                    <div>
                      <p className="text-[#888] text-sm mb-1">الإضافات المختارة</p>
                      {order.selected_addons.map((a, i) => (
                        <div key={i} className="flex justify-between text-sm pl-4">
                          <span className="text-[#666]">{a.name}</span>
                          <span className="text-[#F0E6D3]">+ {a.price.toLocaleString('ar-SA')} {c}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-[#888]">مجموع الإضافات</span>
                        <span className="text-[#F0E6D3]">+ {order.addons_total.toLocaleString('ar-SA')} {c}</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-[#C8A96A]/15 pt-3 flex justify-between font-bold">
                    <span className="text-[#F0E6D3]">الإجمالي النهائي</span>
                    <span className="text-[#C8A96A] text-lg">
                      {order.final_total?.toLocaleString('ar-SA')} {c}
                    </span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className={sectionCls}>
          <h3 className="text-[#F0E6D3] font-semibold text-sm mb-4">الملفات المرفوعة</h3>
          {!order.uploaded_files || order.uploaded_files.length === 0 ? (
            <p className="text-[#555] text-sm">لا توجد ملفات مرفوعة.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {order.uploaded_files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noreferrer"
                  className="block bg-[#0E0D0B] border border-[#333] rounded-xl overflow-hidden group hover:border-[#C8A96A]/30 transition-all">
                  <div className="aspect-video bg-[#141310] overflow-hidden">
                    {f.url.match(/\.(jpg|jpeg|png|webp)/i) ? (
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={24} className="text-[#555]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-[#888] text-xs truncate">{f.name}</span>
                    <ExternalLink size={11} className="text-[#555] flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className={sectionCls + ' space-y-4'}>
          <h3 className="text-[#F0E6D3] font-semibold text-sm">الملاحظات الداخلية</h3>
          <div className="flex gap-2">
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && !e.nativeEvent.isComposing) handleAddNote() }}
              placeholder="اكتب ملاحظة داخلية... (Ctrl+Enter للإرسال)"
              rows={3}
              className="flex-1 bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none resize-none"
            />
            <button onClick={handleAddNote} disabled={isPending || !noteContent.trim()}
              className="p-3 bg-[#C8A96A] text-[#0E0D0B] rounded-xl hover:bg-[#d4b87a] transition-colors disabled:opacity-50 self-end">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <div className="space-y-3">
            {notes.length === 0 && <p className="text-[#555] text-sm">لا توجد ملاحظات بعد.</p>}
            {notes.map(note => (
              <div key={note.id} className="bg-[#0E0D0B]/60 rounded-xl p-3 border border-[#333]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#C8A96A] text-xs font-medium">{note.admin_name ?? 'Admin'}</span>
                  <span className="text-[#555] text-[10px]">
                    {new Date(note.created_at).toLocaleString('ar-SA')}
                  </span>
                </div>
                <p className="text-[#F0E6D3] text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className={sectionCls}>
          <h3 className="text-[#F0E6D3] font-semibold text-sm mb-4">سجل الطلب</h3>
          {timeline.length === 0 && <p className="text-[#555] text-sm">لا يوجد سجل بعد.</p>}
          <div className="relative">
            <div className="absolute top-0 bottom-0 right-[18px] w-px bg-[#C8A96A]/15" />
            <div className="space-y-4">
              {timeline.map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-3 relative">
                  <div className="w-9 h-9 rounded-full bg-[#0E0D0B] border border-[#C8A96A]/20 flex items-center justify-center flex-shrink-0 z-10">
                    <Circle size={8} className="text-[#C8A96A] fill-[#C8A96A]" />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-[#F0E6D3] text-sm">{entry.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {entry.actor_name && (
                        <span className="text-[#C8A96A] text-xs">{entry.actor_name}</span>
                      )}
                      <span className="text-[#555] text-[10px]">
                        {new Date(entry.created_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
