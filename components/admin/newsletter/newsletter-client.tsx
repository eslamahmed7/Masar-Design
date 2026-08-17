'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Send, Trash2, Mail, Users, AlertCircle, Loader2 } from 'lucide-react'
import { sendCustomNewsletter, deleteNewsletterSubscriber } from '@/lib/admin/actions'

interface Props {
  initialSubscribers: any[]
  error?: string
}

export function NewsletterClient({ initialSubscribers, error: initialError }: Props) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState(initialError || '')
  const [isPending, startTransition] = useTransition()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !htmlContent.trim()) {
      setError('يرجى إدخال عنوان ومحتوى الرسالة.')
      return
    }

    if (!confirm(`هل أنت متأكد من إرسال هذه الرسالة إلى ${subscribers.length} مشترك؟`)) return

    setStatus('loading')
    setError('')

    const res = await sendCustomNewsletter(subject, htmlContent)
    if (res.error) {
      setError(res.error)
      setStatus('error')
    } else {
      setStatus('success')
      setSubject('')
      setHtmlContent('')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('حذف هذا المشترك؟')) return
    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(id)
      if (res.error) {
        alert(res.error)
      } else {
        setSubscribers(prev => prev.filter(s => s.id !== id))
      }
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F0E6D3]">إدارة النشرة البريدية</h1>
        <p className="text-[#888] text-sm mt-1">عرض المشتركين وإرسال حملات ترويجية عبر البريد الإلكتروني</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-[#0E0D0B] border border-[#333] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#C8A96A]/10 rounded-full flex items-center justify-center text-[#C8A96A]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-[#888]">إجمالي المشتركين</p>
            <p className="text-2xl font-bold text-[#F0E6D3]">{subscribers.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Send Email Form */}
        <div className="bg-[#0E0D0B] border border-[#333] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#F0E6D3] mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#C8A96A]" /> إرسال رسالة مخصصة
          </h2>
          
          <form onSubmit={handleSend} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            {status === 'success' && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
                تم إرسال الرسالة بنجاح لجميع المشتركين.
              </div>
            )}

            <div>
              <label className="block text-xs text-[#999] mb-1">عنوان الرسالة</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="مثال: خصم خاص بمناسبة العيد"
                className="bg-black border border-[#333] rounded-xl px-4 py-2.5 text-[#F0E6D3] text-sm focus:border-[#C8A96A]/50 focus:outline-none w-full"
                disabled={status === 'loading'}
              />
            </div>
            
            <div>
              <label className="block text-xs text-[#999] mb-1">محتوى الرسالة (يدعم HTML)</label>
              <textarea
                value={htmlContent}
                onChange={e => setHtmlContent(e.target.value)}
                placeholder="<p>مرحباً بك في مسار...</p>"
                rows={8}
                dir="ltr"
                className="bg-black border border-[#333] rounded-xl px-4 py-2.5 text-[#F0E6D3] text-sm focus:border-[#C8A96A]/50 focus:outline-none w-full font-mono text-left"
                disabled={status === 'loading'}
              />
              <p className="text-[10px] text-[#666] mt-1">يتم تغليف المحتوى تلقائياً في قالب البريد الخاص بمسار.</p>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || subscribers.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</>
              ) : (
                <><Send className="w-5 h-5" /> إرسال لجميع المشتركين</>
              )}
            </button>
          </form>
        </div>

        {/* Subscribers List */}
        <div className="bg-[#0E0D0B] border border-[#333] rounded-xl overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-[#333] bg-black/50">
            <h2 className="text-sm font-bold text-[#F0E6D3]">قائمة المشتركين النشطين</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {subscribers.length === 0 ? (
              <p className="text-center text-[#666] text-sm py-10">لا يوجد مشتركون حالياً.</p>
            ) : (
              subscribers.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-[#222] bg-black/20 hover:border-[#333] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm text-[#F0E6D3]">{sub.email}</span>
                    <span className="text-xs text-[#666]">{new Date(sub.subscribed_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    disabled={isPending}
                    className="p-2 text-[#666] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
