'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, Check, X, Loader2, Megaphone, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { createPromotion, updatePromotion, deletePromotion } from '@/lib/admin/actions'
import type { DBGlobalPromotion } from '@/lib/admin/types'

interface Props { initialPromotions: DBGlobalPromotion[] }

const defaultForm = {
  title: '', title_ar: '', description: '',
  discount_value: '', discount_type: 'percentage' as 'percentage' | 'fixed',
  applicable_to: 'all' as 'all' | 'category' | 'service',
  start_date: '', end_date: '',
  is_active: true, show_banner: true,
  banner_text: '', banner_color: '#C8A96A',
  enable_countdown: true, priority: '0',
  send_email_to_subscribers: false,
}

export function PromotionsClient({ initialPromotions }: Props) {
  const [promotions, setPromotions] = useState<DBGlobalPromotion[]>(initialPromotions)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleEditClick = (promo: DBGlobalPromotion) => {
    setEditingId(promo.id)
    setForm({
      title: promo.title,
      title_ar: promo.title_ar || '',
      description: promo.description || '',
      discount_value: String(promo.discount_value),
      discount_type: promo.discount_type,
      applicable_to: promo.applicable_to,
      start_date: promo.start_date ? promo.start_date.substring(0, 16) : '',
      end_date: promo.end_date ? promo.end_date.substring(0, 16) : '',
      is_active: promo.is_active,
      show_banner: promo.show_banner,
      banner_text: promo.banner_text || '',
      banner_color: promo.banner_color || '#C8A96A',
      enable_countdown: promo.enable_countdown,
      priority: String(promo.priority),
      send_email_to_subscribers: false, // Default to false when editing so we don't spam accidentally
    })
    setCreating(true)
  }

  const handleCreate = () => {
    if (!form.title.trim() || !form.discount_value) {
      setError('العنوان والقيمة مطلوبان.')
      return
    }
    setError('')
    startTransition(async () => {
      if (editingId) {
        const res = await updatePromotion(editingId, {
          title: form.title.trim(),
          title_ar: form.title_ar.trim() || null,
          description: form.description.trim() || null,
          discount_value: Number(form.discount_value),
          discount_type: form.discount_type,
          applicable_to: form.applicable_to,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          is_active: form.is_active,
          show_banner: form.show_banner,
          banner_text: form.banner_text.trim() || null,
          banner_color: form.banner_color,
          enable_countdown: form.enable_countdown,
          priority: Number(form.priority),
          send_email_to_subscribers: form.send_email_to_subscribers,
        })
        if (res.error) { setError(res.error); return }
        setPromotions(prev => prev.map(p => p.id === editingId ? res.promotion! : p))
        setForm(defaultForm)
        setEditingId(null)
        setCreating(false)
      } else {
        const res = await createPromotion({
          title: form.title.trim(),
          title_ar: form.title_ar.trim() || undefined,
          description: form.description.trim() || undefined,
          discount_value: Number(form.discount_value),
          discount_type: form.discount_type,
          applicable_to: form.applicable_to,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          is_active: form.is_active,
          show_banner: form.show_banner,
          banner_text: form.banner_text.trim() || undefined,
          banner_color: form.banner_color,
          enable_countdown: form.enable_countdown,
          priority: Number(form.priority),
          send_email_to_subscribers: form.send_email_to_subscribers,
        })
        if (res.error) { setError(res.error); return }
        setPromotions(prev => [res.promotion!, ...prev])
        setForm(defaultForm)
        setCreating(false)
      }
    })
  }

  const handleToggle = (promo: DBGlobalPromotion) => {
    startTransition(async () => {
      await updatePromotion(promo.id, { is_active: !promo.is_active })
      setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p))
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('حذف هذا العرض؟')) return
    startTransition(async () => {
      await deletePromotion(id)
      setPromotions(prev => prev.filter(p => p.id !== id))
    })
  }

  const inputCls = 'bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none w-full'
  const labelCls = 'block text-xs text-[#999] mb-1'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">العروض العامة</h1>
          <p className="text-[#888] text-sm mt-1">إدارة العروض والخصومات العامة وشريط الإعلانات</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditingId(null); setForm(defaultForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={15} /> عرض جديد
        </button>
      </div>

      {/* Active banner preview */}
      {promotions.filter(p => p.is_active && p.show_banner).length > 0 && (
        <div className="rounded-xl overflow-hidden border border-[#C8A96A]/20">
          <div className="py-2 px-4 flex items-center justify-center gap-3 text-sm font-medium"
            style={{ backgroundColor: promotions.find(p => p.is_active && p.show_banner)?.banner_color + '22',
              color: promotions.find(p => p.is_active && p.show_banner)?.banner_color }}>
            <Megaphone size={14} />
            <span>
              {promotions.find(p => p.is_active && p.show_banner)?.banner_text ||
               promotions.find(p => p.is_active && p.show_banner)?.title_ar ||
               promotions.find(p => p.is_active && p.show_banner)?.title}
            </span>
            <span className="opacity-70 text-xs">— معاينة الشريط النشط</span>
          </div>
        </div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1A1916] border border-[#C8A96A]/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-[#F0E6D3] font-semibold text-sm">{editingId ? 'تعديل العرض' : 'عرض جديد'}</h3>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/20 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>العنوان *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="10% خصم على جميع الخدمات" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>العنوان بالعربية</label>
                <input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))}
                  placeholder="خصم ١٠٪ على جميع الخدمات" className={inputCls} dir="rtl" />
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
                  placeholder={form.discount_type === 'percentage' ? '10' : '500'} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ينطبق على</label>
                <select value={form.applicable_to} onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value as any }))} className={inputCls}>
                  <option value="all">جميع الخدمات</option>
                  <option value="category">تصنيف محدد</option>
                  <option value="service">خدمة محددة</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>الأولوية</label>
                <input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>تاريخ البدء</label>
                <input type="datetime-local" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>تاريخ الانتهاء</label>
                <input type="datetime-local" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>نص الشريط الإعلاني</label>
                <input value={form.banner_text} onChange={e => setForm(p => ({ ...p, banner_text: e.target.value }))}
                  placeholder="عرض الصيف! خصم ١٠٪ على التصميم الداخلي" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>لون الشريط</label>
                <div className="flex gap-2">
                  <input type="color" value={form.banner_color} onChange={e => setForm(p => ({ ...p, banner_color: e.target.value }))}
                    className="w-10 h-9 rounded-lg border border-[#333] bg-[#0E0D0B] cursor-pointer" />
                  <input value={form.banner_color} onChange={e => setForm(p => ({ ...p, banner_color: e.target.value }))}
                    className={`${inputCls} flex-1`} />
                </div>
              </div>
            </div>
            {/* Toggles */}
            <div className="flex items-center gap-6">
              {[
                { key: 'is_active', label: 'نشط' },
                { key: 'show_banner', label: 'عرض الشريط' },
                { key: 'enable_countdown', label: 'عداد تنازلي' },
                { key: 'send_email_to_subscribers', label: 'إرسال العرض للمشتركين عبر البريد' },
              ].map(toggle => (
                <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={form[toggle.key as keyof typeof form] as boolean}
                    onChange={e => setForm(p => ({ ...p, [toggle.key]: e.target.checked }))}
                    className="w-4 h-4 accent-[#C8A96A]" />
                  <span className="text-[#888] text-sm">{toggle.label}</span>
                </label>
              ))}
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

      {/* Promotions grid */}
      {promotions.length === 0 && (
        <div className="text-center py-16 text-[#555]">
          <Megaphone size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد عروض بعد.</p>
        </div>
      )}

      <div className="grid gap-4">
        {promotions.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-[#1A1916] border rounded-2xl p-5 transition-all ${
              promo.is_active ? 'border-[#C8A96A]/25' : 'border-[#C8A96A]/8'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Color indicator */}
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: promo.banner_color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[#F0E6D3] font-semibold">{promo.title}</p>
                    {promo.title_ar && <p className="text-[#888] text-sm">{promo.title_ar}</p>}
                    <span className="px-2 py-0.5 bg-[#C8A96A]/15 text-[#C8A96A] border border-[#C8A96A]/20 rounded-full text-[10px] font-bold">
                      {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : ' ر.س'} خصم
                    </span>
                    {promo.is_active && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px]">نشط</span>
                    )}
                  </div>
                  {promo.banner_text && (
                    <p className="text-[#888] text-sm mt-1">شريط: &ldquo;{promo.banner_text}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {promo.start_date && (
                      <span className="text-[#666] text-xs">من: {new Date(promo.start_date).toLocaleDateString('ar-SA')}</span>
                    )}
                    {promo.end_date && (
                      <span className="text-[#666] text-xs">حتى: {new Date(promo.end_date).toLocaleDateString('ar-SA')}</span>
                    )}
                    {promo.show_banner && <span className="text-[#666] text-xs">• شريط مرئي</span>}
                    {promo.enable_countdown && <span className="text-[#666] text-xs">• عداد تنازلي</span>}
                    <span className="text-[#666] text-xs">• أولوية: {promo.priority}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(promo)} disabled={isPending}
                  className={`p-1.5 text-[#555] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors`}
                  title={promo.is_active ? 'إيقاف' : 'تفعيل'}>
                  {promo.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => handleEditClick(promo)} disabled={isPending}
                  className="p-1.5 text-[#555] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors"
                  title="تعديل">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(promo.id)} disabled={isPending}
                  className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                  title="حذف">
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
