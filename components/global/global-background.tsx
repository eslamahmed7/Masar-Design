'use client'

import { useEffect, useRef, useState } from 'react'

export function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    // Initialize particles
    const initParticles = () => {
      particles = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 50000)
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
        })
      }
    }

    initParticles()

    let spotlightX = canvas.width / 2
    let spotlightY = canvas.height / 2
    let spotlightTargetX = canvas.width / 2
    let spotlightTargetY = canvas.height / 2

    // Track mouse for spotlight
    const handleMouseMove = (e: MouseEvent) => {
      spotlightTargetX = e.clientX
      spotlightTargetY = e.clientY
    }

    window.addEventListener('mousemove', handleMouseMove)

    let animationFrameId: number

    const bgFill =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-deep')
        .trim() || '#241f18'

    const animate = () => {
      ctx.fillStyle = bgFill
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Blueprint grid (very subtle)
      ctx.strokeStyle = 'rgba(212, 175, 110, 0.03)'
      ctx.lineWidth = 0.5

      const gridSize = 80
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

      // Soft moving spotlight
      spotlightX += (spotlightTargetX - spotlightX) * 0.05
      spotlightY += (spotlightTargetY - spotlightY) * 0.05

      const spotlightGradient = ctx.createRadialGradient(
        spotlightX,
        spotlightY,
        0,
        spotlightX,
        spotlightY,
        400
      )
      spotlightGradient.addColorStop(
        0,
        'rgba(212, 175, 110, 0.08)'
      )
      spotlightGradient.addColorStop(0.5, 'rgba(212, 175, 110, 0.02)')
      spotlightGradient.addColorStop(1, 'rgba(212, 175, 110, 0)')

      ctx.fillStyle = spotlightGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animate and draw particles
      for (let particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
        }

        // Keep in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Draw particle
        ctx.fillStyle = `rgba(212, 175, 110, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMobile])

  if (isMobile) {
    return <div className="fixed inset-0 bg-[var(--bg-deep)] -z-10 pointer-events-none" />
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ display: 'block' }}
    />
  )
}
