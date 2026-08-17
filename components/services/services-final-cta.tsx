'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import { ServiceButton } from './service-showcase'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

export function ServicesFinalCta() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ['0%', '0%'] : ['-8%', '8%'],
  )

  return (
    <section
      ref={ref}
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-32 text-center md:px-12"
    >
      {/* Parallax background image */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10 scale-110">
        <Image
          src="/services/furniture-styling.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          quality={75}
          loading="lazy"
          aria-hidden
        />
      </motion.div>
      {/* Dark wash so text stays legible + blends into footer */}
      <div className="absolute inset-0 -z-10 bg-deep/85" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-deep via-deep/70 to-deep" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 40%, rgba(201,168,106,0.12) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-6 font-mono text-xs uppercase tracking-[0.5em] text-gold/70"
        >
          Let&apos;s Create Together
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="font-heading text-5xl font-bold leading-tight text-foreground text-balance md:text-6xl lg:text-7xl"
        >
          {t('servicesPage.finalCtaTitle1')}{' '}
          <span className="gold-gradient-text">{t('servicesPage.finalCtaTitle2')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink md:text-xl"
        >
          {t('servicesPage.finalCtaDesc')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <ServiceButton href="/start">{t('servicesPage.finalCtaBook')}</ServiceButton>
          <ServiceButton href="/projects" variant="secondary">
            {t('servicesPage.finalCtaWork')}
          </ServiceButton>
        </motion.div>
      </div>
    </section>
  )
}
