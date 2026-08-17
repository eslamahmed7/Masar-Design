'use client'

import { useRef } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from 'motion/react'
import { AboutBackground } from '@/components/about-background'
import { ProjectsGallery } from '@/components/projects-gallery'
import type { Project } from '@/lib/projects'
import { useMobile } from '@/lib/use-mobile'
import { useI18n } from '@/lib/i18n'

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t, tArr, lang } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  const headlineLines = tArr('home.projectsTitle')

  const revealed = useInView(galleryRef, { once: true, margin: '-15% 0px' })
  const headerInView = useInView(sectionRef, { once: true, margin: '-25% 0px' })

  // Cursor parallax for the shared background layers
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (isMobile) return
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }

  // Scroll story: blueprint draws + glow expands as the section enters
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  })
  const drawProgress = useTransform(scrollYProgress, [0, 0.85], [0, 1])
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.15])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1])

  return (
    <section
      id="projects"
      ref={sectionRef}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      onMouseMove={handleMouseMove}
      aria-labelledby="projects-heading"
      className="relative overflow-hidden py-10 sm:py-32 lg:py-40"
    >
      {/* Shared cinematic background (consistent with the About section) */}
      <AboutBackground
        mouseX={mouseX}
        mouseY={mouseY}
        drawProgress={drawProgress}
      />

      {/* Extra expanding glow keyed to scroll for the "emerge from darkness" story */}
      <motion.div
        aria-hidden
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`h-full w-full rounded-full ${isMobile ? '' : 'blur-[130px]'}`}
          style={{
            background:
              'radial-gradient(circle, oklch(0.81 0.12 84 / 0.22) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[10px] sm:text-sm font-medium tracking-[0.2em] sm:tracking-[0.35em] text-gold"
        >
          {t('home.projectsLabel')}
        </motion.p>        <h2
          id="projects-heading"
          className="mt-2 sm:mt-6 font-heading text-2xl sm:text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl"
        >
          {headlineLines.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={headerInView ? { y: '0%' } : {}}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + i * 0.14,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-2 sm:mt-6 max-w-xl text-[10px] sm:text-base leading-relaxed text-muted-foreground text-pretty"
        >
          {t('home.projectsDesc')}
        </motion.p>
      </div>

      {/* Cinematic gallery */}
      <div ref={galleryRef} className="relative z-10 mt-8 sm:mt-20">
        <ProjectsGallery projects={projects} revealed={revealed} />
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 0.6 } : {}}
        transition={{ duration: 1, delay: 1 }}
        className="relative z-10 mt-6 sm:mt-10 text-center font-sans text-[8px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground"
      >
        {t('home.projectsHint')}
      </motion.p>
    </section>
  )
}
