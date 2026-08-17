'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

export function AboutCta() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <section ref={ref} className="relative overflow-hidden py-40 md:py-60">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 will-transform" style={{ y: bgY }}>
        <Image
          src="/about/philosophy.png"
          alt=""
          fill
          className="object-cover scale-110"
          sizes="100vw"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/85" />

      {/* Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,106,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Heading */}
        <div className="overflow-hidden mb-6">
          <motion.h2
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight gold-gradient-text"
            initial={{ y: '100%' }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('aboutPage.ctaTitle1')}
            <br />
            {t('aboutPage.ctaTitle2')}
          </motion.h2>
        </div>

        {/* Rule */}
        <motion.div
          className="mx-auto mb-8 h-px w-16"
          style={{ background: 'var(--gold)', opacity: 0.5 }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        />

        {/* Paragraph */}
        <motion.p
          className="mb-12 text-base leading-loose text-foreground/60"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          {t('aboutPage.ctaDesc1')}
          <br />
          {t('aboutPage.ctaDesc2')}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <Link
            href="/start"
            className="group relative inline-flex items-center gap-2 rounded-full px-9 py-4 text-sm font-medium text-[#0B0B0B] transition-all duration-300"
            style={{ background: 'var(--gold)' }}
          >
            <span className="relative z-10">{t('aboutPage.ctaStart')}</span>
            {/* Shimmer */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 overflow-hidden"
              style={{ transition: 'opacity 0.3s' }}
            >
              <span
                className="absolute top-0 bottom-0 w-1/3 skew-x-[-16deg] -left-full group-hover:left-full"
                style={{
                  background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--ink) 20%, transparent), transparent)',
                  transition: 'left 0.5s ease',
                }}
              />
            </span>
          </Link>

          <Link
            href="/projects"
            className="inline-flex items-center rounded-full border px-9 py-4 text-sm font-medium transition-all duration-300 hover:border-gold/50 hover:text-gold"
            style={{ borderColor: 'rgba(201,168,106,0.25)', color: 'rgba(201,168,106,0.7)' }}
          >
            {t('aboutPage.ctaWork')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
