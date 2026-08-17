'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from 'motion/react'
import {
  Users,
  Ruler,
  LayoutGrid,
  Box,
  PencilRuler,
  Palette,
  FolderCheck,
  type LucideIcon,
} from 'lucide-react'
import { JOURNEY_STAGES, type JourneyStage } from '@/lib/services-page-data'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

const ICONS: Record<string, LucideIcon> = {
  meeting: Users,
  blueprint: Ruler,
  floorplan: LayoutGrid,
  cube: Box,
  technical: PencilRuler,
  materials: Palette,
  portfolio: FolderCheck,
}

export function MasarJourney() {
  const { t, lang } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.6', 'end 0.9'],
  })

  // The drawn path + travelling orb are driven by scroll progress
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const orbTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const orbX = useTransform(
    scrollYProgress,
    [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    reduceMotion ? [0, 0, 0, 0, 0, 0, 0] : [0, 34, -34, 34, -34, 34, 0],
  )
  const logoOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1])

  return (
    <section id="journey" className="relative overflow-hidden bg-deep px-6 py-10 sm:py-32 md:px-12 lg:px-20">
      {/* Blueprint + particle backdrop */}
      <JourneyBackdrop />

      {/* Heading */}
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: EASE }}
          className="font-heading text-5xl font-bold text-foreground md:text-6xl lg:text-7xl"
        >
          {t('servicesPage.journeyTitle')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink md:text-xl"
        >
          {t('servicesPage.journeyDesc')}
        </motion.p>
      </div>

      {/* Journey track */}
      <div ref={ref} className="relative mx-auto mt-8 sm:mt-16 md:mt-28 max-w-5xl">
        {/* Central line — faint base */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/12 to-transparent" />
        {/* Central line — illuminated progress */}
        <motion.div
          style={{ scaleY: lineScale }}
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-gradient-to-b from-gold/80 via-gold/50 to-gold/10 shadow-[0_0_18px_rgba(201,168,106,0.6)]"
        />

        {/* Travelling glowing orb */}
        <motion.div
          style={{ top: orbTop, x: orbX }}
          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
          aria-hidden
        >
          <div className="relative -translate-y-1/2">
            <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-gold/40" />
            <div className="h-4 w-4 rounded-full bg-gold shadow-[0_0_30px_10px_rgba(201,168,106,0.6)]" />
          </div>
        </motion.div>

        {/* Stage cards — zigzag on BOTH mobile and desktop */}
        <div className="relative space-y-10 md:space-y-28">
          {JOURNEY_STAGES.map((stage, i) => (
            <StageRow key={stage.number} stage={stage} index={i} />
          ))}
        </div>
      </div>

      {/* Ending — path resolves into the MASAR mark */}
      <motion.div
        style={{ opacity: logoOpacity }}
        className="relative mx-auto mt-16 sm:mt-32 flex max-w-2xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
          className="mb-8 h-16 w-px bg-gradient-to-b from-gold to-transparent"
        />
        <h3 className="gold-gradient-text font-heading text-6xl font-bold tracking-tight md:text-7xl">
          {t('servicesPage.journeyBrand')}
        </h3>
        <p className="mt-8 text-lg leading-relaxed text-ink">
          {t('servicesPage.journeyEnding')}
        </p>
      </motion.div>
    </section>
  )
}

function StageRow({ stage, index }: { stage: JourneyStage; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rowRef, { once: true, margin: '-120px' })
  const Icon = ICONS[stage.icon] ?? Users
  const isRight = index % 2 === 0 // alternate sides on desktop

  return (
    <div
      ref={rowRef}
      className="relative grid grid-cols-2 items-center gap-3 md:gap-16"
    >
      {/* Node pulse on the line */}
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
        className="absolute left-1/2 top-1/2 z-10 h-2.5 w-2.5 md:h-3 md:w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_16px_4px_rgba(201,168,106,0.5)]"
      />

      {/* Card — placed on alternating column (same logic on all breakpoints) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.34, 1.3, 0.64, 1] }}
        className={
          isRight
            ? 'col-start-1 pr-1 md:pl-4 md:pr-0'
            : 'col-start-2 pl-1 md:pr-4 md:pl-0'
        }
      >
        <JourneyCard stage={stage} Icon={Icon} />
      </motion.div>
    </div>
  )
}

function JourneyCard({
  stage,
  Icon,
}: {
  stage: JourneyStage
  Icon: LucideIcon
}) {
  const { lang } = useI18n()
  const points = lang === 'ar' ? stage.points : stage.pointsEn
  return (
    <div className="group relative overflow-hidden rounded-[clamp(14px,3vw,24px)] border border-[color:rgba(201,168,106,0.18)] bg-surface-4/90 p-3.5 sm:p-6 md:p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_40px_100px_-40px_rgba(201,168,106,0.35)]">
      {/* Light sweep on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:animate-[light-sweep_1s_ease-out] group-hover:opacity-100" />

      <div className="mb-3 md:mb-6 flex items-center justify-between gap-2">
        <span className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-gold/25 transition-colors duration-500 group-hover:text-gold/60">
          {stage.number}
        </span>
        <span className="flex h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl border border-gold/25 bg-gold/[0.06] text-gold transition-transform duration-500 group-hover:rotate-6 shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" strokeWidth={1.5} />
        </span>
      </div>

      <h4 className="font-heading text-sm sm:text-lg md:text-2xl font-bold text-foreground leading-snug">
        {lang === 'ar' ? stage.titleAr : stage.titleEn}
      </h4>

      <ul className="mt-2.5 md:mt-5 space-y-1.5 md:space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-[11px] sm:text-sm md:text-[15px] text-ink">
            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-gold/70" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

function JourneyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]">
        <defs>
          <pattern id="journey-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 H0 V60" fill="none" stroke="rgba(201,168,106,0.6)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#journey-grid)" />
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(100% 60% at 50% 0%, rgba(201,168,106,0.05) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
