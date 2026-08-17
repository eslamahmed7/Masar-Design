'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FaqCard } from './faq-card'
import type { DBFaq, DBFaqCategory } from '@/lib/admin/types'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

interface Props {
  faqs: DBFaq[]
  categories: DBFaqCategory[]
}

export function FaqSection({ faqs, categories }: Props) {
  const { t, lang } = useI18n()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = faqs
    if (activeCategory) list = list.filter(f => f.category_id === activeCategory)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(f =>
        f.question_ar.toLowerCase().includes(q) ||
        f.answer_ar.toLowerCase().includes(q)
      )
    }
    return list
  }, [faqs, activeCategory, search])

  const hasResults = filtered.length > 0

  return (
    <section className="relative py-10 sm:py-24 px-2 sm:px-6 md:px-12 lg:px-24" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(70% 40% at 50% 0%, rgba(200,169,106,0.03) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14 text-center"
        >
          <p className="mb-2 sm:mb-4 font-mono text-[8px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gold/60">
            {t('faq.label')}
          </p>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold text-foreground md:text-5xl">
            {t('faq.title')}
          </h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="relative mx-auto mb-8 max-w-xl"
        >
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-foreground/30">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('faq.searchPlaceholder')}
            className="w-full rounded-xl border border-divider bg-surface/55 py-2 sm:py-3.5 pr-10 sm:pr-12 pl-3 sm:pl-5 text-[10px] sm:text-sm text-foreground placeholder:text-foreground/30 outline-none transition-all duration-300 focus:border-gold/30 focus:bg-surface/65 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.07)]"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearch('')}
                className="absolute inset-y-0 left-4 flex items-center text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category filters */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mb-6 sm:mb-10 flex flex-wrap justify-center gap-1.5 sm:gap-2.5"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 sm:px-5 py-1 sm:py-2 text-[9px] sm:text-xs font-medium transition-all duration-300 ${
                activeCategory === null
                  ? 'bg-gold text-[#0B0B0B] shadow-[0_0_16px_rgba(200,169,106,0.25)]'
                  : 'border border-white/10 text-foreground/50 hover:border-gold/25 hover:text-foreground/80'
              }`}
            >
              {t('faq.all')}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={`rounded-full px-3 sm:px-5 py-1 sm:py-2 text-[9px] sm:text-xs font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gold text-[#0B0B0B] shadow-[0_0_16px_rgba(200,169,106,0.25)]'
                    : 'border border-white/10 text-foreground/50 hover:border-gold/25 hover:text-foreground/80'
                }`}
              >
                {cat.name_ar}
              </button>
            ))}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {hasResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-4 ${filtered.length >= 4 ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'}`}
            >
              {filtered.map((faq, i) => (
                <FaqCard
                  key={faq.id}
                  faq={faq}
                  isOpen={openId === faq.id}
                  onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                  index={i}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-6 py-20 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-divider bg-surface/50 text-foreground/20">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="font-heading text-xl text-foreground/60">{t('faq.noResults')}</p>
                <p className="mt-2 text-sm text-foreground/35">{t('faq.noResultsHint')}</p>
              </div>
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 rounded-xl border border-gold/25 px-6 py-3 text-sm font-medium text-gold transition-all hover:border-gold/50 hover:bg-gold/8 hover:shadow-[0_0_20px_rgba(200,169,106,0.1)]"
              >
                {t('faq.contact')}
                <svg className="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
