'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react'
import type { Project } from '@/lib/projects'
import { useI18n } from '@/lib/i18n'
import { ProjectCard } from '@/components/project-card'
import { ProjectPreview } from '@/components/project-preview'

type Metrics = { vw: number; cardWidth: number; step: number }

// Deterministic value used for SSR and the first client render so hydration
// matches. Real viewport metrics are measured in an effect after mount.
const DEFAULT_METRICS: Metrics = { vw: 1440, cardWidth: 520, step: 576 }

function computeMetrics(): Metrics {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  let cardWidth: number
  let gap: number
  if (vw >= 1024) {
    cardWidth = 520
    gap = 56
  } else if (vw >= 640) {
    cardWidth = 440
    gap = 40
  } else {
    cardWidth = vw * 0.82
    gap = 16
  }
  return { vw, cardWidth, step: cardWidth + gap }
}

export function ProjectsGallery({
  projects,
  revealed,
}: {
  projects: Project[]
  revealed: boolean
}) {
  const [metrics, setMetrics] = useState<Metrics>(DEFAULT_METRICS)
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewProject, setPreviewProject] = useState<Project | null>(null)
  const x = useMotionValue(0)
  const wheelAcc = useRef(0)
  const wheelReset = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  const { step, cardWidth, vw } = metrics
  const leadingSpacer = Math.max(vw / 2 - cardWidth / 2, 0)
  const maxX = 0
  const minX = -(projects.length - 1) * step

  useEffect(() => {
    // Measure real viewport after mount (post-hydration) and on resize
    setMetrics(computeMetrics())
    function onResize() {
      setMetrics(computeMetrics())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(projects.length - 1, index))
      setActiveIndex(clamped)
      animate(x, -clamped * step, {
        type: 'spring',
        stiffness: 120,
        damping: 26,
        mass: 0.9,
      })
    },
    [projects.length, step, x],
  )

  // Re-snap to the active card when metrics change (e.g. resize / breakpoint)
  useEffect(() => {
    x.set(-activeIndex * step)
  }, [step, activeIndex, x])

  // Track the nearest card as active during free drag
  useMotionValueEvent(x, 'change', (latest) => {
    const nearest = Math.max(
      0,
      Math.min(projects.length - 1, Math.round(-latest / step)),
    )
    if (nearest !== activeIndex) setActiveIndex(nearest)
  })

  // Wheel → step through cards with a cinematic snap
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onWheel(e: WheelEvent) {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      wheelAcc.current += delta
      if (wheelReset.current) clearTimeout(wheelReset.current)
      wheelReset.current = setTimeout(() => {
        wheelAcc.current = 0
      }, 160)

      if (Math.abs(wheelAcc.current) > 48) {
        e.preventDefault()
        const dir = wheelAcc.current > 0 ? 1 : -1
        wheelAcc.current = 0
        goTo(activeIndexRef.current + dir)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [goTo])

  // Keep a ref of active index for the wheel listener (avoids stale closure)
  const activeIndexRef = useRef(activeIndex)
  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  // Keyboard: left/right arrows navigate gallery (when preview is closed)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (previewProject) return
      if (e.key === 'ArrowRight') goTo(activeIndexRef.current - 1)
      if (e.key === 'ArrowLeft') goTo(activeIndexRef.current + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, previewProject])

  return (
    <>
    <ProjectPreview
      project={previewProject}
      onClose={() => setPreviewProject(null)}
    />
    <div
      ref={containerRef}
      dir="ltr"
      className="relative w-full overflow-hidden"
      style={{
        // True edge fade into the background
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >
      {/* Perspective stage */}
      <div style={{ perspective: 1600 }}>
        <motion.div
          className="flex items-center will-change-transform"
          style={{
            x,
            paddingLeft: leadingSpacer,
            paddingRight: leadingSpacer,
            gap: step - cardWidth,
            transformStyle: 'preserve-3d',
          }}
          drag="x"
          dragConstraints={{ left: minX, right: maxX }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const projected = x.get() + info.velocity.x * 0.18
            goTo(Math.round(-projected / step))
          }}
        >
          {projects.map((project, i) => (
            <GalleryItem
              key={project.id}
              project={project}
              index={i}
              x={x}
              step={step}
              isActive={i === activeIndex}
              revealed={revealed}
              onActivate={() => goTo(i)}
              onPreview={() => setPreviewProject(project)}
            />
          ))}
        </motion.div>
      </div>

      {/* Progress / navigation dots */}
      <div className="mt-10 flex items-center justify-center gap-3">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={t('projectsPage.viewAria').replace('{title}', p.title)}
            onClick={() => goTo(i)}
            className="group relative h-2.5 rounded-full transition-all duration-500"
            style={{
              width: i === activeIndex ? 34 : 10,
              backgroundColor:
                i === activeIndex
                  ? 'var(--gold)'
                  : 'oklch(0.7 0.015 75 / 0.35)',
            }}
          />
        ))}
      </div>
    </div>
    </>
  )
}

function GalleryItem({
  project,
  index,
  x,
  step,
  isActive,
  revealed,
  onActivate,
  onPreview,
}: {
  project: Project
  index: number
  x: ReturnType<typeof useMotionValue<number>>
  step: number
  isActive: boolean
  revealed: boolean
  onActivate: () => void
  onPreview: () => void
}) {
  // Signed distance (in steps) from the viewport center
  const dist = useTransform(x, (latest) => (latest + index * step) / step)

  const scale = useTransform(dist, [-1, 0, 1], [0.84, 1, 0.84], {
    clamp: true,
  })
  const rotateY = useTransform(dist, [-1, 0, 1], [14, 0, -14], { clamp: true })
  const brightness = useTransform(
    dist,
    [-1, 0, 1],
    [0.5, 1, 0.5],
    { clamp: true },
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }}
      transition={{
        duration: 0.9,
        delay: revealed ? 0.15 + index * 0.1 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <ProjectCard
        project={project}
        index={index}
        isActive={isActive}
        scale={scale}
        rotateY={rotateY}
        brightness={brightness}
        onActivate={onActivate}
        onPreview={onPreview}
      />
    </motion.div>
  )
}
