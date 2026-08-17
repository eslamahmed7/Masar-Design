'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ServiceShowcase as ServiceShowcaseType } from '@/lib/services-page-data'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

export function ServiceShowcase({
  service,
  index,
}: {
  service: ServiceShowcaseType
  index: number
}) {
  const { lang } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Slow parallax + subtle zoom on the image while scrolling
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [60, -60],
  )
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [1, 1, 1] : [1.08, 1.02, 1.08],
  )

  const imageFirst = service.imageSide === 'right'

  return (
    <section
      ref={sectionRef}
      id={service.id}
      className="relative flex min-h-[40vh] sm:min-h-screen items-center overflow-hidden px-2 sm:px-6 py-10 sm:py-24 md:px-12 lg:px-20"
    >
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-4 sm:gap-12 lg:grid-cols-2 lg:gap-20 grid-cols-2">
        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1.2, ease: EASE }}
          className={`group relative ${
            imageFirst ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[30px] border border-[color:rgba(201,168,106,0.18)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] will-transform"
          >
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
              <Image
                src={service.image || '/placeholder.svg'}
                alt={service.subtitleEn}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                quality={90}
                loading="lazy"
              />
            </motion.div>

            {/* Soft dark vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Gold edge glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-[30px] opacity-0 ring-1 ring-inset ring-gold/40 transition-opacity duration-700 group-hover:opacity-100" />

            {/* Blueprint line animation overlay */}
            {service.blueprint && (
              <BlueprintOverlay />
            )}
          </motion.div>

          {/* English label tag */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="mt-3 sm:mt-6 block font-mono text-[8px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gold/70"
          >
            {String(index + 1).padStart(2, '0')} — {service.subtitleEn}
          </motion.span>
        </motion.div>

        {/* CONTENT */}
        <div className={imageFirst ? 'lg:order-1' : 'lg:order-2'}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="font-heading text-lg sm:text-4xl font-bold leading-tight text-foreground text-balance md:text-5xl lg:text-6xl"
          >
            {service.titleAr === service.titleEn || lang === 'ar' ? service.titleAr : service.titleEn}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            className="mt-3 sm:mt-6 max-w-xl text-[9px] sm:text-lg leading-relaxed text-ink"
          >
            {lang === 'ar' ? service.descriptionAr : service.descriptionEn}
          </motion.p>

          {/* Features */}
          <ul className="mt-4 sm:mt-10 space-y-2 sm:space-y-4">
            {(lang === 'ar' ? service.features : service.featuresEn).map((feature, i) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.6,
                  delay: 0.45 + i * 0.1,
                  ease: EASE,
                }}
                className="flex items-center gap-4"
              >
                <span className="h-px w-4 sm:w-8 flex-shrink-0 bg-gradient-to-l from-gold to-transparent" />
                <span className="text-[8px] sm:text-base text-foreground/90 md:text-lg">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 0.7,
              delay: 0.55 + service.features.length * 0.1,
              ease: EASE,
            }}
            className="mt-6 sm:mt-12"
          >
            <ServiceButton href="/start">{lang === 'ar' ? service.cta : service.ctaEn}</ServiceButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* Shared luxury button — dark matte, thin gold border, soft hover, arrow slide */
export function ServiceButton({
  children,
  href,
  variant = 'primary',
}: {
  children: React.ReactNode
  href: string
  variant?: 'primary' | 'secondary'
}) {
  const { lang } = useI18n()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight
  return (
    <Link
      href={href as never}
      className={`group/btn inline-flex items-center gap-2 sm:gap-3 rounded-full border px-4 py-2 sm:px-8 sm:py-4 font-heading text-[10px] sm:text-base transition-all duration-500 hover:-translate-y-[3px] ${
        variant === 'primary'
          ? 'border-gold/40 bg-gold/[0.06] text-gold hover:border-gold hover:bg-gold hover:text-primary-foreground hover:shadow-[0_18px_50px_-18px_rgba(201,168,106,0.7)]'
          : 'border-divider bg-surface/55 text-foreground hover:border-gold/50 hover:text-gold'
      }`}
    >
      <span>{children}</span>
      <Arrow className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-500 group-hover/btn:-translate-x-1.5" />
    </Link>
  )
}

/* Animated blueprint lines that draw slowly over technical-plan imagery */
function BlueprintOverlay() {
  const reduceMotion = useReducedMotion()
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 400 300"
      preserveAspectRatio="none"
    >
      {[
        'M20 40 H380',
        'M20 40 V260',
        'M380 40 V260',
        'M20 260 H380',
        'M20 150 H380',
        'M200 40 V260',
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="rgba(201,168,106,0.55)"
          strokeWidth={0.8}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: reduceMotion ? 1 : [0, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 2.6, delay: 0.4 + i * 0.25, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}
