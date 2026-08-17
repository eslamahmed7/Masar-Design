'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FaqFormModal } from './faq-form-modal'
import { createFaq, updateFaq, deleteFaq } from '@/lib/admin/actions'
import type { DBFaq, DBFaqCategory } from '@/lib/admin/types'
import { HelpCircle, Plus, Pencil, Trash2, Search, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  initialFaqs: DBFaq[]
  initialCategories: DBFaqCategory[]
}

function FaqRow({
  faq,
  onEdit,
  onDelete,
  onToggle,
}: {
  faq: DBFaq
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`
        group flex items-start gap-4 rounded-xl border px-5 py-4 transition-all duration-300
        ${faq.is_active
          ? 'border-[#222] bg-[#141310] hover:border-[#C8A96A]/20'
          : 'border-[#1A1917] bg-[#0E0D0B] opacity-60'
        }
      `}
    >
      {/* Order number */}
      <span className="mt-0.5 flex-shrink-0 font-mono text-xs text-[#444]">
        {String(faq.sort_order).padStart(2, '0')}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-medium text-[#F0E6D3] leading-relaxed">{faq.question_ar}</p>
        <p className="text-xs text-[#666] leading-relaxed line-clamp-2">{faq.answer_ar}</p>
        <div className="flex items-center gap-2 mt-1">
          {faq.faq_categories && (
            <span className="rounded-full border border-[#C8A96A]/20 bg-[#C8A96A]/8 px-2 py-0.5 text-[10px] text-[#C8A96A]/80">
              {faq.faq_categories.name_ar}
            </span>
          )}
          {!faq.is_active && (
            <span className="rounded-full border border-[#333] px-2 py-0.5 text-[10px] text-[#555]">مخفي</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#1A1917] hover:text-[#888] transition-all"
          title={faq.is_active ? 'إخفاء' : 'إظهار'}
        >
          {faq.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#C8A96A]/10 hover:text-[#C8A96A] transition-all"
          title="تعديل"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-red-950/40 hover:text-red-400 transition-all"
          title="حذف"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

export function FaqsClient({ initialFaqs, initialCategories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [faqs, setFaqs] = useState(initialFaqs)
  const [categories] = useState(initialCategories)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<DBFaq | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const filtered = faqs.filter(f => {
    const matchSearch = !search.trim() ||
      f.question_ar.toLowerCase().includes(search.toLowerCase()) ||
      f.answer_ar.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategory || f.category_id === filterCategory
    return matchSearch && matchCat
  })

  const handleCreate = async (data: { question_ar: string; answer_ar: string; category_id?: string | null; sort_order?: number }) => {
    setSubmitting(true)
    const result = await createFaq(data)
    if ('faq' in result && result.faq) {
      const withCat = { ...result.faq, faq_categories: categories.find(c => c.id === data.category_id) ?? null }
      setFaqs(prev => [withCat, ...prev])
      setShowModal(false)
    }
    setSubmitting(false)
  }

  const handleUpdate = async (id: string, data: Partial<DBFaq>) => {
    setSubmitting(true)
    const result = await updateFaq(id, data)
    if ('faq' in result && result.faq) {
      setFaqs(prev => prev.map(f => f.id === id
        ? { ...f, ...data, faq_categories: categories.find(c => c.id === data.category_id) ?? f.faq_categories }
        : f
      ))
      setEditingFaq(null)
      setShowModal(false)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا السؤال نهائياً؟')) return
    await deleteFaq(id)
    setFaqs(prev => prev.filter(f => f.id !== id))
  }

  const handleToggle = async (faq: DBFaq) => {
    await updateFaq(faq.id, { is_active: !faq.is_active })
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_active: !f.is_active } : f))
  }

  const openEdit = (faq: DBFaq) => { setEditingFaq(faq); setShowModal(true) }
  const openCreate = () => { setEditingFaq(null); setShowModal(true) }

  return (
    <div className="min-h-full bg-[#0E0D0B]" dir="rtl">
      {/* Header */}
      <div className="border-b border-[#C8A96A]/10 bg-[#141310] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#C8A96A]/25 bg-[#C8A96A]/10 text-[#C8A96A]">
              <HelpCircle size={16} />
            </div>
            <div>
              <h1 className="font-bold text-[#F0E6D3] text-lg">الأسئلة الشائعة</h1>
              <p className="text-xs text-[#666]">{faqs.length} سؤال</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => startTransition(() => router.refresh())}
              className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1A1917] px-3 py-2 text-xs text-[#888] transition-all hover:border-[#C8A96A]/25 hover:text-[#C8A96A]"
            >
              <RefreshCw size={13} className={isPending ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-[#C8A96A] px-4 py-2 text-xs font-semibold text-[#0E0D0B] transition-all hover:bg-[#d4b87a] hover:shadow-[0_0_16px_rgba(200,169,106,0.25)]"
            >
              <Plus size={14} />
              إضافة سؤال
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[#C8A96A]/10 bg-[#141310] px-6 py-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في الأسئلة..."
              className="w-full rounded-xl border border-[#222] bg-[#0E0D0B] py-2.5 pr-9 pl-4 text-xs text-[#F0E6D3] placeholder:text-[#444] outline-none transition-all focus:border-[#C8A96A]/30"
            />
          </div>
          {/* Category filter */}
          <select
            value={filterCategory ?? ''}
            onChange={e => setFilterCategory(e.target.value || null)}
            className="rounded-xl border border-[#222] bg-[#0E0D0B] px-3 py-2 text-xs text-[#888] outline-none transition-all hover:border-[#C8A96A]/25"
          >
            <option value="">كل التصنيفات</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQ list */}
      <div className="p-6 space-y-2.5 max-w-4xl">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#222] bg-[#1A1917] text-[#444]">
                <HelpCircle size={24} />
              </div>
              <p className="text-sm text-[#555]">
                {search ? 'لا توجد أسئلة مطابقة' : 'لا توجد أسئلة بعد. أضف أول سؤال!'}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 rounded-xl bg-[#C8A96A] px-4 py-2 text-xs font-semibold text-[#0E0D0B] transition-all hover:bg-[#d4b87a]"
                >
                  <Plus size={13} />
                  إضافة سؤال
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map(faq => (
              <FaqRow
                key={faq.id}
                faq={faq}
                onEdit={() => openEdit(faq)}
                onDelete={() => handleDelete(faq.id)}
                onToggle={() => handleToggle(faq)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <FaqFormModal
            faq={editingFaq}
            categories={categories}
            onClose={() => { setShowModal(false); setEditingFaq(null) }}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
