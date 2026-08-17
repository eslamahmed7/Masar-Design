'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

interface Particle {
  left: string; top: string; size: number; dur: number; delay: number
}

const PARTICLES: Particle[] = [
  { left: '10%', top: '20%', size: 2,   dur: 7,  delay: 0   },
  { left: '25%', top: '75%', size: 1.5, dur: 9,  delay: 0.8 },
  { left: '45%', top: '12%', size: 2.5, dur: 8,  delay: 1.4 },
  { left: '60%', top: '85%', size: 1.5, dur: 10, delay: 0.3 },
  { left: '78%', top: '30%', size: 2,   dur: 7.5,delay: 1.1 },
  { left: '90%', top: '60%', size: 1.5, dur: 9.5,delay: 2.0 },
  { left: '35%', top: '50%', size: 1,   dur: 11, delay: 0.6 },
  { left: '70%', top: '18%', size: 2,   dur: 8.5,delay: 1.7 },
  { left: '15%', top: '45%', size: 1.5, dur: 7,  delay: 2.5 },
  { left: '55%', top: '65%', size: 1,   dur: 10, delay: 1.2 },
]

interface Props {
  onReset: () => void
}

export function ContactSuccess({ onReset }: Props) {
  const { t, lang } = useI18n()
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    // Scroll to center the success section
    window.scrollTo({ top: window.scrollY, behavior: 'smooth' })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-24"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 -z-10 bg-deep/80 backdrop-blur-sm"
      />

      {/* Radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(200,169,106,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-gold/60"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          initial={{ opacity: 0 }}
          animate={{ y: [0, -20, 0], opacity: [0, 0.6, 0] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay + 0.5,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* MASAR Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative mb-10"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gold/20 blur-xl"
          />
          {/* Logo circle */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold/40 bg-gold/10 backdrop-blur-sm">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="font-heading text-3xl font-bold text-gold"
            >
              م
            </motion.span>
          </div>
          {/* Check badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-deep bg-emerald-500"
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Gold divider top */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
          className="mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="font-heading text-4xl font-bold text-foreground md:text-5xl"
        >
          {t('contactSuccess.title')}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
          className="mt-5 text-base leading-relaxed text-foreground/60 max-w-sm"
        >
          {t('contactSuccess.desc')}
        </motion.p>

        {/* Gold divider bottom */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          className="my-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-medium text-foreground/70 transition-all hover:border-white/20 hover:text-foreground hover:bg-white/5"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {t('contactSuccess.backHome')}
          </Link>
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-[#0B0B0B] transition-all hover:bg-[#d4b87a] hover:shadow-[0_0_25px_rgba(200,169,106,0.3)]"
          >
            <motion.span
              className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              initial={{ x: '-120%' }}
              whileHover={{ x: '220%' }}
              transition={{ duration: 0.5 }}
            />
            <span className="relative flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('contactSuccess.sendAnother')}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
