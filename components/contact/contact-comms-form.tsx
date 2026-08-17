'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createContactMessage } from '@/lib/admin/actions'
import type { DBContactMessageType } from '@/lib/admin/types'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const
const MAX_CHARS = 3000
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip', 'application/x-zip-compressed']
const MAX_SIZE_MB = 10

interface Props {
  messageTypes: DBContactMessageType[]
  onSuccess: () => void
}

function UploadIcon() {
  return (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

interface FieldProps {
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, optional, error, children }: FieldProps) {
  const { t } = useI18n()
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        {label}
        {optional && <span className="text-xs text-foreground/40">{t('commsForm.optional')}</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputCls = `
  w-full rounded-xl border border-divider bg-surface/55 px-4 py-3.5
  text-sm text-foreground placeholder:text-foreground/30
  outline-none ring-0 transition-all duration-300
  focus:border-gold/40 focus:bg-surface/65 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.08)]
  hover:border-white/14
`.trim()

export function ContactCommsForm({ messageTypes, onSuccess }: Props) {
  const { t, lang } = useI18n()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', messageTypeId: '', message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = t('commsForm.errName')
    if (!form.phone.trim()) e.phone = t('commsForm.errPhone')
    else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone)) e.phone = t('commsForm.errPhoneInvalid')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('commsForm.errEmailInvalid')
    if (!form.message.trim()) e.message = t('commsForm.errMessage')
    else if (form.message.length > MAX_CHARS) e.message = t('commsForm.errMaxChars').replace('{n}', String(MAX_CHARS))
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFile = useCallback((f: File) => {
    setFileError('')
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError(t('commsForm.errFileType'))
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(t('commsForm.errFileSize').replace('{n}', String(MAX_SIZE_MB)))
      return
    }
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setFilePreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setFilePreview(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(f)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setUploadProgress(0)

    try {
      let attachmentUrl: string | undefined
      let attachmentName: string | undefined
      let attachmentType: string | undefined
      let attachmentSize: number | undefined

      if (file) {
        setUploadProgress(20)
        const base64 = await toBase64(file)
        setUploadProgress(50)

        if (file.type.startsWith('image/')) {
          const { uploadToCloudinary } = await import('@/lib/admin/actions')
          const res = await uploadToCloudinary({ base64, folder: 'masar/contact' })
          if ('error' in res) throw new Error(res.error)
          attachmentUrl = res.url
          attachmentType = 'image'
        } else {
          const { uploadToSupabaseStorage } = await import('@/lib/admin/actions')
          const res = await uploadToSupabaseStorage({
            file: base64, fileName: file.name,
            mimeType: file.type, bucket: 'contact-attachments',
          })
          if ('error' in res) throw new Error(res.error)
          attachmentUrl = res.url
          attachmentType = 'document'
        }
        attachmentName = file.name
        attachmentSize = file.size
        setUploadProgress(80)
      }

      const result = await createContactMessage({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        message_type_id: form.messageTypeId || undefined,
        message: form.message.trim(),
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_size: attachmentSize,
      })

      setUploadProgress(100)
      if ('error' in result && result.error) throw new Error(result.error)
      onSuccess()
    } catch (err) {
      console.error(err)
      setErrors({ submit: t('commsForm.errSubmit') })
    } finally {
      setSubmitting(false)
    }
  }

  const charPct = Math.min((form.message.length / MAX_CHARS) * 100, 100)
  const charColor = charPct > 90 ? 'text-red-400' : charPct > 70 ? 'text-amber-400' : 'text-foreground/40'

  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-24" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(50% 30% at 50% 100%, rgba(200,169,106,0.03) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14 text-center"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-gold/60">
            {t('commsForm.label')}
          </p>
          <h2 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
            {t('commsForm.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-foreground/50 leading-relaxed">
            {t('commsForm.desc1')}{' '}
            <a href="/start" className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2">
              {t('commsForm.descLink')}
            </a>.
          </p>
          <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="relative rounded-2xl border border-divider bg-surface/50 p-8 backdrop-blur-sm md:p-12"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: 'radial-gradient(60% 30% at 50% 0%, rgba(200,169,106,0.04) 0%, transparent 60%)' }}
          />

          <form onSubmit={handleSubmit} className="relative space-y-7">
            {/* Row: Name + Phone */}
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label={t('commsForm.nameLabel')} error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t('commsForm.namePlaceholder')}
                  className={inputCls}
                  disabled={submitting}
                />
              </Field>
              <Field label={t('commsForm.phoneLabel')} error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+20 100 000 0000"
                  className={inputCls}
                  dir="ltr"
                  disabled={submitting}
                />
              </Field>
            </div>

            {/* Row: Email + Message Type */}
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label={t('commsForm.emailLabel')} optional error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="example@email.com"
                  className={inputCls}
                  dir="ltr"
                  disabled={submitting}
                />
              </Field>
              <Field label={t('commsForm.typeLabel')}>
                <select
                  value={form.messageTypeId}
                  onChange={e => setForm(f => ({ ...f, messageTypeId: e.target.value }))}
                  className={`${inputCls} cursor-pointer`}
                  disabled={submitting}
                >
                  <option value="">{t('commsForm.typePlaceholder')}</option>
                  {messageTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.label_ar}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Message */}
            <Field label={t('commsForm.messageLabel')} error={errors.message}>
              <div className="relative">
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={t('commsForm.messagePlaceholder')}
                  rows={7}
                  maxLength={MAX_CHARS}
                  className={`${inputCls} resize-none`}
                  disabled={submitting}
                />
                {/* Character counter */}
                <div className="mt-1.5 flex items-center justify-between px-1">
                  <span />
                  <span className={`font-mono text-xs transition-colors ${charColor}`}>
                    {form.message.length.toLocaleString(lang === 'ar' ? 'ar' : 'en')} / {MAX_CHARS.toLocaleString(lang === 'ar' ? 'ar' : 'en')}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-1 h-px w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full bg-gold/50 transition-all duration-300"
                    style={{ width: `${charPct}%` }}
                  />
                </div>
              </div>
            </Field>

            {/* File Upload */}
            <Field label={t('commsForm.attachLabel')} optional>
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed
                      py-10 px-6 text-center transition-all duration-300
                      ${dragOver
                        ? 'border-gold/50 bg-gold/5'
                        : 'border-divider bg-surface/45 hover:border-gold/30 hover:bg-surface/55'}
                    `}
                  >
                    <div className={`text-gold/50 transition-colors ${dragOver ? 'text-gold/80' : ''}`}>
                      <UploadIcon />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">
                        {t('commsForm.dragText')}{' '}
                        <span className="text-gold/70 hover:text-gold transition-colors">{t('commsForm.browse')}</span>
                      </p>
                      <p className="mt-1 text-xs text-foreground/30">
                        {t('commsForm.fileHint').replace('{n}', String(MAX_SIZE_MB))}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center gap-4 rounded-xl border border-gold/20 bg-gold/5 p-4"
                  >
                    {filePreview ? (
                      <img src={filePreview} alt="" className="h-14 w-14 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gold/60">
                        <FileIcon />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-foreground/80">{file.name}</p>
                      <p className="text-xs text-foreground/40 mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {submitting && uploadProgress < 100 && (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="h-full bg-gold/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setFilePreview(null); setFileError('') }}
                      disabled={submitting}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-foreground/40 hover:bg-white/10 hover:text-foreground/70 transition-all"
                    >
                      <XIcon />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {fileError && <p className="mt-1 text-xs text-red-400">{fileError}</p>}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.docx,.zip"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </Field>

            {/* Submit error */}
            <AnimatePresence>
              {errors.submit && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 text-center"
                >
                  {errors.submit}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? {} : { scale: 1.01 }}
              whileTap={submitting ? {} : { scale: 0.99 }}
              className={`
                relative w-full overflow-hidden rounded-xl py-4 text-base font-semibold
                transition-all duration-500
                ${submitting
                  ? 'bg-gold/40 text-foreground/60 cursor-not-allowed'
                  : 'bg-gold text-[#0B0B0B] hover:bg-[#d4b87a] hover:shadow-[0_0_30px_rgba(200,169,106,0.3)]'}
              `}
            >
              {/* Sweep shimmer */}
              {!submitting && (
                <motion.span
                  className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: '-120%' }}
                  whileHover={{ x: '220%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              )}
              <span className="relative flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('commsForm.submitting')}
                  </>
                ) : (
                  <>
                    {t('commsForm.submit')}
                    <svg className="h-5 w-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
