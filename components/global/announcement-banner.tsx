'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Promotion {
  id: string
  title: string
  title_ar: string | null
  banner_text: string | null
  banner_color: string
  discount_value: number
  discount_type: string
  end_date: string | null
  enable_countdown: boolean
}

interface Props {
  promotions: Promotion[]
}

function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    if (!endDate) return
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft(null); return }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate])

  return timeLeft
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center leading-none mx-0.5">
      <span className="font-bold text-sm tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="text-[9px] opacity-70">{label}</span>
    </span>
  )
}

function BannerSlide({ promo }: { promo: Promotion }) {
  const { t, lang } = useI18n()
  const timeLeft = useCountdown(promo.enable_countdown ? promo.end_date : null)
  const text = lang === 'ar' ? promo.banner_text || promo.title_ar || promo.title : promo.title || promo.title_ar || promo.banner_text
  const discountLabel = `${promo.discount_value}${promo.discount_type === 'percentage' ? '%' : lang === 'ar' ? ' ر.س' : ' SAR'}`

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Megaphone size={13} className="flex-shrink-0 opacity-80" />
        <span className="text-sm font-medium tracking-wide">{text}</span>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
          style={{ backgroundColor: promo.banner_color + '33', border: `1px solid ${promo.banner_color}55` }}>
          {t('promo.discount').replace('{label}', discountLabel)}
        </span>
      </div>
      {timeLeft && (
        <div className="flex items-center gap-1 text-xs">
          <span className="opacity-60 text-xs">{t('promo.endsIn')}</span>
          {timeLeft.d > 0 && <CountdownUnit value={timeLeft.d} label={t('promo.day')} />}
          <CountdownUnit value={timeLeft.h} label={t('promo.hourShort')} />
          <span className="opacity-50 font-bold text-xs">:</span>
          <CountdownUnit value={timeLeft.m} label={t('promo.minuteShort')} />
          <span className="opacity-50 font-bold text-xs">:</span>
          <CountdownUnit value={timeLeft.s} label={t('promo.secondShort')} />
        </div>
      )}
    </div>
  )
}

export function AnnouncementBanner({ promotions }: Props) {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Cycle through multiple promotions
  useEffect(() => {
    if (promotions.length <= 1) return
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % promotions.length)
    }, 6000)
    return () => clearInterval(id)
  }, [promotions.length])

  if (!promotions.length || dismissed) return null

  const promo = promotions[current]
  const color = promo.banner_color ?? '#C8A96A'

  return (
    <AnimatePresence>
      <motion.div
        key="announcement-banner"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-50 overflow-hidden"
        style={{ backgroundColor: color + '18', borderBottom: `1px solid ${color}30` }}
      >
        <div className="relative px-4 py-2 flex items-center justify-center" style={{ color }}>
          {/* Prev arrow (only if multiple) */}
          {promotions.length > 1 && (
            <button
              onClick={() => setCurrent(prev => (prev - 1 + promotions.length) % promotions.length)}
              className="absolute right-10 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={14} />
            </button>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
            >
              <BannerSlide promo={promo} />
            </motion.div>
          </AnimatePresence>

          {/* Next arrow */}
          {promotions.length > 1 && (
            <button
              onClick={() => setCurrent(prev => (prev + 1) % promotions.length)}
              className="absolute left-10 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          {/* Dots */}
          {promotions.length > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0.5 flex gap-1">
              {promotions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="w-1 h-1 rounded-full transition-opacity"
                  style={{ backgroundColor: color, opacity: i === current ? 1 : 0.3 }} />
              ))}
            </div>
          )}

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute left-3 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
          >
            <X size={13} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
