'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

export function AboutHero() {
  const { t, tArr } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.2, 1.3])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.55, 0.82])
  
  // Parallax and fade effects matching home page but with negative Y to prevent top gap
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  const lines = tArr('aboutPage.heroWords').map((text, i) => ({
    text,
    delay: 0.1 + i * 0.2,
  }))

  return (
    <section
      ref={ref}
      className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div
        className="absolute -top-16 -bottom-16 left-0 right-0 will-change-transform"
        style={{
          scale: imgScale,
          y: bgY,
        }}
      >
        <Image
          src="/about/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-background"
        style={{ opacity: overlayOpacity }}
      />

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.03] noise-layer pointer-events-none" />

      {/* Center content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Overline */}
        <motion.span
          className="mb-6 text-xs tracking-[0.4em] uppercase"
          style={{ color: 'var(--gold)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('aboutPage.heroOverline')}
        </motion.span>

        {/* Arabic title — line by line */}
        <h1 className="flex flex-col items-center leading-none" aria-label={t('aboutPage.heroAria')}>
          {lines.map((line) => (
            <div key={line.text} className="overflow-hidden">
              <motion.span
                className="block font-heading text-[min(22vw,180px)] font-bold gold-gradient-text"
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ delay: line.delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {line.text}
              </motion.span>
            </div>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          className="mt-8 max-w-xl text-base leading-loose text-foreground/70 font-sans"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('aboutPage.heroDesc1')}
          <br />
          {t('aboutPage.heroDesc2')}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
        >
          <Link
            href="/services"
            className="rounded-full border px-8 py-3 text-sm font-medium transition-all duration-300 hover:bg-gold hover:text-[#0B0B0B]"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            {t('aboutPage.heroServices')}
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-foreground/20 px-8 py-3 text-sm font-medium text-foreground/80 transition-all duration-300 hover:border-gold/50 hover:text-gold"
          >
            {t('aboutPage.heroWork')}
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <motion.div
            className="h-10 w-px"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--gold))' }}
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
