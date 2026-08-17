'use client'

import { useEffect, useState } from 'react'
import { motion, type MotionValue, useTransform, useMotionValue } from 'motion/react'
import { useMobile } from '@/lib/use-mobile'

type Particle = {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  drift: number
}

export function AboutBackground({
  mouseX,
  mouseY,
  drawProgress,
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  drawProgress?: MotionValue<number>
}) {
  const isMobile = useMobile()
  const defaultDrawProgress = useTransform(useMotionValue(1), [0, 1], [0, 1])
  const activeDrawProgress = drawProgress || defaultDrawProgress

  // Parallax offsets per layer (independent depths)
  const concreteX = useTransform(mouseX, [-1, 1], [12, -12])
  const concreteY = useTransform(mouseY, [-1, 1], [10, -10])
  const marbleX = useTransform(mouseX, [-1, 1], [24, -24])
  const marbleY = useTransform(mouseY, [-1, 1], [18, -18])
  const blueprintX = useTransform(mouseX, [-1, 1], [40, -40])
  const blueprintY = useTransform(mouseY, [-1, 1], [30, -30])
  const glowX = useTransform(mouseX, [-1, 1], [60, -60])
  const glowY = useTransform(mouseY, [-1, 1], [50, -50])

  // Golden construction lines: dashoffset driven by scroll draw progress
  const dash = useTransform(activeDrawProgress, [0, 1], [1400, 0])

  // Generate on the client only to avoid SSR hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([])
  useEffect(() => {
    const isMobileNow = window.innerWidth < 768
    const count = isMobileNow ? 0 : 26 // zero particles on mobile
    if (count > 0) {
      setParticles(
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2.5 + 1,
          delay: Math.random() * 6,
          duration: Math.random() * 8 + 8,
          drift: Math.random() * 30 - 15,
        })),
      )
    }
  }, [])

  if (isMobile) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Layer 1 — dark architectural concrete */}
        <div className="absolute -inset-12">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 120% at 20% 0%, oklch(0.22 0.01 60) 0%, oklch(0.16 0.006 60) 45%, oklch(0.12 0.005 55) 100%)',
            }}
          />
        </div>
        {/* Layer 2 — black marble texture */}
        <div className="absolute -inset-12 opacity-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(60% 40% at 70% 30%, oklch(0.4 0.03 70 / 0.4), transparent 60%), radial-gradient(50% 50% at 20% 80%, oklch(0.3 0.02 65 / 0.35), transparent 55%)',
            }}
          />
        </div>
        {/* Layer 6 — noise texture */}
        <div className="noise-layer absolute inset-0 opacity-[0.04]" />
        {/* Layer 8 — soft vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 100% at 50% 50%, transparent 55%, oklch(0.1 0.004 55 / 0.85) 100%)',
          }}
        />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1 — dark architectural concrete */}
      <motion.div
        style={{ x: concreteX, y: concreteY }}
        className="absolute -inset-12"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 20% 0%, oklch(0.22 0.01 60) 0%, oklch(0.16 0.006 60) 45%, oklch(0.12 0.005 55) 100%)',
          }}
        />
      </motion.div>

      {/* Layer 2 — black marble texture */}
      <motion.div
        style={{ x: marbleX, y: marbleY }}
        className={`absolute -inset-12 opacity-40 ${isMobile ? '' : 'mix-blend-soft-light'}`}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(60% 40% at 70% 30%, oklch(0.4 0.03 70 / 0.4), transparent 60%), radial-gradient(50% 50% at 20% 80%, oklch(0.3 0.02 65 / 0.35), transparent 55%)',
          }}
        />
      </motion.div>

      {/* Layer 3 — subtle blueprint grid */}
      <motion.div
        style={{ x: blueprintX, y: blueprintY }}
        className="absolute -inset-12 opacity-[0.09]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, oklch(0.86 0.09 88 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.86 0.09 88 / 0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </motion.div>

      {/* Layer 4 — golden construction lines that draw themselves */}
      <motion.svg
        style={{ x: blueprintX, y: blueprintY }}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <motion.path
          d="M0 210 H1440 M0 690 H1440 M360 0 V900 M1080 0 V900"
          stroke="var(--gold)"
          strokeWidth="1"
          strokeOpacity="0.35"
          strokeDasharray="1400"
          style={{ strokeDashoffset: dash }}
        />
        <motion.path
          d="M360 210 L1080 690 M1080 210 L360 690"
          stroke="var(--gold)"
          strokeWidth="0.75"
          strokeOpacity="0.2"
          strokeDasharray="1400"
          style={{ strokeDashoffset: dash }}
        />
        <motion.circle
          cx="720"
          cy="450"
          r="180"
          stroke="var(--gold)"
          strokeWidth="0.75"
          strokeOpacity="0.18"
          strokeDasharray="1400"
          style={{ strokeDashoffset: dash }}
        />
      </motion.svg>

      {/* Layer 5 — soft floating particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-gold/50"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, p.drift, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Layer 7 — large radial glow that follows cursor */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`h-full w-full rounded-full opacity-40 ${isMobile ? '' : 'blur-[120px] mix-blend-color-dodge'}`}
          style={{
            background:
              'radial-gradient(circle, oklch(0.81 0.12 84 / 0.35) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Layer 6 — noise texture */}
      <div className={`noise-layer absolute inset-0 opacity-[0.04] ${isMobile ? '' : 'mix-blend-overlay'}`} />

      {/* Layer 8 — soft vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 50%, transparent 55%, oklch(0.1 0.004 55 / 0.85) 100%)',
        }}
      />
    </div>
  )
}
