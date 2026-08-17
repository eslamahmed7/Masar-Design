'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useI18n } from '@/lib/i18n'

/**
 * Software tools used by MASAR.
 * Each card shows the official logo (from theSVG.org), the tool name,
 * and a short localized description.
 *
 * The marquee is driven entirely by a CSS @keyframes scroll so it
 * never stops — we duplicate the list so the loop is perfectly seamless.
 * Hovering a card pauses ONLY that card's Ken-Burns effect; the track
 * continues scrolling.
 */

const TOOLS = [
  {
    name: 'AutoCAD',
    descKey: 'autocad',
    color: '#C41E22',
    logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/autocad/default.svg',
  },
  {
    name: 'SketchUp',
    descKey: 'sketchup',
    color: '#005F9E',
    logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/sketchup/default.svg',
  },
  {
    name: 'Revit',
    descKey: 'revit',
    color: '#2979FF',
    logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/autodesk-revit/default.svg',
  },
  {
    name: 'Blender',
    descKey: 'blender',
    color: '#F4792B',
    logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/blender/default.svg',
  },
  {
    name: 'D5 Render',
    descKey: 'd5',
    color: '#00DF9A',
    logo: 'https://www.d5render.com/wp-content/uploads/2026/01/d5-logo-512-150x150.png',
  },
  {
    name: 'Twinmotion',
    descKey: 'twinmotion',
    color: '#00E5FF',
    logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/twinmotion/default.svg',
  },
  {
    name: 'Photoshop',
    descKey: 'photoshop',
    color: '#31A8FF',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg',
  },
]



function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function ToolCard({ tool }: { tool: typeof TOOLS[0] }) {
  const { t } = useI18n()
  return (
    <div
      className="group relative flex-shrink-0 w-[75px] sm:w-[150px] md:w-[200px] lg:w-[260px] rounded-[6px] sm:rounded-2xl overflow-hidden select-none"
      style={{
        border: '1px solid rgba(201,168,106,0.15)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
        background: 'oklch(0.18 0.007 60)',
      }}
    >
      {/* Gold glow border on hover */}
      <div
        className="absolute inset-0 rounded-lg sm:rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-350"
        style={{
          boxShadow: '0 0 32px rgba(201,168,106,0.22), inset 0 0 0 1px rgba(201,168,106,0.4)',
        }}
      />

      <div className="flex flex-col gap-1.5 sm:gap-4 p-2 sm:p-7">
        {/* Logo */}
        <div className="flex h-6 w-6 sm:h-14 sm:w-14 items-center justify-center rounded-[4px] sm:rounded-xl overflow-hidden"
          style={{ 
            background: hexToRgba(tool.color, 0.09), 
            border: `1px solid ${hexToRgba(tool.color, 0.25)}` 
          }}>
          <img
            src={tool.logo}
            alt={`${tool.name} logo`}
            className="w-4 h-4 sm:w-9 sm:h-9 object-contain"
            style={{
              filter: tool.name === 'Twinmotion' ? 'brightness(0) invert(1)' : undefined,
              mixBlendMode: tool.name === 'D5 Render' ? 'screen' : undefined
            }}
            loading="lazy"
            crossOrigin="anonymous"
          />
        </div>

        {/* Color accent line */}
        <div
          className="h-0.5 w-3 sm:w-10 rounded-full"
          style={{ background: `linear-gradient(to right, ${tool.color}, rgba(201,168,106,0.5))` }}
        />

        {/* Text */}
        <div>
          <h3 className="text-[8px] sm:text-sm md:text-lg font-semibold text-foreground leading-tight">{tool.name}</h3>
          <p className="mt-0.5 text-[6px] sm:text-xs md:text-sm text-foreground/50">{t(`aboutPage.toolsDesc.${tool.descKey}`)}</p>
        </div>
      </div>
    </div>
  )
}

export function CreativeTools() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })

  const [isHovered, setIsHovered] = useState(false)

  return (
    <section ref={ref} className="relative py-24 md:py-40 overflow-hidden">
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

      {/* Heading */}
      <div className="mx-auto max-w-7xl px-4 sm:px-12 mb-6 sm:mb-16 text-center">
        <motion.span
          className="mb-2 sm:mb-4 block text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase"
          style={{ color: 'var(--gold)' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {t('aboutPage.toolsLabel')}
        </motion.span>
        <div className="overflow-hidden">
          <motion.h2
            className="font-heading text-2xl sm:text-5xl md:text-6xl font-bold text-foreground"
            initial={{ y: '100%' }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('aboutPage.toolsTitle')}
          </motion.h2>
        </div>
      </div>

      {/* CSS Marquee — never stops */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div
          className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--background), transparent)' }}
        />
        <div
          className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--background), transparent)' }}
        />

        {/* The scrolling track wrapper */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex w-max py-4"
          style={{
            animation: 'masar-marquee 25s linear infinite',
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        >
          {/* Set 1 */}
          <div className="flex shrink-0 gap-2 sm:gap-5 pr-2 sm:pr-5">
            {TOOLS.map((tool, i) => (
              <ToolCard key={`t1-${i}`} tool={tool} />
            ))}
          </div>
          {/* Set 2 */}
          <div className="flex shrink-0 gap-2 sm:gap-5 pr-2 sm:pr-5">
            {TOOLS.map((tool, i) => (
              <ToolCard key={`t2-${i}`} tool={tool} />
            ))}
          </div>
          {/* Set 3 */}
          <div className="flex shrink-0 gap-2 sm:gap-5 pr-2 sm:pr-5">
            {TOOLS.map((tool, i) => (
              <ToolCard key={`t3-${i}`} tool={tool} />
            ))}
          </div>
          {/* Set 4 */}
          <div className="flex shrink-0 gap-2 sm:gap-5 pr-2 sm:pr-5">
            {TOOLS.map((tool, i) => (
              <ToolCard key={`t4-${i}`} tool={tool} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom quote */}
      <motion.div
        className="mx-auto mt-6 sm:mt-16 max-w-2xl px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <p className="text-xs leading-loose text-foreground/45 italic">
          &ldquo;{t('aboutPage.toolsQuote1')}
          <br />
          {t('aboutPage.toolsQuote2')}&rdquo;
        </p>
      </motion.div>
    </section>
  )
}
