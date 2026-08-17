'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  ShoppingCart, Search, ChevronRight, Download, Filter,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2, RotateCcw,
} from 'lucide-react'
import type { DBOrder, OrderStatus } from '@/lib/admin/types'
import { exportOrdersCsv } from '@/lib/admin/actions'

interface Props { initialOrders: DBOrder[]; total: number }

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  under_review: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  in_progress: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  completed: 'bg-[#C8A96A]/15 text-[#C8A96A] border-[#C8A96A]/20',
  cancelled: 'bg-[#333]/60 text-[#888] border-[#444]',
}

const STATUS_LABELS: Record<string, string> = {
  all: 'الكل',
  pending: 'قيد الانتظار',
  under_review: 'قيد المراجعة',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const FILTERS = ['all', 'pending', 'under_review', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled']

export function OrdersClient({ initialOrders, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const orders = initialOrders // use prop directly to react to URL changes
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const activeStatus = searchParams.get('status') ?? 'all'
  const [isPending, startTransition] = useTransition()

  const applyFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') params.delete('status')
    else params.set('status', status)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const applySearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set('search', search)
    else params.delete('search')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleExport = () => {
    startTransition(async () => {
      const data = await exportOrdersCsv({ status: activeStatus === 'all' ? undefined : activeStatus })
      if (!data.length) return
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map((r: any) => Object.values(r).join(','))
      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'orders.csv'; a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">الطلبات</h1>
          <p className="text-[#888] text-sm mt-1">{total.toLocaleString('ar-SA')} طلب إجمالي</p>
        </div>
        <button onClick={handleExport} disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1916] border border-[#C8A96A]/20 text-[#C8A96A] rounded-xl text-sm hover:bg-[#C8A96A]/10 transition-colors disabled:opacity-50">
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          تصدير CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1A1916] border border-[#C8A96A]/10 rounded-xl px-3 py-2 max-w-md">
        <Search size={15} className="text-[#555] flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) applySearch() }}
          placeholder="بحث بالاسم، الهاتف، رقم الطلب..."
          className="bg-transparent flex-1 text-sm text-[#F0E6D3] placeholder:text-[#555] focus:outline-none"
        />
        {search && (
          <button onClick={() => { setSearch(''); applySearch() }} className="text-[#555] hover:text-[#888]">
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f}
            onClick={() => applyFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              activeStatus === f
                ? 'bg-[#C8A96A]/15 text-[#C8A96A] border-[#C8A96A]/30'
                : 'bg-[#1A1916] text-[#888] border-[#333] hover:border-[#C8A96A]/20'
            }`}
          >
            {STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#C8A96A]/8 text-[#666] text-xs">
          <span>رقم الطلب</span>
          <span>العميل</span>
          <span>الخدمة</span>
          <span>المساحة</span>
          <span>الإجمالي</span>
          <span>الحالة</span>
          <span></span>
        </div>

        {orders.length === 0 && (
          <div className="py-20 text-center">
            <ShoppingCart size={36} className="text-[#333] mx-auto mb-3" />
            <p className="text-[#666] text-sm">لا توجد طلبات.</p>
          </div>
        )}

        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-[#C8A96A]/5 hover:bg-[#F0E6D3]/2 transition-colors group"
          >
            <div>
              <p className="text-[#C8A96A] font-mono text-xs font-bold">{order.order_number}</p>
              <p className="text-[#555] text-[10px] mt-0.5">
                {new Date(order.created_at).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <div>
              <p className="text-[#F0E6D3] text-sm font-medium">{order.customer_name}</p>
              <p className="text-[#666] text-xs">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-[#888] text-sm truncate">{(order.services as any)?.name ?? '—'}</p>
              <p className="text-[#666] text-xs">{(order.categories as any)?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-[#888] text-sm">
                {order.project_area ? `${order.project_area.toLocaleString('ar-SA')} م²` : '—'}
              </p>
            </div>
            <div>
              {(() => {
                const servicePricing = (order.services as any)?.pricing;
                const serviceCurrency = Array.isArray(servicePricing) ? servicePricing[0]?.currency : servicePricing?.currency;
                const actualCurrency = serviceCurrency || order.currency || 'SAR';
                const c = actualCurrency === 'SAR' ? 'ريال' : actualCurrency === 'EGP' ? 'جنيه' : actualCurrency === 'USD' ? 'دولار' : actualCurrency;
                return order.final_total ? (
                  <div className="font-semibold text-[#F0E6D3] text-sm">
                    {order.final_total.toLocaleString('ar-SA')} {c}
                  </div>
                ) : <span className="text-[#555]">—</span>
              })()}
              {order.coupon_code && (
                <p className="text-[#C8A96A] text-[10px]">كوبون: {order.coupon_code}</p>
              )}
            </div>
            <div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <Link href={`/admin/orders/${order.id}`}
              className="p-1.5 text-[#555] group-hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors">
              <ChevronRight size={15} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
