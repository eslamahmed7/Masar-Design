'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/lib/site-config'
import { useSearch } from '@/lib/search-context'
import { useSettings } from '@/lib/settings-context'
import { useI18n } from '@/lib/i18n'

const SECTION_IDS = ['hero', 'about', 'projects', 'services', 'contact']
const SECTION_TO_HREF: Record<string, string> = {
  hero: '/',
  about: '/about',
  projects: '/projects',
  services: '/services',
  contact: '/contact',
}

export function LuxuryHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('/')
  const pathname = usePathname()
  const { openSearch } = useSearch()
  const { openPanel, theme } = useSettings()
  const { t, lang } = useI18n()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  const desktopScrim = isDark ? 'rgba(11, 11, 11, 0.8)' : 'rgba(246, 242, 234, 0.85)'
  const mobileScrim = isDark ? 'rgba(11, 11, 11, 0.95)' : 'rgba(250, 247, 240, 0.95)'

  const [isHome, setIsHome] = useState(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsHome(pathname === '/')
  }, [pathname])

  useEffect(() => {
    if (!isMounted) return

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return

    if (pathname !== '/') {
      setActiveSection(pathname)
      return
    }

    const states = new Map<string, { intersecting: boolean; top: number }>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          states.set(entry.target.id, {
            intersecting: entry.isIntersecting,
            top: entry.boundingClientRect.top,
          })
        }

        let bestId: string | null = null
        let bestDist = Infinity

        for (const id of SECTION_IDS) {
          const s = states.get(id)
          if (!s || !s.intersecting) continue
          const dist = Math.abs(s.top)
          if (dist < bestDist) {
            bestDist = dist
            bestId = id
          }
        }

        if (bestId) {
          const href = SECTION_TO_HREF[bestId]
          if (href) setActiveSection(href)
        }
      },
      { threshold: 0, rootMargin: '-80px 0px -60% 0px' },
    )

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [isMounted, pathname])

  if (!isMounted) {
    return <div className="h-20" />
  }

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        className="relative w-full z-50 hidden md:block h-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto flex items-center justify-between px-8 transition-all duration-300"
          animate={{
            height: scrolled ? 64 : 80,
            backgroundColor: scrolled ? desktopScrim : 'rgba(11, 11, 11, 0)',
            backdropFilter: scrolled ? 'blur(8px)' : 'blur(0px)',
          }}
        >
          {/* Logo - Right */}
          <Link
            href="/"
            className="order-3 flex items-center gap-3 transition-colors group"
          >
            <span className="font-heading text-lg font-bold tracking-wider text-gold">
              Masar
            </span>
            <div className="h-5 w-px bg-gold/25" />
            <img
              src="/masar-logo.png"
              alt={t('footer.logoAlt')}
              className="w-11 h-11 object-contain"
            />
          </Link>

          {/* Navigation - Center */}
          <nav className="order-2 flex items-center gap-8">
            {SITE_CONFIG.nav.map((item) => (
              <DesktopNavLink key={item.href} item={item} isActive={activeSection === item.href} />
            ))}
          </nav>

          {/* Search + Settings + CTA - Left */}
          <div className="order-1 flex items-center gap-3">
            {/* Settings button */}
            <motion.button
              onClick={openPanel}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold/70 transition-all hover:border-gold/50 hover:text-gold"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label={t('common.settingsAria')}
              title={t('common.settings')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>

            {/* Search button */}
            <motion.button
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold/70 transition-all hover:border-gold/50 hover:text-gold"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label={t('common.searchAria')}
              title={t('common.searchHint')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
            </motion.button>

            {/* CTA Button */}
            <Link href="/start">
              <motion.span
                className="inline-block rounded-full border border-gold bg-transparent px-6 py-2 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-[#0B0B0B]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('common.startProject')}
              </motion.span>
            </Link>
          </div>
          {/* Border */}
          {scrolled && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      </motion.header>

      {/* Mobile Header */}
      <motion.header
        className="relative w-full z-50 md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-300 border-b ${
            scrolled ? 'py-3 border-[#C8A96A]/20' : 'py-5 border-transparent'
          }`}
          style={{
            backgroundColor: scrolled ? mobileScrim : 'rgba(11, 11, 11, 0)',
            backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading group">
            <span className="text-base font-bold text-gold">
              Masar
            </span>
            <div className="h-4 w-px bg-gold/25" />
            <img
              src="/masar-logo.png"
              alt={t('footer.logoAlt')}
              className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
            />
          </Link>

          {/* Search + Settings + Menu */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={openPanel}
              className="p-2 text-gold/70 hover:text-gold transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label={t('common.settingsAria')}
              title={t('common.settings')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </motion.button>

            <motion.button
              onClick={openSearch}
              className="p-2 text-gold/70 hover:text-gold transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label={t('common.search')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
            </motion.button>

          {/* Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gold hover:text-gold/80 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-gold/10"
          >
            <nav className="flex flex-col divide-y divide-gold/10">
              {SITE_CONFIG.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-6 py-4 transition-colors text-right ${
                    activeSection === item.href
                      ? 'text-gold font-semibold'
                      : 'text-[#C8A96A] hover:bg-gold/5'
                  }`}
                >
                  {lang === 'ar' ? item.labelAr : item.labelEn}
                </Link>
              ))}
              <div className="px-6 py-4 flex justify-end">
                <Link
                  href="/start"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border border-gold bg-transparent px-6 py-2 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-[#0B0B0B] text-center inline-block"
                >
                  {t('common.startProject')}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

    </>
  )
}

function DesktopNavLink({ item, isActive }: { item: { labelAr: string; labelEn: string; href: string }; isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false)
  const { lang } = useI18n()
  const highlighted = isHovered || isActive

  return (
    <Link
      href={item.href}
      className="relative text-sm font-medium transition-colors duration-300"
      style={{ color: highlighted ? 'var(--gold)' : 'var(--ink)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {lang === 'ar' ? item.labelAr : item.labelEn}
      {highlighted && (
        <motion.div
          layoutId={`underline-${item.href}`}
          className="absolute bottom--1 left-0 right-0 h-px bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  )
}
