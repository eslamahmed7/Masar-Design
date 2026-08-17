'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Ticket, Gauge } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculatePricing, type PriceBreakdown } from '@/lib/pricing/engine'
import { validateCouponCode } from '@/lib/public/actions'
import { LucideIcon } from '@/lib/lucide-icon'
import type { DBGlobalPromotion } from '@/lib/admin/types'

const EASE = [0.22, 1, 0.36, 1] as const

export type ServiceId = string

export interface ServiceData {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  coverImageUrl: string | null
  pricePerSqm: number
  currency: string
  pricingType: string
  fixedPrice: number | null
  minArea: number | null
  maxArea: number | null
  minOrderValue: number | null
}

interface ServiceSelectionProps {
  selectedService: ServiceData | null
  onSelect: (service: ServiceData | null) => void
  area: string
  onAreaChange: (area: string) => void
  couponResult: CouponDisplay | null
  onCouponResult: (result: CouponDisplay | null) => void
  priceBreakdown: PriceBreakdown | null
  onPriceBreakdown: (pb: PriceBreakdown | null) => void
}

export interface CouponDisplay {
  code: string
  discountType: string
  discountValue: number
  maxDiscount: number | null
}

async function fetchServices(): Promise<ServiceData[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_pricing(*)')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })

  if (!data) return []
  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    nameAr: s.name_ar || s.name,
    description: s.short_description || '',
    descriptionAr: s.long_description || s.short_description || '',
    icon: s.icon || '',
    coverImageUrl: s.cover_image_url,
    pricePerSqm: s.service_pricing?.price_per_sqm ?? 0,
    currency: s.service_pricing?.currency ?? 'EGP',
    pricingType: s.service_pricing?.pricing_type ?? 'quote',
    fixedPrice: s.service_pricing?.fixed_price ?? null,
    minArea: s.service_pricing?.min_area ?? null,
    maxArea: s.service_pricing?.max_area ?? null,
    minOrderValue: s.service_pricing?.min_order_value ?? null,
  }))
}

async function fetchActivePromotion(): Promise<DBGlobalPromotion | null> {
  const supabase = createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('global_promotions')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('priority', { ascending: false })
    .limit(1)
    .single()
  return data as DBGlobalPromotion | null
}

export function ServiceSelection({
  selectedService,
  onSelect,
  area,
  onAreaChange,
  couponResult,
  onCouponResult,
  priceBreakdown,
  onPriceBreakdown,
}: ServiceSelectionProps) {
  const queryClient = useQueryClient()
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')
  const couponApplied = useRef(false)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  })

  const { data: activePromotion } = useQuery({
    queryKey: ['active-promotion'],
    queryFn: fetchActivePromotion,
    staleTime: 2 * 60 * 1000,
  })

  // Realtime invalidation when services change
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('public-services-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        () => queryClient.invalidateQueries({ queryKey: ['public-services'] }),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  const numArea = useMemo(() => {
    const n = parseFloat(area)
    return isNaN(n) || n <= 0 ? 0 : n
  }, [area])

  const pricingInput = useMemo(() => {
    if (!selectedService || numArea <= 0) return null
    return {
      area: numArea,
      servicePricing: {
        pricing_type: selectedService.pricingType,
        price_per_sqm: selectedService.pricePerSqm,
        fixed_price: selectedService.fixedPrice,
        min_area: selectedService.minArea,
        max_area: selectedService.maxArea,
        min_order_value: selectedService.minOrderValue,
        currency: selectedService.currency,
      },
    }
  }, [selectedService, numArea])

  useEffect(() => {
    if (!pricingInput) {
      onPriceBreakdown(null)
      return
    }

    const globalPromotion = activePromotion
      ? {
          discount_type: activePromotion.discount_type,
          discount_value: activePromotion.discount_value,
          title: activePromotion.title,
          title_ar: activePromotion.title_ar,
        }
      : null

    const coupon = couponResult
      ? {
          discount_type: couponResult.discountType as 'percentage' | 'fixed',
          discount_value: couponResult.discountValue,
          max_discount: couponResult.maxDiscount,
        }
      : null

    const pb = calculatePricing({
      ...pricingInput,
      globalPromotion: globalPromotion as any,
      coupon: coupon as any,
    }) as PriceBreakdown

    onPriceBreakdown(pb)
  }, [pricingInput, activePromotion, couponResult, onPriceBreakdown])

  const handleAreaChange = useCallback((value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAreaChange(value)
    }
  }, [onAreaChange])

  const validateCoupon = useCallback(async () => {
    const code = couponCode.trim()
    if (!code || !priceBreakdown) return

    setValidatingCoupon(true)
    setCouponError('')

    const res = await validateCouponCode(code, priceBreakdown.subtotal)

    if (res.valid && res.data) {
      onCouponResult({
        code: res.data.code,
        discountType: res.data.discount_type,
        discountValue: res.data.discount_value,
        maxDiscount: res.data.max_discount,
      })
      couponApplied.current = true
    } else {
      onCouponResult(null)
      setCouponError(res.error || 'كود الخصم غير صالح.')
      couponApplied.current = false
    }

    setValidatingCoupon(false)
  }, [couponCode, priceBreakdown, onCouponResult])

  const handleCouponBlur = useCallback(() => {
    if (couponCode.trim() && !couponApplied.current) {
      validateCoupon()
    }
  }, [couponCode, validateCoupon])

  const handleCouponKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      validateCoupon()
    }
  }, [validateCoupon])

  const currencyDisplay = 'ج.م'
  const discountRate = selectedService?.pricePerSqm ?? 0

  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-deep py-28 px-6 md:px-12" dir="rtl">
        <div className="mx-auto max-w-7xl text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-gold/60" />
          <p className="mt-4 text-ink-faint text-sm">جاري تحميل الخدمات...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-deep py-28 px-6 md:px-12" dir="rtl">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, rgba(201,168,106,0.05) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mb-4 font-mono text-xs uppercase tracking-[0.45em] text-gold/70"
          >
            ما الذي تحتاجه؟
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
            className="font-heading text-4xl font-bold text-foreground text-balance md:text-5xl lg:text-6xl"
          >
            اختر خدمتك
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="mx-auto mt-4 max-w-md text-base text-muted-foreground"
          >
            حدّد نوع الخدمة التي تبحث عنها وسنوجّه طلبك للفريق المختص
          </motion.p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-faint text-lg">لا تخدمات متاحة حالياً</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  isSelected={selectedService?.id === service.id}
                  onSelect={() => onSelect(selectedService?.id === service.id ? null : service)}
                />
              ))}
            </div>

            <AnimatePresence>
              {selectedService && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mt-12"
                >
                  <div className="max-w-lg mx-auto bg-surface/80 backdrop-blur-sm border border-gold/15 rounded-3xl p-8 shadow-[0_0_60px_oklch(0.81_0.12_84/0.08)]">
                    <h3 className="text-center font-heading text-xl font-semibold text-gold mb-8">
                      تفاصيل السعر
                    </h3>

                    <div className="flex items-center justify-between py-3 border-b border-divider">
                      <span className="text-sm text-ink-faint">سعر المتر المربع</span>
                      <span className="text-lg font-bold text-foreground">
                        {discountRate.toLocaleString('ar-EG')} {currencyDisplay} / م²
                      </span>
                    </div>

                    <div className="py-4 border-b border-divider">
                      <label className="block text-sm text-ink-faint mb-2">مساحة المشروع (م²)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={area}
                        onChange={(e) => handleAreaChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault()
                        }}
                        placeholder="مثال: 180"
                        min="0"
                        step="any"
                        dir="rtl"
                        className="w-full bg-surface-3 border border-divider-soft rounded-xl px-4 py-3 text-foreground text-sm placeholder-ink-faintest focus:border-gold/50 focus:outline-none transition-colors"
                      />
                    </div>

                    {priceBreakdown && numArea > 0 && (
                      <div className="space-y-3 pt-4">
                        <PriceRow label="المجموع الفرعي" value={`${priceBreakdown.subtotal.toLocaleString('ar-EG')} ${currencyDisplay}`} />

                        {priceBreakdown.globalPromotionDiscount > 0 && (
                          <PriceRow
                            label={`خصم (${priceBreakdown.globalPromotionLabel || 'تخفيض'})`}
                            value={`-${priceBreakdown.globalPromotionDiscount.toLocaleString('ar-EG')} ${currencyDisplay}`}
                            className="text-emerald-400"
                          />
                        )}

                        <div className="py-3 border-b border-divider">
                          <label className="block text-sm text-ink-faint mb-2">كود الخصم</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value)
                                couponApplied.current = false
                              }}
                              onBlur={handleCouponBlur}
                              onKeyDown={handleCouponKeyDown}
                              placeholder="أدخل كود الخصم"
                              dir="rtl"
                              className="flex-1 bg-surface-3 border border-divider-soft rounded-xl px-4 py-2.5 text-foreground text-sm placeholder-ink-faintest focus:border-gold/50 focus:outline-none transition-colors"
                            />
                            <button
                              type="button"
                              onClick={validateCoupon}
                              disabled={validatingCoupon || !couponCode.trim()}
                              className="px-4 py-2.5 bg-gold/15 border border-gold/30 text-gold rounded-xl text-sm font-medium hover:bg-gold/25 disabled:opacity-40 transition-all"
                            >
                              {validatingCoupon ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                            </button>
                          </div>
                          {couponError && (
                            <p className="mt-1.5 text-xs text-red-400">{couponError}</p>
                          )}
                          {couponResult && !couponError && (
                            <p className="mt-1.5 text-xs text-emerald-400">
                              خصم {couponResult.discountValue}{couponResult.discountType === 'percentage' ? '%' : ` ${currencyDisplay}`}
                            </p>
                          )}
                        </div>

                        {couponResult && priceBreakdown.couponDiscount > 0 && (
                          <PriceRow
                            label="خصم الكود"
                            value={`-${priceBreakdown.couponDiscount.toLocaleString('ar-EG')} ${currencyDisplay}`}
                            className="text-emerald-400"
                          />
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                          <span className="text-sm font-bold text-gold">الإجمالي النهائي</span>
                          <span className="text-xl font-bold text-gold">
                            {priceBreakdown.finalTotal.toLocaleString('ar-EG')} {currencyDisplay}
                          </span>
                        </div>
                      </div>
                    )}

                    {numArea <= 0 && (
                      <p className="text-center text-xs text-ink-faintest mt-4">أدخل مساحة المشروع لحساب السعر</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
  isSelected,
  onSelect,
}: {
  service: ServiceData
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const currencyDisplay = 'ج.م'

  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE }}
      onClick={onSelect}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-[26px] border text-right transition-all duration-500 ${
        isSelected
          ? 'border-gold shadow-[0_0_40px_oklch(0.81_0.12_84/0.25),0_20px_60px_rgba(0,0,0,0.6)]'
          : 'border-border hover:border-gold/40 hover:shadow-[0_0_30px_oklch(0.81_0.12_84/0.12),0_16px_40px_rgba(0,0,0,0.5)]'
      }`}
      aria-pressed={isSelected}
      aria-label={`اختر ${service.nameAr}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {service.coverImageUrl ? (
          <img
            src={service.coverImageUrl}
            alt={service.nameAr}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-surface-3 flex items-center justify-center">
            <LucideIcon name={service.icon} size={36} className="text-gold/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/30 to-transparent" />

        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-gold bg-gold text-primary-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </motion.div>
        )}
      </div>

      <div className="relative p-6 bg-card/60 backdrop-blur-sm">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -right-1/3 w-1/3 skew-x-12 bg-white/8 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
        />

        <div className="mb-3 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
              isSelected
                ? 'border-gold/60 bg-gold/20 text-gold'
                : 'border-border bg-card/50 text-muted-foreground group-hover:border-gold/30 group-hover:bg-gold/10 group-hover:text-gold'
            }`}
          >
            <LucideIcon name={service.icon} size={18} />
          </div>
          <div className="flex-1">
            <h3
              className={`font-heading text-lg font-semibold transition-colors duration-300 ${
                isSelected ? 'text-gold' : 'text-foreground group-hover:text-gold/90'
              }`}
            >
              {service.nameAr}
            </h3>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{service.descriptionAr}</p>

        {service.pricePerSqm > 0 && (
          <p className="mt-3 text-xs text-gold/70">
            ابتداءً من{' '}
            <span className="font-semibold">
              {service.pricePerSqm.toLocaleString('ar-EG')} {currencyDisplay}
            </span>
            /م²
          </p>
        )}

        {isSelected && (
          <motion.div
            layoutId="selected-card-border"
            className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-gold/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.button>
  )
}

function PriceRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <span className="text-sm text-ink-faint">{label}</span>
      <span className={`text-sm font-medium ${className || 'text-foreground'}`}>{value}</span>
    </div>
  )
}
