'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, type MotionValue, useTransform } from 'motion/react'
import { useI18n } from '@/lib/i18n'

type FloatObj = {
  src: string
  altKey: string
  className: string
  size: number
  depth: number // parallax multiplier
  float: number // vertical float amplitude
  rotate: number // gentle rotation amplitude
  duration: number
  delay: number
}

const OBJECTS: FloatObj[] = [
  {
    src: '/objects/chair.png',
    altKey: 'chair',
    className: 'left-[-6%] top-[14%]',
    size: 150,
    depth: 34,
    float: 22,
    rotate: 5,
    duration: 9,
    delay: 0,
  },
  {
    src: '/objects/lamp.png',
    altKey: 'lamp',
    className: 'left-[2%] bottom-[8%]',
    size: 120,
    depth: 22,
    float: 18,
    rotate: -4,
    duration: 11,
    delay: 1.2,
  },
  {
    src: '/objects/vase.png',
    altKey: 'vase',
    className: 'right-[-5%] top-[6%]',
    size: 116,
    depth: 40,
    float: 26,
    rotate: 6,
    duration: 8,
    delay: 0.6,
  },
  {
    src: '/objects/plant.png',
    altKey: 'plant',
    className: 'right-[-4%] bottom-[10%]',
    size: 132,
    depth: 28,
    float: 20,
    rotate: -5,
    duration: 10,
    delay: 1.6,
  },
  {
    src: '/objects/marble.png',
    altKey: 'marble',
    className: 'right-[16%] bottom-[-4%]',
    size: 96,
    depth: 48,
    float: 16,
    rotate: 8,
    duration: 12,
    delay: 0.9,
  },
  {
    src: '/objects/wood.png',
    altKey: 'wood',
    className: 'left-[18%] top-[-3%]',
    size: 92,
    depth: 44,
    float: 15,
    rotate: -7,
    duration: 13,
    delay: 2,
  },
]

function FloatingItem({
  obj,
  index,
  mouseX,
  mouseY,
}: {
  obj: FloatObj
  index: number
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const { t } = useI18n()
  const px = useTransform(mouseX, [-1, 1], [obj.depth, -obj.depth])
  const py = useTransform(mouseY, [-1, 1], [obj.depth * 0.8, -obj.depth * 0.8])

  return (
    <motion.div
      style={{ x: px, y: py }}
      className={`pointer-events-none absolute z-20 ${obj.className}`}
      initial={{ opacity: 0, scale: 0.6, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 1,
        delay: 0.4 + index * 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        animate={{
          y: [0, -obj.float, 0],
          rotate: [0, obj.rotate, 0],
        }}
        transition={{
          duration: obj.duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: obj.delay,
        }}
        className="will-transform relative drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] scale-[0.4] sm:scale-[0.8] origin-center"
        style={{ width: obj.size, height: obj.size }}
      >
        <Image
          src={obj.src || '/placeholder.svg'}
          alt={t(`cta.floatObjects.${obj.altKey}`)}
          fill
          sizes="160px"
          className="object-contain mix-blend-lighten"
        />
      </motion.div>
    </motion.div>
  )
}

export function FloatingObjects({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) return null

  return (
    <>
      {OBJECTS.map((obj, i) => (
        <FloatingItem
          key={obj.src}
          obj={obj}
          index={i}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
    </>
  )
}
