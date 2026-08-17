'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import { Sparkles, Eye, Gem, Layers, type LucideIcon } from 'lucide-react'
import { WHY_CARDS, WHY_STATS, type WhyCard } from '@/lib/services-page-data'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  eye: Eye,
  gem: Gem,
  layers: Layers,
}

export function WhyMasar() {
  const { t, lang } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [50, -50],
  )

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 py-10 sm:py-32 md:px-12 lg:px-20"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(90% 70% at 20% 20%, rgba(201,168,106,0.06) 0%, transparent 55%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.5em] text-gold/70"
        >
          Why MASAR
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: EASE }}
          className="font-heading text-5xl font-bold text-foreground text-balance md:text-6xl lg:text-7xl"
        >
          {t('servicesPage.whyTitle')}
        </motion.h2>
      </div>

      <div className="mx-auto mt-8 sm:mt-20 grid max-w-[1400px] items-start gap-6 sm:gap-12 lg:grid-cols-2 lg:gap-20 grid-cols-1 lg:grid-cols-2">
        {/* Feature image with parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative order-1"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-[32px] border border-[color:rgba(201,168,106,0.18)] shadow-[0_50px_140px_-50px_rgba(0,0,0,0.95)] will-transform">
            <motion.div style={{ y: imageY }} className="absolute inset-0">
              <Image
                src="/services/why-masar.png"
                alt={t('servicesPage.whyImageAlt')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="scale-110 object-cover"
                quality={75}
                loading="lazy"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Floating stats */}
          <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4">
            {WHY_STATS.map((s, i) => (
              <StatBlock key={s.labelAr} {...s} lang={lang} delay={i * 0.15} />
            ))}
          </div>
        </motion.div>

        {/* Asymmetric card stack */}
        <div className="order-2 lg:order-2 grid gap-3 sm:gap-6 grid-cols-2">
          {WHY_CARDS.map((card, i) => (
            <WhyCardItem key={card.number} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyCardItem({ card, index }: { card: WhyCard; index: number }) {
  const { lang } = useI18n()
  const Icon = ICONS[card.icon] ?? Sparkles
  // Asymmetric offsets so the grid feels organic, not rigid
  const offset = index % 2 === 0 ? 'sm:translate-y-6' : 'sm:-translate-y-2'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
      className={`group relative overflow-hidden rounded-[24px] border border-[color:rgba(201,168,106,0.16)] bg-surface-4/80 p-3 sm:p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_40px_100px_-45px_rgba(201,168,106,0.35)] ${offset}`}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:animate-[light-sweep_1s_ease-out] group-hover:opacity-100" />

      <div className="mb-2 sm:mb-6 flex items-center justify-between">
        <span className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl border border-gold/25 bg-gold/[0.06] text-gold transition-transform duration-500 group-hover:scale-110">
          <Icon className="h-3 w-3 sm:h-5 sm:w-5" strokeWidth={1.5} />
        </span>
        <span className="font-heading text-lg sm:text-3xl font-bold text-gold/20 transition-colors duration-500 group-hover:text-gold/50">
          {card.number}
        </span>
      </div>

      <h3 className="font-heading text-[10px] sm:text-xl font-bold text-foreground">
        {lang === 'ar' ? card.titleAr : card.titleEn}
      </h3>
      <p className="mt-1.5 sm:mt-3 text-[8px] sm:text-[15px] leading-relaxed text-ink line-clamp-3 sm:line-clamp-none">
        {lang === 'ar' ? card.descriptionAr : card.descriptionEn}
      </p>
    </motion.div>
  )
}

function StatBlock({
  value,
  suffix,
  labelAr,
  labelEn,
  lang,
  delay,
}: {
  value: number
  suffix: string
  labelAr: string
  labelEn: string
  lang: string
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const duration = 1800
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setDisplay(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="rounded-xl sm:rounded-2xl border border-[color:rgba(201,168,106,0.16)] bg-surface-4/70 p-2 sm:p-4 text-center"
    >
      <span className="gold-gradient-text font-heading text-sm sm:text-2xl font-bold tabular-nums md:text-3xl">
        {display}
        {suffix}
      </span>
      <p className="mt-1 sm:mt-1.5 text-[8px] sm:text-xs text-muted-foreground md:text-sm">{lang === 'ar' ? labelAr : labelEn}</p>
    </motion.div>
  )
}
