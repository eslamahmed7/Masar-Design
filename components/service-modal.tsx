'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { X, CheckCircle2 } from 'lucide-react'
import { type Service } from '@/lib/services'
import { useI18n } from '@/lib/i18n'
import { MagneticButton } from './magnetic-button'

interface ServiceModalProps {
  service: Service
  onClose: () => void
}

const PRICING_TYPE_KEYS: Record<string, string> = {
  per_sqm: 'servicesPage.pricing.perSqm',
  fixed: 'servicesPage.pricing.fixed',
  custom: 'servicesPage.pricing.custom',
  quote: 'servicesPage.pricing.quote',
}

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  const { t, lang } = useI18n()
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-deep border border-[#C8A96A]/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white/80 hover:text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image */}
        <div className="relative w-full h-48 sm:h-64">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 -mt-10 relative z-10">
          <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white mb-1">
            {service.title}
          </h2>
          <p className="font-sans text-sm tracking-[0.2em] text-[#C8A96A] mb-6">
            {service.titleAr}
          </p>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {service.descriptionAr || service.description}
            </p>
          </div>

          {/* Pricing Section */}
          {service.pricing && (
            <div className="bg-surface-3 border border-[#C8A96A]/10 rounded-xl p-5 mb-6">
              <h3 className="text-ink-strong font-semibold mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                {t('servicesPage.pricing.detailTitle')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ink-faint mb-1">{t('servicesPage.pricing.system')}</p>
                  <p className="text-sm font-medium text-white">
                    {t(PRICING_TYPE_KEYS[service.pricing.pricing_type] ?? 'servicesPage.pricing.quote')}
                  </p>
                </div>
                {service.pricing.price_per_sqm && (
                  <div>
                    <p className="text-xs text-ink-faint mb-1">{t('servicesPage.pricing.price')}</p>
                    <p className="text-sm font-medium text-[#C8A96A]">
                      {service.pricing.price_per_sqm.toLocaleString(locale)} {service.pricing.currency} {t('servicesPage.pricing.perSqmUnit')}
                    </p>
                  </div>
                )}
                {service.pricing.fixed_price && (
                  <div>
                    <p className="text-xs text-ink-faint mb-1">{t('servicesPage.pricing.price')}</p>
                    <p className="text-sm font-medium text-[#C8A96A]">
                      {service.pricing.fixed_price.toLocaleString(locale)} {service.pricing.currency}
                    </p>
                  </div>
                )}
                {service.pricing.min_area && (
                  <div>
                    <p className="text-xs text-ink-faint mb-1">{t('servicesPage.pricing.minArea')}</p>
                    <p className="text-sm font-medium text-white">
                      {service.pricing.min_area} {t('servicesPage.pricing.sqmUnit')}
                    </p>
                  </div>
                )}
                {service.pricing.min_order_value && (
                  <div>
                    <p className="text-xs text-ink-faint mb-1">{t('servicesPage.pricing.minOrder')}</p>
                    <p className="text-sm font-medium text-white">
                      {service.pricing.min_order_value.toLocaleString(locale)} {service.pricing.currency}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options / Addons */}
          {service.options && service.options.length > 0 && (
            <div className="mb-8">
              <h3 className="text-ink-strong font-semibold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                {t('servicesPage.pricing.addons')}
              </h3>
              <div className="space-y-3">
                {service.options.map((opt: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-surface-3 p-4 rounded-xl border border-divider-soft">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#C8A96A]" />
                      <span className="text-sm text-ink-strong">{opt.name_ar || opt.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#C8A96A]">
                      +{opt.price.toLocaleString(locale)} {opt.price_type === 'percentage' ? '%' : service.pricing?.currency || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-center mt-8">
            <div onClick={() => { window.location.href = '/#start'; onClose() }}>
              <MagneticButton className="w-full sm:w-auto px-12 py-3 bg-[#C8A96A] text-[#0A0908] font-bold rounded-xl hover:bg-[#d4b87a] transition-colors">
                {t('servicesPage.pricing.orderService')}
              </MagneticButton>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
