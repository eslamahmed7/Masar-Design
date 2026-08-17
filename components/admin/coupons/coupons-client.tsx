'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, Check, X, Loader2, Tag, Copy, AlertCircle, WandSparkles } from 'lucide-react'
import { createCoupon, updateCoupon, deleteCoupon, generateCouponCode } from '@/lib/admin/actions'
import type { DBCoupon } from '@/lib/admin/types'

interface Props { initialCoupons: DBCoupon[] }

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-[#333]/60 text-[#888] border-[#444]',
  expired: 'bg-red-500/10 text-red-400 border-red-500/20',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'نشط', inactive: 'غير نشط', expired: 'منتهي',
}

const defaultForm = {
  code: '', description: '', discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: '', max_discount: '', min_order_value: '',
  valid_from: '', valid_until: '', max_uses: '', status: 'active' as 'active' | 'inactive' | 'expired',
}

export function CouponsClient({ initialCoupons }: Props) {
  const [coupons, setCoupons] = useState<DBCoupon[]>(initialCoupons)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerateCode = async () => {
    setGenerating(true)
    const res = await generateCouponCode(8)
    if (res.code) setForm(p => ({ ...p, code: res.code }))
    setGenerating(false)
  }

  const handleEditClick = (coupon: DBCoupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
      min_order_value: coupon.min_order_value ? String(coupon.min_order_value) : '',
      valid_from: coupon.valid_from ? coupon.valid_from.substring(0, 16) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.substring(0, 16) : '',
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      status: coupon.status,
    })
    setCreating(true)
  }

  const handleCreate = () => {
    if (!form.code.trim() || !form.discount_value) {
      setError('كود الخصم والقيمة مطلوبان.')
      return
    }
    setError('')
    startTransition(async () => {
      if (editingId) {
        const res = await updateCoupon(editingId, {
          code: form.code.trim().toUpperCase(),
          description: form.description.trim() || null,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          max_discount: form.max_discount ? Number(form.max_discount) : null,
          min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
          valid_from: form.valid_from || null,
          valid_until: form.valid_until || null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          status: form.status,
        })
        if (res.error) { setError(res.error); return }
        setCoupons(prev => prev.map(c => c.id === editingId ? res.coupon! : c))
        setForm(defaultForm)
        setEditingId(null)
        setCreating(false)
      } else {
        const res = await createCoupon({
          code: form.code.trim().toUpperCase(),
          description: form.description.trim() || undefined,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          max_discount: form.max_discount ? Number(form.max_discount) : null,
          min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
          valid_from: form.valid_from || null,
          valid_until: form.valid_until || null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          status: form.status,
        })
        if (res.error) { setError(res.error); return }
        setCoupons(prev => [res.coupon!, ...prev])
        setForm(defaultForm)
        setCreating(false)
      }
    })
  }

  const handleToggleStatus = (coupon: DBCoupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active'
    startTransition(async () => {
      await updateCoupon(coupon.id, { status: newStatus })
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: newStatus } : c))
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('حذف هذا الكوبون؟')) return
    startTransition(async () => {
      await deleteCoupon(id)
      setCoupons(prev => prev.filter(c => c.id !== id))
    })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  const inputCls = 'bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none w-full'
  const labelCls = 'block text-xs text-[#999] mb-1'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">كوبونات الخصم</h1>
          <p className="text-[#888] text-sm mt-1">إنشاء وإدارة كوبونات الخصم</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditingId(null); setForm(defaultForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={15} /> كوبون جديد
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1A1916] border border-[#C8A96A]/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-[#F0E6D3] font-semibold text-sm">{editingId ? 'تعديل الكوبون' : 'كوبون جديد'}</h3>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/20 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>كود الخصم *</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="SUMMER25" className={inputCls} />
                  <button type="button" onClick={handleGenerateCode} disabled={generating}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs bg-[#222] text-[#C8A96A] hover:bg-[#C8A96A]/10 border border-[#C8A96A]/20 transition-all whitespace-nowrap disabled:opacity-50">
                    {generating ? <Loader2 size={13} className="animate-spin" /> : <WandSparkles size={13} />}
                    توليد كود
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>نوع الخصم</label>
                <select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value as any }))} className={inputCls}>
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>قيمة الخصم *</label>
                <input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                  placeholder={form.discount_type === 'percentage' ? '10' : '100'} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الحد الأقصى للخصم</label>
                <input type="number" value={form.max_discount} onChange={e => setForm(p => ({ ...p, max_discount: e.target.value }))}
                  placeholder="اختياري" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الحد الأدنى للطلب</label>
                <input type="number" value={form.min_order_value} onChange={e => setForm(p => ({ ...p, min_order_value: e.target.value }))}
                  placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الحد الأقصى للاستخدام</label>
                <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                  placeholder="غير محدود" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>صالح من</label>
                <input type="datetime-local" value={form.valid_from} onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>صالح حتى</label>
                <input type="datetime-local" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الحالة</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className={inputCls}>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className={labelCls}>الوصف</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="وصف اختياري للكوبون" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-xs font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} حفظ
              </button>
              <button onClick={() => { setCreating(false); setEditingId(null); setForm(defaultForm); setError('') }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#222] text-[#888] rounded-xl text-xs hover:text-[#F0E6D3] transition-colors">
                <X size={13} /> إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table header */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#C8A96A]/8 text-[#666] text-xs">
          <span>الكود</span>
          <span>نوع الخصم</span>
          <span>القيمة</span>
          <span>الاستخدام</span>
          <span>الصلاحية</span>
          <span>الحالة</span>
          <span></span>
        </div>

        {coupons.length === 0 && (
          <div className="py-16 text-center">
            <Tag size={32} className="text-[#333] mx-auto mb-3" />
            <p className="text-[#666] text-sm">لا توجد كوبونات بعد.</p>
          </div>
        )}

        {coupons.map((coupon, i) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-[#C8A96A]/5 hover:bg-[#F0E6D3]/2 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#C8A96A] font-mono text-sm font-bold">{coupon.code}</span>
              <button onClick={() => copyCode(coupon.code)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#555] hover:text-[#C8A96A] transition-all">
                {copied === coupon.code ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <span className="text-[#888] text-sm">
              {coupon.discount_type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
            </span>
            <span className="text-[#F0E6D3] text-sm font-medium">
              {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ' ر.س'}
              {coupon.max_discount ? ` (حد أقصى: ${coupon.max_discount})` : ''}
            </span>
            <span className="text-[#888] text-sm">
              {coupon.current_uses} / {coupon.max_uses ?? '∞'}
            </span>
            <div className="text-xs text-[#666]">
              {coupon.valid_from && <p>من: {new Date(coupon.valid_from).toLocaleDateString('ar-SA')}</p>}
              {coupon.valid_until && <p>حتى: {new Date(coupon.valid_until).toLocaleDateString('ar-SA')}</p>}
              {!coupon.valid_from && !coupon.valid_until && <p>دائم</p>}
            </div>
            <div>
              <button onClick={() => handleToggleStatus(coupon)}
                className={`px-2.5 py-1 rounded-full text-[10px] border transition-all hover:opacity-80 ${STATUS_COLORS[coupon.status]}`}>
                {STATUS_LABELS[coupon.status]}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleEditClick(coupon)}
                className="p-1.5 text-[#555] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors">
                <Pencil size={13} />
              </button>
              <button onClick={() => handleDelete(coupon.id)} disabled={isPending}
                className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
