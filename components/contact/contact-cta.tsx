'use client'

import { useRef } from 'react'
import { SITE_CONFIG } from '@/lib/site-config'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

const PARTICLES = [
  { left: '5%', top: '20%', size: 3, dur: 8, delay: 0 },
  { left: '15%', top: '70%', size: 2, dur: 10, delay: 1.1 },
  { left: '45%', top: '10%', size: 2.5, dur: 9, delay: 0.4 },
  { left: '70%', top: '80%', size: 2, dur: 11, delay: 1.6 },
  { left: '85%', top: '35%', size: 3, dur: 7.5, delay: 0.7 },
  { left: '92%', top: '60%', size: 2, dur: 9.5, delay: 2 },
]

export function ContactCta() {
  const { t, lang } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const spotlightY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-5%', '5%'])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-32 text-center md:px-12"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-deep" aria-hidden />

      {/* Blueprint texture */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.035]"
        aria-hidden
      >
        <defs>
          <pattern id="cta-grid" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M90 0 H0 V90" fill="none" stroke="rgba(201,168,106,0.7)" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.5" fill="rgba(201,168,106,0.5)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-grid)" />
      </svg>

      {/* Animated spotlight */}
      <motion.div
        style={{ y: spotlightY }}
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 900,
            height: 600,
            background:
              'radial-gradient(ellipse, rgba(201,168,106,0.12) 0%, transparent 65%)',
            borderRadius: '50%',
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {!reduceMotion &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-gold/40"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

      {/* Noise overlay */}
      <div className="noise-layer pointer-events-none absolute inset-0 -z-10 opacity-[0.02]" aria-hidden />

      {/* Gold top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-6 font-mono text-xs uppercase tracking-[0.5em] text-gold/70"
        >
          {t('contactCta.eyebrow')}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="font-heading text-5xl font-bold leading-tight text-foreground text-balance md:text-6xl lg:text-7xl"
        >
          {t('contactCta.headline1')}{' '}
          <span className="gold-gradient-text">{t('contactCta.headline2')}</span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: EASE }}
          className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        />

        {[t('contactCta.line1'), t('contactCta.line2')].map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.35 + i * 0.12, ease: EASE }}
            className={`text-lg leading-relaxed md:text-xl ${i === 0 ? 'text-ink' : 'text-muted-foreground'}`}
          >
            {line}
          </motion.p>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
        >
          {/* Primary CTA */}
          <a
            href="#contact-form"
            className="group relative overflow-hidden rounded-full border border-gold bg-gold/15 px-10 py-4 text-base font-semibold text-gold transition-all duration-500 hover:bg-gold hover:text-primary-foreground hover:shadow-[0_0_50px_oklch(0.81_0.12_84/0.5)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -right-1/3 w-1/3 skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
            />
            <span className="relative z-10">{t('contactCta.startNow')}</span>
          </a>

          {/* WhatsApp CTA */}
          <a
            href={SITE_CONFIG.contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-full border border-border bg-card/40 px-10 py-4 text-base font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-[#25D366]/40 hover:text-[#25D366]"
          >
            {/* WhatsApp icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t('contactCta.whatsapp')}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
