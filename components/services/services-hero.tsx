'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import { ServiceButton } from './service-showcase'
import { useI18n } from '@/lib/i18n'

export function ServicesHero() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  // Scroll-driven effects
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])

  // Optional: gentle X drift for background
  const bgX = useTransform(scrollYProgress, [0, 1], ['0%', '5%'])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-24 pt-36 md:px-12 lg:px-20"
    >
      {/* Background layers */}
      <HeroBackground bgX={bgX} bgY={bgY} />

      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* LEFT — copy */}
        <motion.div style={{ opacity: contentOpacity, y: contentY }} className="lg:order-1">
          <motion.p
            className="reveal-hero mb-6 font-mono text-xs uppercase tracking-[0.5em] text-gold/70"
            style={{ '--rv-delay': '0.2s', '--rv-dur': '1s', '--rv-y': '20px' } as React.CSSProperties}
          >
            MASAR — Services
          </motion.p>

          <h1 className="font-heading text-6xl font-bold leading-[1.05] text-foreground text-balance md:text-7xl lg:text-8xl">
            {[t('servicesPage.heroTitle')].map((line) => (
              <span
                key={line}
                className="reveal-hero block"
                style={{ '--rv-delay': '0.35s', '--rv-dur': '1.1s', '--rv-y': '40px' } as React.CSSProperties}
              >
                {line}
              </span>
            ))}
          </h1>

          <motion.p
            className="reveal-hero mt-8 max-w-lg text-lg leading-relaxed text-ink md:text-xl"
            style={{ '--rv-delay': '0.65s', '--rv-dur': '1s', '--rv-y': '30px' } as React.CSSProperties}
          >
            {t('servicesPage.heroDesc')}
          </motion.p>

          <motion.div
            className="reveal-hero mt-12 flex flex-wrap items-center gap-4"
            style={{ '--rv-delay': '0.9s', '--rv-dur': '1s', '--rv-y': '24px' } as React.CSSProperties}
          >
            <ServiceButton href="/start">{t('servicesPage.heroStart')}</ServiceButton>
            <ServiceButton href="/projects" variant="secondary">
              {t('servicesPage.heroWork')}
            </ServiceButton>
          </motion.div>
        </motion.div>

        {/* RIGHT — image */}
        <motion.div
          style={{ scale: imageScale }}
          className="relative lg:order-2"
        >
          <motion.div
            className="reveal-hero relative aspect-[4/5] w-full overflow-hidden rounded-[36px] border border-[color:rgba(201,168,106,0.18)] shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)] will-transform"
            style={{ '--rv-delay': '0.2s', '--rv-dur': '1.4s', '--rv-y': '30px', '--rv-scale': '0.94' } as React.CSSProperties}
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src="/services/hero-luxury.png"
                alt={t('servicesPage.heroImageAlt')}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="scale-110 object-cover"
                quality={92}
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/50">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-8 w-px bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

function HeroBackground({
  bgX,
  bgY,
}: {
  bgX: import('motion/react').MotionValue<any>
  bgY: import('motion/react').MotionValue<any>
}) {
  return (
    <motion.div
      style={{ x: bgX, y: bgY }}
      className="pointer-events-none absolute inset-0 -z-0"
      aria-hidden
    >
      {/* Radial warm light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 70% 20%, rgba(201,168,106,0.08) 0%, transparent 55%)',
        }}
      />
      {/* Blueprint grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
        <defs>
          <pattern id="hero-grid" width="70" height="70" patternUnits="userSpaceOnUse">
            <path d="M70 0 H0 V70" fill="none" stroke="rgba(201,168,106,0.6)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/40"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
      {/* Dark vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </motion.div>
  )
}

const PARTICLES = [
  { left: '12%', top: '30%', size: 3, dur: 7, delay: 0 },
  { left: '25%', top: '65%', size: 2, dur: 9, delay: 1 },
  { left: '48%', top: '20%', size: 2.5, dur: 8, delay: 0.5 },
  { left: '62%', top: '75%', size: 2, dur: 10, delay: 1.5 },
  { left: '80%', top: '40%', size: 3, dur: 7.5, delay: 0.8 },
  { left: '90%', top: '60%', size: 2, dur: 9.5, delay: 2 },
  { left: '35%', top: '45%', size: 1.5, dur: 11, delay: 1.2 },
]
