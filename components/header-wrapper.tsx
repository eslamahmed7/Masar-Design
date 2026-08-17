'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LuxuryHeader } from '@/components/luxury-header'
import { PromotionBanner } from '@/components/global/promotion-banner'

export function HeaderWrapper() {
  const pathname = usePathname()
  const [isHome, setIsHome] = useState(true)

  useEffect(() => {
    setIsHome(pathname === '/')
  }, [pathname])

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null

  // Hide on full-screen 360 tour pages — only a back button is shown there
  if (pathname?.includes('/360/tour')) return null

  return (
    <div id="header-wrapper" className="fixed top-0 z-50 flex flex-col w-full transition-opacity duration-300">
      <PromotionBanner />
      <LuxuryHeader />
    </div>
  )
}

