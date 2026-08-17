'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

const TEXT_BLOCKS = [
  { key: 'first' },
  { key: 'second' },
  { key: 'third' },
] as const

export function BehindEveryDesign() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [-30, 30])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 12,
        y: (e.clientY / window.innerHeight - 0.5) * 8,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section ref={ref} className="relative py-16 sm:py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-7xl px-3 sm:px-12">
        <div className="grid grid-cols-2 gap-4 sm:gap-16 md:gap-20 items-center">

          {/* Left: Full-bleed image */}
          <div className="relative h-[220px] sm:h-[450px] md:h-[700px] overflow-hidden rounded-lg sm:rounded-2xl">
            <motion.div
              className="absolute inset-0 will-transform"
              style={{
                y: imgY,
                x: mousePos.x,
                transition: 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
              <Image
                src="/about/behind-design.png"
                alt={t('aboutPage.behindImageAlt')}
                fill
                className="object-cover scale-110"
                sizes="50vw"
              />
            </motion.div>

            {/* Dark vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(9,9,9,0.5) 100%)',
              }}
            />

            {/* Corner accents */}
            <div className="absolute top-3 sm:top-6 left-3 sm:left-6 w-6 h-6 sm:w-12 sm:h-12 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />
              <div className="absolute top-0 left-0 h-full w-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />
            </div>
            <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 w-6 h-6 sm:w-12 sm:h-12 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />
              <div className="absolute bottom-0 right-0 h-full w-px" style={{ background: 'var(--gold)', opacity: 0.4 }} />
            </div>
          </div>

          {/* Right: text blocks */}
          <div className="flex flex-col gap-6 sm:gap-14">
            <div>
              <motion.span
                className="mb-1.5 sm:mb-3 block text-[10px] sm:text-xs tracking-[0.35em] uppercase"
                style={{ color: 'var(--gold)' }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
              >
                {t('aboutPage.behindLabel')}
              </motion.span>
              <div className="overflow-hidden">
                <motion.h2
                  className="font-heading text-lg sm:text-4xl md:text-6xl font-bold text-foreground leading-tight"
                  initial={{ y: '100%' }}
                  animate={isInView ? { y: 0 } : {}}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('aboutPage.behindTitle1')}
                  <br />
                  <span className="gold-gradient-text">{t('aboutPage.behindTitle2')}</span>
                </motion.h2>
              </div>
            </div>

            {TEXT_BLOCKS.map((block, i) => (
              <motion.div
                key={block.key}
                className="group"
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.65, ease: 'easeOut' }}
              >
                <div
                  className="mb-2 sm:mb-3 h-px w-4 sm:w-8 transition-all duration-500 group-hover:w-14"
                  style={{ background: 'var(--gold)' }}
                />
                <h3 className="mb-1 sm:mb-2 font-heading text-xs sm:text-lg font-semibold text-foreground">
                  {t(`aboutPage.behindBlocks.${block.key}.title`)}
                </h3>
                <p className="text-[9px] sm:text-xs md:text-sm leading-relaxed sm:leading-loose text-foreground/55">{t(`aboutPage.behindBlocks.${block.key}.body`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
