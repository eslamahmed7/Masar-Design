'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { MessageDrawer } from './message-drawer'
import {
  updateContactMessageStatus,
  deleteContactMessage,
  permanentlyDeleteContactMessage,
  restoreContactMessage,
} from '@/lib/admin/actions'
import type { DBContactMessage, DBContactMessageType, ContactMessageStatus } from '@/lib/admin/types'
import { MessageSquare, Search, Filter, RefreshCw, Archive, Trash2, Eye, Paperclip } from 'lucide-react'

interface Props {
  initialMessages: DBContactMessage[]
  totalMessages: number
  messageTypes: DBContactMessageType[]
  initialStatus: string
  initialPage: number
  unreadCount: number
}

const STATUS_TABS = [
  { key: 'new',         label: 'جديد',          color: 'text-amber-400' },
  { key: 'in_progress', label: 'جاري التواصل', color: 'text-blue-400' },
  { key: 'contacted',   label: 'تم التواصل',    color: 'text-emerald-400' },
  { key: 'closed',      label: 'مغلق',          color: 'text-foreground/40' },
  { key: 'trashed',     label: 'سلة المحذوفات', color: 'text-red-400' },
  { key: 'all',         label: 'الكل',          color: 'text-foreground/60' },
]

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new:         { label: 'جديد',          cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  in_progress: { label: 'جاري التواصل', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  contacted:   { label: 'تم التواصل',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  closed:      { label: 'مغلق',          cls: 'bg-[#333]/60 text-[#888] border-[#444]' },
  trashed:     { label: 'محذوفة',        cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function MessageCard({
  msg,
  onClick,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  isPending,
}: {
  msg: DBContactMessage
  onClick: () => void
  onArchive: () => void
  onDelete: () => void
  onRestore?: () => void
  onPermanentDelete?: () => void
  isPending: boolean
}) {
  const isNew = msg.status === 'new'
  const isTrashed = msg.status === 'trashed'
  const statusInfo = STATUS_LABELS[msg.status] ?? STATUS_LABELS.new

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className={`
        group relative flex cursor-pointer flex-col gap-3 rounded-xl border p-5
        transition-all duration-300
        ${isNew
          ? 'border-gold/20 bg-gold/5 hover:border-gold/35 hover:bg-gold/8'
          : 'border-white/6 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.035]'
        }
        ${isPending ? 'opacity-60 pointer-events-none' : ''}
      `}
      onClick={onClick}
    >
      {/* Unread indicator */}
      {isNew && (
        <span className="absolute top-5 right-5 h-2 w-2 rounded-full bg-gold/80 shadow-[0_0_6px_rgba(200,169,106,0.6)]" />
      )}

      {/* Top row */}
      <div className="flex items-start gap-4 pr-5">
        {/* Avatar */}
        <div className={`
          flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-sm font-bold
          ${isNew
            ? 'border-gold/30 bg-gold/15 text-gold'
            : 'border-white/10 bg-white/5 text-foreground/50'
          }
        `}>
          {msg.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + type + number */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`font-medium text-sm ${isNew ? 'text-foreground' : 'text-foreground/70'}`}>
              {msg.name}
            </span>
            {msg.contact_message_types && (
              <span className="rounded-full border border-gold/20 bg-gold/8 px-2 py-0.5 text-[10px] text-gold/80">
                {msg.contact_message_types.label_ar}
              </span>
            )}
            <span className="font-mono text-[10px] text-foreground/30">{msg.message_number}</span>
          </div>

          {/* Preview */}
          <p className={`text-xs leading-relaxed line-clamp-2 ${isNew ? 'text-foreground/70' : 'text-foreground/40'}`}>
            {msg.message}
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
          {msg.attachment_url && (
            <span className="flex items-center gap-1 text-[10px] text-foreground/40">
              <Paperclip size={10} />
              مرفق
            </span>
          )}
          {msg.email && (
            <span className="text-[10px] text-foreground/30 font-mono">{msg.email}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-foreground/30">{formatDate(msg.created_at)}</span>
          {/* Quick actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isTrashed ? (
              <>
                {msg.status !== 'closed' && (
                  <button
                    onClick={e => { e.stopPropagation(); onArchive() }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/30 hover:bg-white/10 hover:text-foreground/70 transition-all"
                    title="إغلاق"
                  >
                    <Archive size={13} />
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onDelete() }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/30 hover:bg-red-950/40 hover:text-red-400 transition-all"
                  title="نقل للمحذوفات"
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={e => { e.stopPropagation(); onRestore?.() }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/30 hover:bg-emerald-950/40 hover:text-emerald-400 transition-all"
                  title="استعادة"
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onPermanentDelete?.() }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/30 hover:bg-red-950/40 hover:text-red-400 transition-all"
                  title="حذف نهائي"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ContactMessagesClient({
  initialMessages,
  totalMessages,
  messageTypes,
  initialStatus,
  initialPage,
  unreadCount,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [messages, setMessages] = useState(initialMessages)
  const [activeStatus, setActiveStatus] = useState(initialStatus)
  const [search, setSearch] = useState('')
  const [selectedMsg, setSelectedMsg] = useState<DBContactMessage | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const switchTab = (key: string) => {
    setActiveStatus(key)
    startTransition(() => {
      router.push(`/admin/contact-messages?status=${key}`)
    })
  }

  const filtered = search.trim()
    ? messages.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search) ||
        m.message_number.toLowerCase().includes(search.toLowerCase()) ||
        (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.contact_message_types?.label_ar ?? '').includes(search)
      )
    : messages

  const markPending = (id: string) => setPendingIds(s => new Set(s).add(id))
  const clearPending = (id: string) => setPendingIds(s => { const n = new Set(s); n.delete(id); return n })

  const handleOpen = async (msg: DBContactMessage) => {
    setSelectedMsg(msg)
    if (msg.status === 'new') {
      markPending(msg.id)
      await updateContactMessageStatus(msg.id, 'in_progress')
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'in_progress' } : m))
      clearPending(msg.id)
    }
  }

  const handleArchive = async (id: string) => {
    markPending(id)
    await updateContactMessageStatus(id, 'closed')
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selectedMsg?.id === id) setSelectedMsg(null)
    clearPending(id)
  }

  const handleDelete = async (id: string) => {
    markPending(id)
    await deleteContactMessage(id)
    if (activeStatus !== 'all') {
      setMessages(prev => prev.filter(m => m.id !== id))
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'trashed' } : m))
    }
    if (selectedMsg?.id === id) setSelectedMsg(null)
    clearPending(id)
  }

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.')) return
    markPending(id)
    await permanentlyDeleteContactMessage(id)
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selectedMsg?.id === id) setSelectedMsg(null)
    clearPending(id)
  }

  const handleRestore = async (id: string) => {
    markPending(id)
    await restoreContactMessage(id)
    if (activeStatus === 'trashed') {
      setMessages(prev => prev.filter(m => m.id !== id))
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'closed' } : m))
    }
    if (selectedMsg?.id === id) setSelectedMsg(null)
    clearPending(id)
  }

  const handleDrawerUpdate = useCallback((updated: Partial<DBContactMessage>) => {
    setMessages(prev => prev.map(m => m.id === selectedMsg?.id ? { ...m, ...updated } : m))
    setSelectedMsg(prev => prev ? { ...prev, ...updated } : prev)
  }, [selectedMsg?.id])

  const totalPages = Math.ceil(totalMessages / 20)
  const localUnread = messages.filter(m => m.status === 'new').length

  return (
    <div className="flex h-full" dir="rtl">
      {/* Main inbox */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${selectedMsg ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#C8A96A]/10 bg-[#141310] px-6 py-5">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#C8A96A]/25 bg-[#C8A96A]/10 text-[#C8A96A]">
                <MessageSquare size={16} />
              </div>
              <div>
                <h1 className="font-bold text-[#F0E6D3] text-lg">رسائل التواصل</h1>
                <p className="text-xs text-[#666]">{totalMessages} رسالة إجمالاً</p>
              </div>
            </div>
            <button
              onClick={() => startTransition(() => router.refresh())}
              className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1A1917] px-3 py-2 text-xs text-[#888] transition-all hover:border-[#C8A96A]/25 hover:text-[#C8A96A]"
            >
              <RefreshCw size={13} className={isPending ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 rounded-xl border border-[#222] bg-[#0E0D0B] p-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`
                  flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all
                  ${activeStatus === tab.key
                    ? 'bg-[#C8A96A]/15 text-[#C8A96A] shadow-sm'
                    : 'text-[#666] hover:text-[#888]'
                  }
                `}
              >
                {tab.label}
                {tab.key === 'new' && unreadCount > 0 && (
                  <span className="rounded-full bg-[#C8A96A] px-1.5 py-0.5 text-[9px] font-bold text-[#0E0D0B]">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 border-b border-[#C8A96A]/10 bg-[#141310] px-6 py-3">
          <div className="relative">
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث باسم المرسل، الهاتف، الرقم، البريد، أو نوع الرسالة..."
              className="w-full rounded-xl border border-[#222] bg-[#0E0D0B] py-2.5 pr-10 pl-4 text-xs text-[#F0E6D3] placeholder:text-[#444] outline-none transition-all focus:border-[#C8A96A]/30"
            />
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-20 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#222] bg-[#1A1917] text-[#444]">
                  <MessageSquare size={24} />
                </div>
                <p className="text-sm text-[#555]">
                  {search ? 'لا توجد رسائل مطابقة للبحث' : 'لا توجد رسائل في هذا القسم'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(msg => (
                  <MessageCard
                    key={msg.id}
                    msg={msg}
                    onClick={() => handleOpen(msg)}
                    onArchive={() => handleArchive(msg.id)}
                    onDelete={() => handleDelete(msg.id)}
                    onRestore={() => handleRestore(msg.id)}
                    onPermanentDelete={() => handlePermanentDelete(msg.id)}
                    isPending={pendingIds.has(msg.id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-center gap-3 border-t border-[#C8A96A]/10 px-6 py-4">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => {
                  startTransition(() => {
                    router.push(`/admin/contact-messages?status=${activeStatus}&page=${p}`)
                  })
                }}
                className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                  p === initialPage
                    ? 'bg-[#C8A96A]/15 text-[#C8A96A]'
                    : 'text-[#666] hover:text-[#888] hover:bg-[#1A1917]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedMsg && (
          <MessageDrawer
            key={selectedMsg.id}
            message={selectedMsg}
            onClose={() => setSelectedMsg(null)}
            onUpdate={handleDrawerUpdate}
            onArchive={() => handleArchive(selectedMsg.id)}
            onDelete={() => handleDelete(selectedMsg.id)}
            onRestore={() => handleRestore(selectedMsg.id)}
            onPermanentDelete={() => handlePermanentDelete(selectedMsg.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
