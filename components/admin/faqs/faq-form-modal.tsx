'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { DBFaq, DBFaqCategory } from '@/lib/admin/types'
import { X } from 'lucide-react'

interface Props {
  faq: DBFaq | null
  categories: DBFaqCategory[]
  onClose: () => void
  onCreate: (data: { question_ar: string; answer_ar: string; category_id?: string | null; sort_order?: number }) => Promise<void>
  onUpdate: (id: string, data: Partial<DBFaq>) => Promise<void>
  submitting: boolean
}

const inputCls = `
  w-full rounded-xl border border-[#222] bg-[#0E0D0B] px-4 py-3
  text-sm text-[#F0E6D3] placeholder:text-[#333]
  outline-none transition-all focus:border-[#C8A96A]/40
`.trim()

export function FaqFormModal({ faq, categories, onClose, onCreate, onUpdate, submitting }: Props) {
  const isEdit = !!faq
  const [question_ar, setQuestion] = useState(faq?.question_ar ?? '')
  const [answer_ar, setAnswer] = useState(faq?.answer_ar ?? '')
  const [category_id, setCategoryId] = useState<string>(faq?.category_id ?? '')
  const [sort_order, setSortOrder] = useState(faq?.sort_order ?? 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!question_ar.trim()) e.question_ar = 'السؤال مطلوب'
    if (!answer_ar.trim()) e.answer_ar = 'الإجابة مطلوبة'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      question_ar: question_ar.trim(),
      answer_ar: answer_ar.trim(),
      category_id: category_id || null,
      sort_order: Number(sort_order),
    }
    if (isEdit && faq) {
      await onUpdate(faq.id, payload)
    } else {
      await onCreate(payload)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl rounded-2xl border border-[#C8A96A]/15 bg-[#141310] shadow-[0_0_60px_rgba(0,0,0,0.6)]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#C8A96A]/10 px-6 py-4">
          <h2 className="font-bold text-[#F0E6D3]">
            {isEdit ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#1A1917] hover:text-[#888] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#888]">التصنيف</label>
            <select
              value={category_id}
              onChange={e => setCategoryId(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="">بدون تصنيف</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#888]">
              السؤال <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={question_ar}
              onChange={e => setQuestion(e.target.value)}
              placeholder="ما هو سؤالك؟"
              className={inputCls}
            />
            {errors.question_ar && (
              <p className="text-xs text-red-400">{errors.question_ar}</p>
            )}
          </div>

          {/* Answer */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#888]">
              الإجابة <span className="text-red-400">*</span>
            </label>
            <textarea
              value={answer_ar}
              onChange={e => setAnswer(e.target.value)}
              placeholder="اكتب إجابة واضحة ومفيدة..."
              rows={5}
              className={`${inputCls} resize-none`}
            />
            {errors.answer_ar && (
              <p className="text-xs text-red-400">{errors.answer_ar}</p>
            )}
          </div>

          {/* Sort order */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#888]">ترتيب العرض</label>
            <input
              type="number"
              value={sort_order}
              onChange={e => setSortOrder(Number(e.target.value))}
              min={0}
              className={`${inputCls} max-w-[120px]`}
              dir="ltr"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A1917]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#222] px-5 py-2.5 text-xs font-medium text-[#666] transition-all hover:border-[#333] hover:text-[#888]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#C8A96A] px-6 py-2.5 text-xs font-semibold text-[#0E0D0B] transition-all hover:bg-[#d4b87a] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isEdit ? 'حفظ التغييرات' : 'إضافة السؤال'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
