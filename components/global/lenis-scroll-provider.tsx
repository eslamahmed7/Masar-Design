'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Disable Lenis smooth scrolling in admin panel to prevent layout scroll issues
    if (pathname?.startsWith('/admin')) return

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      orientation: 'vertical',
    })

    lenisRef.current = lenis

    // Connect GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update)
    
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    
    gsap.ticker.add(rafCallback)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(rafCallback)
    }
  }, [pathname])

  return children
}
