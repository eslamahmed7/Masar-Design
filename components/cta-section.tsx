'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'motion/react'
import { useI18n } from '@/lib/i18n'

// ─── Blueprint canvas ─────────────────────────────────────────────────────────
function BlueprintLines({ progress }: { progress: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      aria-hidden
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <clipPath id="cta-reveal">
          <rect x="0" y="0" width={1400 * progress} height="900" />
        </clipPath>
      </defs>
      <g clipPath="url(#cta-reveal)" stroke="var(--gold)" strokeWidth="0.6" fill="none">
        {/* radial arcs */}
        <circle cx="700" cy="450" r="180" />
        <circle cx="700" cy="450" r="320" />
        <circle cx="700" cy="450" r="480" />
        {/* horizontal grid */}
        {[100, 200, 300, 400, 500, 600, 700, 800].map((y) => (
          <line key={y} x1="0" y1={y} x2="1400" y2={y} />
        ))}
        {/* vertical grid */}
        {[140, 280, 420, 560, 700, 840, 980, 1120, 1260].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="900" />
        ))}
        {/* diagonals */}
        <line x1="700" y1="0" x2="1400" y2="900" />
        <line x1="700" y1="0" x2="0" y2="900" />
        <line x1="0" y1="450" x2="1400" y2="450" />
        {/* cross marks */}
        {[
          [200, 200], [1200, 200], [200, 700], [1200, 700], [700, 150], [700, 750],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
            <line x1={x} y1={y - 10} x2={x} y2={y + 10} />
          </g>
        ))}
        {/* measurement ticks */}
        {[280, 420, 560, 700, 840, 980, 1120].map((x) => (
          <g key={`tick-${x}`}>
            <line x1={x} y1="445" x2={x} y2="455" strokeWidth="0.8" />
          </g>
        ))}
      </g>
    </svg>
  )
}

// ─── Light Rays ───────────────────────────────────────────────────────────────
function LightRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[
        { rotate: -22, left: '42%', opacity: 0.055, delay: '0s' },
        { rotate: -14, left: '50%', opacity: 0.08, delay: '0.6s' },
        { rotate: -6, left: '58%', opacity: 0.055, delay: '1.2s' },
        { rotate: 3, left: '66%', opacity: 0.035, delay: '0.3s' },
      ].map((ray, i) => (
        <motion.div
          key={i}
          className="absolute top-0 h-full w-[1.5px] origin-top"
          style={{
            left: ray.left,
            rotate: ray.rotate,
            background: `linear-gradient(to bottom, transparent 0%, oklch(0.81 0.12 84 / ${ray.opacity}) 30%, transparent 100%)`,
          }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: parseFloat(ray.delay),
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Floating CTA Objects ─────────────────────────────────────────────────────
const CTA_OBJECTS = [
  { src: '/objects/chair.png', altKey: 'chair', w: 110, className: 'left-[4%] top-[20%]', float: 22, rotate: 4, dur: 9, delay: 0 },
  { src: '/objects/vase.png', altKey: 'vase', w: 90, className: 'right-[3%] top-[15%]', float: 18, rotate: -5, dur: 11, delay: 0.8 },
  { src: '/objects/lamp.png', altKey: 'lamp', w: 100, className: 'left-[8%] bottom-[15%]', float: 16, rotate: 3, dur: 10, delay: 1.4 },
  { src: '/objects/plant.png', altKey: 'plant', w: 95, className: 'right-[5%] bottom-[18%]', float: 20, rotate: -4, dur: 12, delay: 0.5 },
  { src: '/objects/marble.png', altKey: 'marble', w: 72, className: 'right-[22%] bottom-[6%]', float: 12, rotate: 7, dur: 14, delay: 1.8 },
  { src: '/objects/wood.png', altKey: 'wood', w: 68, className: 'left-[22%] top-[6%]', float: 10, rotate: -6, dur: 13, delay: 2.2 },
]

function CtaObjects({ mouseX, mouseY }: { mouseX: ReturnType<typeof useMotionValue<number>>; mouseY: ReturnType<typeof useMotionValue<number>> }) {
  const { t } = useI18n()
  return (
    <>
      {CTA_OBJECTS.map((obj, i) => (
        <motion.div
          key={obj.src}
          className={`pointer-events-none absolute z-10 ${obj.className}`}
          style={{
            // eslint-disable-next-line react-hooks/rules-of-hooks
            x: useTransformProxy(mouseX, obj.w * 0.06),
            // eslint-disable-next-line react-hooks/rules-of-hooks
            y: useTransformProxy(mouseY, obj.w * 0.05),
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -obj.float, 0], rotate: [0, obj.rotate, 0] }}
            transition={{ duration: obj.dur, repeat: Infinity, ease: 'easeInOut', delay: obj.delay }}
            className="relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] scale-[0.4] sm:scale-[0.8] origin-center"
            style={{ width: obj.w, height: obj.w }}
          >
            <Image src={obj.src} alt={t(`cta.objects.${obj.altKey}`)} fill sizes="120px" className="object-contain mix-blend-lighten" />
          </motion.div>
        </motion.div>
      ))}
    </>
  )
}

// small helper to avoid the rules-of-hooks problem inside a map
function useTransformProxy(mv: ReturnType<typeof useMotionValue<number>>, factor: number) {
  return useTransform(mv, [-1, 1], [-factor, factor])
}

// ─── Magnetic Button ─────────────────────────────────────────────────────────
type Ripple = { id: number; x: number; y: number }

function CtaButton({ label, href, variant }: { label: string; href: string; variant: 'gold' | 'glass' }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const mx = useMotionValue(0); const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 })

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  function onLeave() { mx.set(0); my.set(0) }
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const id = Date.now()
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    setTimeout(() => setRipples((p) => p.filter((rp) => rp.id !== id)), 700)
  }

  const isGold = variant === 'gold'

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={[
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 sm:px-10 sm:py-5 font-heading text-xs sm:text-lg font-medium transition-all duration-500',
        isGold
          ? 'bg-gradient-to-l from-[oklch(0.78_0.12_82)] to-[oklch(0.68_0.10_82)] text-[oklch(0.12_0.006_60)] shadow-[0_0_40px_oklch(0.81_0.12_84/0.35)] hover:shadow-[0_0_60px_oklch(0.81_0.12_84/0.55)]'
          : 'border border-gold/40 bg-gold/8 text-gold backdrop-blur-sm hover:border-gold/70 hover:bg-gold/15 hover:shadow-[0_0_30px_oklch(0.81_0.12_84/0.2)]',
      ].join(' ')}
    >
      {/* idle light sweep every few seconds */}
      {isGold && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/30"
          animate={{ left: ['−100%', '200%'] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        />
      )}
      {/* hover sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
      />
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute h-24 w-24 rounded-full bg-white/25"
          style={{ left: r.x - 48, top: r.y - 48 }}
        />
      ))}
      <span className="relative z-10">{label}</span>
    </motion.a>
  )
}

// ─── Main CTA Section ─────────────────────────────────────────────────────────

export function CtaSection() {
  const { t, tArr, lang } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const [blueprintProgress, setBlueprintProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const HEADLINE_LINES = tArr('cta.titleLines')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only initialize useScroll after mount to prevent hydration errors
  const { scrollYProgress } = useScroll(
    isMounted
      ? { target: sectionRef, offset: ['start end', 'end start'] }
      : { offset: ['start end', 'end start'] },
  )

  // Glow scale on scroll-in
  const glowScale = useTransform(scrollYProgress, [0, 0.3], [0.4, 1])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1])
  // Fade out as footer rises
  const sectionOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])

  // Blueprint draws itself as section scrolls into view
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setBlueprintProgress(Math.min(Math.max((v - 0) / 0.45, 0), 1))
    })
    return unsubscribe
  }, [scrollYProgress])

  // Mouse parallax
  const rawMouseX = useMotionValue(0)
  const rawMouseY = useMotionValue(0)
  const mouseX = useSpring(rawMouseX, { stiffness: 60, damping: 20 })
  const mouseY = useSpring(rawMouseY, { stiffness: 60, damping: 20 })

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    rawMouseX.set((e.clientX / window.innerWidth) * 2 - 1)
    rawMouseY.set((e.clientY / window.innerHeight) * 2 - 1)
  }

  if (!isMounted) return <section className="h-screen" />

  return (
    <motion.section
      id="contact"
      ref={sectionRef}
      style={{ opacity: sectionOpacity }}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[oklch(0.11_0.005_60)]"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      aria-label={t('cta.aria')}
    >
      {/* ── Layer 1: noise ── */}
      <div className="noise-layer pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden />

      {/* ── Layer 2: Blueprint ── */}
      <BlueprintLines progress={blueprintProgress} />

      {/* ── Layer 3: Radial glow ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          scale: glowScale,
          opacity: glowOpacity,
          background: 'radial-gradient(ellipse, oklch(0.81 0.12 84 / 0.1) 0%, transparent 70%)',
        }}
      />

      {/* ── Layer 4: Vignette ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, oklch(0.08 0.004 60 / 0.85) 100%)' }}
      />

      {/* ── Layer 5: Light rays ── */}
      <LightRays />

      {/* ── Floating objects ── */}
      <CtaObjects mouseX={mouseX} mouseY={mouseY} />

      {/* ── Core content ── */}
      <div className="relative z-20 flex flex-col items-center px-6 py-24 text-center">
        {/* eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-2 sm:mb-8 font-heading text-[8px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] text-gold"
        >
          {t('cta.eyebrow')}
        </motion.p>

        {/* Headline */}
        <h2 className="mb-4 sm:mb-8 font-heading text-3xl sm:text-6xl font-semibold leading-tight text-foreground text-balance md:text-7xl lg:text-8xl">
          {HEADLINE_LINES.map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* gold sweep on first line */}
              {i === 0 ? (
                <motion.span
                  className="relative inline-block"
                  initial={{ backgroundPosition: '200% center' }}
                  whileInView={{ backgroundPosition: '0% center' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, var(--foreground) 0%, var(--gold-soft) 40%, var(--gold) 50%, var(--gold-soft) 60%, var(--foreground) 100%)',
                    backgroundSize: '200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {line}
                </motion.span>
              ) : line}
            </motion.span>
          ))}
        </h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 sm:mb-14 max-w-xl font-sans text-[10px] sm:text-base leading-relaxed text-foreground/60 md:text-lg"
        >
          {t('cta.subtitle')}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          <CtaButton label={t('cta.startBtn')} href="/start" variant="gold" />
          <CtaButton label={t('cta.contactBtn')} href="/contact" variant="glass" />
        </motion.div>

        {/* thin gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 h-px w-32 origin-center rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold-soft), transparent)' }}
        />
      </div>

      {/* ── Gradient into footer ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{ background: 'linear-gradient(to bottom, transparent, oklch(0.1 0.005 60))' }}
      />
    </motion.section>
  )
}
