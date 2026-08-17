'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useLightbox } from '@/components/global/image-lightbox'
import { useI18n } from '@/lib/i18n'

type GalleryImage = { src: string; alt: string; span: string }

// Fallback static gallery if no projects passed
const STATIC_GALLERY: GalleryImage[] = [
  { src: '/about/gallery-1.png', alt: 'bedroom', span: 'col-span-2 row-span-2' },
  { src: '/about/gallery-2.png', alt: 'kitchen', span: 'col-span-1 row-span-1' },
  { src: '/about/gallery-3.png', alt: 'spa', span: 'col-span-1 row-span-1' },
  { src: '/about/gallery-4.png', alt: 'living', span: 'col-span-2 row-span-1' },
  { src: '/about/gallery-5.png', alt: 'office', span: 'col-span-1 row-span-2' },
]

const SPANS = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-2',
]

export function AboutGallery({ projectImages = [] }: { projectImages?: { src: string; alt: string }[] }) {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })
  const { open: openLightbox } = useLightbox()
  const [page, setPage] = useState(0)

  // Build gallery from real project images or fall back to static
  const allImages: GalleryImage[] = projectImages.length >= 5
    ? projectImages.slice(0, 5).map((img, i) => ({
        src: img.src,
        alt: img.alt,
        span: SPANS[i],
      }))
    : STATIC_GALLERY.map(img => ({
        src: img.src,
        alt: t(`aboutPage.galleryAlts.${img.alt}`),
        span: img.span,
      }))

  // Auto-cycle every 6s — pick a new random set of 5 from the pool
  const pool = projectImages.length >= 5 ? projectImages : []
  useEffect(() => {
    if (pool.length < 10) return
    const t = setInterval(() => setPage(p => p + 1), 6000)
    return () => clearInterval(t)
  }, [pool.length])

  const gallery: GalleryImage[] = pool.length >= 10
    ? Array.from({ length: 5 }, (_, i) => ({
        src: pool[(page * 5 + i) % pool.length].src,
        alt: pool[(page * 5 + i) % pool.length].alt,
        span: SPANS[i],
      }))
    : allImages

  return (
    <section ref={ref} className="relative py-10 sm:py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        {/* Heading */}
        <div className="mb-6 sm:mb-16 text-center">
          <motion.span
            className="mb-1 sm:mb-4 block text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase"
            style={{ color: 'var(--gold)' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            {t('aboutPage.galleryLabel')}
          </motion.span>
          <div className="overflow-hidden">
            <motion.h2
              className="font-heading text-2xl sm:text-5xl md:text-6xl font-bold text-foreground"
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('aboutPage.galleryTitle')}
            </motion.h2>
          </div>
        </div>

        {/* Mosaic grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-4 h-[320px] sm:h-[720px]">
          {gallery.map((item, i) => (
            <motion.div
              key={item.src}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${item.span}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => openLightbox(gallery.map(g => ({ src: g.src, alt: g.alt, title: g.alt })), i)}
            >
              {/* Image with zoom */}
              <motion.div
                className="absolute inset-0 will-transform"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 66vw, 50vw"
                  quality={80}
                />
              </motion.div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-500" />

              {/* Hover: light reflection strip */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden rounded-2xl"
                style={{ pointerEvents: 'none' }}
              >
                <div
                  className="absolute top-0 bottom-0 w-1/4 skew-x-[-16deg] -left-full group-hover:left-full"
                  style={{
                    background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--ink) 6%, transparent), transparent)',
                    transition: 'left 0.7s ease',
                  }}
                />
              </div>

              {/* Alt caption */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-2 sm:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to top, rgba(9,9,9,0.8), transparent)' }}
              >
                <p className="text-[10px] sm:text-sm text-foreground/80">{item.alt}</p>
              </motion.div>

              {/* Gold border */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,106,0.3)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  )
}
