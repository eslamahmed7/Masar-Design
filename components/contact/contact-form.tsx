'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import type { ServiceData, CouponDisplay } from './service-selection'
import type { PriceBreakdown } from '@/lib/pricing/engine'
import { submitContactOrder } from '@/lib/public/actions'

const EASE = [0.22, 1, 0.36, 1] as const

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  // Step 1
  name: string
  email: string
  phone: string
  contactMethod: 'phone' | 'whatsapp' | 'email' | ''
  // Step 2
  projectType: string
  area: string
  city: string
  country: string
  // Step 3
  budget: string
  style: string
  delivery: string
  // Step 4
  description: string
  files: File[]
  // Pre-filled from service selection
  service: string
  serviceName: string
  // Pricing
  pricePerSqm: string
  pricingArea: string
  subtotal: string
  promotionDiscount: string
  promotionLabel: string
  couponDiscount: string
  couponCode: string
  finalTotal: string
  currency: string
}

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  contactMethod: '',
  projectType: '',
  area: '',
  city: '',
  country: '',
  budget: '',
  style: '',
  delivery: '',
  description: '',
  files: [],
  service: '',
  serviceName: '',
  pricePerSqm: '',
  pricingArea: '',
  subtotal: '',
  promotionDiscount: '',
  promotionLabel: '',
  couponDiscount: '',
  couponCode: '',
  finalTotal: '',
  currency: '',
}

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'المعلومات الأساسية', short: '١' },
  { label: 'تفاصيل المشروع', short: '٢' },
  { label: 'متطلبات التصميم', short: '٣' },
  { label: 'وصف المشروع', short: '٤' },
  { label: 'المراجعة', short: '٥' },
]

// ─── Styled input primitives ──────────────────────────────────────────────────
function LuxInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder = ' ',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="group relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        dir="rtl"
        className="peer w-full rounded-2xl border border-border bg-card/40 px-5 pb-3 pt-6 text-sm text-foreground placeholder-transparent backdrop-blur-md transition-all duration-300 focus:border-gold/60 focus:bg-card/70 focus:outline-none focus:ring-2 focus:ring-gold/15"
      />
      <label className="pointer-events-none absolute right-5 top-2 text-[11px] font-medium text-gold/70 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-gold/80">
        {label}
      </label>
    </div>
  )
}

function OptionChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
        selected
          ? 'border-gold/60 bg-gold/15 text-gold shadow-[0_0_20px_oklch(0.81_0.12_84/0.15)]'
          : 'border-border bg-card/30 text-muted-foreground hover:border-gold/30 hover:bg-gold/5 hover:text-foreground'
      }`}
    >
      {selected && (
        <motion.span
          layoutId="chip-bg"
          className="absolute inset-0 rounded-xl bg-gold/10"
          transition={{ duration: 0.3 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function Step1({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <StepFieldReveal delay={0}>
        <LuxInput
          label="الاسم الكامل"
          value={data.name}
          onChange={(v) => update({ name: v })}
          required
        />
      </StepFieldReveal>
      <StepFieldReveal delay={0.07}>
        <LuxInput
          label="البريد الإلكتروني"
          value={data.email}
          onChange={(v) => update({ email: v })}
          type="email"
          required
        />
      </StepFieldReveal>
      <StepFieldReveal delay={0.14}>
        <LuxInput
          label="رقم الهاتف"
          value={data.phone}
          onChange={(v) => update({ phone: v })}
          type="tel"
          required
        />
      </StepFieldReveal>
      <StepFieldReveal delay={0.21}>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">طريقة التواصل المفضّلة</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: 'phone', label: 'هاتف' },
                { value: 'whatsapp', label: 'واتساب' },
                { value: 'email', label: 'بريد إلكتروني' },
              ] as { value: FormData['contactMethod']; label: string }[]
            ).map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                selected={data.contactMethod === opt.value}
                onClick={() => update({ contactMethod: opt.value })}
              />
            ))}
          </div>
        </div>
      </StepFieldReveal>
    </div>
  )
}

// ─── Step 2: Project Details ──────────────────────────────────────────────────
const PROJECT_TYPES = [
  'شقة',
  'فيلا',
  'مكتب',
  'مطعم',
  'كافيه',
  'تجاري',
  'أخرى',
]

function Step2({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <StepFieldReveal delay={0}>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">نوع المشروع</p>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TYPES.map((t) => (
              <OptionChip
                key={t}
                label={t}
                selected={data.projectType === t}
                onClick={() => update({ projectType: t })}
              />
            ))}
          </div>
        </div>
      </StepFieldReveal>
      <StepFieldReveal delay={0.1}>
        <LuxInput
          label="مساحة المشروع (متر مربع)"
          value={data.area}
          onChange={(v) => update({ area: v })}
          type="number"
        />
      </StepFieldReveal>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StepFieldReveal delay={0.17}>
          <LuxInput
            label="المدينة"
            value={data.city}
            onChange={(v) => update({ city: v })}
          />
        </StepFieldReveal>
        <StepFieldReveal delay={0.22}>
          <LuxInput
            label="الدولة"
            value={data.country}
            onChange={(v) => update({ country: v })}
          />
        </StepFieldReveal>
      </div>
    </div>
  )
}

// ─── Step 3: Design Requirements ─────────────────────────────────────────────
const STYLES = ['عصري', 'مينيمال', 'فخم', 'كلاسيكي', 'معاصر', 'سكندنافي', 'أخرى']

function Step3({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <StepFieldReveal delay={0}>
        <LuxInput
          label="الميزانية (اختياري)"
          value={data.budget}
          onChange={(v) => update({ budget: v })}
        />
      </StepFieldReveal>
      <StepFieldReveal delay={0.09}>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">الأسلوب المفضّل</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <OptionChip
                key={s}
                label={s}
                selected={data.style === s}
                onClick={() => update({ style: s })}
              />
            ))}
          </div>
        </div>
      </StepFieldReveal>
      <StepFieldReveal delay={0.18}>
        <LuxInput
          label="الوقت المتوقع للتسليم"
          value={data.delivery}
          onChange={(v) => update({ delivery: v })}
          placeholder=" "
        />
      </StepFieldReveal>
    </div>
  )
}

// ─── Step 4: Description + Upload ────────────────────────────────────────────
function Step4({ data, update }: { data: FormData; update: (d: Partial<FormData>) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const arr = Array.from(incoming)
    update({ files: [...data.files, ...arr] })
  }

  function removeFile(index: number) {
    update({ files: data.files.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-5">
      <StepFieldReveal delay={0}>
        <div className="relative">
          <textarea
            value={data.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder=" "
            dir="rtl"
            rows={4}
            className="peer w-full resize-none rounded-2xl border border-border bg-card/40 px-5 pb-3 pt-7 text-sm text-foreground placeholder-transparent backdrop-blur-md transition-all duration-300 focus:border-gold/60 focus:bg-card/70 focus:outline-none focus:ring-2 focus:ring-gold/15"
          />
          <label className="pointer-events-none absolute right-5 top-2 text-[11px] font-medium text-gold/70 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-gold/80">
            وصف المشروع
          </label>
        </div>
      </StepFieldReveal>

      {/* Upload zone */}
      <StepFieldReveal delay={0.1}>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">رفع الملفات</p>
          <motion.div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              addFiles(e.dataTransfer.files)
            }}
            animate={dragging ? { borderColor: 'oklch(0.81 0.12 84)', scale: 1.01 } : { scale: 1 }}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-300 ${
              dragging
                ? 'border-gold bg-gold/5'
                : 'border-border bg-card/30 hover:border-gold/40 hover:bg-gold/5'
            }`}
          >
            <motion.div
              animate={dragging ? { y: -6 } : { y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg className="h-10 w-10 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </motion.div>
            <div>
              <p className="text-sm font-medium text-foreground">اسحب وأفلت الملفات هنا</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DWG, PNG, JPG — أو انقر للاستعراض</p>
            </div>
          </motion.div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.dwg,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {/* File previews */}
          {data.files.length > 0 && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex flex-col gap-2"
            >
              {data.files.map((file, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card/30 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
                      <svg className="h-3.5 w-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25" />
                      </svg>
                    </div>
                    <span className="text-xs text-foreground/80">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </StepFieldReveal>
    </div>
  )
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────
const CONTACT_METHOD_LABELS: Record<string, string> = {
  phone: 'هاتف',
  whatsapp: 'واتساب',
  email: 'بريد إلكتروني',
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground/90">{value}</span>
    </div>
  )
}

function Step5({
  data,
  onEdit,
}: {
  data: FormData
  onEdit: (step: number) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {[
        {
          title: 'المعلومات الأساسية',
          step: 0,
          rows: [
            { label: 'الاسم', value: data.name },
            { label: 'البريد الإلكتروني', value: data.email },
            { label: 'الهاتف', value: data.phone },
            {
              label: 'طريقة التواصل',
              value: CONTACT_METHOD_LABELS[data.contactMethod] ?? '',
            },
          ],
        },
        {
          title: 'تفاصيل المشروع',
          step: 1,
          rows: [
            { label: 'الخدمة', value: data.service ? data.serviceName : '' },
            { label: 'نوع المشروع', value: data.projectType },
            { label: 'المساحة', value: data.area ? `${data.area} م²` : '' },
            { label: 'الموقع', value: [data.city, data.country].filter(Boolean).join(', ') },
          ],
        },
        {
          title: 'متطلبات التصميم',
          step: 2,
          rows: [
            { label: 'الميزانية', value: data.budget },
            { label: 'الأسلوب', value: data.style },
            { label: 'وقت التسليم', value: data.delivery },
          ],
        },
        {
          title: 'وصف المشروع',
          step: 3,
          rows: [
            { label: 'الوصف', value: data.description },
            { label: 'الملفات', value: data.files.length ? `${data.files.length} ملف` : '' },
          ],
        },
        ...(data.finalTotal && data.subtotal
          ? [{
              title: 'تفاصيل السعر',
              step: -1,
              rows: [
                { label: 'الخدمة', value: data.serviceName || '-' },
                { label: 'سعر المتر', value: data.pricePerSqm ? `${Number(data.pricePerSqm).toLocaleString('ar-EG')} ج.م` : '-' },
                { label: 'المساحة', value: data.pricingArea ? `${data.pricingArea} م²` : '-' },
                { label: 'المجموع الفرعي', value: `${Number(data.subtotal).toLocaleString('ar-EG')} ج.م` },
                ...(data.promotionDiscount && Number(data.promotionDiscount) > 0
                  ? [{ label: data.promotionLabel || 'خصم', value: `-${Number(data.promotionDiscount).toLocaleString('ar-EG')} ج.م` }]
                  : []),
                ...(data.couponCode && data.couponDiscount && Number(data.couponDiscount) > 0
                  ? [{ label: `خصم الكود (${data.couponCode})`, value: `-${Number(data.couponDiscount).toLocaleString('ar-EG')} ج.م` }]
                  : []),
                { label: 'الإجمالي النهائي', value: `${Number(data.finalTotal).toLocaleString('ar-EG')} ج.م` },
              ],
            }]
          : []),
      ].map((section) => (
        <StepFieldReveal key={section.title} delay={0}>
          <div className="rounded-2xl border border-border bg-card/30 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-heading text-sm font-semibold text-gold">{section.title}</h4>
              <button
                type="button"
                onClick={() => onEdit(section.step)}
                className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-gold hover:underline"
              >
                تعديل
              </button>
            </div>
            {section.rows.map((r) => (
              <ReviewRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
        </StepFieldReveal>
      ))}
    </div>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden rounded-3xl border border-gold/30 bg-deep px-8 py-20 text-center"
    >
      {/* Background particles */}
      {!reduceMotion &&
        SUCCESS_PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-gold/40"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [0, -25, 0], opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 40%, rgba(201,168,106,0.14) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Blueprint sketch animation */}
      <div className="relative mb-10" aria-hidden>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="overflow-visible"
        >
          {/* Animated floor plan lines */}
          <motion.rect
            x="15" y="15" width="90" height="90"
            rx="4"
            fill="none"
            stroke="oklch(0.81 0.12 84 / 0.5)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
          />
          <motion.line
            x1="60" y1="15" x2="60" y2="105"
            stroke="oklch(0.81 0.12 84 / 0.3)"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 1.2 }}
          />
          <motion.line
            x1="15" y1="55" x2="105" y2="55"
            stroke="oklch(0.81 0.12 84 / 0.3)"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 1.5 }}
          />

          {/* Animated check mark circle */}
          <motion.circle
            cx="60" cy="60" r="28"
            fill="none"
            stroke="oklch(0.81 0.12 84)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1.8 }}
          />
          <motion.path
            d="M46 60 L57 71 L74 49"
            fill="none"
            stroke="oklch(0.81 0.12 84)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 2.6 }}
          />

          {/* Construction dots */}
          {[{ cx: 15, cy: 15 }, { cx: 105, cy: 15 }, { cx: 15, cy: 105 }, { cx: 105, cy: 105 }].map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r="3"
              fill="oklch(0.81 0.12 84)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.2, duration: 0.4 }}
            />
          ))}
        </svg>

        {/* Gold glow behind icon */}
        <div
          className="absolute inset-0 -z-10 blur-2xl"
          style={{ background: 'radial-gradient(circle, oklch(0.81 0.12 84 / 0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.8, ease: EASE }}
        className="font-heading text-3xl font-bold text-foreground md:text-4xl"
      >
        شكراً لثقتك في{' '}
        <span className="gold-gradient-text">MASAR</span>
      </motion.h2>

      {/* Subtitle lines fade in */}
      {[
        'لقد استلمنا طلبك بنجاح،',
        'وسيقوم فريقنا بمراجعته والتواصل معك في أقرب وقت',
        'لبدء رحلتنا في تصميم مساحة تعكس رؤيتك.',
      ].map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3 + i * 0.18, ease: EASE }}
          className="mt-1 text-sm leading-loose text-muted-foreground"
        >
          {line}
        </motion.p>
      ))}

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 3.6, ease: EASE }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href="/"
          className="group relative overflow-hidden rounded-full border border-gold bg-gold/10 px-8 py-3.5 text-sm font-medium text-gold backdrop-blur-sm transition-all duration-500 hover:bg-gold hover:text-primary-foreground hover:shadow-[0_0_30px_oklch(0.81_0.12_84/0.4)]"
        >
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -right-1/3 w-1/3 skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100" />
          <span className="relative z-10">العودة للرئيسية</span>
        </a>
        <a
          href="/projects"
          className="group rounded-full border border-border bg-card/40 px-8 py-3.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:text-foreground"
        >
          استعراض أعمالنا
        </a>
      </motion.div>
    </motion.div>
  )
}

const SUCCESS_PARTICLES = [
  { left: '8%', top: '20%', size: 3, dur: 7, delay: 0 },
  { left: '20%', top: '75%', size: 2, dur: 9, delay: 1 },
  { left: '50%', top: '10%', size: 2.5, dur: 8, delay: 0.5 },
  { left: '75%', top: '80%', size: 2, dur: 10, delay: 1.5 },
  { left: '88%', top: '30%', size: 3, dur: 7.5, delay: 0.8 },
  { left: '65%', top: '60%', size: 2, dur: 9.5, delay: 2 },
]

// ─── Field reveal wrapper ─────────────────────────────────────────────────────
function StepFieldReveal({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="mb-8" dir="rtl">
      {/* Step labels */}
      <div className="mb-4 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                backgroundColor:
                  i < current
                    ? 'oklch(0.81 0.12 84)'
                    : i === current
                    ? 'oklch(0.81 0.12 84 / 0.2)'
                    : 'oklch(0.2 0.007 60)',
                borderColor:
                  i <= current
                    ? 'oklch(0.81 0.12 84)'
                    : 'oklch(0.95 0.02 80 / 12%)',
              }}
              transition={{ duration: 0.4 }}
              className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold"
            >
              {i < current ? (
                <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span
                  style={{
                    color: i === current ? 'oklch(0.81 0.12 84)' : 'oklch(0.7 0.015 75)',
                  }}
                >
                  {s.short}
                </span>
              )}
            </motion.div>
            <span
              className="hidden text-[9px] md:block"
              style={{
                color: i === current ? 'oklch(0.81 0.12 84)' : 'oklch(0.7 0.015 75)',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      {/* Bar */}
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-border">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: EASE }}
          className="h-full rounded-full bg-gradient-to-l from-gold to-gold/60"
        />
      </div>
    </div>
  )
}

// ─── Main Form Shell ──────────────────────────────────────────────────────────
export function ContactForm({
  preselectedService,
  area,
  priceBreakdown,
  couponResult,
}: {
  preselectedService: ServiceData | null
  area: string
  priceBreakdown: PriceBreakdown | null
  couponResult: CouponDisplay | null
}) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [data, setData] = useState<FormData>({
    ...INITIAL_DATA,
    service: preselectedService?.id ?? '',
    serviceName: preselectedService?.nameAr ?? '',
    pricingArea: area,
  })
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [submitting, setSubmitting] = useState(false)

  // Sync props to form data
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      service: preselectedService?.id ?? '',
      serviceName: preselectedService?.nameAr ?? '',
    }))
  }, [preselectedService])

  useEffect(() => {
    if (!area && area !== '0') return
    setData((prev) => ({ ...prev, pricingArea: area }))
  }, [area])

  useEffect(() => {
    if (!priceBreakdown || !preselectedService) return
    setData((prev) => ({
      ...prev,
      pricePerSqm: String(preselectedService.pricePerSqm),
      subtotal: String(priceBreakdown.subtotal),
      promotionDiscount: String(priceBreakdown.globalPromotionDiscount),
      promotionLabel: priceBreakdown.globalPromotionLabel || '',
      couponDiscount: String(priceBreakdown.couponDiscount),
      couponCode: couponResult?.code || '',
      finalTotal: String(priceBreakdown.finalTotal),
      currency: 'EGP',
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceBreakdown])

  const update = useCallback((partial: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  function goPrev() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }
  function goEdit(s: number) {
    setDirection(-1)
    setStep(s)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    const result = await submitContactOrder({
      name: data.name,
      email: data.email,
      phone: data.phone,
      contactMethod: data.contactMethod,
      projectType: data.projectType,
      city: data.city,
      country: data.country,
      budget: data.budget,
      style: data.style,
      delivery: data.delivery,
      description: data.description,
      serviceId: data.service || null,
      serviceName: data.serviceName,
      area: data.pricingArea,
      pricePerSqm: data.pricePerSqm,
      subtotal: data.subtotal,
      promotionDiscount: data.promotionDiscount,
      couponCode: data.couponCode,
      couponDiscount: data.couponDiscount,
      finalTotal: data.finalTotal,
    })

    setSubmitting(false)

    if (result.error) {
      alert(result.error)
      return
    }

    setSubmitted(true)
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  }

  return (
    <section
      className="relative overflow-hidden bg-deep px-6 py-28 md:px-12"
      dir="rtl"
      id="contact-form"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 100%, rgba(201,168,106,0.05) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        {!submitted && (
          <div className="mb-12 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-3 font-mono text-xs uppercase tracking-[0.45em] text-gold/70"
            >
              أخبرنا عن مشروعك
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
              className="font-heading text-4xl font-bold text-foreground md:text-5xl"
            >
              نموذج التواصل
            </motion.h2>
          </div>
        )}

        {submitted ? (
          <SuccessScreen />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="rounded-3xl border border-border bg-card/30 p-6 backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:p-10"
          >
            <ProgressBar current={step} total={STEPS.length} />

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {step === 0 && <Step1 data={data} update={update} />}
                  {step === 1 && <Step2 data={data} update={update} />}
                  {step === 2 && <Step3 data={data} update={update} />}
                  {step === 3 && <Step4 data={data} update={update} />}
                  {step === 4 && <Step5 data={data} onEdit={goEdit} />}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm text-muted-foreground transition-all hover:border-gold/30 hover:text-foreground"
                  >
                    <svg className="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    السابق
                  </button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="group relative overflow-hidden rounded-full border border-gold/50 bg-gold/10 px-8 py-3 text-sm font-medium text-gold transition-all duration-500 hover:bg-gold hover:text-primary-foreground hover:shadow-[0_0_28px_oklch(0.81_0.12_84/0.4)]"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 -right-1/3 w-1/3 skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100" />
                    <span className="relative z-10">التالي</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative overflow-hidden rounded-full border border-gold bg-gold/15 px-10 py-3.5 text-sm font-semibold text-gold transition-all duration-500 hover:bg-gold hover:text-primary-foreground hover:shadow-[0_0_40px_oklch(0.81_0.12_84/0.5)] disabled:opacity-50"
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 -right-1/3 w-1/3 skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100" />
                    <span className="relative z-10">{submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}</span>
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  )
}
