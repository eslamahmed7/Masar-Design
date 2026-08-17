'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useTransform,
} from 'motion/react'

import { useMobile } from '@/lib/use-mobile'
import { useI18n } from '@/lib/i18n'

const SLIDES = [
  { src: '/interiors/living-room.png', ar: 'غرفة معيشة فاخرة', en: 'Living Room' },
  { src: '/interiors/bedroom.png', ar: 'غرفة نوم عصرية', en: 'Bedroom' },
  { src: '/interiors/kitchen.png', ar: 'مطبخ فاخر', en: 'Kitchen' },
  { src: '/interiors/closet.png', ar: 'غرفة ملابس', en: 'Walk-in Closet' },
  { src: '/interiors/bathroom.png', ar: 'حمام رخامي', en: 'Marble Bathroom' },
  { src: '/interiors/entrance.png', ar: 'مدخل الفيلا', en: 'Villa Entrance' },
  { src: '/interiors/office.png', ar: 'مكتب منزلي', en: 'Home Office' },
  { src: '/interiors/dining.png', ar: 'مساحة الطعام', en: 'Dining Space' },
]

export function CinematicSlideshow({
  rotateX,
  rotateY,
}: {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
}) {
  const [index, setIndex] = useState(0)
  const isMobile = useMobile()
  const { lang } = useI18n()

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  // Depth: inner layers shift a touch more than the frame for parallax
  const innerX = useTransform(rotateY, [-8, 8], [-18, 18])
  const innerY = useTransform(rotateX, [-8, 8], [18, -18])

  const active = SLIDES[index]

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="will-transform relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-gold/20 bg-card shadow-2xl md:aspect-[3/4]"
    >
      {/* image stack */}
      <motion.div
        style={{ x: innerX, y: innerY }}
        className="absolute -inset-6"
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: isMobile ? 1 : 1.18, filter: isMobile ? 'none' : 'blur(14px)' }}
            animate={{ opacity: 1, scale: isMobile ? 1 : 1.06, filter: isMobile ? 'none' : 'blur(0px)' }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 1.02, filter: isMobile ? 'none' : 'blur(10px)' }}
            transition={{
              opacity: { duration: 1.6, ease: 'easeInOut' },
              filter: { duration: 1.6, ease: 'easeInOut' },
              scale: isMobile ? { duration: 0 } : { duration: 6, ease: 'linear' },
            }}
            className="absolute inset-0"
          >
            <Image
              src={active.src || '/placeholder.svg'}
              alt={lang === 'ar' ? active.ar : active.en}
              fill
              priority={index === 0}
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, 40vw"
              className="object-cover"
              quality={isMobile ? 70 : 85}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* depth gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />

      {/* recurring light sweep */}
      <motion.div
        key={`sweep-${index}`}
        initial={{ x: '-120%', opacity: 0 }}
        animate={{ x: '220%', opacity: [0, 0.4, 0] }}
        transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      {/* inner frame highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />

      {/* caption */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={lang === 'ar' ? active.ar : active.en}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-heading text-xl text-foreground">
              {lang === 'ar' ? active.ar : active.en}
            </p>
            <p className="mt-1 font-serif text-sm italic tracking-wide text-gold/80">
              {lang === 'ar' ? active.en : active.ar}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* progress dots */}
        <div className="flex gap-1.5">
          {SLIDES.map((s, i) => (
            <span
              key={s.en}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-6 bg-gold' : 'w-1.5 bg-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
