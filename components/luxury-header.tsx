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
  const { openPanel, theme, setLanguage } = useSettings()
  const { t, lang } = useI18n()

  const toggleLanguage = () => setLanguage(lang === 'ar' ? 'en' : 'ar')

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
          {/* Logo - fills header height */}
          <Link
            href="/"
            className="order-3 flex items-center transition-opacity hover:opacity-80"
          >
            <img
              src="/masar-logo.png"
              alt={t('footer.logoAlt')}
              style={{ height: scrolled ? '60px' : '78px', width: 'auto', objectFit: 'contain', transition: 'height 0.3s ease' }}
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
            {/* Language toggle button */}
            <motion.button
              onClick={toggleLanguage}
              className="flex h-9 items-center gap-1.5 px-2.5 rounded-full border border-gold/25 text-gold/70 transition-all hover:border-gold/50 hover:text-gold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle Language"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              {/* Globe icon */}
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
              </svg>
              {/* Language indicator */}
              <span className="text-[10px] font-bold tracking-widest">
                {lang === 'ar' ? 'EN' : 'AR'}
              </span>
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
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <img
              src="/masar-logo.png"
              alt={t('footer.logoAlt')}
              style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Search + Settings + Menu */}
          <div className="flex items-center gap-2">
            {/* Language toggle button */}
            <motion.button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-full border border-gold/25 text-gold/70 hover:text-gold transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle Language"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
              </svg>
              <span className="text-[10px] font-bold tracking-widest">
                {lang === 'ar' ? 'EN' : 'AR'}
              </span>
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
