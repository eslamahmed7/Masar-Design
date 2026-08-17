'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import gsap from 'gsap'

export function LoadingIndicator({ visible = true }: { visible?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = 60

    let animationFrameId: number
    let currentProgress = 0
    const targetProgress = Math.random() * 0.8 + 0.2 // Random between 0.2-1
    let progressDirection = 1

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Ease towards target
      if (currentProgress < targetProgress) {
        currentProgress += (targetProgress - currentProgress) * 0.02
      } else if (currentProgress > 0.95) {
        currentProgress = 0.95
      }

      setProgress(currentProgress)

      // Draw progress line
      const lineHeight = 2
      const lineY = canvas.height / 2
      const lineWidth = canvas.width * currentProgress

      // Main gold line
      ctx.fillStyle = 'rgba(212, 175, 110, 0.8)'
      ctx.fillRect(0, lineY - lineHeight / 2, lineWidth, lineHeight)

      // Glow effect
      const gradient = ctx.createLinearGradient(
        Math.max(0, lineWidth - 100),
        0,
        lineWidth + 50,
        0
      )
      gradient.addColorStop(0, 'rgba(212, 175, 110, 0)')
      gradient.addColorStop(0.5, 'rgba(212, 175, 110, 0.4)')
      gradient.addColorStop(1, 'rgba(212, 175, 110, 0)')

      ctx.fillStyle = gradient
      ctx.fillRect(
        Math.max(0, lineWidth - 100),
        lineY - 8,
        100,
        16
      )

      // Construction nodes along the line
      const nodeSpacing = 40
      const numNodes = Math.floor(lineWidth / nodeSpacing)
      for (let i = 0; i <= numNodes; i++) {
        const nodeX = i * nodeSpacing
        const nodeOpacity = Math.min((lineWidth - nodeX) / 50, 1) * 0.6
        ctx.fillStyle = `rgba(212, 175, 110, ${nodeOpacity})`
        ctx.fillRect(nodeX - 3, lineY - 4, 6, 8)
        ctx.strokeStyle = `rgba(212, 175, 110, ${nodeOpacity * 0.5})`
        ctx.lineWidth = 1
        ctx.strokeRect(nodeX - 5, lineY - 6, 10, 12)
      }

      // Subtle blueprint grid background
      ctx.strokeStyle = 'rgba(212, 175, 110, 0.05)'
      ctx.lineWidth = 0.5
      const gridSize = 20
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [visible])

  if (!visible) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[60px] z-40 bg-background/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: 'block' }}
      />

      {/* Logo center indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="text-xs font-medium text-gold/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.5 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(progress * 100)}%
        </motion.div>
      </div>
    </motion.div>
  )
}
