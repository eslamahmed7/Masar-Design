'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import type { DBHeroSettings } from '@/lib/admin/types'
import { useMobile } from '@/lib/use-mobile'
import { useI18n } from '@/lib/i18n'

// ─── Defaults ────────────────────────────────────────────────────────────────
const D = {
  headline_ar: 'مساحتك تبدأ هنا',
  subtitle_ar: 'استوديو التصميم الداخلي',
  description_ar: 'نحوّل المساحات إلى تجارب معيشية استثنائية تعكس شخصيتك وتُلهم حياتك اليومية.',
  cta_primary_text: 'استكشف مشاريعنا',
  cta_primary_href: '#projects',
  cta_video_text: 'شاهد الفيديو التعريفي',
  overlay_opacity: 0.45,
  brightness: 1.0,
  blur: 0,
  hero_height: '100vh',
  image_url: null as string | null,
  video_url: null as string | null,
}

// ─── Stable particles ─────────────────────────────────────────────────────────
const PARTICLES = [
  { id: 0,  x: 8,  y: 20, s: 3, d: 0,   dur: 4   },
  { id: 1,  x: 22, y: 55, s: 4, d: 0.8, dur: 5   },
  { id: 2,  x: 12, y: 35, s: 2, d: 1.6, dur: 3.5 },
  { id: 3,  x: 28, y: 70, s: 5, d: 0.4, dur: 6   },
  { id: 4,  x: 18, y: 15, s: 3, d: 2.0, dur: 4.5 },
  { id: 5,  x: 35, y: 45, s: 4, d: 1.2, dur: 5.5 },
  { id: 6,  x: 6,  y: 65, s: 2, d: 0.6, dur: 4   },
  { id: 7,  x: 40, y: 80, s: 3, d: 1.8, dur: 6.5 },
  { id: 8,  x: 15, y: 40, s: 5, d: 0.2, dur: 3.8 },
  { id: 9,  x: 30, y: 25, s: 3, d: 1.4, dur: 5.2 },
  { id: 10, x: 45, y: 58, s: 4, d: 0.9, dur: 4.8 },
  { id: 11, x: 5,  y: 88, s: 2, d: 2.2, dur: 3.2 },
]

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ x, y, s, d, dur }: { x: number; y: number; s: number; d: number; dur: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: s, height: s,
        background: 'radial-gradient(circle, oklch(0.81 0.12 84 / 0.6) 0%, transparent 70%)',
      }}
      animate={{ y: [0, -16, 0], opacity: [0.25, 0.65, 0.25] }}
      transition={{ duration: dur, delay: d, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({ videoUrl, label, onClose, t }: {
  videoUrl: string | null
  label: string
  onClose: () => void
  t: (key: string) => string
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('hero.videoModalAria')}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />

      <motion.div
        className="relative z-10 w-full max-w-4xl"
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{ boxShadow: '0 0 0 1px oklch(0.81 0.12 84 / 0.35), 0 32px 80px -16px oklch(0.81 0.12 84 / 0.2)' }}
        />

        <div className="relative overflow-hidden rounded-2xl bg-black/60 aspect-video flex items-center justify-center">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              aria-label={label}
            />
          ) : (
            <div className="flex flex-col items-center gap-6 px-8 text-center py-20">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 24px oklch(0.81 0.12 84 / 0.55))' }}
              >
                <img src="/masar-logo.png" alt="مسار" className="w-14 h-14 object-contain" />
              </motion.div>
              <div>
                <p className="font-heading text-2xl text-white mb-2">{t('hero.videoComingSoon')}</p>
                <p className="text-sm text-white/50 max-w-xs leading-relaxed mx-auto">
                  {t('hero.videoComingSoonDesc')}
                </p>
              </div>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -left-4 flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-black/80 text-white/60 hover:text-gold hover:border-gold/60 transition-all backdrop-blur-sm"
          aria-label={t('lightbox.closeAria')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Cinematic Placeholder (no external file needed) ─────────────────────────
function CinematicPlaceholder() {
  const isMobile = useMobile()

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(125deg,
          #0a0804 0%,
          #0f0d09 15%,
          #16130d 30%,
          #1c1710 45%,
          #201a11 55%,
          #1a1510 68%,
          #111008 80%,
          #0a0804 100%
        )`,
      }}
    >
      {/* Architectural SVG silhouette — suggests a building without being literal */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="gl1" cx="65%" cy="40%" r="35%">
            <stop offset="0%" stopColor="oklch(0.81 0.12 84)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="oklch(0.81 0.12 84)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gl2" cx="70%" cy="55%" r="20%">
            <stop offset="0%" stopColor="oklch(0.75 0.10 80)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.75 0.10 80)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2015" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f0d09" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1509" stopOpacity="1" />
            <stop offset="100%" stopColor="#080706" stopOpacity="1" />
          </linearGradient>
          {!isMobile && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Ambient light pools */}
        <ellipse cx="900" cy="350" rx="350" ry="280" fill="url(#gl1)" />
        <ellipse cx="950" cy="500" rx="180" ry="140" fill="url(#gl2)" />

        {/* Floor perspective lines */}
        <g opacity="0.12" stroke="#c8a96a" strokeWidth="0.5">
          <line x1="720" y1="900" x2="0" y2="600" />
          <line x1="720" y1="900" x2="200" y2="600" />
          <line x1="720" y1="900" x2="400" y2="600" />
          <line x1="720" y1="900" x2="600" y2="600" />
          <line x1="720" y1="900" x2="900" y2="600" />
          <line x1="720" y1="900" x2="1100" y2="600" />
          <line x1="720" y1="900" x2="1300" y2="600" />
          <line x1="720" y1="900" x2="1440" y2="620" />
        </g>

        {/* Ceiling perspective */}
        <g opacity="0.08" stroke="#c8a96a" strokeWidth="0.5">
          <line x1="720" y1="0" x2="0" y2="300" />
          <line x1="720" y1="0" x2="300" y2="300" />
          <line x1="720" y1="0" x2="600" y2="300" />
          <line x1="720" y1="0" x2="900" y2="300" />
          <line x1="720" y1="0" x2="1200" y2="300" />
          <line x1="720" y1="0" x2="1440" y2="300" />
        </g>

        {/* Back wall — center vanishing point composition */}
        <rect x="540" y="150" width="360" height="600" fill="url(#wallGrad)" opacity="0.6" />

        {/* Tall windows — warm interior glow */}
        <rect x="570" y="180" width="80" height="350" rx="2" fill="#c8a96a" opacity="0.07" filter={isMobile ? 'none' : 'url(#glow)'} />
        <rect x="670" y="180" width="80" height="350" rx="2" fill="#c8a96a" opacity="0.07" filter={isMobile ? 'none' : 'url(#glow)'} />
        <rect x="770" y="180" width="80" height="350" rx="2" fill="#c8a96a" opacity="0.07" filter={isMobile ? 'none' : 'url(#glow)'} />

        {/* Window frames gold */}
        <g stroke="#c8a96a" strokeWidth="0.8" fill="none" opacity="0.25">
          <rect x="570" y="180" width="80" height="350" rx="2" />
          <rect x="670" y="180" width="80" height="350" rx="2" />
          <rect x="770" y="180" width="80" height="350" rx="2" />
          {/* Dividers */}
          <line x1="610" y1="180" x2="610" y2="530" />
          <line x1="710" y1="180" x2="710" y2="530" />
          <line x1="810" y1="180" x2="810" y2="530" />
          <line x1="570" y1="355" x2="650" y2="355" />
          <line x1="670" y1="355" x2="750" y2="355" />
          <line x1="770" y1="355" x2="850" y2="355" />
        </g>

        {/* Side walls — perspective */}
        <polygon points="0,0 540,150 540,750 0,900" fill="#0c0a07" opacity="0.8" />
        <polygon points="1440,0 900,150 900,750 1440,900" fill="#0c0a07" opacity="0.8" />

        {/* Side wall gold trim lines */}
        <g stroke="#c8a96a" strokeWidth="0.6" opacity="0.15">
          {/* Left wall perspective lines */}
          <line x1="0" y1="120" x2="540" y2="180" />
          <line x1="0" y1="240" x2="540" y2="280" />
          <line x1="0" y1="400" x2="540" y2="430" />
          <line x1="0" y1="560" x2="540" y2="580" />
          <line x1="0" y1="700" x2="540" y2="700" />
          {/* Right wall */}
          <line x1="1440" y1="120" x2="900" y2="180" />
          <line x1="1440" y1="240" x2="900" y2="280" />
          <line x1="1440" y1="400" x2="900" y2="430" />
          <line x1="1440" y1="560" x2="900" y2="580" />
          <line x1="1440" y1="700" x2="900" y2="700" />
        </g>

        {/* Floor */}
        <polygon points="0,900 540,750 900,750 1440,900" fill="url(#floorGrad)" opacity="0.7" />

        {/* Floor reflection lines */}
        <g stroke="#c8a96a" strokeWidth="0.4" opacity="0.1">
          <line x1="0" y1="820" x2="1440" y2="820" />
          <line x1="0" y1="860" x2="1440" y2="860" />
        </g>

        {/* Ceiling molding lines */}
        <g stroke="#c8a96a" strokeWidth="0.5" opacity="0.18">
          <line x1="540" y1="150" x2="900" y2="150" />
          <line x1="540" y1="165" x2="900" y2="165" />
        </g>

        {/* Warm interior light bloom */}
        <ellipse cx="720" cy="350" rx="200" ry="180" fill="#c8a96a" opacity="0.06" filter="url(#glow)" />
      </svg>

      {/* Soft gold shimmer layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 65% 45%, oklch(0.81 0.12 84 / 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 30% 30% at 68% 50%, oklch(0.81 0.12 84 / 0.10) 0%, transparent 60%)
          `,
        }}
      />
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
interface Props {
  hero?: DBHeroSettings | null
}

export function HeroSection({ hero }: Props) {
  const { t, lang } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  // Config with fallbacks
  const cfg = {
    headline_ar:      hero?.headline_ar      ?? t('hero.defaults.headline'),
    subtitle_ar:      hero?.subtitle_ar      ?? t('hero.defaults.subtitle'),
    description_ar:   hero?.description_ar   ?? t('hero.defaults.description'),
    cta_primary_text: hero?.cta_primary_text ?? t('hero.defaults.ctaPrimary'),
    cta_primary_href: hero?.cta_primary_href ?? D.cta_primary_href,
    cta_video_text:   hero?.cta_video_text   ?? t('hero.defaults.ctaVideo'),
    overlay_opacity:  Math.min(hero?.overlay_opacity ?? D.overlay_opacity, 0.15),
    brightness:       hero?.brightness       ?? D.brightness,
    blur:             hero?.blur             ?? D.blur,
    hero_height:      hero?.hero_height      ?? D.hero_height,
    image_url:        hero?.image_url        ?? null,
    video_url:        hero?.video_url        ?? null,
  }

  useEffect(() => { setImageFailed(false) }, [cfg.image_url])

  const scrollTo = useCallback((target: string) => {
    if (!target) return
    if (target.startsWith('#')) {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.location.href = target
    }
  }, [])

  return (
    <>
      {/* ── Video Modal ── */}
      <AnimatePresence>
        {videoOpen && (
          <VideoModal
            videoUrl={cfg.video_url}
            label={cfg.cta_video_text}
            onClose={() => setVideoOpen(false)}
            t={t}
          />
        )}
      </AnimatePresence>

      <section
        id="hero"
        ref={sectionRef}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative w-full overflow-hidden"
        style={{ minHeight: cfg.hero_height, background: '#0a0804' }}
      >

        {/* ══════════════════════════════════════════════
            LAYER 0 — Full-bleed background media
        ══════════════════════════════════════════════ */}
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          style={{ y: bgY, scale: bgScale }}
        >
          {/* Video background — autoplay muted loop */}
          {cfg.video_url && !videoOpen ? (
            <video
              src={cfg.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: `brightness(${Math.max(1, cfg.brightness)}) contrast(1.1) saturate(1.1) blur(${cfg.blur}px)`,
                opacity: 1,
              }}
            />
          ) : cfg.image_url && !imageFailed ? (
            <Image
              src={cfg.image_url}
              alt={t('hero.imageAlt')}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              onError={() => setImageFailed(true)}
              style={{
                filter: `brightness(${Math.max(1, cfg.brightness)}) contrast(1.1) saturate(1.1) blur(${cfg.blur}px)`,
                opacity: 1,
              }}
            />
          ) : (
            <CinematicPlaceholder />
          )}
        </motion.div>

        {/* ══════════════════════════════════════════════
            LAYER 1 — Dark overlay (REMOVED as per user request)
        ══════════════════════════════════════════════ */}
        <div className="absolute inset-0 z-[1] pointer-events-none" />

        {/* ══════════════════════════════════════════════
            LAYER 2 — Directional vignette (REMOVED as per user request)
        ══════════════════════════════════════════════ */}
        <div className="absolute inset-0 z-[2] pointer-events-none" />

        {/* ══════════════════════════════════════════════
            LAYER 3 — Floating particles (left zone only)
        ══════════════════════════════════════════════ */}
        <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
          {PARTICLES.map(p => (
            <Particle key={p.id} x={p.x} y={p.y} s={p.s} d={p.d} dur={p.dur} />
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            LAYER 4 — Content
        ══════════════════════════════════════════════ */}
        <div
          className="relative z-[10] flex h-full items-center"
          style={{ minHeight: cfg.hero_height }}
        >
          <motion.div
            className="w-full px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            {/* Max width wrapper keeps content to the left ~half on large screens */}
            <div className="max-w-[580px] mr-auto">

              {/* Subtitle label */}
              <p
                className="reveal-hero mb-3 font-sans text-xs tracking-[0.3em] uppercase"
                style={{ color: 'oklch(0.81 0.12 84 / 0.70)', '--rv-delay': '0.25s' } as React.CSSProperties}
              >
                {cfg.subtitle_ar}
              </p>

              {/* Headline — clip reveal */}
              <div className="overflow-hidden mb-5">
                <h1
                  className="reveal-hero-clip font-heading font-bold leading-[1.08] text-white"
                  style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', '--rv-delay': '0.32s' } as React.CSSProperties}
                >
                  {cfg.headline_ar}
                </h1>
              </div>

              {/* Description */}
              <p
                className="reveal-hero mb-9 text-sm leading-[1.85] sm:text-base"
                style={{ color: 'oklch(0.72 0.005 60)', maxWidth: '42ch', '--rv-delay': '0.36s' } as React.CSSProperties}
              >
                {cfg.description_ar}
              </p>

              {/* CTAs */}
              <div
                className="reveal-hero flex flex-wrap items-center gap-3 sm:gap-4"
                style={{ '--rv-delay': '0.47s' } as React.CSSProperties}
              >
                {/* Primary */}
                <motion.button
                  id="hero-cta-primary"
                  onClick={() => scrollTo(cfg.cta_primary_href)}
                  whileHover={{ y: -2, boxShadow: '0 14px 40px oklch(0.81 0.12 84 / 0.38)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  className="relative overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold text-[#0B0B0B]"
                  style={{
                    background: 'linear-gradient(130deg, oklch(0.84 0.12 84) 0%, oklch(0.73 0.10 80) 100%)',
                  }}
                >
                  {/* Shimmer on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 w-1/4 translate-x-full skew-x-[-18deg] bg-white/30 group-hover:translate-x-[-200%] transition-transform duration-700"
                  />
                  <span className="relative z-10">{cfg.cta_primary_text}</span>
                </motion.button>

                {/* Video button */}
                <motion.button
                  id="hero-cta-video"
                  onClick={() => setVideoOpen(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  className="group flex items-center gap-3 rounded-full border border-gold/35 px-6 py-3.5 text-sm font-medium text-gold/85 backdrop-blur-sm transition-all hover:border-gold/70 hover:bg-gold/8 hover:text-gold"
                >
                  {/* Play circle */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-gold/8 transition-colors group-hover:bg-gold/18">
                    <svg width="9" height="10" viewBox="0 0 9 11" fill="currentColor" className="translate-x-[1px]">
                      <path d="M0 0v11l9-5.5L0 0z" />
                    </svg>
                  </span>
                  {cfg.cta_video_text}
                </motion.button>
              </div>

              {/* Stats strip */}
              <div
                className="reveal-hero mt-12 flex gap-8 border-t border-divider pt-7"
                style={{ '--rv-delay': '0.58s' } as React.CSSProperties}
              >
                {[
                  { num: '5+', label: t('hero.statsYears') },
                  { num: '100+', label: t('hero.statsProjects') },
                  { num: '95+', label: t('hero.statsClients') },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-heading text-2xl font-bold leading-none" style={{ color: 'oklch(0.81 0.12 84)' }}>{s.num}</p>
                    <p className="mt-1 text-[10px] tracking-wide text-white/35">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════
            LAYER 5 — Scroll indicator
        ══════════════════════════════════════════════ */}
        <motion.button
          style={{ opacity: contentOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollTo(cfg.cta_primary_href)}
          aria-label={t('hero.scrollAria')}
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-9 w-5 items-start justify-center rounded-full border border-gold/35 p-1.5"
          >
            <motion.span
              className="h-1.5 w-[3px] rounded-full bg-gold/70"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <p className="text-[8px] tracking-[0.3em] text-gold/40 uppercase">{t('hero.scroll')}</p>
        </motion.button>
      </section>
    </>
  )
}
