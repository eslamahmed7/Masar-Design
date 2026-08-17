'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'motion/react'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

export function ContactHero() {
  const { t, tArr } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-label={t('contact.heroAria')}
    >
      {/* Background image with parallax zoom */}
      <motion.div
        style={{ scale: bgScale, y: bgY }}
        className="absolute inset-0 -z-10 will-change-transform"
        aria-hidden
      >
        <Image
          src="/contact/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={90}
        />
      </motion.div>

      {/* Dark overlay layers */}
      <div className="absolute inset-0 -z-10 bg-deep/60" aria-hidden />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(80% 70% at 50% 30%, rgba(201,168,106,0.10) 0%, transparent 60%)',
        }}
        aria-hidden
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(100% 100% at 50% 0%, transparent 45%, rgba(9,9,9,0.85) 100%)',
        }}
        aria-hidden
      />

      {/* Noise texture */}
      <div className="noise-layer pointer-events-none absolute inset-0 -z-10 opacity-[0.025]" aria-hidden />

      {/* Blueprint grid subtle */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.04]"
        aria-hidden
      >
        <defs>
          <pattern id="contact-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M80 0 H0 V80"
              fill="none"
              stroke="rgba(201,168,106,0.7)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contact-grid)" />
      </svg>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-gold/50"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Center content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex flex-col items-center px-6 pt-20 text-center"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="mb-8 font-mono text-xs uppercase tracking-[0.5em] text-gold/70"
        >
          {t('contact.eyebrow')}
        </motion.p>

        {/* Main headline */}
        <h1 className="font-heading text-3xl sm:text-6xl font-bold leading-tight text-balance text-foreground md:text-7xl lg:text-8xl xl:text-9xl">
          {tArr('contact.titleLines').map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 60, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.4 + i * 0.18,
                ease: EASE,
              }}
              className="block"
            >
              {i === 1 ? (
                <span className="gold-gradient-text">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.85, ease: EASE }}
          className="mx-auto mt-4 sm:mt-8 max-w-lg text-[10px] sm:text-lg leading-loose sm:leading-loose text-ink md:text-xl"
        >
          {t('contact.subtitle1')}
          <br />
          <span className="text-foreground/70">{t('contact.subtitle2')}</span>
        </motion.p>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
          className="mt-12 h-px w-32 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold/50">
          {t('contact.discover')}
        </span>
        <motion.span
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-10 w-px bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

const PARTICLES = [
  { left: '8%', top: '25%', size: 3, dur: 8, delay: 0 },
  { left: '18%', top: '70%', size: 2, dur: 10, delay: 1.2 },
  { left: '42%', top: '15%', size: 2.5, dur: 9, delay: 0.4 },
  { left: '58%', top: '80%', size: 2, dur: 11, delay: 1.8 },
  { left: '75%', top: '35%', size: 3, dur: 7.5, delay: 0.7 },
  { left: '88%', top: '60%', size: 2, dur: 9.5, delay: 2.2 },
  { left: '30%', top: '50%', size: 1.5, dur: 12, delay: 1.5 },
  { left: '65%', top: '20%', size: 2, dur: 8.5, delay: 0.9 },
]
