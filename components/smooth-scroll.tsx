'use client'

import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  // First effect: set mounted flag immediately
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Second effect: only run Lenis setup after mount to prevent HMR router errors
  useEffect(() => {
    if (!isMounted) return

    // Respect reduced motion preference
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    // Disable virtual scrolling entirely on mobile / touch devices for maximum native performance
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    const isMobileViewport = window.innerWidth < 768
    if (isTouch || isMobileViewport) {
      return
    }

    let lenis: InstanceType<typeof Lenis> | null = null
    let raf: ((time: number) => void) | null = null

    // Defer initialization to avoid router initialization race during HMR
    const timeoutId = setTimeout(() => {
      try {
        // Safely register plugin
        try {
          gsap.registerPlugin(ScrollTrigger)
        } catch (_) {
          // already registered
        }

        lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.5,
        })

        lenis.on('scroll', ScrollTrigger.update)

        raf = (time: number) => {
          lenis!.raf(time * 1000)
        }
        gsap.ticker.add(raf)
        gsap.ticker.lagSmoothing(0)
      } catch (error) {
        // Silently ignore initialization errors during HMR
        if (process.env.NODE_ENV === 'development') {
          console.debug('[v0] Lenis setup deferred')
        }
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (raf) {
        gsap.ticker.remove(raf)
      }
      if (lenis) {
        lenis.destroy()
      }
    }
  }, [isMounted])

  return <>{children}</>
}
