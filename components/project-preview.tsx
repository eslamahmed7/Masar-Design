'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import type { Project } from '@/lib/projects'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

interface ProjectPreviewProps {
  project: Project | null
  onClose: () => void
}

export function ProjectPreview({ project, onClose }: ProjectPreviewProps) {
  const { t, lang } = useI18n()
  const [activeImg, setActiveImg] = useState(0)
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Portal needs client-side only
  useEffect(() => { setMounted(true) }, [])

  // Reset active image when a new project opens
  useEffect(() => {
    if (project) setActiveImg(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  // Keyboard: Escape to close, arrows to cycle images
  useEffect(() => {
    if (!project) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (!project) return
      const imgs = project.images ?? [project.image]
      if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % imgs.length)
      if (e.key === 'ArrowLeft') setActiveImg((i) => (i - 1 + imgs.length) % imgs.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose])

  // Lock body scroll completely (works on iOS Safari too)
  useEffect(() => {
    if (!project) return

    const scrollY = window.scrollY
    const body = document.body

    // Save original styles
    const originalPosition = body.style.position
    const originalTop = body.style.top
    const originalWidth = body.style.width
    const originalOverflow = body.style.overflow

    // Apply lock
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    // Add class to body to hide all page content via CSS (prevents any bleed-through)
    document.body.classList.add('preview-open')

    const header = document.getElementById('header-wrapper')
    if (header) {
      header.style.opacity = '0'
      header.style.pointerEvents = 'none'
    }

    return () => {
      // Restore
      body.style.position = originalPosition
      body.style.top = originalTop
      body.style.width = originalWidth
      body.style.overflow = originalOverflow
      
      if (header) {
        header.style.opacity = ''
        header.style.pointerEvents = ''
      }

      document.body.classList.remove('preview-open')

      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
  }, [project])

  const images = project ? (project.images ?? [project.image]) : []

  const facts = project
    ? [
        { label: t('projectPreview.location'), value: project.location ?? '—' },
        { label: t('projectPreview.area'), value: project.area ? `${project.area} ${t('common.sqm')}` : '—' },
        { label: t('projectPreview.year'), value: project.year ?? '—' },
        { label: t('projectPreview.category'), value: project.category },
      ]
    : []

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="preview-backdrop"
          data-preview-overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t('projectPreview.ariaPreview').replace('{title}', project.title)}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Backdrop — fixed, independent from panel, covers full viewport */}
          <div
            className="fixed inset-0 bg-black cursor-pointer"
            onClick={onClose}
          />

          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            aria-label={t('projectPreview.close')}
            onClick={onClose}
            className="fixed left-6 top-5 z-[210] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-black/50 text-muted-foreground backdrop-blur-md transition-all duration-300 hover:border-gold/50 hover:text-gold hover:shadow-[0_0_20px_oklch(0.81_0.12_84/0.3)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>

          {/* Panel — scrollable on mobile, centered on desktop */}
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.93, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="relative mx-4 my-4 flex w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-border bg-[oklch(0.14_0.006_60)] shadow-[0_40px_120px_-20px_oklch(0_0_0/0.85)] lg:max-h-[88vh] lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── Left / Top: main image + thumbnails ─── */}
            <div className="relative flex flex-1 flex-col bg-black lg:max-w-[55%]">
              {/* Hero image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden lg:flex-1 lg:aspect-auto lg:h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImg}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <Image
                      src={images[activeImg] ?? project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                    />
                    {/* Bottom gradient */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to top, oklch(0.14 0.006 60 / 0.8) 0%, transparent 50%)',
                      }}
                    />

                    {/* Light sweep on image change */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/10 animate-[light-sweep_0.9s_ease-out]"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Image counter */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5">
                  <span className="font-sans text-xs text-gold tabular-nums">
                    {String(activeImg + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="font-sans text-xs text-muted-foreground tabular-nums">
                    {String(images.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Prev / next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label={t('projectPreview.nextImage')}
                      onClick={() =>
                        setActiveImg((i) => (i + 1) % images.length)
                      }
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-black/40 text-foreground/70 backdrop-blur-sm transition hover:border-gold/50 hover:text-gold"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label={t('projectPreview.prevImage')}
                      onClick={() =>
                        setActiveImg((i) => (i - 1 + images.length) % images.length)
                      }
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-black/40 text-foreground/70 backdrop-blur-sm transition hover:border-gold/50 hover:text-gold"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3 [&::-webkit-scrollbar]:hidden">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={t('projectPreview.imageN').replace('{n}', String(i + 1))}
                      onClick={() => setActiveImg(i)}
                      className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all duration-300"
                      style={{
                        borderColor:
                          i === activeImg
                            ? 'var(--gold)'
                            : 'oklch(0.95 0.02 80 / 12%)',
                        opacity: i === activeImg ? 1 : 0.55,
                      }}
                    >
                      <Image
                        src={src}
                        alt={`${project.title} — ${i + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Right / Bottom: info ─── */}
            <div className="flex flex-col justify-between gap-6 overflow-y-auto p-8 lg:w-[45%] lg:p-10">
              {/* Category + Title */}
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
                  className="mb-3 font-sans text-xs font-medium tracking-[0.3em] text-gold"
                >
                  {project.category}
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.7, ease: EASE }}
                  className="font-heading text-3xl font-bold leading-tight text-foreground text-balance sm:text-4xl"
                >
                  {project.title}
                </motion.h2>

                {/* Thin gold separator */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
                  className="mt-6 h-px origin-right bg-gradient-to-l from-gold/60 via-gold/20 to-transparent"
                />
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
                className="text-base leading-relaxed text-muted-foreground text-pretty"
              >
                {project.description}
              </motion.p>

              {/* Quick facts */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
                className="grid grid-cols-2 gap-3"
              >
                {facts.map(({ label, value }) => (
                  <div
                    key={label}
                    className="glass-panel rounded-xl p-4"
                  >
                    <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
                className="flex items-center gap-4"
              >
                <Link
                  href="/start"
                  onClick={onClose}
                  className="group flex flex-1 items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/20 to-gold/10 px-6 py-4 font-heading text-sm font-semibold text-gold transition-all duration-400 hover:border-gold/70 hover:from-gold/30 hover:to-gold/15 hover:shadow-[0_0_30px_oklch(0.81_0.12_84/0.25)] cursor-pointer"
                >
                  <span>{t('projectPreview.consult')}</span>
                  <svg
                    className="transition-transform duration-400 group-hover:translate-x-1"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Subtle gold glow border */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[2rem]"
              style={{
                boxShadow: 'inset 0 0 0 1px oklch(0.81 0.12 84 / 0.12)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
