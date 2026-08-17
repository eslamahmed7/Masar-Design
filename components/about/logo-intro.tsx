'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

interface LogoIntroProps {
  onComplete: () => void
}

export function LogoIntro({ onComplete }: LogoIntroProps) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<'reveal' | 'dissolve' | 'done'>('reveal')
  const [skipped, setSkipped] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (skipped) {
      onComplete()
      return
    }
    // Reveal for 1.8s, then dissolve
    timerRef.current = setTimeout(() => {
      setPhase('dissolve')
      timerRef.current = setTimeout(() => {
        setPhase('done')
        onComplete()
      }, 700)
    }, 1800)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [skipped, onComplete])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#0c0a07' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        {/* Subtle architectural grid */}
        <motion.div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #C8A96A18 1px, transparent 1px),
              linear-gradient(to bottom, #C8A96A18 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
          animate={phase === 'dissolve' ? { opacity: 0 } : { opacity: 0.1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Radial warm spotlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200, 169, 106, 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo container */}
        <motion.div
          className="relative flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={
            phase === 'dissolve'
              ? { scale: 1.05, opacity: 0, y: -20 }
              : { scale: 1, opacity: 1, y: 0 }
          }
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient gold glow halo */}
          <div
            className="absolute -inset-8 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle, #C8A96A 0%, transparent 70%)' }}
          />

          {/* Pure real PNG logo */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72">
            <Image
              src="/masar-logo.png"
              alt="MASAR DESIGN"
              fill
              priority
              sizes="(max-width: 640px) 224px, 288px"
              className="object-contain"
            />
          </div>

          {/* Shimmer line */}
          <motion.div
            className="mt-6 h-[1px] w-32 bg-gradient-to-r from-transparent via-gold to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.8 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />

          {/* Brand slogan */}
          <motion.p
            className="mt-4 text-xs tracking-[0.4em] uppercase text-gold/80 font-sans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            MASAR DESIGN STUDIO
          </motion.p>
        </motion.div>

        {/* Skip button */}
        <motion.button
          onClick={() => setSkipped(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest text-gold/50 transition-colors hover:text-gold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          aria-label={t('about.skipIntro')}
        >
          {t('about.skipIntro')}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

