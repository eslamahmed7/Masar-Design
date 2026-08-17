'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Project } from '@/lib/projects'
import { useMobile } from '@/lib/use-mobile'
import { useI18n } from '@/lib/i18n'

/**
 * Presentational, data-driven gallery card.
 *
 * Knows nothing about the dataset — it renders whatever `Project` it is given
 * and applies the gallery's distance-based transforms (`scale`, `rotateY`,
 * `brightness`) passed down as motion values. Hover interactions (image zoom,
 * light sweep, gold glow, 3D tilt, title lift, arrow slide) are self-contained.
 */
export function ProjectCard({
  project,
  index,
  isActive,
  scale,
  rotateY,
  brightness,
  onActivate,
  onPreview,
}: {
  project: Project
  index: number
  isActive: boolean
  scale: MotionValue<number>
  rotateY: MotionValue<number>
  brightness: MotionValue<number>
  /** Snap this card to center */
  onActivate: () => void
  /** Open the fullscreen preview — only fires on confirmed click (not drag) */
  onPreview: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const isMobile = useMobile()
  const { t } = useI18n()
  // Track whether a drag occurred since pointerdown so clicks after drag don't open preview
  const didDrag = useRef(false)

  function handlePointerDown() { didDrag.current = false }
  function handlePointerMove() { didDrag.current = true }
  function handleClick() {
    if (didDrag.current) return
    if (isActive) {
      onPreview()
    } else {
      onActivate()
    }
  }

  // Local pointer-driven 3D tilt (very subtle, layered on top of gallery rotateY)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const tiltX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 18,
  })
  const tiltY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 18,
  })

  function handleMove(e: React.PointerEvent<Element>) {
    if (isMobile) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleLeave() {
    if (isMobile) return
    setHovered(false)
    px.set(0)
    py.set(0)
  }

  const filter = useTransform(brightness, (b) => `brightness(${b})`)

  return (
    <motion.div
      className="relative shrink-0"
      style={{ scale }}
      // Gentle idle breathing when centered
      animate={
        isActive
          ? { y: [0, -8, 0] }
          : { y: 0 }
      }
      transition={
        isActive
          ? { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
          : { duration: 0.6 }
      }
    >
      <motion.div style={{ rotateY }} className="[transform-style:preserve-3d]">
        <motion.article
          ref={ref}
          onPointerDown={handlePointerDown}
          onPointerMove={(e) => { handlePointerMove(); handleMove(e) }}
          onPointerEnter={() => !isMobile && setHovered(true)}
          onPointerLeave={handleLeave}
          onClick={handleClick}
          style={{ rotateX: tiltX, rotateY: tiltY, filter }}
          aria-label={isActive
            ? t('projectsPage.viewAria').replace('{title}', project.title)
            : t('projectsPage.selectAria').replace('{title}', project.title)}
          className="group relative h-[55vw] sm:h-[68vh] max-h-[760px] min-h-[200px] sm:min-h-[440px] w-[82vw] sm:w-[440px] lg:w-[520px] cursor-pointer overflow-hidden rounded-2xl sm:rounded-[2rem] border border-border [transform-style:preserve-3d] will-change-transform"
        >
          {/* Gold glow ring on hover */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-px z-30 rounded-xl sm:rounded-[2rem]"
            animate={{
              boxShadow: hovered
                ? '0 0 0 1px var(--gold), 0 30px 80px -20px oklch(0.81 0.12 84 / 0.45)'
                : '0 0 0 1px transparent, 0 20px 60px -30px oklch(0 0 0 / 0.7)',
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Image with cinematic zoom + parallax */}
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={project.image || '/placeholder.svg'}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 440px, 520px"
              className="object-cover"
              quality={80}
              priority={index < 2}
              draggable={false}
            />
          </motion.div>

          {/* Depth gradient for legible text */}
          <div
            aria-hidden
            className="absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(to top, oklch(0.1 0.004 55 / 0.92) 0%, oklch(0.12 0.005 55 / 0.35) 42%, transparent 68%)',
            }}
          />

          {/* Soft light sweep on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 z-20 w-1/3 -skew-x-12 bg-white/15 opacity-0 group-hover:animate-[light-sweep_1.1s_ease-out] group-hover:opacity-100"
          />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-1 sm:gap-4 p-2 sm:p-8">
            <div className="overflow-hidden">
              <p className="mb-0.5 sm:mb-2 font-sans text-[8px] sm:text-xs font-medium tracking-[0.1em] sm:tracking-[0.25em] text-gold">
                {project.category}
              </p>
              <motion.h3
                className="font-heading text-sm sm:text-3xl font-bold text-foreground text-balance line-clamp-1 sm:line-clamp-none"
                animate={{ y: hovered ? -4 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {project.title}
              </motion.h3>
              <motion.p
                className="mt-1 max-w-sm text-[8px] sm:text-sm leading-relaxed text-muted-foreground hidden sm:block"
                animate={{
                  opacity: hovered ? 1 : 0.75,
                  y: hovered ? 0 : 6,
                }}
                transition={{ duration: 0.5 }}
              >
                {project.description}
              </motion.p>
            </div>

            {/* Gold arrow button */}
            <motion.span
              aria-hidden
              className="relative flex h-5 w-5 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/50 bg-gold/10 text-gold"
              animate={{
                backgroundColor: hovered
                  ? 'oklch(0.81 0.12 84)'
                  : 'oklch(0.81 0.12 84 / 0.1)',
                color: hovered
                  ? 'oklch(0.18 0.01 60)'
                  : 'oklch(0.81 0.12 84)',
              }}
              transition={{ duration: 0.4 }}
            >
              <motion.svg
                width="10"
                height="10"
                className="sm:w-[18px] sm:h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ x: hovered ? 2 : 0, rotate: hovered ? -45 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* RTL context: arrow points to the leading (left) edge */}
                <path
                  d="M15 5l-7 7 7 7"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.span>
          </div>
        </motion.article>
      </motion.div>
    </motion.div>
  )
}
