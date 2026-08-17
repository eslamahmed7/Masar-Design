'use client'

import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

type Ripple = { id: number; x: number; y: number }

export function MagneticButton({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * 0.35)
    y.set(relY * 0.4)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const id = Date.now()
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ])
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700)
    onClick?.(e)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/40 bg-gold/10 px-8 py-4 font-heading text-base font-medium text-gold transition-colors duration-500 hover:bg-gold hover:text-primary-foreground ${className}`}
    >
      {/* glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'var(--gold)' }}
      />
      {/* light sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-opacity duration-300 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
      />
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pointer-events-none absolute h-24 w-24 rounded-full bg-white/40"
          style={{ left: r.x - 48, top: r.y - 48 }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
