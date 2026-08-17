'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  fetchSearchItems,
  searchItems,
  QUICK_ACTIONS,
  SEARCH_SUGGESTIONS,
  type SearchItem,
} from '@/lib/search-db'
import { useSearch } from '@/lib/search-context'
import { useI18n } from '@/lib/i18n'

// ── Local-storage helpers ─────────────────────────────────────────────────
const STORAGE_KEY = 'masar_recent_searches'
const MAX_RECENT = 5

function getRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function pushRecent(query: string) {
  const prev = getRecent().filter((q) => q !== query)
  const next = [query, ...prev].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function clearRecent() {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Type-icon map ─────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: SearchItem['type'] }) {
  const { t } = useI18n()
  const map: Record<SearchItem['type'], { label: string; color: string }> = {
    project: { label: t('commandPalette.typeProject'), color: 'text-amber-400 bg-amber-400/10' },
    service: { label: t('commandPalette.typeService'), color: 'text-emerald-400 bg-emerald-400/10' },
    page: { label: t('commandPalette.typePage'), color: 'text-sky-400 bg-sky-400/10' },
    category: { label: t('commandPalette.typeCategory'), color: 'text-purple-400 bg-purple-400/10' },
  }
  const { label, color } = map[type]
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${color}`}>
      {label}
    </span>
  )
}

// ── Arrow icon ────────────────────────────────────────────────────────────
function ArrowIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-gold/50 transition-all group-hover:text-gold group-hover:translate-x-[-2px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

// ── Quick-action icons ────────────────────────────────────────────────────
function QuickIcon({ icon }: { icon: string }) {
  const icons: Record<string, string> = {
    rocket: 'M13 10V3L4 14h7v7l9-11h-7z',
    message: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    grid: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return (
    <svg
      className="h-4 w-4 text-gold"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon] ?? icons.info} />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export function CommandPalette() {
  const { isOpen, openSearch, closeSearch } = useSearch()
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const [searchDb, setSearchDb] = useState<SearchItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Load dynamic search data from Supabase on mount
  useEffect(() => {
    fetchSearchItems().then(setSearchDb).catch(() => {})
  }, [])

  // Debounced results
  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchItems(searchDb, query)
  }, [query, searchDb])

  const showResults = query.trim().length > 0
  const showEmpty = showResults && results.length === 0

  // Sync recent from localStorage + lock ALL scroll when palette opens
  useEffect(() => {
    if (isOpen) {
      setRecent(getRecent())
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 60)
      // Lock scroll on both html and body (cross-browser)
      const prevBodyOverflow = document.body.style.overflow
      const prevHtmlOverflow = document.documentElement.style.overflow
      const prevBodyPos = document.body.style.position
      const prevScrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${prevScrollY}px`
      document.body.style.width = '100%'
      return () => {
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
        document.body.style.position = prevBodyPos
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, prevScrollY)
      }
    }
  }, [isOpen])

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) closeSearch()
        else openSearch()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, openSearch, closeSearch])

  // Navigation
  const allItems = showResults ? results : []
  const maxIndex = Math.max(0, allItems.length - 1)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, maxIndex))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = allItems[activeIndex]
        if (item) {
          handleSelect(item.href, query)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, activeIndex, maxIndex, query, closeSearch],
  )

  const handleSelect = (href: string, searchQuery?: string) => {
    if (searchQuery?.trim()) pushRecent(searchQuery.trim())
    setRecent(getRecent())
    closeSearch()
    window.location.href = href
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setActiveIndex(0)
    inputRef.current?.focus()
  }

  const handleClearRecent = () => {
    clearRecent()
    setRecent([])
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
          />

          {/* Palette container */}
          <motion.div
            key="palette"
            role="dialog"
            aria-modal="true"
            aria-label={t('commandPalette.searchAria')}
            className="fixed inset-x-4 top-[10vh] z-[201] mx-auto max-w-2xl"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <div
              className="overflow-hidden rounded-2xl border border-gold/20 shadow-2xl"
              style={{ background: 'oklch(0.14 0.007 60 / 0.97)' }}
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-gold/10 px-5 py-4">
                {/* Search icon */}
                <svg
                  className="h-5 w-5 shrink-0 text-gold/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
                  />
                </svg>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveIndex(0)
                  }}
                  placeholder={t('commandPalette.searchPlaceholder')}
                  dir="auto"
                  className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />

                {query && (
                  <button
                    onClick={() => { setQuery(''); inputRef.current?.focus() }}
                    className="shrink-0 rounded p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
                    aria-label={t('commandPalette.clearSearch')}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <kbd className="hidden shrink-0 rounded border border-gold/20 px-1.5 py-0.5 text-[11px] text-muted-foreground/50 sm:block">
                  ESC
                </kbd>
              </div>

              {/* Body — max height with scroll, isolated from page scroll */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {/* ── No query: quick actions + recent + suggestions ── */}
                {!showResults && (
                  <div className="divide-y divide-gold/10">
                    {/* Quick actions */}
                    <section className="px-3 py-3">
                      <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                        {t('commandPalette.quickActions')}
                      </p>
                      <ul className="space-y-0.5">
                        {QUICK_ACTIONS.map((action, i) => (
                          <motion.li
                            key={action.href}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.2 }}
                          >
                            <Link
                              href={action.href as any}
                              onClick={() => handleSelect(action.href)}
                              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gold/8"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gold/20 bg-gold/5">
                                <QuickIcon icon={action.icon} />
                              </span>
                              <span className="text-sm text-foreground/90">{lang === 'ar' ? action.labelAr : action.labelEn}</span>
                              <ArrowIcon />
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </section>

                    {/* Recent searches */}
                    {recent.length > 0 && (
                      <section className="px-3 py-3">
                        <div className="mb-2 flex items-center justify-between px-2">
                          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                            {t('commandPalette.recentSearches')}
                          </p>
                          <button
                            onClick={handleClearRecent}
                            className="text-[11px] text-muted-foreground/40 transition-colors hover:text-gold"
                          >
                            {t('commandPalette.clearAll')}
                          </button>
                        </div>
                        <ul className="flex flex-wrap gap-2 px-2">
                          {recent.map((r) => (
                            <li key={r}>
                              <button
                                onClick={() => handleSuggestionClick(r)}
                                className="flex items-center gap-1.5 rounded-full border border-gold/15 bg-gold/5 px-3 py-1.5 text-xs text-foreground/70 transition-all hover:border-gold/30 hover:text-gold"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {r}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* Suggestions */}
                    <section className="px-3 py-3">
                      <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                        {t('commandPalette.suggestions')}
                      </p>
                      <div className="flex flex-wrap gap-2 px-2">
                        {SEARCH_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSuggestionClick(s)}
                            className="rounded-full border border-gold/15 bg-transparent px-3 py-1.5 text-xs text-foreground/60 transition-all hover:border-gold/30 hover:text-gold"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* ── Results ── */}
                {showResults && !showEmpty && (
                  <section className="px-3 py-3">
                    <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                      {t('commandPalette.resultsCount').replace('{n}', String(results.length))}
                    </p>
                    <ul ref={listRef} className="space-y-0.5">
                      {results.map((item, i) => (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.18 }}
                        >
                          <button
                            onClick={() => handleSelect(item.href, query)}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-all ${
                              activeIndex === i
                                ? 'bg-gold/10 ring-1 ring-gold/20'
                                : 'hover:bg-gold/6'
                            }`}
                          >
                            {/* Image */}
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={lang === 'ar' ? item.titleAr : item.titleEn}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <svg className="h-5 w-5 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex-1 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {lang === 'ar' ? item.titleAr : item.titleEn}
                                </p>
                                <TypeBadge type={item.type} />
                              </div>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground/60">
                                {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
                              </p>
                              <p className="mt-0.5 text-xs text-gold/50">{lang === 'ar' ? item.category : item.categoryEn}</p>
                            </div>

                            <ArrowIcon />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* ── No results ── */}
                {showEmpty && (
                  <div className="px-5 py-10 text-center">
                    <p className="mb-1 text-sm text-muted-foreground/70">{t('commandPalette.noResults')}</p>
                    <p className="mb-5 text-xs text-muted-foreground/40">{t('commandPalette.noResultsHint')}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {['/services', '/projects', '/start'].map((href) => {
                        const labels: Record<string, string> = {
                          '/services': t('nav.services'),
                          '/projects': t('nav.projects'),
                          '/start': t('common.startProject'),
                        }
                        return (
                          <Link
                            key={href}
                            href={href as any}
                            onClick={() => handleSelect(href)}
                            className="rounded-full border border-gold/20 px-4 py-2 text-xs text-gold/70 transition-all hover:border-gold/40 hover:text-gold"
                          >
                            {labels[href]}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gold/10 px-5 py-2.5">
                <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground/40">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gold/15 px-1 py-0.5">↑</kbd>
                    <kbd className="rounded border border-gold/15 px-1 py-0.5">↓</kbd>
                    {t('commandPalette.navigate')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gold/15 px-1 py-0.5">↵</kbd>
                    {t('commandPalette.toOpen')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-gold/15 px-1 py-0.5">ESC</kbd>
                    {t('commandPalette.close')}
                  </span>
                </div>
                <div className="md:hidden" />
                <span className="font-heading text-xs text-gold/30">MASAR</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
