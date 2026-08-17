'use client'

import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'motion/react'
import { CinematicSlideshow } from './cinematic-slideshow'
import { FloatingObjects } from './floating-objects'
import { AboutBackground } from './about-background'
import { StatCounters } from './stat-counters'
import { MagneticButton } from './magnetic-button'
import Link from 'next/link'
import { useMobile } from '@/lib/use-mobile'
import { useI18n } from '@/lib/i18n'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.16, delayChildren: 0.1 },
  },
}

export const lineReveal = {
  hidden: (isMobile: boolean) => ({ opacity: 0, y: 40, filter: isMobile ? 'none' : 'blur(8px)' }),
  show: (isMobile: boolean) => ({
    opacity: 1,
    y: 0,
    filter: isMobile ? 'none' : 'blur(0px)',
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function AboutSection() {
  const { t, tArr, lang } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const isMobile = useMobile()

  const HEADLINE_LINES = tArr('about.titleLines')
  const PARAGRAPH_LINES = tArr('about.paragraphLines')

  // Normalized mouse position (-1 .. 1)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const mouseX = useSpring(rawX, { stiffness: 120, damping: 22, mass: 0.4 })
  const mouseY = useSpring(rawY, { stiffness: 120, damping: 22, mass: 0.4 })

  // Slideshow tilt: max 8 degrees
  const rotateY = useTransform(mouseX, [-1, 1], [-8, 8])
  const rotateX = useTransform(mouseY, [-1, 1], [8, -8])

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (isMobile) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    rawX.set(nx * 2)
    rawY.set(ny * 2)
  }

  function handleMouseLeave() {
    if (isMobile) return
    rawX.set(0)
    rawY.set(0)
  }

  // We completely removed useScroll tracking to eliminate layout thrashing and severe lag on mobile.

  return (
    <section
      id="about"
      ref={sectionRef}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-background py-10 sm:py-24 md:py-0"
      aria-labelledby="about-heading"
    >
      <AboutBackground
        mouseX={mouseX}
        mouseY={mouseY}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col sm:flex-row items-center gap-8 sm:gap-16 px-4 sm:px-6 md:gap-10 md:px-10 py-8 sm:py-24 md:py-24">
        {/* LEFT — philosophy / identity (45%) */}
        <motion.div
          className="order-2 w-full sm:w-full md:order-1 md:w-[45%]"
        >
          {/* gold label */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3"
          >
            <span className="h-px w-8 sm:w-10 bg-gold" />
            <span className="font-heading text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-gold">
              {t('about.label')}
            </span>
          </motion.div>

          {/* headline */}
          <motion.h2
            id="about-heading"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="font-heading text-2xl sm:text-4xl leading-[1.3] tracking-tight text-foreground text-balance md:text-[3.4rem]"
          >
            {HEADLINE_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  custom={isMobile}
                  variants={lineReveal}
                  className={i === 1 ? 'gold-gradient-text inline-block' : 'inline-block'}
                  style={i === 1 ? { fontSize: 'inherit' } : {}}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h2>

          {/* paragraph — progressive line reveal */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-4 sm:mt-8 space-y-2 sm:space-y-2"
          >
            {PARAGRAPH_LINES.map((line) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  custom={isMobile}
                  variants={lineReveal}
                  className="block font-sans text-sm sm:text-base leading-relaxed tracking-wide text-muted-foreground md:text-lg"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.div>

          {/* animated signature */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-6 sm:mt-10"
          >
            <svg
              viewBox="0 0 320 60"
              className="h-10 sm:h-14 w-auto"
              fill="none"
              aria-hidden
            >
              <motion.path
                d="M6 40 C 40 8, 70 8, 78 34 C 84 52, 96 52, 110 30 C 122 12, 150 14, 156 40 M170 20 L170 42 M186 42 L186 22 C 200 12, 214 22, 214 42 M300 14 C 260 14, 250 46, 300 46"
                stroke="var(--gold)"
                strokeWidth="1.6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeInOut', delay: 0.6 }}
              />
            </svg>
            <p className="mt-1 sm:mt-2 font-serif text-sm sm:text-lg italic tracking-wide text-foreground/80">
              MASAR Interior Design Studio
            </p>
          </motion.div>

          {/* CTA */}
          <div className="mt-6 sm:mt-8 flex sm:scale-100 origin-right">
            <Link href="/services#journey">
              <MagneticButton>{t('about.cta')}</MagneticButton>
            </Link>
          </div>
        </motion.div>

        {/* RIGHT — cinematic slideshow + floating objects (55%) */}
        <motion.div
          className="relative order-1 flex w-full sm:w-full items-center justify-center md:order-2 md:w-[55%]"
        >
          <div className="relative w-full max-w-md">
            <div className="relative">
              <FloatingObjects mouseX={mouseX} mouseY={mouseY} />
              <CinematicSlideshow rotateX={rotateX} rotateY={rotateY} />
            </div>

            {/* floating stats panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative z-30 mx-auto mt-4 sm:mt-8 w-full sm:w-[92%] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:w-full md:mt-8"
            >
              <StatCounters />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
