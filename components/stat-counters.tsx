'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useI18n } from '@/lib/i18n'

function Counter({
  value,
  suffix,
  start,
}: {
  value: number
  suffix: string
  start: boolean
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!start) return
    let raf = 0
    const duration = 1800
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setDisplay(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, value])

  return (
    <span className="gold-gradient-text font-heading text-xl sm:text-3xl font-bold tabular-nums md:text-4xl">
      {display}
      {suffix}
    </span>
  )
}

export function StatCounters() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const STATS = [
    { value: 5, suffix: '+', label: t('stats.years') },
    { value: 100, suffix: '+', label: t('stats.projects') },
    { value: 95, suffix: '+', label: t('stats.clients') },
    { value: 3, suffix: '', label: t('stats.revisions') },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel rounded-xl sm:rounded-3xl p-3 sm:p-6 md:p-8"
    >
      {/* Desktop / tablet grid, mobile becomes swipeable row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 pb-2 sm:overflow-visible">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 * i }}
            className="relative rounded-lg sm:rounded-2xl border border-border/60 bg-background/30 p-2 sm:p-5 text-center"
          >
            <Counter value={s.value} suffix={s.suffix} start={inView} />
            <p className="mt-1 sm:mt-2 font-sans text-[9px] sm:text-sm text-muted-foreground">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
