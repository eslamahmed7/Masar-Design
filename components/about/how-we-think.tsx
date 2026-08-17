'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { useI18n } from '@/lib/i18n'

const STAGES = [
  {
    num: '01',
    key: 'idea',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 sm:w-10 sm:h-10">
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="4" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="39" x2="20" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="20" x2="1" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="39" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    key: 'planning',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 sm:w-10 sm:h-10">
        <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="4" y1="16" x2="36" y2="16" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="16" y1="8" x2="16" y2="32" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    num: '03',
    key: 'creativity',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 sm:w-10 sm:h-10">
        <path d="M8 32 Q 20 4 32 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="18" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    num: '04',
    key: 'final',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5 sm:w-10 sm:h-10">
        <path d="M8 20 L17 29 L32 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function HowWeThink() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })

  return (
    <section ref={ref} className="relative py-24 md:py-48 overflow-hidden">
      {/* Blueprint grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--gold) 1px, transparent 1px),
            linear-gradient(to bottom, var(--gold) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-12">
        {/* Heading */}
        <div className="mb-12 md:mb-20 text-center">
          <motion.span
            className="mb-4 block text-xs tracking-[0.35em] uppercase"
            style={{ color: 'var(--gold)' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            {t('aboutPage.howLabel')}
          </motion.span>
          <div className="overflow-hidden">
            <motion.h2
              className="font-heading text-4xl md:text-6xl font-bold text-foreground"
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('aboutPage.howTitle')}
            </motion.h2>
          </div>
        </div>

        {/* Stages grid */}
        <div className="relative grid grid-cols-4 gap-0">
          {/* Animated connector line */}
          <motion.div
            className="absolute top-[28px] sm:top-[52px] left-0 right-0 h-px block"
            style={{ 
              background: 'linear-gradient(to right, transparent, var(--gold), var(--gold), transparent)',
            }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.5, duration: 1, ease: 'easeInOut' }}
          />

          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.num}
              className="group relative flex flex-col items-center text-center px-1 sm:px-6 py-4 sm:py-10 rounded-2xl cursor-default w-full"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
            >
              {/* Number */}
              <span
                className="absolute top-1 sm:top-2 right-2 sm:right-6 font-mono text-[8px] sm:text-xs"
                style={{ color: 'var(--gold)', opacity: 0.35 }}
              >
                {stage.num}
              </span>

              {/* Icon circle */}
              <div
                className="relative z-10 mb-4 sm:mb-8 flex h-12 w-12 sm:h-[106px] sm:w-[106px] items-center justify-center rounded-full border transition-all duration-500 group-hover:border-gold/50 group-hover:shadow-[0_0_30px_rgba(201,168,106,0.18)]"
                style={{
                  borderColor: 'rgba(201,168,106,0.2)',
                  background: 'rgba(201,168,106,0.04)',
                  color: 'var(--gold)',
                }}
              >
                {/* Rotating outer ring on hover */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-dashed opacity-0 group-hover:opacity-30"
                  style={{ borderColor: 'var(--gold)' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                />
                {stage.icon}
              </div>

              <h3 className="mb-2 font-heading text-[11px] sm:text-xl font-semibold text-foreground">
                {t(`aboutPage.howStages.${stage.key}.title`)}
              </h3>
              <p className="text-[9px] sm:text-sm leading-relaxed sm:leading-loose text-foreground/55">
                {t(`aboutPage.howStages.${stage.key}.desc`)}
              </p>

              {/* Bottom gold glow on hover */}
              <div
                className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-3/4"
                style={{ background: 'var(--gold)', opacity: 0.5 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
