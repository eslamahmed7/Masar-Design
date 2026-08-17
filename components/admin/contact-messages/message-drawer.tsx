'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  updateContactMessageStatus,
  updateContactMessageNotes,
} from '@/lib/admin/actions'
import type { DBContactMessage, ContactMessageStatus } from '@/lib/admin/types'
import {
  X, Archive, Trash2, MessageSquare, Paperclip, Phone, Mail,
  Clock, Pencil, Save, ExternalLink, Copy, Check, RefreshCw
} from 'lucide-react'

interface Props {
  message: DBContactMessage
  onClose: () => void
  onUpdate: (updates: Partial<DBContactMessage>) => void
  onArchive: () => void
  onDelete: () => void
  onRestore?: () => void
  onPermanentDelete?: () => void
}



function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function MessageDrawer({ message, onClose, onUpdate, onArchive, onDelete, onRestore, onPermanentDelete }: Props) {
  const [notes, setNotes] = useState(message.admin_notes ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const normalizePhone = (phone: string) => {
    let p = phone.replace(/\D/g, '')
    if (p.startsWith('01') && p.length === 11) {
      p = '2' + p
    }
    return p
  }

  const handleCopyInfo = () => {
    const text = `Customer Name: ${message.name}
Phone Number: ${message.phone}
Email: ${message.email || 'N/A'}
Message Type: ${message.contact_message_types?.label_ar || 'N/A'}
Date: ${formatDate(message.created_at)}
Message: ${message.message}`
    
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusChange = (value: ContactMessageStatus) => {
    startTransition(async () => {
      await updateContactMessageStatus(message.id, value)
      onUpdate({ status: value })
    })
  }



  const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNotes(val)
    setSaveStatus('saving')
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      await updateContactMessageNotes(message.id, val)
      onUpdate({ admin_notes: val })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
    new:         { label: 'جديد',          cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    in_progress: { label: 'جاري التواصل', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    contacted:   { label: 'تم التواصل',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    closed:      { label: 'مغلق',          cls: 'bg-[#333]/60 text-[#888] border-[#444]' },
    trashed:     { label: 'سلة المحذوفات', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
  }
  const badgeInfo = STATUS_BADGES[message.status] ?? STATUS_BADGES.new



  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full w-full flex-col border-r border-[#C8A96A]/10 bg-[#141310] lg:w-[440px] lg:flex-shrink-0"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#C8A96A]/10 px-5 py-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#C8A96A]/25 bg-[#C8A96A]/10 text-sm font-bold text-[#C8A96A]">
            {message.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="truncate font-medium text-sm text-[#F0E6D3]">{message.name}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide ${badgeInfo.cls}`}>
                {badgeInfo.label}
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#555]">{message.message_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {message.status !== 'trashed' ? (
            <>
              {message.status !== 'closed' && (
                <button
                  onClick={onArchive}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#1A1917] hover:text-[#888] transition-all"
                  title="إغلاق"
                >
                  <Archive size={14} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-red-950/40 hover:text-red-400 transition-all"
                title="نقل للمحذوفات"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onRestore}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-emerald-950/40 hover:text-emerald-400 transition-all"
                title="استعادة"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={onPermanentDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-red-950/40 hover:text-red-400 transition-all"
                title="حذف نهائي"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <div className="w-[1px] h-4 bg-[#333] mx-1" />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] hover:bg-[#1A1917] hover:text-[#888] transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contact info Premium Card */}
        <div className="p-5">
          <div className="rounded-xl border border-gold/20 bg-gradient-to-b from-gold/5 to-transparent p-5">
            <p className="mb-4 text-xs font-bold text-gold flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(200,169,106,0.8)]" />
              بيانات التواصل
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#E0E0E0]">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-foreground/50">
                  <span className="font-bold">{message.name.charAt(0)}</span>
                </div>
                <span>{message.name}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-[#E0E0E0]">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-foreground/50">
                  <Phone size={14} />
                </div>
                <span className="font-mono" dir="ltr">{message.phone}</span>
              </div>

              {message.email && (
                <div className="flex items-center gap-3 text-sm text-[#E0E0E0]">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-foreground/50">
                    <Mail size={14} />
                  </div>
                  <span dir="ltr">{message.email}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-[#E0E0E0]">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-foreground/50">
                  <Clock size={14} />
                </div>
                <span>{formatDate(message.created_at)}</span>
              </div>

              {message.contact_message_types && (
                <div className="flex items-center gap-3 text-sm text-[#E0E0E0]">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-foreground/50">
                    <MessageSquare size={14} />
                  </div>
                  <span>{message.contact_message_types.label_ar}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`tel:${message.phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold/20 bg-gold/10 py-2.5 text-xs font-medium text-gold hover:bg-gold/20 hover:shadow-[0_0_15px_rgba(200,169,106,0.15)] transition-all"
              >
                <Phone size={14} /> اتصال
              </a>
              <a
                href={`https://wa.me/${normalizePhone(message.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#25D366]/20 bg-[#25D366]/10 py-2.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/20 hover:shadow-[0_0_15px_rgba(37,211,102,0.15)] transition-all"
              >
                <MessageSquare size={14} /> واتساب
              </a>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {message.email ? (
                <a
                  href={`mailto:${message.email}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-foreground/70 hover:bg-white/10 transition-all"
                >
                  <Mail size={14} /> إيميل
                </a>
              ) : (
                <button
                  disabled
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] py-2.5 text-xs font-medium text-foreground/30 cursor-not-allowed"
                >
                  <Mail size={14} /> إيميل
                </button>
              )}
              <button
                onClick={handleCopyInfo}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-foreground/70 hover:bg-white/10 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'تم النسخ' : 'نسخ البيانات'}
              </button>
            </div>
          </div>
        </div>

        {/* Status controls */}
        <div className="border-b border-[#C8A96A]/10 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[10px] uppercase tracking-wider text-[#555]">حالة الرسالة</label>
            <select
              value={message.status}
              onChange={e => handleStatusChange(e.target.value as ContactMessageStatus)}
              disabled={isPending}
              className="rounded-lg border border-[#222] bg-[#0E0D0B] px-3 py-1.5 text-xs text-[#888] outline-none transition-all hover:border-[#C8A96A]/25 focus:border-[#C8A96A]/40"
            >
              <option value="new">جديد</option>
              <option value="in_progress">جاري التواصل</option>
              <option value="contacted">تم التواصل</option>
              <option value="closed">مغلق</option>
              <option value="trashed">سلة المحذوفات</option>
            </select>
          </div>
        </div>

        {/* Message body */}
        <div className="border-b border-[#C8A96A]/10 px-5 py-4">
          <p className="mb-3 text-[10px] uppercase tracking-wider text-[#555]">الرسالة</p>
          <p className="text-sm leading-relaxed text-[#999] whitespace-pre-wrap">{message.message}</p>
        </div>

        {/* Attachment */}
        {message.attachment_url && (
          <div className="border-b border-[#C8A96A]/10 px-5 py-4">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-[#555]">المرفق</p>
            {message.attachment_type === 'image' ? (
              <div className="relative rounded-xl overflow-hidden border border-[#222]">
                <img
                  src={message.attachment_url}
                  alt={message.attachment_name ?? 'مرفق'}
                  className="w-full max-h-48 object-cover"
                />
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/70 hover:bg-black/80 transition-all"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[#222] bg-[#0E0D0B] p-3 text-xs text-[#888] transition-all hover:border-[#C8A96A]/25 hover:text-[#C8A96A]"
              >
                <Paperclip size={14} className="flex-shrink-0" />
                <span className="flex-1 truncate">{message.attachment_name}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}



        {/* Admin Notes */}
        <div className="px-5 py-4 pb-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-[#555]">ملاحظات داخلية (خاصة بالإدارة)</p>
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500">
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                جاري الحفظ...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <Check size={10} />
                تم الحفظ
              </span>
            )}
          </div>
          
          <textarea
            value={notes}
            onChange={handleChangeNotes}
            rows={5}
            placeholder="اكتب ملاحظاتك حول العميل هنا (يتم الحفظ تلقائياً)..."
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-foreground/80 placeholder:text-foreground/30 outline-none resize-none transition-all focus:border-gold/30 focus:bg-white/10"
          />
        </div>
      </div>

      {/* Copy Toast */}
      {copied && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-[#1A1917] px-4 py-2 shadow-2xl flex items-center gap-2">
          <Check size={14} className="text-gold" />
          <span className="text-xs font-bold text-gold">تم نسخ بيانات العميل</span>
        </div>
      )}

    </motion.div>
  )
}
