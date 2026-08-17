'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'motion/react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

// SVG paths hand-traced from the MASAR logo geometry:
// Outer left pillar, outer right pillar, M top-stroke, inner arch left, inner arch right
const LOGO_STROKES = [
  // Left outer vertical pillar
  { id: 'pillar-l', d: 'M 90 30 L 90 240', len: 210 },
  // Right outer vertical pillar
  { id: 'pillar-r', d: 'M 270 30 L 270 240', len: 210 },
  // M top-left diagonal
  { id: 'm-left', d: 'M 90 30 L 180 130', len: 155 },
  // M top-right diagonal
  { id: 'm-right', d: 'M 270 30 L 180 130', len: 155 },
  // Inner arch — left side
  { id: 'arch-l', d: 'M 140 240 L 140 175 Q 140 145 180 145', len: 110 },
  // Inner arch — right side
  { id: 'arch-r', d: 'M 220 240 L 220 175 Q 220 145 180 145', len: 110 },
]

// Dot positions along the blueprint paths (percentage along each stroke)
const DOTS = [
  { stroke: 0, pos: 0.3 },
  { stroke: 1, pos: 0.6 },
  { stroke: 2, pos: 0.5 },
  { stroke: 3, pos: 0.5 },
  { stroke: 4, pos: 0.7 },
  { stroke: 5, pos: 0.4 },
]

interface LogoIntroProps {
  onComplete: () => void
}

export function LogoIntro({ onComplete }: LogoIntroProps) {
  const { t } = useI18n()
  const [phase, setPhase] = useState<'draw' | 'reveal' | 'dissolve' | 'done'>('draw')
  const [skipped, setSkipped] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advance = useCallback(() => {
    // Draw phase: 1.4 s → reveal phase: 0.8 s → dissolve: 0.8 s → done
    timerRef.current = setTimeout(() => setPhase('reveal'), 1400)
  }, [])

  useEffect(() => {
    if (skipped) {
      onComplete()
      return
    }
    advance()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [advance, skipped, onComplete])

  useEffect(() => {
    if (phase === 'reveal') {
      timerRef.current = setTimeout(() => setPhase('dissolve'), 900)
    } else if (phase === 'dissolve') {
      timerRef.current = setTimeout(() => { setPhase('done'); onComplete() }, 900)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phase, onComplete])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--bg-deep)' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        {/* Blueprint grid background */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #C9A86A22 1px, transparent 1px),
              linear-gradient(to bottom, #C9A86A22 1px, transparent 1px)
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
            background: 'radial-gradient(ellipse 50% 55% at 50% 50%, rgba(201,168,106,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Logo stack */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={
            phase === 'dissolve'
              ? { scale: 1.08, opacity: 0, y: -24 }
              : { scale: 1, opacity: 1, y: 0 }
          }
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Blueprint SVG — draws first */}
          <svg
            viewBox="0 0 360 270"
            className="absolute"
            style={{ width: 200, height: 150 }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Construction dots */}
            {phase === 'draw' && DOTS.map((dot, i) => {
              const stroke = LOGO_STROKES[dot.stroke]
              // Approximate dot position: use simple linear interpolation on bounding box
              const x = 90 + (dot.stroke % 2 === 0 ? 0 : 180) + (dot.pos * 20 - 10)
              const y = 30 + dot.pos * 200
              return (
                <motion.circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r={3}
                  fill="#C9A86A"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.6], scale: [0, 1.4, 1] }}
                  transition={{ delay: 0.2 + i * 0.18, duration: 0.5 }}
                />
              )
            })}

            {/* Blueprint strokes — sequential draw-on */}
            {LOGO_STROKES.map((stroke, i) => (
              <motion.path
                key={stroke.id}
                d={stroke.d}
                stroke="#C9A86A"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  phase === 'draw'
                    ? { pathLength: 1, opacity: 0.7 }
                    : phase === 'reveal'
                    ? { pathLength: 1, opacity: 0 }
                    : { pathLength: 1, opacity: 0 }
                }
                transition={{
                  pathLength: { delay: 0.05 + i * 0.18, duration: 0.55, ease: 'easeOut' },
                  opacity: {
                    delay: phase === 'reveal' ? 0 : 0.05 + i * 0.18,
                    duration: phase === 'reveal' ? 0.4 : 0.01,
                  },
                }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,106,0.5))' }}
              />
            ))}
          </svg>

          {/* Real PNG logo — fades in over the blueprint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={
              phase === 'reveal' || phase === 'dissolve'
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.88 }
            }
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              filter: `
                drop-shadow(0 0 18px rgba(201,168,106,0.45))
                drop-shadow(0 0 6px rgba(201,168,106,0.25))
              `,
            }}
          >
            <motion.div className="relative" style={{ width: 160, height: 186 }}>
              <Image
                src="/masar-logo.png"
                alt="MASAR"
                fill
                priority
                sizes="160px"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Brand name below logo */}
        <motion.p
          className="mt-8 text-sm tracking-[0.35em] uppercase font-mono"
          style={{ color: '#C9A86A', opacity: 0.7 }}
          initial={{ opacity: 0, y: 12 }}
          animate={
            phase === 'reveal'
              ? { opacity: 0.7, y: 0 }
              : phase === 'dissolve'
              ? { opacity: 0, y: -8 }
              : { opacity: 0, y: 12 }
          }
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          MASAR STUDIO
        </motion.p>

        {/* Skip button */}
        <motion.button
          onClick={() => setSkipped(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest transition-colors"
          style={{ color: 'var(--ink-soft)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ color: 'rgba(201,168,106,0.9)' }}
          aria-label={t('about.skipIntro')}
        >
          {t('about.skipIntro')}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
