'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'motion/react'
import { SITE_CONFIG } from '@/lib/site-config'

// ─── Magnetic CTA ────────────────────────────────────────────────────────────
type Ripple = { id: number; x: number; y: number }

function HeaderCTA() {
  const ref = useRef<HTMLAnchorElement>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 240, damping: 18, mass: 0.35 })
  const sy = useSpring(my, { stiffness: 240, damping: 18, mass: 0.35 })

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.32)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.36)
  }
  function onLeave() { mx.set(0); my.set(0) }
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const id = Date.now()
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    setTimeout(() => setRipples((prev) => prev.filter((rp) => rp.id !== id)), 700)
  }

  return (
    <motion.a
      ref={ref}
      href="#contact"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className="group relative hidden overflow-hidden rounded-full border border-gold/50 bg-gradient-to-l from-gold/25 to-gold/10 px-6 py-2.5 font-heading text-sm font-medium text-gold backdrop-blur-sm transition-all duration-500 hover:border-gold/80 hover:bg-gradient-to-l hover:from-gold/40 hover:to-gold/20 hover:shadow-[0_0_28px_rgba(200,160,60,0.35)] md:inline-flex"
    >
      {/* light sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
      />
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute h-20 w-20 rounded-full bg-gold/30"
          style={{ left: r.x - 40, top: r.y - 40 }}
        />
      ))}
      <span className="relative z-10">ابدأ مشروعك</span>
    </motion.a>
  )
}

// ─── Nav Link ────────────────────────────────────────────────────────────────
function NavLink({
  label,
  href,
  isActive,
  scrolled,
}: {
  label: string
  href: string
  isActive: boolean
  scrolled: boolean
}) {
  return (
    <a
      href={href}
      className="group relative px-1 py-0.5 font-heading text-sm transition-all duration-300"
      style={{
        color: isActive ? 'var(--gold)' : scrolled ? 'oklch(0.88 0.01 80)' : 'oklch(0.92 0.01 80)',
        letterSpacing: '0.04em',
      }}
    >
      <span className="relative z-10 transition-[letter-spacing] duration-300 group-hover:tracking-widest">
        {label}
      </span>
      {/* underline */}
      <span
        aria-hidden
        className="absolute bottom-0 left-1/2 h-px -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-full"
        style={{
          width: isActive ? '100%' : '0%',
          background: 'var(--gold)',
          boxShadow: isActive ? '0 0 8px var(--gold)' : 'none',
        }}
      />
    </a>
  )
}

// ─── Mobile Menu ─────────────────────────────────────────────────────────────
function MobileMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
        >
          {/* blurred dark overlay */}
          <div className="absolute inset-0 bg-[oklch(0.1_0.006_60/0.96)] backdrop-blur-2xl" />

          {/* thin gold top bar */}
          <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          {/* header row */}
          <div className="relative z-10 flex items-center justify-between px-6 py-5">
            <a href="/" className="flex items-center gap-2 font-heading text-2xl font-semibold text-gold" onClick={onClose}>
              <img
                src="/masar-logo.png"
                alt="شعار مسار"
                className="w-8 h-8 object-contain"
              />
            </a>
            <button
              type="button"
              aria-label="إغلاق القائمة"
              onClick={onClose}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-gold/5 transition-colors hover:border-gold/50 hover:bg-gold/10"
            >
              <svg
                className="h-4 w-4 text-gold transition-transform duration-300 group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* nav links */}
          <nav className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2" dir="rtl">
            {SITE_CONFIG.nav.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                className="group relative py-3 font-heading text-4xl font-semibold tracking-wide text-foreground/80 transition-colors duration-300 hover:text-gold sm:text-5xl"
              >
                <span>{item.labelAr}</span>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 rounded-full bg-gold transition-all duration-400 group-hover:w-3/4"
                />
              </motion.a>
            ))}
          </nav>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="relative z-10 flex justify-center pb-12"
          >
            <a
              href="#contact"
              onClick={onClose}
              className="rounded-full border border-gold/60 bg-gold/15 px-10 py-4 font-heading text-lg text-gold backdrop-blur-sm transition-all hover:bg-gold/25"
            >
              ابدأ مشروعك
            </a>
          </motion.div>

          {/* bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gold/5 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Header ─────────────────────────────────────────────────────────────
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHref, setActiveHref] = useState('#hero')
  const [isMounted, setIsMounted] = useState(false)

  // Prevent SSR/hydration mismatch and router initialization errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    function onScroll() {
      const y = window.scrollY
      setScrollY(y)
      setScrolled(y > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMounted])

  // Compute blend factor 0→1 as scroll goes from 60→260px
  const t = Math.min(Math.max((scrollY - 60) / 200, 0), 1)
  // Height: 72px → 58px
  const height = 72 - 14 * t
  // Blur: 12px → 28px
  const blur = 12 + 16 * t
  // Gold border opacity: 0.14 → 0.45
  const borderOpacity = 0.14 + 0.31 * t
  // Dark bg opacity: 0.35 → 0.75
  const bgOpacity = 0.35 + 0.4 * t
  // Logo scale: 1 → 0.9
  const logoScale = 1 - 0.1 * t
  // Nav gap: 40px → 28px
  const navGap = 40 - 12 * t

  if (!isMounted) {
    // Placeholder during SSR/hydration to prevent layout shift
    return (
      <div className="fixed left-0 right-0 top-5 z-50 flex justify-center px-4 h-20" />
    )
  }

  return (
    <>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <header
        className="fixed left-0 right-0 top-5 z-50 flex justify-center px-4 will-change-transform"
        role="banner"
      >
        <motion.div
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="w-full max-w-6xl"
        >
          <div
            className="relative flex items-center justify-between rounded-[2rem] px-6 transition-shadow duration-500"
            dir="rtl"
            style={{
              height: `${height}px`,
              background: `oklch(0.13 0.006 60 / ${bgOpacity})`,
              backdropFilter: `blur(${blur}px) saturate(160%)`,
              WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
              border: `1px solid oklch(0.81 0.12 84 / ${borderOpacity})`,
              boxShadow: `0 8px 40px oklch(0 0 0 / ${0.3 + 0.2 * t}), 0 0 0 1px oklch(0.81 0.12 84 / ${0.06 + 0.06 * t}) inset`,
            }}
          >
            {/* Logo */}
            <motion.a
              href="/"
              style={{ scale: logoScale }}
              className="group relative flex items-center gap-2 leading-none transition-all duration-500"
              aria-label="مسار — الصفحة الرئيسية"
            >
              <img
                src="/masar-logo.png"
                alt="شعار مسار"
                className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
              />
              {/* soft gold glow on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-lg opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: 'var(--gold)' }}
              />
            </motion.a>

            {/* Desktop Nav */}
            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex"
              style={{ gap: `${navGap}px`, transition: 'gap 0.4s ease' }}
              aria-label="التنقل الرئيسي"
              dir="rtl"
            >
              {SITE_CONFIG.nav.map((item) => (
                <NavLink
                  key={item.href}
                  label={item.labelAr}
                  href={item.href}
                  isActive={activeHref === item.href}
                  scrolled={scrolled}
                />
              ))}
            </nav>

            {/* Right: CTA + Mobile burger */}
            <div className="flex items-center gap-3">
              <HeaderCTA />

              {/* Mobile menu trigger */}
              <button
                type="button"
                aria-label="فتح القائمة"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-gold/25 bg-gold/5 transition-colors hover:border-gold/50 hover:bg-gold/10 md:hidden"
              >
                <span className="block h-px w-5 rounded-full bg-gold/80 transition-all" />
                <span className="block h-px w-3.5 self-start rounded-full bg-gold/60 transition-all" style={{ marginRight: '4px' }} />
                <span className="block h-px w-5 rounded-full bg-gold/80 transition-all" />
              </button>
            </div>
          </div>
        </motion.div>
      </header>
    </>
  )
}
