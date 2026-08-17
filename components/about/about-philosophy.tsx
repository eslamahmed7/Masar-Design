'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

export function AboutPhilosophy() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [-40, 40])

  const paragraphs = [
    t('aboutPage.philosophyP1'),
    t('aboutPage.philosophyP2'),
    t('aboutPage.philosophyP3'),
  ]

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-10 sm:py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-16 md:gap-24 items-center">

          {/* Right: image */}
          <div
            ref={imgRef}
            className="relative order-1 sm:order-1 md:order-2 h-[280px] sm:h-[450px] md:h-[680px] col-span-1 sm:col-span-1 overflow-hidden rounded-xl sm:rounded-2xl"
          >
            <motion.div className="absolute inset-0 will-transform" style={{ y: imgY }}>
              <Image
                src="/about/philosophy.png"
                alt={t('aboutPage.philosophyImageAlt')}
                fill
                priority
                className="object-cover scale-110"
                sizes="50vw"
              />
            </motion.div>

            {/* Gold frame accent */}
            <div
              className="absolute inset-0 rounded-lg sm:rounded-2xl pointer-events-none"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,106,0.15)' }}
            />

            {/* Top-right corner accent lines */}
            <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
              <div className="absolute top-0 right-0 h-full w-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
            </div>
            <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
              <div className="absolute bottom-0 left-0 h-full w-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
            </div>
          </div>

          {/* Left: text */}
          <div className="order-2 sm:order-2 md:order-1 flex flex-col justify-center col-span-1 sm:col-span-1">
            {/* Label */}
            <motion.span
              className="mb-3 sm:mb-4 text-xs sm:text-xs tracking-[0.35em] uppercase"
              style={{ color: 'var(--gold)' }}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              {t('aboutPage.philosophyLabel')}
            </motion.span>

            {/* Heading */}
            <div className="overflow-hidden mb-4 sm:mb-8">
              <motion.h2
                className="font-heading text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground"
                initial={{ y: '100%' }}
                animate={isInView ? { y: 0 } : {}}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                {t('aboutPage.philosophyTitle1')}
                <br />
                <span className="gold-gradient-text">{t('aboutPage.philosophyTitle2')}</span>
              </motion.h2>
            </div>

            {/* Gold rule */}
            <motion.div
              className="mb-4 sm:mb-8 h-px w-8 sm:w-16"
              style={{ background: 'var(--gold)' }}
              initial={{ scaleX: 0, originX: 1 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            />

            {/* Paragraphs */}
            <div className="flex flex-col gap-3 sm:gap-5">
              {paragraphs.map((p, i) => (
                <motion.p
                   key={i}
                   className="text-sm sm:text-xs md:text-base leading-relaxed sm:leading-loose text-foreground/65"
                   initial={{ opacity: 0, y: 16 }}
                   animate={isInView ? { opacity: 1, y: 0 } : {}}
                   transition={{ delay: 0.35 + i * 0.12, duration: 0.65, ease: 'easeOut' }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
