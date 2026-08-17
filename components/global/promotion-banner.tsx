'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n'

interface Promotion {
  id: string
  title_ar: string | null
  title: string
  description: string | null
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  banner_text: string | null
  banner_color: string
  end_date: string | null
  enable_countdown: boolean
}

export function PromotionBanner() {
  const { t, lang } = useI18n()
  const pathname = usePathname()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return

    const fetchPromotion = async () => {
      const supabase = createClient()
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('global_promotions')
        .select('id, title_ar, title, description, discount_value, discount_type, banner_text, banner_color, end_date, enable_countdown')
        .eq('is_active', true)
        .eq('show_banner', true)
        .or(`end_date.gt.${now},end_date.is.null`)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) setPromotion(data as Promotion)
    }

    fetchPromotion()
  }, [pathname])

  useEffect(() => {
    if (!promotion?.enable_countdown || !promotion?.end_date) return

    const updateCountdown = () => {
      const diff = new Date(promotion.end_date!).getTime() - Date.now()
      if (diff <= 0) { setCountdown(''); return }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) setCountdown(lang === 'ar' ? `${days} يوم ${hours} ساعة` : `${days}d ${hours}h`)
      else if (hours > 0) setCountdown(lang === 'ar' ? `${hours} ساعة ${minutes} دقيقة` : `${hours}h ${minutes}m`)
      else setCountdown(lang === 'ar' ? `${minutes} دقيقة` : `${minutes}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [promotion, lang])

  if (!promotion || dismissed || pathname?.startsWith('/admin')) return null

  const bgColor = promotion.banner_color || '#C8A97E'

  return (
    <div
      className="relative w-full px-4 py-1.5 text-center text-sm font-medium flex items-center justify-center gap-3"
      style={{ backgroundColor: bgColor, color: '#0E0D0B' }}
    >
      <span>
        {lang === 'ar' ? promotion.banner_text || promotion.title_ar || promotion.title : promotion.title || promotion.title_ar || promotion.banner_text}
        {promotion.discount_value && (
          <span className="font-bold mx-1">
            {promotion.discount_value}{promotion.discount_type === 'percentage' ? '%' : lang === 'ar' ? ' ر.س' : ' SAR'}
          </span>
        )}
        {promotion.description && <span className="opacity-80 mr-1">{promotion.description}</span>}
      </span>

      {countdown && (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold opacity-80">
          <Clock size={12} /> {countdown}
        </span>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="absolute left-2 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label={t('promo.closeAria')}
      >
        <X size={14} />
      </button>
    </div>
  )
}
