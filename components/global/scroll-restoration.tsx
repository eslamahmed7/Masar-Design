'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Intelligent scroll restoration.
 * Saves each page's scroll position before navigating away,
 * and restores it on return — without fighting with Lenis.
 */
export function ScrollRestoration() {
  const pathname = usePathname()
  const positionsRef = useRef<Record<string, number>>({})
  const isFirstRender = useRef(true)

  useEffect(() => {
    // On first render, try to restore saved position for this route
    if (isFirstRender.current) {
      isFirstRender.current = false
      const saved = positionsRef.current[pathname]
      if (saved !== undefined) {
        // Small delay so Lenis / layout has settled
        const timer = setTimeout(() => {
          window.scrollTo({ top: saved, behavior: 'instant' })
        }, 80)
        return () => clearTimeout(timer)
      }
      return
    }

    // Save position when pathname changes (i.e. navigating away)
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      positionsRef.current[pathname] = window.scrollY
    }
  }, [pathname])

  // Also save position on beforeunload (tab close / refresh)
  useEffect(() => {
    const save = () => {
      positionsRef.current[pathname] = window.scrollY
    }
    window.addEventListener('beforeunload', save)
    return () => window.removeEventListener('beforeunload', save)
  }, [pathname])

  return null
}
