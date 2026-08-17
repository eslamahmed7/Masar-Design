'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import gsap from 'gsap'
import { useI18n } from '@/lib/i18n'

const INTRO_KEY = 'masar-intro-viewed'

export function CinematicIntro() {
  const { t } = useI18n()
  const [showIntro, setShowIntro] = useState<boolean | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Check if user has already seen the intro
    const hasViewed = typeof window !== 'undefined' && localStorage.getItem(INTRO_KEY)
    setShowIntro(!hasViewed)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (showIntro !== true) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number
    let progress = 0

    // Scene 1: Black screen with golden point
    const scene1Duration = 0.8
    // Scene 2: Blueprint drawing
    const scene2Duration = 1.5
    // Scene 3: Logo transform
    const scene3Duration = 0.8
    // Scene 4: Blueprint dissolve
    const scene4Duration = 0.9

    const totalDuration =
      scene1Duration + scene2Duration + scene3Duration + scene4Duration

    const drawGoldenPoint = (
      x: number,
      y: number,
      size: number,
      opacity: number
    ) => {
      ctx.fillStyle = `rgba(212, 175, 110, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()

      // Glow
      ctx.strokeStyle = `rgba(212, 175, 110, ${opacity * 0.5})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    const drawBlueprintLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      opacity: number,
      dashOffset = 0
    ) => {
      ctx.strokeStyle = `rgba(212, 175, 110, ${opacity})`
      ctx.lineWidth = 2
      ctx.lineDashOffset = dashOffset
      ctx.setLineDash([10, 10])
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawConstructionPoint = (
      x: number,
      y: number,
      opacity: number
    ) => {
      ctx.fillStyle = `rgba(212, 175, 110, ${opacity})`
      ctx.fillRect(x - 4, y - 4, 8, 8)
      ctx.strokeStyle = `rgba(212, 175, 110, ${opacity * 0.5})`
      ctx.lineWidth = 1
      ctx.strokeRect(x - 6, y - 6, 12, 12)
    }

    const bgFill =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-deep')
        .trim() || '#241f18'

    const animate = (timestamp: number) => {
      const elapsed = (timestamp % (totalDuration * 1000)) / 1000
      progress = elapsed / totalDuration

      // Clear canvas
      ctx.fillStyle = bgFill
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      if (progress < scene1Duration / totalDuration) {
        // Scene 1: Golden point appearing
        const sceneProgress = progress / (scene1Duration / totalDuration)
        const size = 3 + sceneProgress * 2
        const opacity = sceneProgress * 0.8

        drawGoldenPoint(centerX, centerY, size, opacity)
      } else if (
        progress <
        (scene1Duration + scene2Duration) / totalDuration
      ) {
        // Scene 2: Blueprint lines drawing from point
        const sceneProgress =
          (progress - scene1Duration / totalDuration) /
          (scene2Duration / totalDuration)
        const opacity = 0.7 + sceneProgress * 0.3

        // Draw main construction point
        drawGoldenPoint(centerX, centerY, 5, opacity)

        // Draw expanding architectural lines
        const lineDistance = 200 * sceneProgress
        const numLines = Math.ceil(sceneProgress * 8)

        for (let i = 0; i < numLines; i++) {
          const angle = (i / 8) * Math.PI * 2
          const x1 = centerX + Math.cos(angle) * 20
          const y1 = centerY + Math.sin(angle) * 20
          const x2 = centerX + Math.cos(angle) * lineDistance
          const y2 = centerY + Math.sin(angle) * lineDistance

          drawBlueprintLine(x1, y1, x2, y2, opacity * 0.6, -sceneProgress * 20)
          drawConstructionPoint(x2, y2, opacity * 0.5)
        }

        // Draw blueprint grid hint
        const gridSize = 30
        const gridOpacity = opacity * 0.15
        for (let x = 0; x < canvas.width; x += gridSize) {
          drawBlueprintLine(x, 0, x, canvas.height, gridOpacity, 0)
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          drawBlueprintLine(0, y, canvas.width, y, gridOpacity, 0)
        }
      } else if (
        progress <
        (scene1Duration + scene2Duration + scene3Duration) / totalDuration
      ) {
        // Scene 3: Logo appears and glows
        const sceneProgress =
          (progress -
            (scene1Duration + scene2Duration) / totalDuration) /
          (scene3Duration / totalDuration)

        const blueprintOpacity = 0.3 * (1 - sceneProgress)
        const logoOpacity = Math.min(sceneProgress * 1.5, 1)

        // Fade blueprint
        ctx.fillStyle = `rgba(212, 175, 110, ${blueprintOpacity})`
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2
          const x = centerX + Math.cos(angle) * (100 * blueprintOpacity)
          const y = centerY + Math.sin(angle) * (100 * blueprintOpacity)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()

        // Draw soft glow around logo area
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          50,
          centerX,
          centerY,
          200
        )
        gradient.addColorStop(
          0,
          `rgba(212, 175, 110, ${logoOpacity * 0.3})`
        )
        gradient.addColorStop(1, 'rgba(212, 175, 110, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        // Scene 4: Blueprint lines dissolve, page fades in
        const sceneProgress =
          (progress -
            (scene1Duration + scene2Duration + scene3Duration) /
              totalDuration) /
          (scene4Duration / totalDuration)

        // Soft blueprint dissolve
        const dissolveOpacity = (1 - sceneProgress) * 0.2
        ctx.fillStyle = `rgba(212, 175, 110, ${dissolveOpacity})`

        const gridSize = 40
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

        // When animation completes
        if (sceneProgress >= 0.95) {
          localStorage.setItem(INTRO_KEY, 'true')
          setShowIntro(false)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [showIntro])

  const handleSkip = () => {
    localStorage.setItem(INTRO_KEY, 'true')
    setShowIntro(false)
  }

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ display: 'block' }}
          />

          {/* Skip button */}
          <motion.button
            onClick={handleSkip}
            className="absolute top-8 right-8 text-xs font-medium text-ink-soft hover:text-ink dark:text-gold/60 dark:hover:text-gold transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            {t('about.skipIntro')}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
