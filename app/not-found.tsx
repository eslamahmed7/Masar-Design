'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

// Blueprint line definitions drawn by the construction point
const BLUEPRINT_LINES: Array<{ d: string; delay: number; duration: number }> = [
  { d: 'M100 300 L300 300 L300 150 L200 80 L100 150 Z',       delay: 0.3, duration: 1.8 },
  { d: 'M350 300 L550 300 L550 120 L450 60 L350 120 Z',        delay: 0.8, duration: 1.8 },
  { d: 'M100 300 L550 300',                                     delay: 1.5, duration: 0.9 },
  { d: 'M200 200 L200 300',                                     delay: 1.6, duration: 0.5 },
  { d: 'M450 160 L450 300',                                     delay: 1.7, duration: 0.5 },
  { d: 'M100 200 L550 200',                                     delay: 1.9, duration: 0.8 },
  { d: 'M160 300 L160 150 L240 150',                           delay: 2.0, duration: 0.7 },
  { d: 'M410 300 L410 120 L490 120',                           delay: 2.1, duration: 0.7 },
]

const PARTICLES = [
  { cx: '12%', cy: '25%', r: 1.5, dur: 8,  delay: 0   },
  { cx: '88%', cy: '30%', r: 1.2, dur: 10, delay: 1.2 },
  { cx: '22%', cy: '70%', r: 2,   dur: 9,  delay: 0.6 },
  { cx: '75%', cy: '65%', r: 1.5, dur: 11, delay: 1.8 },
  { cx: '50%', cy: '18%', r: 1.2, dur: 8,  delay: 0.9 },
  { cx: '60%', cy: '80%', r: 2,   dur: 12, delay: 2.2 },
  { cx: '35%', cy: '45%', r: 1,   dur: 10, delay: 1.5 },
  { cx: '80%', cy: '50%', r: 1.5, dur: 9,  delay: 0.3 },
]

export default function NotFound() {
  const [phase, setPhase] = useState<'drawing' | 'pause' | 'transform' | 'reveal'>('drawing')
  const reduceMotion = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 22 })
  const sy = useSpring(my, { stiffness: 50, damping: 22 })

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduceMotion) {
      setPhase('reveal')
      return
    }
    // Sequence: draw → pause → transform → reveal
    const t1 = setTimeout(() => setPhase('pause'), 3400)
    const t2 = setTimeout(() => setPhase('transform'), 4200)
    const t3 = setTimeout(() => setPhase('reveal'), 5600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [reduceMotion])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 30)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 18)
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: 'var(--bg-deep)' }}
      onMouseMove={handleMouseMove}
      role="main"
      aria-label="صفحة 404 — الصفحة غير موجودة"
    >
      {/* ── Architectural grid ── */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
        <defs>
          <pattern id="nf-grid" width="55" height="55" patternUnits="userSpaceOnUse">
            <path d="M55 0 H0 V55" fill="none" stroke="rgba(201,168,106,0.8)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nf-grid)" />
      </svg>

      {/* ── Ambient radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(70% 60% at 50% 50%, rgba(201,168,106,0.06) 0%, transparent 60%)' }}
        aria-hidden
      />

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold/30"
            style={{ left: p.cx, top: p.cy, width: p.r * 2, height: p.r * 2 }}
            animate={{ y: [0, -18, 0], opacity: [0.1, 0.45, 0.1] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </div>

      {/* ── Mouse parallax layer ── */}
      <motion.div style={{ x: sx, y: sy }} className="relative z-10 flex flex-col items-center text-center px-6">

        {/* ── Blueprint drawing phase ── */}
        <AnimatePresence mode="wait">
          {(phase === 'drawing' || phase === 'pause') && (
            <motion.div
              key="blueprint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-8"
              aria-hidden
            >
              <svg
                viewBox="0 0 650 360"
                className="w-full max-w-lg h-auto"
                fill="none"
              >
                {BLUEPRINT_LINES.map((line, i) => (
                  <motion.path
                    key={i}
                    d={line.d}
                    stroke="rgba(201,168,106,0.45)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: line.delay, duration: line.duration, ease: 'easeInOut' }}
                  />
                ))}
                {/* Construction point traveling last line */}
                <motion.circle
                  cx="100" cy="300" r="4"
                  fill="var(--gold)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(201,168,106,0.9))' }}
                  animate={{ cx: [100, 550, 550, 100], cy: [300, 300, 80, 80] }}
                  transition={{ delay: 1.5, duration: 2.5, ease: 'easeInOut' }}
                />
              </svg>

              {/* "Lost the way" text appearing after pause */}
              <AnimatePresence>
                {phase === 'pause' && (
                  <motion.p
                    key="lost"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="font-heading text-lg text-gold/60"
                  >
                    يبدو أننا فقدنا الطريق...
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MASAR logo (appears during transform) ── */}
        <AnimatePresence>
          {(phase === 'transform' || phase === 'reveal') && (
            <motion.div
              key="logo"
              className="mb-8 relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE }}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute h-36 w-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(201,168,106,0.22) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              {/* MASAR wordmark drawn from blueprint lines */}
              <svg
                viewBox="0 0 200 80"
                className="relative z-10 w-48 h-auto"
                aria-label="MASAR"
              >
                <motion.text
                  x="100"
                  y="52"
                  textAnchor="middle"
                  fontFamily="var(--font-arabic-heading), serif"
                  fontSize="28"
                  fontWeight="700"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="0.8"
                  initial={{ pathLength: 0, opacity: 0, strokeDashoffset: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{
                    filter: phase === 'reveal' ? 'drop-shadow(0 0 12px rgba(201,168,106,0.7))' : 'none',
                  }}
                >
                  مسار
                </motion.text>
                <motion.text
                  x="100"
                  y="52"
                  textAnchor="middle"
                  fontFamily="var(--font-arabic-heading), serif"
                  fontSize="28"
                  fontWeight="700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === 'reveal' ? 1 : 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  style={{ fill: 'var(--gold)' }}
                >
                  مسار
                </motion.text>
                {/* Underline */}
                <motion.line
                  x1="60" y1="60" x2="140" y2="60"
                  stroke="rgba(201,168,106,0.4)"
                  strokeWidth="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content (reveal phase) ── */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              key="content"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {/* 404 */}
              <motion.p
                className="font-heading font-bold leading-none"
                style={{
                  fontSize: 'clamp(80px, 18vw, 180px)',
                  background: 'linear-gradient(135deg, rgba(201,168,106,0.25) 0%, rgba(201,168,106,0.55) 50%, rgba(201,168,106,0.2) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                404
              </motion.p>

              <motion.h1
                className="font-heading text-2xl font-bold text-foreground/90 text-balance sm:text-3xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
              >
                عذرًا...
              </motion.h1>

              <motion.p
                className="max-w-sm text-sm leading-relaxed text-foreground/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
              >
                الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
                <br />
                يمكنك العودة إلى الصفحة الرئيسية أو استكشاف مشاريعنا.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="mt-4 flex flex-wrap items-center justify-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
              >
                <NotFoundButton href="/" primary>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 8L8 2L14 8M8 2V14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  العودة للرئيسية
                </NotFoundButton>
                <NotFoundButton href="/projects">
                  استعراض أعمالنا
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 3l-5 5 5 5M1 8h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NotFoundButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function NotFoundButton({
  href,
  children,
  primary,
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300"
        style={{
          border: '1px solid',
          borderColor: primary ? 'var(--gold)' : 'rgba(201,168,106,0.25)',
          background: primary ? 'rgba(201,168,106,0.1)' : 'transparent',
          color: primary ? 'var(--gold)' : 'var(--ink-soft)',
          boxShadow: primary ? '0 4px 24px rgba(201,168,106,0.12)' : 'none',
        }}
      >
        {/* Sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:animate-[light-sweep_0.8s_ease-out] group-hover:opacity-100"
        />
        {children}
      </Link>
    </motion.div>
  )
}
