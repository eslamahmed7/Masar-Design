'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import gsap from 'gsap'

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()

  const handleBeforeUnload = () => {
    // Trigger transition on route change
    setIsTransitioning(true)
  }

  useEffect(() => {
    // When pathname changes, stop the transition
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
      }, 700)

      return () => clearTimeout(timeout)
    }
  }, [pathname, isTransitioning])

  useEffect(() => {
    const handleRouteChange = () => {
      setIsTransitioning(true)
    }

    // Setup for manual route tracking
    const handlePopState = () => {
      handleRouteChange()
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <PageTransitionOverlay key="transition" canvasRef={canvasRef} />
        )}
      </AnimatePresence>
      {children}
    </>
  )
}

function PageTransitionOverlay({
  canvasRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) {
  const canvRef = useRef<HTMLCanvasElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const canvas = canvRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number
    let progress = 0
    const totalDuration = 0.7 // 700ms

    const drawBlueprintLines = (
      opacity: number,
      progress: number
    ) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Blueprint grid
      ctx.strokeStyle = `rgba(212, 175, 110, ${opacity * 0.2})`
      ctx.lineWidth = 1
      ctx.setLineDash([8, 8])

      const gridSize = 50
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      ctx.setLineDash([])

      // Animated architectural lines
      const numLines = Math.ceil(progress * 12)
      for (let i = 0; i < numLines; i++) {
        const angle = (i / 12) * Math.PI * 2
        const distance = 100 + progress * 150
        const x1 = canvas.width / 2
        const y1 = canvas.height / 2
        const x2 = x1 + Math.cos(angle) * distance
        const y2 = y1 + Math.sin(angle) * distance

        ctx.strokeStyle = `rgba(212, 175, 110, ${opacity * (1 - progress * 0.3)})`
        ctx.lineWidth = 1.5
        ctx.setLineDash([10, 10])
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      ctx.setLineDash([])

      // Central logo glow
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        30,
        canvas.width / 2,
        canvas.height / 2,
        150
      )
      gradient.addColorStop(0, `rgba(212, 175, 110, ${opacity * 0.4})`)
      gradient.addColorStop(1, 'rgba(212, 175, 110, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const animate = (timestamp: number) => {
      const elapsed = (timestamp % (totalDuration * 1000)) / 1000
      progress = Math.min(elapsed / totalDuration, 1)

      // Opacity curve: fade in, stay, fade out
      let opacity = 1
      if (progress < 0.3) {
        opacity = progress / 0.3
      } else if (progress > 0.7) {
        opacity = (1 - progress) / 0.3
      }

      drawBlueprintLines(opacity, progress)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvRef}
        className="absolute inset-0"
        style={{ display: 'block', mixBlendMode: 'screen' }}
      />
    </motion.div>
  )
}
