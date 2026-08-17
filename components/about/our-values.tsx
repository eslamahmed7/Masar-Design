'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { useI18n } from '@/lib/i18n'

const VALUES = [
  {
    key: 'creativity',
    heightClass: 'h-44 sm:h-48 md:h-72',
    offsetClass: '',
  },
  {
    key: 'precision',
    heightClass: 'h-44 sm:h-48 md:h-80',
    offsetClass: 'sm:mt-8',
  },
  {
    key: 'simplicity',
    heightClass: 'h-44 sm:h-48 md:h-64',
    offsetClass: '',
  },
  {
    key: 'detail',
    heightClass: 'h-44 sm:h-48 md:h-80',
    offsetClass: 'sm:mt-12',
  },
  {
    key: 'innovation',
    heightClass: 'h-44 sm:h-48 md:h-72',
    offsetClass: 'sm:mt-4',
  },
]

export function OurValues() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })

  return (
    <section ref={ref} className="relative py-12 sm:py-24 md:py-48">
      <div className="mx-auto max-w-7xl px-4 sm:px-3 md:px-12">
        {/* Heading */}
        <div className="mb-8 sm:mb-12 md:mb-20 text-center">
          <motion.span
            className="mb-2 sm:mb-4 block text-xs tracking-[0.35em] uppercase"
            style={{ color: 'var(--gold)' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            {t('aboutPage.valuesLabel')}
          </motion.span>
          <div className="overflow-hidden">
            <motion.h2
              className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold text-foreground"
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('aboutPage.valuesTitle')}
            </motion.h2>
          </div>
        </div>

        {/* Cards grid — asymmetric floating composition */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-6 md:items-start">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.key}
              className={`group relative flex flex-col justify-end overflow-hidden rounded-xl sm:rounded-3xl p-4 sm:p-8 ${v.heightClass} ${v.offsetClass}`}
              style={{
                background: 'rgba(201,168,106,0.03)',
                border: '1px solid rgba(201,168,106,0.12)',
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, borderColor: 'rgba(201,168,106,0.4)' }}
            >
              {/* Large background number */}
              <span
                className="pointer-events-none absolute top-2 sm:top-4 left-3 sm:left-6 font-mono text-4xl sm:text-7xl font-bold opacity-[0.04]"
                style={{ color: 'var(--gold)', lineHeight: 1 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Light sweep on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-xl sm:rounded-3xl">
                <div
                  className="absolute inset-0"
                  style={{ animation: 'light-sweep 0.7s ease forwards' }}
                >
                  <div
                    className="absolute top-0 bottom-0 w-1/3 skew-x-[-16deg]"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,106,0.06), transparent)' }}
                  />
                </div>
              </div>

              {/* Border glow on hover */}
              <div
                className="absolute inset-0 rounded-xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: '0 0 30px rgba(201,168,106,0.1), inset 0 0 30px rgba(201,168,106,0.04)' }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div
                  className="mb-2 sm:mb-4 h-px w-4 sm:w-10 transition-all duration-500 group-hover:w-16"
                  style={{ background: 'var(--gold)' }}
                />
                <h3 className="mb-1 sm:mb-3 font-heading text-sm sm:text-xl font-semibold text-foreground">
                  {t(`aboutPage.values.${v.key}.title`)}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed sm:leading-loose text-foreground/55">{t(`aboutPage.values.${v.key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
