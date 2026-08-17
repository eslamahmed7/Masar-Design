'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { Service } from '@/lib/services'
import { ServiceCard } from './service-card'
import { ServicesBackground } from './services-background'
import { useMobile } from '@/lib/use-mobile'
import { useI18n } from '@/lib/i18n'

export function ServicesSection({ services }: { services: Service[] }) {
  const { t, tArr } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Split services into groups for Bento layout
  // Pattern: large (2 cols) + small + small + small + small + large (2 cols)
  type ServiceItem = { service: typeof services[0]; index: number }
  const servicesBySize = services.reduce<{ largeCards: ServiceItem[]; smallCards: ServiceItem[] }>(
    (acc, service, idx) => {
      if (service.gridSize === 'large') {
        acc.largeCards.push({ service, index: idx })
      } else {
        acc.smallCards.push({ service, index: idx })
      }
      return acc
    },
    { largeCards: [], smallCards: [] },
  )

  const isMobile = useMobile()

  // Opacity for different scroll stages
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0.5, 1])
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1])

  return (
    <section
      id="services"
      ref={containerRef}
      className="relative min-h-auto sm:min-h-[200vh] bg-background overflow-hidden"
    >
      <ServicesBackground scrollProgress={scrollYProgress} />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="sm:sticky top-0 h-auto sm:h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 pb-6 sm:pt-0 sm:pb-0">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            style={{ opacity: headerOpacity }}
          >
            {/* Small label */}
            <motion.p
              className="font-sans text-xs sm:text-sm font-medium tracking-[0.35em] text-gold mb-3 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('home.servicesLabel')}
            </motion.p>            {/* Main headline - Arabic */}
            <motion.h2
              className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 sm:mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              {tArr('home.servicesTitle')[0]}
              <br />
              {tArr('home.servicesTitle')[1]}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-base sm:text-xl leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('home.servicesDesc')}
            </motion.p>
          </motion.div>
        </div>

        {/* Services Grid Section */}
        <motion.div
          style={{ opacity: isMobile ? 1 : contentOpacity }}
          className="relative py-6 sm:py-20 px-2 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8">
            {/* First large card */}
            {servicesBySize.largeCards[0] && (
              <ServiceCard
                service={servicesBySize.largeCards[0].service}
                index={servicesBySize.largeCards[0].index}
              />
            )}

            {/* Four small cards in a 2x2 grid */}
            {servicesBySize.smallCards.slice(0, 4).map((item, idx) => (
              <ServiceCard
                key={item.service.id}
                service={item.service}
                index={item.index}
              />
            ))}

            {/* Last large card */}
            {servicesBySize.largeCards[1] && (
              <ServiceCard
                service={servicesBySize.largeCards[1].service}
                index={servicesBySize.largeCards[1].index}
              />
            )}
          </div>

          {/* Scroll hint - hidden on mobile */}
          <motion.div
            className="hidden sm:block mt-16 text-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <p className="font-sans text-xs sm:text-sm tracking-[0.3em] text-muted-foreground/60">
              {t('home.servicesHint')}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Vignette on exit */}
      <motion.div
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background"
        style={{ opacity: useTransform(scrollYProgress, [0.8, 1], [0, 0.5]) }}
      />
    </section>
  )
}
