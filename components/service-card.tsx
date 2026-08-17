'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { type Service } from '@/lib/services'
import { useI18n } from '@/lib/i18n'
import { MagneticButton } from './magnetic-button'



export function ServiceCard({
  service,
  index,
}: {
  service: Service
  index: number
}) {
  const { t, lang } = useI18n()
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    const rotX = (y / centerY) * 8
    const rotY = (x / centerX) * -8

    rotateX.set(rotX)
    rotateY.set(rotY)
    scale.set(1.02)

    setMouseX(e.clientX - rect.left)
    setMouseY(e.clientY - rect.top)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    setIsHovered(false)
  }

  const isLarge = service.gridSize === 'large'
  const colSpan = isLarge ? 'col-span-2 sm:col-span-2' : 'col-span-1 sm:col-span-1'

  return (
    <motion.div
      ref={cardRef}
      className={`${colSpan} h-full`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, margin: '-50px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        perspective: '1200px',
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full min-h-[320px] sm:min-h-[450px] flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-gold/30 bg-gradient-to-br from-white/8 to-white/5 backdrop-blur-xl transition-all duration-300"
      >
        {/* Glow border on hover */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0"
            style={{
              background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(212, 175, 55, 0.4), transparent 60%)`,
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Image Background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="relative h-full w-full"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              quality={90}
            />
          </motion.div>
        </div>

        {/* Slide-in Details Panel */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-20 bg-deep/90 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-2.5 sm:p-6 pb-2 sm:pb-6 h-full flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-hidden flex flex-col">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                    className="absolute top-2.5 left-2.5 p-1 bg-surface-2/60 hover:bg-surface-3 rounded-full transition-colors z-30"
                  >
                    <svg className="w-3 h-3 text-ink-strong" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="prose prose-invert max-w-none mb-2 sm:mb-6 mt-5 sm:mt-8 shrink-0">
                    <p className="text-ink-soft text-[9.5px] sm:text-sm leading-relaxed whitespace-pre-wrap line-clamp-3 sm:line-clamp-none">
                      {service.descriptionAr || service.description}
                    </p>
                  </div>

                  {/* Pricing Section */}
                  {service.pricing && (
                    <div className="bg-surface-3 border border-[#C8A96A]/10 rounded-xl p-2.5 sm:p-4 mb-2 sm:mb-4 shrink-0">
                      <h3 className="text-ink-strong text-[10px] sm:text-sm font-semibold mb-1.5 sm:mb-3 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#C8A96A]" />
                        {t('servicesPage.pricing.detailTitle')}
                      </h3>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                        <div>
                          <p className="text-[8px] sm:text-[9px] text-ink-faint mb-0.5">{t('servicesPage.pricing.system')}</p>
                          <p className="text-[9.5px] sm:text-xs font-medium text-ink-strong">
                            {t(service.pricing.pricing_type === 'per_sqm' ? 'servicesPage.pricing.perSqm' :
                               service.pricing.pricing_type === 'fixed' ? 'servicesPage.pricing.fixed' :
                               service.pricing.pricing_type === 'custom' ? 'servicesPage.pricing.custom' : 'servicesPage.pricing.quote')}
                          </p>
                        </div>
                        {service.pricing.price_per_sqm && (
                          <div>
                            <p className="text-[8px] sm:text-[9px] text-ink-faint mb-0.5">{t('servicesPage.pricing.price')}</p>
                            <p className="text-[9.5px] sm:text-xs font-medium text-[#C8A96A]">
                              {service.pricing.price_per_sqm.toLocaleString(locale)} {service.pricing.currency} {t('servicesPage.pricing.perSqmUnit')}
                            </p>
                          </div>
                        )}
                        {service.pricing.fixed_price && (
                          <div>
                            <p className="text-[8px] sm:text-[9px] text-ink-faint mb-0.5">{t('servicesPage.pricing.price')}</p>
                            <p className="text-[9.5px] sm:text-xs font-medium text-[#C8A96A]">
                              {service.pricing.fixed_price.toLocaleString(locale)} {service.pricing.currency}
                            </p>
                          </div>
                        )}
                        {service.pricing.min_area && (
                          <div>
                            <p className="text-[8px] sm:text-[9px] text-ink-faint mb-0.5">{t('servicesPage.pricing.minArea')}</p>
                            <p className="text-[9.5px] sm:text-xs font-medium text-ink-strong">
                              {service.pricing.min_area} {t('servicesPage.pricing.sqmUnit')}
                            </p>
                          </div>
                        )}
                        {service.pricing.max_area && (
                          <div>
                            <p className="text-[8px] sm:text-[9px] text-ink-faint mb-0.5">{t('servicesPage.pricing.maxArea')}</p>
                            <p className="text-[9.5px] sm:text-xs font-medium text-ink-strong">
                              {service.pricing.max_area} {t('servicesPage.pricing.sqmUnit')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Options / Addons */}
                  {service.options && service.options.length > 0 && (
                    <div className="mb-2 shrink overflow-hidden flex flex-col">
                      <h3 className="text-ink-strong text-[10px] sm:text-sm font-semibold mb-1.5 sm:mb-3 flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#C8A96A]" />
                        {t('servicesPage.pricing.addons')}
                      </h3>
                      <div className="space-y-1 sm:space-y-2 overflow-y-auto scrollbar-none flex-1 max-h-[60px] sm:max-h-none">
                        {service.options.map((opt: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-surface-3 p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-divider-soft shrink-0">
                            <span className="text-[9px] sm:text-xs text-ink-strong">{opt.name_ar || opt.name}</span>
                            <span className="text-[9px] sm:text-xs font-bold text-[#C8A96A]">
                              +{opt.price.toLocaleString(locale)} {opt.price_type === 'percentage' ? '%' : service.pricing?.currency || ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-1.5 sm:pt-4 shrink-0 w-full">
                  <MagneticButton 
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/start?serviceId=${service.id}`; setIsModalOpen(false); }} 
                    className="w-full rounded-lg bg-[#C8A96A] px-3 py-1.5 sm:py-3 text-[10px] sm:text-sm font-bold text-[#0A0908] transition-all hover:bg-[#d4b87a]"
                  >
                    {t('servicesPage.pricing.orderService')}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content (Title and Button) */}
        <AnimatePresence>
          {!isModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-30 mt-auto flex flex-col items-start text-start p-4 sm:p-6 pt-16 sm:pt-20 w-full"
              style={{
                backgroundImage: 'linear-gradient(to top, #0A0908 0%, #0A0908 50%, rgba(10, 9, 8, 0.9) 65%, rgba(10, 9, 8, 0.4) 85%, transparent 100%)'
              }}
            >
              <h3 className="relative font-heading text-lg sm:text-2xl font-bold text-white mb-1">
                {service.title}
              </h3>
              <p className="relative font-sans text-[9px] sm:text-xs font-medium tracking-[0.2em] text-[#C8A96A] mb-2 sm:mb-3">
                {service.titleAr}
              </p>

              <p className="relative text-xs sm:text-sm leading-relaxed text-ink-soft line-clamp-2 mb-4">
                {service.description}
              </p>

              <div className="flex gap-2 w-full mt-2">
                <MagneticButton 
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} 
                  className="w-full rounded-lg border border-gold/30 bg-black/40 backdrop-blur-md px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-all hover:bg-gold/20 hover:border-gold/50 hover:text-gold"
                >
                  {t('common.viewDetails')}
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>


      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </motion.div>
  )
}

