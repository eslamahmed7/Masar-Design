'use client'

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from 'motion/react'
import { submitOrder } from '@/lib/orders/submit-order'
import { createClient } from '@/lib/supabase/client'
import { lookupCoupon, getActivePublicPromotion } from '@/lib/orders/coupon-actions'
import { ContractPDFButton } from './contract-pdf-button'
import { useI18n } from '@/lib/i18n'
import { 
  Building, 
  Home, 
  Briefcase, 
  Utensils, 
  Coffee, 
  Store, 
  HeartPulse, 
  Bed, 
  HelpCircle,
  Check,
  X
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const

const STEP_BACKGROUNDS: Record<number, string> = {
  0: '/start/hero-bg.png',
  1: '/start/step-project-type.png',
  2: '/start/step-info.png',
  3: '/start/step-preferences.png',
  4: '/start/step-upload.png',
  5: '/start/step-timeline.png',
  6: '/start/step-preferences.png', // review reuses
}

const PROJECT_TYPES = [
  { id: 'apartment', icon: Building },
  { id: 'villa', icon: Home },
  { id: 'office', icon: Briefcase },
  { id: 'restaurant', icon: Utensils },
  { id: 'cafe', icon: Coffee },
  { id: 'commercial', icon: Store },
  { id: 'clinic', icon: HeartPulse },
  { id: 'hotel', icon: Bed },
  { id: 'other', icon: HelpCircle },
] as const

const COMM_CHANNELS = [
  { id: 'whatsapp' },
  { id: 'phone' },
  { id: 'email' },
] as const

function currencyLabel(t: (key: string) => string, code: string): string {
  const key = code === 'SAR' ? 'sar' : code === 'EGP' ? 'egp' : code === 'USD' ? 'usd' : null
  return key ? t(`startJourney.currency.${key}`) : code
}

function localeOf(lang: string): string {
  return lang === 'en' ? 'en-US' : 'ar-SA'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  projectType: string
  projectName: string
  city: string
  country: string
  area: string
  clientName: string
  mobile: string
  whatsapp: string
  email: string
  styles: string[]
  serviceIds: string[]
  serviceAddons: Record<string, string[]>
  couponCode: string
  communication: string[]
  files: File[]
}

const INITIAL_FORM: FormData = {
  projectType: '',
  projectName: '',
  city: '',
  country: '',
  area: '',
  clientName: '',
  mobile: '',
  whatsapp: '',
  email: '',
  styles: [],
  serviceIds: [],
  serviceAddons: {},
  couponCode: '',
  communication: [],
  files: [],
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StartJourney() {
  const { t, lang } = useI18n()
  const [step, setStep] = useState(0)        // 0 = hero, 1-6 = form steps, 7 = success
  const [prevStep, setPrevStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 22 })
  const sy = useSpring(my, { stiffness: 50, damping: 22 })

  // Dynamic DB States
  const [dbStyles, setDbStyles] = useState<any[]>([])
  const [dbServices, setDbServices] = useState<any[]>([])
  const [activePromo, setActivePromo] = useState<any | null>(null)
  const [couponDetails, setCouponDetails] = useState<any | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // 1. Fetch styles
      const { data: styleData } = await supabase
        .from('design_styles')
        .select('*')
        .eq('status', 'active')
        .order('sort_order')
      if (styleData) setDbStyles(styleData)
      
      // 2. Fetch services with pricing relation
      const { data: serviceData } = await supabase
        .from('services')
        .select('*, pricing:service_pricing(*), options:pricing_options(*)')
        .eq('status', 'active')
        .order('sort_order')
      if (serviceData) setDbServices(serviceData)
      
      // 3. Fetch active promotion
      try {
        const promo = await getActivePublicPromotion()
        setActivePromo(promo)
      } catch (e) {
        console.error('Error fetching promo', e)
      }
    }
    fetchData()

    // Parse URL params for pre-selecting service
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const serviceParam = params.get('service') || params.get('serviceId')
      if (serviceParam) {
        setForm(prev => ({ ...prev, serviceIds: [serviceParam] }))
        setStep(1) // Skip welcome intro and start journey from Step 1
      }
    }
  }, [])

  // Calculator logic
  const selectedServices = dbServices.filter(s => form.serviceIds.includes(s.id))

  let subtotal = 0
  const servicesBreakdown: { id: string, name: string, price: number, currency: string, formatted: string, isFixed: boolean, addonsList?: {name: string, price: number}[] }[] = []

  if (selectedServices.length > 0) {
    selectedServices.forEach(service => {
      const pricing = Array.isArray(service.pricing) ? service.pricing[0] : service.pricing
      if (pricing) {
        let servicePrice = 0
        if (pricing.pricing_type === 'per_sqm') {
          servicePrice = (pricing.price_per_sqm || 0) * (Number(form.area) || 0)
        } else if (pricing.pricing_type === 'fixed') {
          servicePrice = pricing.fixed_price || 0
        }
        
        // Calculate Addons
        let addonsTotal = 0
        const selectedAddonIds = form.serviceAddons[service.id] || []
        const addonsList: {name: string, price: number}[] = []
        if (service.options && Array.isArray(service.options)) {
          service.options.forEach((opt: any) => {
            if (selectedAddonIds.includes(opt.id)) {
              const optPrice = opt.price_type === 'percentage' ? servicePrice * (opt.price / 100) : opt.price
              addonsTotal += optPrice
              addonsList.push({ name: opt.name_ar || opt.name, price: optPrice })
            }
          })
        }

        const finalServicePrice = servicePrice + addonsTotal
        subtotal += finalServicePrice
        
        const c = pricing.currency || 'SAR'
        const cAr = currencyLabel(t, c)
        
        let formattedString = `${servicePrice.toLocaleString(localeOf(lang))} ${cAr}`
        if (addonsList.length > 0) {
           formattedString += ` + ${t('startJourney.addonsWord')} (${addonsTotal.toLocaleString(localeOf(lang))} ${cAr})`
        }

        servicesBreakdown.push({
          id: service.id,
          name: service.name_ar || service.name,
          price: finalServicePrice,
          currency: c,
          formatted: formattedString,
          isFixed: pricing.pricing_type === 'fixed',
          addonsList
        })
      }
    })
  }

  let isPromoApplicable = false
  if (activePromo) {
    if (activePromo.applicable_to === 'all') {
      isPromoApplicable = true
    } else if (activePromo.applicable_to === 'service' && form.serviceIds.length > 0) {
      isPromoApplicable = form.serviceIds.some(id => activePromo.applicable_ids?.includes(id))
    } else if (activePromo.applicable_to === 'category' && selectedServices.length > 0) {
      isPromoApplicable = selectedServices.some(s => activePromo.applicable_ids?.includes(s.category_id))
    }
  }

  let globalDiscount = 0
  let globalDiscountPct = 0

  if (activePromo && isPromoApplicable && subtotal > 0) {
    if (activePromo.discount_type === 'percentage') {
      globalDiscount = subtotal * (activePromo.discount_value / 100)
      globalDiscountPct = activePromo.discount_value
    } else {
      globalDiscount = activePromo.discount_value
      globalDiscountPct = subtotal > 0 ? (activePromo.discount_value / subtotal) * 100 : 0
    }
  }

  let couponDiscount = 0
  if (couponDetails && subtotal > 0) {
    const baseForCoupon = Math.max(0, subtotal - globalDiscount)
    if (couponDetails.discount_type === 'percentage') {
      couponDiscount = baseForCoupon * (couponDetails.discount_value / 100)
    } else {
      couponDiscount = couponDetails.discount_value
    }
  }

  const finalTotal = Math.max(0, subtotal - globalDiscount - couponDiscount)

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) return
    setValidatingCoupon(true)
    setCouponError(null)
    try {
      const res = await lookupCoupon(code)
      if (res.valid && res.coupon) {
        setCouponDetails(res.coupon)
        setCouponError(null)
      } else {
        setCouponError(res.error || t('startJourney.couponInvalid'))
        setCouponDetails(null)
      }
    } catch (e) {
      setCouponError(t('startJourney.couponError'))
      setCouponDetails(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 24)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 14)
  }, [mx, my, reduceMotion])

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1)
    setPrevStep(step)
    setStep(next)
  }, [step])

  const next = useCallback(() => {
    if (step < 7) goTo(step + 1)
  }, [step, goTo])

  const back = useCallback(() => {
    if (step > 0) goTo(step - 1)
  }, [step, goTo])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)

    // Upload files first if any
    const uploadedFiles: { name: string; url: string }[] = []
    if (form.files.length > 0) {
      // Use dynamic import or direct call to Server Action if we imported it
      // wait, we can just import uploadOrderFile at the top of the file.
      // But we need to make sure we don't block the UI without showing progress.
      // For now, let's just await them sequentially to avoid overwhelming the server.
      try {
        const { uploadOrderFile } = await import('@/lib/orders/submit-order')
        for (const file of form.files) {
          const fd = new FormData()
          fd.append('file', file)
          const res = await uploadOrderFile(fd)
          if (res.url) {
            uploadedFiles.push({ name: file.name, url: res.url })
          }
        }
      } catch (e) {
        console.error('Error uploading files', e)
        // We continue even if file upload fails to not block order submission
      }
    }

      const breakdownText = servicesBreakdown.map(s => {
        let txt = `- ${s.name}: ${s.formatted} ${s.isFixed ? t('startJourney.fixedPricing') : t('startJourney.perSqmPricing')}`
        if (s.addonsList && s.addonsList.length > 0) {
          txt += `\n  ${t('startJourney.addonsWord')}: ${s.addonsList.map(a => `${a.name}`).join('، ')}`
        }
        return txt
      }).join('\n')

    const result = await submitOrder({
      projectType: form.projectType,
      projectName: form.projectName,
      city: form.city,
      country: form.country,
      area: form.area,
      clientName: form.clientName,
      mobile: form.mobile,
      whatsapp: form.whatsapp,
      email: form.email,
      styles: form.styles,
      communication: form.communication,
      serviceId: form.serviceIds.length > 0 ? form.serviceIds[0] : null,
      subtotal: subtotal,
      finalTotal: finalTotal,
      couponCode: couponDetails?.code || null,
      couponDiscountValue: couponDiscount,
      globalDiscountValue: globalDiscount,
      globalDiscountPct: Math.round(globalDiscountPct),
      pricePerSqm: servicesBreakdown[0]?.price || null, // Keeping a value here for backward compatibility
      currency: servicesBreakdown[0]?.currency || 'SAR',
      uploadedFiles,
      servicesBreakdown: breakdownText,
    })

    if ('error' in result) {
      setSubmitError(result.error ?? t('startJourney.unexpectedError'))
      setIsSubmitting(false)
      return
    }

    setSubmitted(true)
    setIsSubmitting(false)
    goTo(7)
  }, [goTo, form, isSubmitting, subtotal, finalTotal, couponDetails, couponDiscount, globalDiscount, globalDiscountPct, servicesBreakdown, t])

  const updateForm = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const bgSrc = submitted ? '/start/hero-bg.png' : (STEP_BACKGROUNDS[step] ?? '/start/hero-bg.png')

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-40 overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* ── Cinematic Background ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={bgSrc}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.04 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: sx, y: sy }}
          >
            <Image
              src={bgSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              quality={90}
            />
          </motion.div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
          {/* Blueprint grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
            <defs>
              <pattern id="sg" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0 H0 V60" fill="none" stroke="rgba(201,168,106,0.8)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sg)" />
          </svg>
          {/* Radial glow */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(80% 70% at 50% 30%, rgba(201,168,106,0.07) 0%, transparent 65%)' }}
            aria-hidden
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Golden Progress Line ── */}
      {step > 0 && !submitted && <ProgressLine step={step} totalSteps={6} />}

      {/* ── Step Content ── */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <StepWrapper key="hero" direction={direction}>
              <HeroStep onStart={() => goTo(1)} />
            </StepWrapper>
          )}
          {step === 1 && (
            <StepWrapper key="step1" direction={direction}>
              <ProjectTypeStep
                selected={form.projectType}
                onSelect={v => updateForm('projectType', v)}
                onNext={next}
                onBack={back}
              />
            </StepWrapper>
          )}
          {step === 2 && (
            <StepWrapper key="step2" direction={direction}>
              <ProjectInfoStep
                form={form}
                onChange={updateForm}
                onNext={next}
                onBack={back}
              />
            </StepWrapper>
          )}
          {step === 3 && (
            <StepWrapper key="step3" direction={direction}>
              <DesignPrefsStep
                dbStyles={dbStyles}
                selected={form.styles}
                onToggle={id => {
                  updateForm('styles', form.styles.includes(id) ? [] : [id])
                }}
                onNext={next}
                onBack={back}
              />
            </StepWrapper>
          )}
          {step === 4 && (
            <StepWrapper key="step4" direction={direction}>
              <UploadStep
                files={form.files}
                onFiles={files => updateForm('files', files)}
                onNext={next}
                onBack={back}
              />
            </StepWrapper>
          )}
          {step === 5 && (
            <StepWrapper key="step5" direction={direction}>
              <ServiceStep
                dbServices={dbServices}
                form={form}
                onChange={updateForm}
                onNext={next}
                onBack={back}
                activePromo={activePromo}
                couponDetails={couponDetails}
                couponError={couponError}
                validatingCoupon={validatingCoupon}
                handleApplyCoupon={handleApplyCoupon}
                subtotal={subtotal}
                globalDiscount={globalDiscount}
                couponDiscount={couponDiscount}
                finalTotal={finalTotal}
                servicesBreakdown={servicesBreakdown}
              />
            </StepWrapper>
          )}
          {step === 6 && (
            <StepWrapper key="step6" direction={direction}>
              <ReviewStep
                form={form}
                dbServices={dbServices}
                finalTotal={finalTotal}
                onEdit={goTo}
                onSubmit={handleSubmit}
                onBack={back}
              />
            </StepWrapper>
          )}
          {step === 7 && submitted && (
            <StepWrapper key="success" direction={direction}>
              <SuccessStep />
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating particles ── */}
      <Particles />
    </div>
  )
}

// ─── Progress Line ─────────────────────────────────────────────────────────────

function ProgressLine({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = Math.min((step - 1) / (totalSteps - 1), 1)

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 sm:px-8 pt-12 sm:pt-24 pb-2 sm:pb-4 gap-2 sm:gap-3">
      {/* Labels */}
      <div className="flex-1 relative h-[2px]">
        {/* Track */}
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        {/* Filled */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgba(201,168,106,0.5) 0%, rgba(201,168,106,1) 100%)',
            boxShadow: '0 0 8px rgba(201,168,106,0.6)',
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        {/* Traveling point */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold"
          style={{ boxShadow: '0 0 12px rgba(201,168,106,0.9)' }}
          animate={{ left: `calc(${progress * 100}% - 5px)` }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </div>
      {/* MASAR logo end-point */}
      <motion.span
        className="font-heading text-sm font-bold tracking-widest"
        animate={{
          color: progress >= 1 ? '#C9A86A' : 'rgba(201,168,106,0.3)',
          textShadow: progress >= 1 ? '0 0 20px rgba(201,168,106,0.8)' : 'none',
        }}
        transition={{ duration: 0.6 }}
      >
        MASAR
      </motion.span>
    </div>
  )
}

// ─── Step Wrapper (cinematic transition) ───────────────────────────────────────

function StepWrapper({ children, direction }: { children: ReactNode; direction: number }) {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center"
      custom={direction}
      initial={{ opacity: 0, y: direction * 60, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: direction * -40, scale: 0.98 }}
      transition={{ duration: 0.75, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// ─── Hero Step ────────────────────────────────────────────────────────────────

function HeroStep({ onStart }: { onStart: () => void }) {
  const { t, tArr } = useI18n()
  return (
    <div className="flex flex-col items-center text-center px-6 max-w-4xl">
      <motion.p
        className="mb-6 font-mono text-xs uppercase tracking-[0.5em] text-gold/70"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
      >
        MASAR — Journey
      </motion.p>

      <h1 className="font-heading leading-none" aria-label={t('startJourney.heroAria')}>
        {tArr('startJourney.heroTitle').map((word, i) => (
          <div key={word} className="overflow-hidden">
            <motion.span
              className="block font-heading text-[min(12vw,70px)] sm:text-[min(15vw,110px)] font-bold gold-gradient-text"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.9, ease: EASE }}
            >
              {word}
            </motion.span>
          </div>
        ))}
      </h1>

      <motion.p
        className="mt-4 sm:mt-8 max-w-xl text-xs sm:text-base leading-relaxed sm:leading-loose text-foreground/70"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.8, ease: EASE }}
      >
        {t('startJourney.heroDesc1')}
        <br />
        {t('startJourney.heroDesc2')}
      </motion.p>

      <motion.div
        className="mt-6 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 scale-90 sm:scale-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
      >
        <GoldButton onClick={onStart}>{t('startJourney.startNow')}</GoldButton>
        <GhostButton as={Link} href="/projects">{t('startJourney.exploreWork')}</GhostButton>
      </motion.div>

      {/* Scroll / continue cue */}
      <motion.div
        className="mt-16 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden
      >
        <motion.div
          className="h-10 w-px"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--gold))' }}
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}

// ─── Step 1: Project Type ─────────────────────────────────────────────────────

function ProjectTypeStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useI18n()
  return (
    <StepShell
      step={1}
      title={t('startJourney.step1Title')}
      subtitle={t('startJourney.step1Subtitle')}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!selected}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 max-h-[50vh] overflow-y-auto pr-1">
        {PROJECT_TYPES.map((pt, i) => (
          <motion.button
            key={pt.id}
            onClick={() => onSelect(pt.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.5, ease: EASE }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex flex-col items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-center transition-all duration-300"
            style={{
              borderColor: selected === pt.id ? 'var(--gold)' : 'rgba(201,168,106,0.15)',
              background: selected === pt.id
                ? 'rgba(201,168,106,0.1)'
                : 'color-mix(in srgb, var(--surface) 45%, transparent)',
              boxShadow: selected === pt.id ? '0 0 24px rgba(201,168,106,0.2)' : 'none',
            }}
            aria-pressed={selected === pt.id}
          >
            {selected === pt.id && (
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl border border-gold/60"
                layoutId="selected-card"
                transition={{ duration: 0.35, ease: EASE }}
              />
            )}
            <span className="text-lg sm:text-2xl" style={{ filter: 'invert(0)' }} aria-hidden>
              <pt.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold/60 transition-colors group-hover:text-gold" />
            </span>
            <span className="font-heading text-xs sm:text-sm font-semibold text-foreground">{t(`startJourney.projectTypes.${pt.id}.label`)}</span>
            <span className="text-[10px] sm:text-xs text-foreground/50 leading-relaxed hidden sm:block">{t(`startJourney.projectTypes.${pt.id}.desc`)}</span>
          </motion.button>
        ))}
      </div>
    </StepShell>
  )
}

// ─── Step 2: Project Info ─────────────────────────────────────────────────────

function ProjectInfoStep({
  form,
  onChange,
  onNext,
  onBack,
}: {
  form: FormData
  onChange: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useI18n()
  const valid = form.projectName.trim() && form.country.trim() && form.clientName.trim() && form.mobile.trim()

  return (
    <StepShell
      step={2}
      title={t('startJourney.step2Title')}
      subtitle={t('startJourney.step2Subtitle')}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!valid}
    >
      <div className="space-y-4">
        {/* Project Info */}
        <div>
          <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-foreground/50">{t('startJourney.projectDataLabel')}</p>
          <div className="grid grid-cols-2 gap-3">
            <LuxInput
              label={t('startJourney.projectNameLabel')}
              value={form.projectName}
              onChange={v => onChange('projectName', v)}
              placeholder={t('startJourney.projectNamePlaceholder')}
              required
            />
            <LuxInput
              label={t('startJourney.countryLabel')}
              value={form.country}
              onChange={v => onChange('country', v)}
              placeholder={t('startJourney.countryPlaceholder')}
              required
            />
            <LuxInput
              label={t('startJourney.fullAddressLabel')}
              value={form.city}
              onChange={v => onChange('city', v)}
              placeholder={t('startJourney.fullAddressPlaceholder')}
            />
            <LuxInput
              label={t('startJourney.areaLabel')}
              value={form.area}
              onChange={v => onChange('area', v.replace(/\D/g, ''))}
              placeholder={t('startJourney.areaPlaceholder')}
              inputMode="numeric"
              type="text"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-foreground/50">{t('startJourney.contactDataLabel')}</p>
          <div className="grid grid-cols-2 gap-3">
            <LuxInput
              label={t('startJourney.clientNameLabel')}
              value={form.clientName}
              onChange={v => onChange('clientName', v)}
              placeholder={t('startJourney.clientNamePlaceholder')}
              required
            />
            <LuxInput
              label={t('startJourney.emailLabel')}
              value={form.email}
              onChange={v => onChange('email', v)}
              placeholder="example@email.com"
              type="email"
            />
            <LuxInput
              label={t('startJourney.mobileLabel')}
              value={form.mobile}
              onChange={v => onChange('mobile', v.replace(/\D/g, ''))}
              placeholder={t('startJourney.phonePlaceholder')}
              type="tel"
              required
            />
            <LuxInput
              label={t('startJourney.whatsappLabel')}
              value={form.whatsapp}
              onChange={v => onChange('whatsapp', v.replace(/\D/g, ''))}
              placeholder={t('startJourney.phonePlaceholder')}
              type="tel"
            />
          </div>
        </div>
      </div>
    </StepShell>
  )
}

// ─── Step 3: Design Preferences ───────────────────────────────────────────────

function DesignPrefsStep({
  dbStyles,
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  dbStyles: any[]
  selected: string[]
  onToggle: (id: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useI18n()
  return (
    <StepShell
      step={3}
      title={t('startJourney.step3Title')}
      subtitle={t('startJourney.step3Subtitle')}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={selected.length === 0}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
        {dbStyles.map((style, i) => {
          const isSelected = selected.includes(style.name)
          return (
            <motion.button
              key={style.id}
              onClick={() => onToggle(style.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.5, ease: EASE }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-col justify-end rounded-xl border overflow-hidden text-right transition-all duration-300 h-32 sm:h-40"
              style={{
                borderColor: isSelected ? 'var(--gold)' : 'rgba(201,168,106,0.15)',
                boxShadow: isSelected ? '0 0 24px rgba(201,168,106,0.18)' : 'none',
              }}
            >
              {/* Card Image Background */}
              <div className="absolute inset-0 bg-divider">
                {style.preview_image_url ? (
                  <img
                    src={style.preview_image_url}
                    alt={style.name_ar || style.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#C8A96A]/20 to-transparent flex items-center justify-center">
                    <span className="text-3xl opacity-50">{style.icon || '🎨'}</span>
                  </div>
                )}
              </div>

              {/* Dark Gradient Overlay */}
              {/* Default gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 opacity-100 group-hover:opacity-0" />
              {/* Hover gradient (darker to read full text) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

              {/* Selection Checkmark */}
              <div className={`absolute top-2 left-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border transition-all ${isSelected ? 'bg-gold border-gold text-[#0B0B0B] scale-100 shadow-[0_0_10px_rgba(201,168,106,0.5)]' : 'bg-black/40 border-white/20 text-transparent scale-90'}`}>
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Card Details Overlay */}
              <div className="relative p-3 w-full z-10 transition-all duration-500">
                <h3 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-gold transition-colors">
                  {style.name_ar || style.name}
                </h3>
                {style.description && (
                  <p className="text-[9px] sm:text-[10px] text-white/70 group-hover:text-white/95 mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-colors duration-300 leading-relaxed">
                    {style.description}
                  </p>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </StepShell>
  )
}

// ─── Step 4: Upload ────────────────────────────────────────────────────────────

function UploadStep({
  files,
  onFiles,
  onNext,
  onBack,
}: {
  files: File[]
  onFiles: (files: File[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    onFiles([...files, ...dropped])
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    onFiles([...files, ...picked])
  }

  function removeFile(i: number) {
    onFiles(files.filter((_, idx) => idx !== i))
  }

  return (
    <StepShell
      step={4}
      title={t('startJourney.step4Title')}
      subtitle={t('startJourney.step4Subtitle')}
      onNext={onNext}
      onBack={onBack}
    >
      {/* Drop zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: dragging ? 'rgba(201,168,106,0.7)' : 'rgba(201,168,106,0.2)',
          background: dragging ? 'rgba(201,168,106,0.07)' : 'color-mix(in srgb, var(--surface) 40%, transparent)',
        }}
        className="relative flex flex-col items-center justify-center gap-2 sm:gap-4 rounded-2xl border-2 border-dashed py-6 sm:py-10 px-4 sm:px-6 cursor-pointer transition-colors"
        whileHover={{ borderColor: 'rgba(201,168,106,0.5)' }}
      >
        <motion.svg
          viewBox="0 0 48 48"
          className="h-8 w-8 sm:h-12 sm:w-12 text-gold/50"
          animate={{ y: dragging ? -8 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <path d="M24 4L24 32M24 4L14 16M24 4L34 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 36v4a2 2 0 002 2h28a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </motion.svg>
        <div className="text-center">
          <p className="text-xs sm:text-base font-medium text-foreground/80">
            {dragging ? t('startJourney.dropTitleDragging') : t('startJourney.dropTitle')}
          </p>
          <p className="mt-1 text-[9px] sm:text-xs text-foreground/40">{t('startJourney.uploadHint')}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".png,.jpg,.jpeg,.pdf,.dwg"
          onChange={handleInput}
        />
      </motion.div>

      {/* Preview */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
          {files.map((file, i) => (
            <motion.div
              key={`${file.name}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-xs text-foreground/70"
            >
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={e => { e.stopPropagation(); removeFile(i) }}
                className="text-foreground/40 hover:text-gold transition-colors"
                aria-label={t('startJourney.removeFile').replace('{name}', file.name)}
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </StepShell>
  )
}

// ─── Step 5: Services & Pricing ───────────────────────────────────────────────

function ServiceStep({
  dbServices,
  form,
  onChange,
  onNext,
  onBack,
  activePromo,
  couponDetails,
  couponError,
  validatingCoupon,
  handleApplyCoupon,
  subtotal,
  globalDiscount,
  couponDiscount,
  finalTotal,
  servicesBreakdown,
}: {
  dbServices: any[]
  form: FormData
  onChange: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  onNext: () => void
  onBack: () => void
  activePromo: any | null
  couponDetails: any | null
  couponError: string | null
  validatingCoupon: boolean
  handleApplyCoupon: (code: string) => void
  subtotal: number
  globalDiscount: number
  couponDiscount: number
  finalTotal: number
  servicesBreakdown: { id: string, name: string, price: number, currency: string, formatted: string, isFixed: boolean }[]
}) {
  const { t, lang } = useI18n()
  const [modalService, setModalService] = useState<any | null>(null)
  const [tempAddons, setTempAddons] = useState<string[]>([])

  const openModal = (service: any) => {
    setModalService(service)
    setTempAddons(form.serviceAddons[service.id] || [])
  }

  const confirmModal = () => {
    if (!modalService) return
    const isSelected = form.serviceIds.includes(modalService.id)
    if (!isSelected) {
      onChange('serviceIds', [...form.serviceIds, modalService.id])
    }
    onChange('serviceAddons', { ...form.serviceAddons, [modalService.id]: tempAddons })
    setModalService(null)
  }

  const removeService = (serviceId: string) => {
    onChange('serviceIds', form.serviceIds.filter(id => id !== serviceId))
    const newAddons = { ...form.serviceAddons }
    delete newAddons[serviceId]
    onChange('serviceAddons', newAddons)
    setModalService(null)
  }

  return (
    <>
    <StepShell
      step={5}
      title={t('startJourney.step5Title')}
      subtitle={t('startJourney.step5Subtitle')}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={form.serviceIds.length === 0}
    >
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {/* Services Select List */}
        <div>
          <label className="block text-[10px] font-semibold text-ink-soft mb-3 uppercase tracking-wider">{t('startJourney.serviceLabel')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dbServices.map(service => {
              const pricing = Array.isArray(service.pricing) ? service.pricing[0] : service.pricing
              const isSelected = form.serviceIds.includes(service.id)
              
              let priceLabel = t('startJourney.customPrice')
              const serviceCurrency = pricing?.currency || 'SAR'
              const sCurrencyAr = currencyLabel(t, serviceCurrency)
              
              if (pricing?.pricing_type === 'per_sqm') {
                priceLabel = `${pricing.price_per_sqm} ${sCurrencyAr} ${t('startJourney.perSqmUnit')}`
              } else if (pricing?.pricing_type === 'fixed') {
                priceLabel = `${pricing.fixed_price} ${sCurrencyAr}`
              }

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => openModal(service)}
                  className="relative flex flex-col items-center justify-center rounded-xl border text-center transition-all duration-300 bg-deep hover:border-gold/30 aspect-square overflow-hidden group"
                  style={{
                    borderColor: isSelected ? 'var(--gold)' : 'rgba(201,168,106,0.12)',
                    boxShadow: isSelected ? '0 0 16px rgba(201,168,106,0.12)' : 'none',
                  }}
                >
                  {service.cover_image_url && (
                    <>
                      <img src={service.cover_image_url} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] via-[#0E0D0B]/40 to-transparent" />
                    </>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center z-20 shadow-md">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                  
                  <div className="relative z-10 w-full h-full flex flex-col justify-end items-start text-right p-3 pt-6">
                    {!service.cover_image_url && (
                      <span className="text-3xl mb-auto self-center mt-2 opacity-80">{service.icon || '🛠️'}</span>
                    )}
                    <h4 className="text-[11px] sm:text-xs font-bold text-ink-cream line-clamp-1 w-full text-right">{service.name_ar || service.name}</h4>
                    {service.short_description && (
                       <p className="text-[9px] sm:text-[10px] text-foreground/70 line-clamp-1 mt-0.5 w-full text-right">{service.short_description}</p>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-gold mt-2 font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-gold/10 truncate max-w-full block">
                      {priceLabel}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pricing Calculator Card */}
        {form.serviceIds.length > 0 && (() => {
          const c = servicesBreakdown[0]?.currency || 'SAR'
          const sCurrencyAr = currencyLabel(t, c)
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-gold/15 bg-gold/5 space-y-3"
            >
              <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider">{t('startJourney.calculatorTitle')}</h4>
              
              <div className="space-y-2 text-xs divide-y divide-white/5">
                <div className="flex justify-between py-1">
                  <span className="text-foreground/60">{t('startJourney.areaRowLabel')}</span>
                  <span className="font-semibold text-ink-cream">{form.area || '0'} {t('startJourney.areaUnit')}</span>
                </div>
                
                {servicesBreakdown.map(sb => (
                  <div key={sb.id} className="flex justify-between py-1 mt-1 pt-1 text-foreground/80">
                    <span>{sb.name} {sb.isFixed ? t('startJourney.fixedPricingTag') : ''}</span>
                    <span className="font-semibold">{sb.formatted}</span>
                  </div>
                ))}

                <div className="flex justify-between py-2 border-t border-white/10 mt-2 font-bold">
                  <span className="text-gold">{t('startJourney.subtotalLabel')}</span>
                  <span className="text-gold">{subtotal.toLocaleString(localeOf(lang))} {sCurrencyAr}</span>
                </div>

                {globalDiscount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400">
                    <span>{t('startJourney.promoDiscountLabel').replace('{title}', activePromo?.title_ar || activePromo?.title)}</span>
                    <span>-{globalDiscount.toLocaleString()} {sCurrencyAr}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400">
                    <span>{t('startJourney.couponDiscountLabel').replace('{code}', couponDetails?.code)}</span>
                    <span>-{couponDiscount.toLocaleString()} {sCurrencyAr}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 text-sm font-bold border-t border-gold/25 pt-1.5">
                  <span className="text-gold">{t('startJourney.estimatedTotalLabel')}</span>
                  <span className="text-gold">{finalTotal.toLocaleString()} {sCurrencyAr}</span>
                </div>
              </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('startJourney.couponPlaceholder')}
                  value={form.couponCode}
                  onChange={e => onChange('couponCode', e.target.value)}
                  className="flex-1 bg-deep border border-divider rounded-lg px-3 py-1.5 text-ink-cream placeholder:text-foreground/20 text-xs focus:outline-none focus:border-gold/50"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon(form.couponCode)}
                  disabled={validatingCoupon}
                  className="px-4 py-1.5 bg-gold/10 border border-gold/40 text-gold rounded-lg text-xs font-semibold hover:bg-gold hover:text-[#0B0B0B] transition-all disabled:opacity-50"
                >
                  {validatingCoupon ? t('startJourney.validating') : t('startJourney.apply')}
                </button>
              </div>
              {couponError && <p className="text-[9px] text-red-400 mt-1">{couponError}</p>}
              {couponDetails && <p className="text-[9px] text-emerald-400 mt-1">{t('startJourney.couponSuccess')}</p>}
            </div>
          </motion.div>
          )
        })()}
      </div>
    </StepShell>

    {/* Service Modal */}
    <AnimatePresence>
      {modalService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalService(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-deep border border-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {modalService.cover_image_url && (
              <div className="h-32 sm:h-40 w-full relative shrink-0">
                <img src={modalService.cover_image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0B] to-transparent" />
              </div>
            )}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-ink-cream">{modalService.name_ar || modalService.name}</h3>
                  <p className="text-sm text-ink-faint">{modalService.name}</p>
                </div>
                <button type="button" onClick={() => setModalService(null)} className="p-1.5 bg-surface-2/60 rounded-full hover:bg-surface-3 text-ink-soft">
                  <X size={16} />
                </button>
              </div>
              
              {modalService.description && (
                <p className="text-sm text-foreground/80 mt-4 leading-relaxed whitespace-pre-wrap">{modalService.description}</p>
              )}
              
              {/* Pricing rules info */}
              <div className="mt-4 bg-surface-3 border border-divider rounded-xl p-3 text-xs text-foreground/70 space-y-1.5">
                <div className="text-gold font-bold mb-2">{t('startJourney.pricingDetails')}</div>
                {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing)?.pricing_type === 'per_sqm' && (
                  <>
                    <div>{t('startJourney.perMeterPrice')} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).price_per_sqm} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).currency}</div>
                    {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).min_area > 0 && <div>{t('startJourney.minArea')} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).min_area} {t('startJourney.areaUnit')}</div>}
                    {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).min_order_value > 0 && <div>{t('startJourney.minOrder')} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).min_order_value} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).currency}</div>}
                  </>
                )}
                {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing)?.pricing_type === 'fixed' && (
                  <div>{t('startJourney.fixedPriceLabel')} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).fixed_price} {(Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing).currency}</div>
                )}
              </div>

              {/* Addons List */}
              {modalService.options && modalService.options.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h4 className="text-sm font-semibold text-ink-cream mb-3">{t('startJourney.addonsTitle')}</h4>
                  {modalService.options.map((opt: any) => {
                    const isOptSelected = tempAddons.includes(opt.id);
                    return (
                      <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isOptSelected ? 'border-gold bg-gold/5' : 'border-white/10 bg-surface/50 hover:bg-white/5'}`}>
                        <input type="checkbox" checked={isOptSelected} onChange={() => {
                          if (isOptSelected) setTempAddons(prev => prev.filter(id => id !== opt.id))
                          else setTempAddons(prev => [...prev, opt.id])
                        }} className="w-4 h-4 accent-gold" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-ink-cream">{opt.name_ar || opt.name}</div>
                          <div className="text-xs text-ink-faint mt-0.5">{opt.price} {opt.price_type === 'percentage' ? '%' : (Array.isArray(modalService.pricing) ? modalService.pricing[0] : modalService.pricing)?.currency}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-surface-3 flex items-center gap-3 shrink-0">
              <button type="button" onClick={confirmModal} className="flex-1 bg-gold hover:bg-[#d4b87a] text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                {form.serviceIds.includes(modalService.id) ? t('startJourney.updateAddons') : t('startJourney.addService')}
              </button>
              {form.serviceIds.includes(modalService.id) && (
                <button type="button" onClick={() => removeService(modalService.id)} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-sm transition-colors border border-red-500/20">
                  {t('startJourney.removeFromOrder')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  )
}

// ─── Step 6: Review ────────────────────────────────────────────────────────────

function ReviewStep({
  form,
  onEdit,
  onSubmit,
  onBack,
  dbServices,
  finalTotal,
}: {
  form: FormData
  onEdit: (step: number) => void
  onSubmit: () => void
  onBack: () => void
  dbServices: any[]
  finalTotal: number
}) {
  const { t, lang } = useI18n()
  const projectType = PROJECT_TYPES.find(p => p.id === form.projectType)
  const selectedServices = dbServices.filter(s => form.serviceIds.includes(s.id))
  const selectedPricing = selectedServices.length > 0 && Array.isArray(selectedServices[0].pricing) ? selectedServices[0].pricing[0] : selectedServices[0]?.pricing
  const currency = selectedPricing?.currency || 'SAR'
  const [hasDownloaded, setHasDownloaded] = useState(false)

  return (
    <StepShell
      step={6}
      title={t('startJourney.step6Title')}
      subtitle={t('startJourney.step6Subtitle')}
      onNext={onSubmit}
      onBack={onBack}
      nextLabel={t('startJourney.submitOrder')}
      nextDisabled={false}
    >
      <div className="flex flex-col gap-4">
        {/* PDF Button moved to the top */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-2">
          <p className="text-sm text-foreground/70 mb-3 text-center">
            {t('startJourney.pdfHint')}
          </p>
          <ContractPDFButton 
            formData={form} 
            selectedService={selectedServices[0]} 
            finalTotal={finalTotal} 
            currency={currency}
            onDownload={() => setHasDownloaded(true)} 
          />
        </div>

        {/* Removed max-h-[50vh] overflow-y-auto to fix double scroll */}
        <div className="space-y-3">
          <ReviewRow label={t('startJourney.reviewProjectType')} value={projectType ? t(`startJourney.projectTypes.${projectType.id}.label`) : '—'} onEdit={() => onEdit(1)} />
          <ReviewRow label={t('startJourney.reviewProjectName')} value={form.projectName || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewCountry')} value={form.country || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewAddress')} value={form.city || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewArea')} value={form.area ? `${form.area} ${t('startJourney.areaUnit')}` : '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewClient')} value={form.clientName || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewMobile')} value={form.mobile || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewWhatsapp')} value={form.whatsapp || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow label={t('startJourney.reviewEmail')} value={form.email || '—'} onEdit={() => onEdit(2)} />
          <ReviewRow
            label={t('startJourney.reviewStyle')}
            value={form.styles.length ? form.styles.join(' — ') : '—'}
            onEdit={() => onEdit(3)}
          />
          <ReviewRow label={t('startJourney.reviewFiles')} value={form.files.length ? `${t('startJourney.filesCount').replace('{n}', String(form.files.length))}` : t('startJourney.none')} onEdit={() => onEdit(4)} />
          <ReviewRow
            label={t('startJourney.reviewService')}
            value={selectedServices.map(s => s.name_ar || s.name).join(' + ') || '—'}
            onEdit={() => onEdit(5)}
          />
          <ReviewRow
            label={t('startJourney.reviewCost')}
            value={`${finalTotal.toLocaleString(localeOf(lang))} ${currency}`}
            onEdit={() => onEdit(5)}
          />
          <ReviewRow
            label={t('startJourney.reviewCommunication')}
            value={form.communication.length
              ? form.communication.map(id => {
                  const ch = COMM_CHANNELS.find(c => c.id === id)
                  return ch ? t(`startJourney.comm.${ch.id}`) : id
                }).join(' — ')
              : t('startJourney.none')}
            onEdit={() => onEdit(5)}
          />
        </div>
      </div>
    </StepShell>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  const { t } = useI18n()
  return (
    <div className="flex items-start justify-between gap-2 sm:gap-4 rounded-xl border border-white/5 bg-surface/55 px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] sm:text-xs text-foreground/40">{label}</span>
        <span className="text-xs sm:text-sm font-medium text-foreground/90">{value}</span>
      </div>
      <button
        onClick={onEdit}
        className="mt-0.5 shrink-0 text-[10px] sm:text-xs text-gold/60 hover:text-gold transition-colors underline underline-offset-2"
      >
        {t('startJourney.edit')}
      </button>
    </div>
  )
}

// ─── Step 7: Success ───────────────────────────────────────────────────────────

function SuccessStep() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center text-center px-6 max-w-2xl">
      {/* Animated MASAR logo reveal */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer glow ring */}
        <motion.div
          className="absolute h-40 w-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,106,0.25) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        {/* Blueprint SVG that draws */}
        <svg viewBox="0 0 120 120" className="h-28 w-28 relative z-10" aria-hidden>
          <motion.circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="rgba(201,168,106,0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          <motion.path
            d="M30 60 Q45 30 60 40 Q75 50 60 80 Q45 90 30 60Z"
            fill="none"
            stroke="rgba(201,168,106,0.5)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
          />
          {/* Checkmark */}
          <motion.path
            d="M40 62 L55 76 L82 46"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 2.5, ease: EASE }}
          />
        </svg>
        {/* Soft particles */}
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold"
            style={{ width: 4, height: 4 }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * 60,
              y: Math.sin((i / 8) * Math.PI * 2) * 60,
              opacity: [0, 1, 0],
            }}
            transition={{ delay: 2.8 + i * 0.05, duration: 1.2, ease: 'easeOut' }}
            aria-hidden
          />
        ))}
      </div>

      {/* MASAR brand */}
      <motion.p
        className="mb-3 font-mono text-xs uppercase tracking-[0.5em] text-gold/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.7 }}
      >
        MASAR Studio
      </motion.p>

      <motion.h2
        className="font-heading text-4xl font-bold gold-gradient-text text-balance sm:text-5xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.9, ease: EASE }}
      >
        {t('startJourney.successTitle')}
      </motion.h2>

      <motion.p
        className="mt-6 max-w-lg text-base leading-relaxed text-foreground/65"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.8, ease: EASE }}
      >
        {t('startJourney.successDesc')}
      </motion.p>

      <motion.div
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 0.7, ease: EASE }}
      >
        <GoldButton as={Link} href="/">{t('startJourney.backHome')}</GoldButton>
        <GhostButton as={Link} href="/projects">{t('startJourney.viewWork')}</GhostButton>
      </motion.div>
    </div>
  )
}

// ─── Shared Shell ──────────────────────────────────────────────────────────────

function StepShell({
  step,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextDisabled = false,
  nextLabel,
}: {
  step: number
  title: string
  subtitle: string
  children: ReactNode
  onNext: () => void
  onBack: () => void
  nextDisabled?: boolean
  nextLabel?: string
}) {
  const { t, tArr, lang } = useI18n()
  const stepLabels = tArr('startJourney.stepLabels')
  const backArrowClass = lang === 'ar' ? 'rotate-180' : ''
  const nextArrowClass = lang === 'ar' ? '' : 'rotate-180'
  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 py-6 sm:px-8">
      {/* Header */}
      <div className="flex-shrink-0 pt-28 sm:pt-20 pb-4 sm:pb-6 text-center">
        <motion.p
          className="mb-1 sm:mb-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gold/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t('startJourney.stepOf').replace('{n}', String(step)).replace('{m}', String(stepLabels.length - 1))}
        </motion.p>
        <motion.h2
          className="font-heading text-xl sm:text-4xl font-bold text-foreground"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-1 sm:mt-2 text-xs sm:text-sm text-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 mx-auto w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
        >
          {children}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex items-center justify-between pt-5 pb-4 mx-auto w-full max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-foreground/50 transition-all hover:border-gold/30 hover:text-gold"
        >
          <svg viewBox="0 0 16 16" className={`h-4 w-4 ${backArrowClass}`} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('startJourney.back')}
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5" aria-hidden>
          {stepLabels.slice(1).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i + 1 === step ? 20 : 6,
                height: 6,
                background: i + 1 <= step ? 'var(--gold)' : 'rgba(201,168,106,0.2)',
              }}
            />
          ))}
        </div>

        <GoldButton onClick={onNext} disabled={nextDisabled}>
          {nextLabel ?? t('startJourney.next')}
          <svg viewBox="0 0 16 16" className={`h-4 w-4 ${nextArrowClass}`} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </GoldButton>
      </div>
    </div>
  )
}

// ─── Luxury Input ──────────────────────────────────────────────────────────────

function LuxInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  inputMode?: "search" | "text" | "none" | "tel" | "url" | "email" | "numeric" | "decimal"
}) {
  const { lang } = useI18n()
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const labelSide = lang === 'en' ? 'left-3 sm:left-4' : 'right-3 sm:right-4'

  return (
    <div className="relative">
      <motion.label
        className={`absolute ${labelSide} font-sans text-xs sm:text-sm pointer-events-none`}
        animate={{
          top: focused || hasValue ? '5px' : '50%',
          y: focused || hasValue ? '0%' : '-50%',
          fontSize: focused || hasValue ? '8px' : '11px',
          color: focused ? 'var(--gold)' : 'var(--ink-faintest)',
          letterSpacing: focused || hasValue ? '0.05em' : '0em',
        }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        {label}{required && ' *'}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ''}
        inputMode={inputMode}
        className="w-full rounded-xl border bg-surface/60 pb-2 pt-5 pr-3 pl-3 sm:pb-3 sm:pt-6 sm:pr-4 sm:pl-4 text-xs sm:text-sm text-foreground outline-none transition-all duration-300 placeholder:text-foreground/20"
        style={{
          borderColor: focused ? 'var(--gold)' : 'rgba(201,168,106,0.18)',
          boxShadow: focused ? '0 0 0 1px rgba(201,168,106,0.3), 0 4px 20px rgba(201,168,106,0.08)' : 'none',
        }}
        dir={lang === 'en' ? 'ltr' : 'rtl'}
      />
    </div>
  )
}

// ─── Shared Buttons ────────────────────────────────────────────────────────────

function GoldButton({
  children,
  onClick,
  disabled,
  as: Comp = 'button',
  href,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  as?: React.ElementType
  href?: string
  className?: string
}) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.04, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`inline-flex ${className}`}
    >
      <Comp
        href={href}
        onClick={onClick}
        disabled={disabled}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-gold/50 bg-gold/10 px-6 py-2.5 text-sm font-medium text-gold transition-all duration-300 hover:bg-gold hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          boxShadow: disabled ? 'none' : '0 4px 24px rgba(201,168,106,0.15)',
        }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-80" style={{ background: 'var(--gold)' }} />
        {children}
      </Comp>
    </motion.div>
  )
}

function GhostButton({
  children,
  onClick,
  as: Comp = 'button',
  href,
}: {
  children: ReactNode
  onClick?: () => void
  as?: React.ElementType
  href?: string
}) {
  return (
    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex">
      <Comp
        href={href}
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-foreground/60 transition-all duration-300 hover:border-gold/30 hover:text-gold"
      >
        {children}
      </Comp>
    </motion.div>
  )
}

// ─── Floating Particles ────────────────────────────────────────────────────────

const PARTICLE_DEFS = [
  { left: '8%',  top: '22%', size: 3,   dur: 8,  delay: 0   },
  { left: '20%', top: '70%', size: 2,   dur: 10, delay: 1.2 },
  { left: '45%', top: '15%', size: 2.5, dur: 9,  delay: 0.4 },
  { left: '67%', top: '80%', size: 2,   dur: 11, delay: 1.7 },
  { left: '82%', top: '35%', size: 3,   dur: 7,  delay: 0.9 },
  { left: '92%', top: '60%', size: 2,   dur: 12, delay: 2.1 },
  { left: '55%', top: '50%', size: 1.5, dur: 10, delay: 0.6 },
]

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {PARTICLE_DEFS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/30"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -22, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}
