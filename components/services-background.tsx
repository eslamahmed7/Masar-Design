'use client'

import { useEffect, useState } from 'react'
import { motion, type MotionValue, useTransform } from 'motion/react'
import { useMobile } from '@/lib/use-mobile'

type Particle = {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  drift: number
}

export function ServicesBackground({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>
}) {
  const [particles, setParticles] = useState<Particle[]>([])
  const isMobile = useMobile()

  // Generate particles on client only to avoid hydration mismatch
  useEffect(() => {
    const isMobileNow = window.innerWidth < 768
    const count = isMobileNow ? 0 : 20 // zero particles on mobile
    if (count > 0) {
      setParticles(
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 1.5 + 0.5,
          delay: Math.random() * 4,
          duration: Math.random() * 6 + 10,
          drift: Math.random() * 20 - 10,
        })),
      )
    }
  }, [])

  const opacityY = useTransform(scrollProgress, [0, 0.3, 1], [0.1, 0.15, 0.08])

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/50" />
        {/* Black marble texture placeholder */}
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#0a0a0a" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/50" />

      {/* Black marble texture */}
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" preserveAspectRatio="none">
          {!isMobile && (
            <defs>
              <filter id="marble-filter">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.02"
                  numOctaves="4"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="40"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          )}
          <rect width="100%" height="100%" fill="#0a0a0a" filter={isMobile ? 'none' : 'url(#marble-filter)'} />
        </svg>
      </div>

      {/* Architectural blueprint lines */}
      <motion.svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        opacity={0.08}
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="rgb(212, 175, 55)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </motion.svg>

      {/* Architectural accent lines */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: opacityY }}
      >
        <svg className="h-full w-full" preserveAspectRatio="none">
          <line
            x1="0"
            y1="25%"
            x2="100%"
            y2="25%"
            stroke="rgb(212, 175, 55)"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgb(212, 175, 55)"
            strokeWidth="1"
            opacity="0.2"
          />
          <line
            x1="0"
            y1="75%"
            x2="100%"
            y2="75%"
            stroke="rgb(212, 175, 55)"
            strokeWidth="1"
            opacity="0.15"
          />
        </svg>
      </motion.div>

      {/* Floating particles with depth */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gold/30 blur-sm"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, particle.drift, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Soft golden glow center */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-radial from-gold/10 via-gold/5 to-transparent blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='2'/%3E%3C/filter%3E%3Crect width='400' height='400' fill='%23ffffff' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Vignette fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
    </div>
  )
}
