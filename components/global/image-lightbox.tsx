'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LightboxImage {
  src: string
  alt?: string
  title?: string
}

interface LightboxContextValue {
  open: (images: LightboxImage[], startIndex?: number) => void
  close: () => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const LightboxContext = createContext<LightboxContextValue>({
  open: () => {},
  close: () => {},
})

export function useLightbox() {
  return useContext(LightboxContext)
}

// ─── Provider + Overlay ──────────────────────────────────────────────────────

export function LightboxProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [images, setImages] = useState<LightboxImage[]>([])
  const [index, setIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Zoom / pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  const open = useCallback((imgs: LightboxImage[], startIndex = 0) => {
    setImages(imgs)
    setIndex(startIndex)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [images.length])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (images.length > 1) {
          e.key === 'ArrowLeft' ? next() : prev()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close, prev, next, images.length])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Mouse wheel zoom — only prevent default when zoom actually changes
  const handleWheel = useCallback((e: React.WheelEvent) => {
    setZoom((z) => {
      const next = Math.min(4, Math.max(1, z - e.deltaY * 0.002))
      if (next !== z) e.preventDefault()
      return next
    })
  }, [])

  // Double-click zoom toggle
  const handleDoubleClick = useCallback(() => {
    setZoom((z) => {
      if (z > 1) { setPan({ x: 0, y: 0 }); return 1 }
      return 2.5
    })
  }, [])

  // Drag-to-pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = pan
  }, [zoom, pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Touch pinch zoom
  const lastTouchDist = useRef<number | null>(null)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastTouchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    }
  }, [])
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const delta = dist / lastTouchDist.current
      setZoom((z) => Math.min(4, Math.max(1, z * delta)))
      lastTouchDist.current = dist
    }
  }, [])
  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null
  }, [])

  const current = images[index]

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}

      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            key="lightbox-backdrop"
            className="fixed inset-0 z-[9990] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          >
            {/* Dark blurred backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

            {/* Blueprint grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />

            {/* Main image container */}
            <motion.div
              key={`lightbox-image-${index}`}
              className="relative z-10 flex items-center justify-center"
              style={{
                width: '90vw',
                height: '85vh',
                maxWidth: 1200,
                cursor: zoom > 1 ? 'grab' : 'default',
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                style={{
                  scale: zoom,
                  x: pan.x,
                  y: pan.y,
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Image
                  src={current.src}
                  alt={current.alt || ''}
                  fill
                  className="object-contain select-none"
                  draggable={false}
                  sizes="90vw"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Close button */}
            <motion.button
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-black/60 text-gold backdrop-blur-sm transition-all hover:border-gold/60 hover:bg-gold/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              onClick={close}
              aria-label={t('lightbox.closeAria')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Image title */}
            {current.title && (
              <motion.div
                className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-gold/20 bg-black/70 px-6 py-2.5 backdrop-blur-md"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-medium text-foreground/90">{current.title}</p>
              </motion.div>
            )}

            {/* Zoom level hint */}
            {zoom > 1 && (
              <motion.div
                className="absolute bottom-6 right-6 z-20 rounded-full border border-gold/20 bg-black/60 px-3 py-1.5 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-xs text-gold/70">{Math.round(zoom * 100)}%</p>
              </motion.div>
            )}

            {/* Prev / Next arrows — only when multiple images */}
            {images.length > 1 && (
              <>
                <motion.button
                  className="absolute right-5 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-black/60 text-gold backdrop-blur-sm transition-all hover:border-gold/60 hover:bg-gold/10"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  aria-label={t('lightbox.prevAria')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
                <motion.button
                  className="absolute left-5 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-black/60 text-gold backdrop-blur-sm transition-all hover:border-gold/60 hover:bg-gold/10"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={(e) => { e.stopPropagation(); next() }}
                  aria-label={t('lightbox.nextAria')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                {/* Dot indicators */}
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setIndex(i); setZoom(1); setPan({ x: 0, y: 0 }) }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-gold/30'}`}
                      aria-label={t('lightbox.imageAria').replace('{n}', String(i + 1))}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  )
}
