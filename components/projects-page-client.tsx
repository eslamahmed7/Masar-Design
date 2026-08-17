'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { Heart, Eye, View } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/projects'
import type { DBCategory, DBDesignStyle } from '@/lib/admin/types'
import { useI18n } from '@/lib/i18n'

type Tab = 'all' | '360'

function Badge360() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#C8A96A] rounded-full text-[10px] font-bold text-[#C8A96A] bg-[#C8A96A]/5 tracking-widest uppercase">
      360°
    </span>
  )
}

function ProjectCard({ project, i, likedProjects, toggleLike, is360Tab }: {
  project: Project
  i: number
  likedProjects: Set<string>
  toggleLike: (id: string, e: React.MouseEvent) => void
  is360Tab: boolean
}) {
  const { t, lang } = useI18n()
  const href = is360Tab ? `/projects/${project.id}/360` : `/projects/${project.id}`

  return (
    <Link key={project.id} href={href} className="flex">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04, duration: 0.4 }}
        className="group relative flex flex-col w-full overflow-hidden rounded-[clamp(12px,2vw,28px)] bg-surface border border-[#C8A96A]/10 hover:border-[#C8A96A]/40 transition-all duration-300 cursor-pointer"
      >
        {/* Image */}
        <div className="relative w-full overflow-hidden bg-surface-2" style={{ aspectRatio: '4/3' }}>
          <Image
            src={project.image || '/placeholder.svg'}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 360 badge overlay */}
          {project.has360 && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <Badge360 />
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={(e) => toggleLike(project.id, e)}
            className="absolute top-2.5 right-2.5 z-10 p-1.5 sm:p-2 rounded-full bg-black/50 backdrop-blur-sm border border-[#C8A96A]/30 hover:bg-black/70 transition-colors"
            aria-label={likedProjects.has(project.id) ? t('projectsPage.unlike') : t('projectsPage.like')}
          >
            <Heart
              size={14}
              className="sm:w-[18px] sm:h-[18px]"
              fill={likedProjects.has(project.id) ? '#C8A96A' : 'none'}
              stroke={likedProjects.has(project.id) ? '#C8A96A' : '#D5D5D5'}
            />
          </button>

          {/* Hover CTA */}
          <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="flex items-center gap-2 px-5 py-2.5 bg-[#C8A96A] text-[#0B0B0B] rounded-lg font-medium text-sm">
              {is360Tab ? <View size={16} /> : <Eye size={16} />}
              {is360Tab ? t('projectsPage.explore360') : t('projectsPage.viewProject')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 sm:p-5 gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-[#C8A96A] font-semibold uppercase tracking-wide">{project.category}</p>
            {project.has360 && !is360Tab && <Badge360 />}
          </div>
          <h3 className="text-sm sm:text-base font-heading font-bold text-ink-strong group-hover:text-[#C8A96A] transition-colors leading-snug text-balance line-clamp-2">
            {project.title}
          </h3>
          <p className="text-xs text-ink-soft leading-relaxed line-clamp-2 hidden sm:block">{project.description}</p>

          {/* 360 tab extra info */}
          {is360Tab && project.rooms && (
            <p className="text-[10px] sm:text-xs text-[#C8A96A]/70">{project.rooms} {t('projectsPage.rooms')} · {project.designStyle}</p>
          )}

          <div className="flex items-center justify-between text-[10px] sm:text-xs text-ink-faint mt-auto pt-2">
            <span className="truncate max-w-[60%]">{project.location}</span>
            <span className="shrink-0">{project.area} {t('common.sqm')}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#C8A96A]/10 mt-1">
            <span className="text-[10px] sm:text-xs text-ink-faint">{project.year}</span>
            <span className="px-3 py-1.5 border border-[#C8A96A]/50 rounded-lg text-[10px] sm:text-xs font-medium text-[#C8A96A] hover:border-[#C8A96A] transition-all">
              {is360Tab ? t('projectsPage.explore') : t('projectsPage.view')}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

interface ProjectsPageClientProps {
  projects: Project[]
  dbCategories?: DBCategory[]
  dbStyles?: DBDesignStyle[]
}

export function ProjectsPageClient({ projects, dbCategories, dbStyles }: ProjectsPageClientProps) {
  const { t, lang } = useI18n()

  const CATEGORIES = lang === 'ar'
    ? ['غرف المعيشة', 'غرف النوم', 'المطابخ', 'الحمامات', 'المكاتب', 'الفيلات', 'تجاري', 'المطاعم', 'الكافيهات']
    : ['Living Rooms', 'Bedrooms', 'Kitchens', 'Bathrooms', 'Offices', 'Villas', 'Commercial', 'Restaurants', 'Cafes']
  const STYLES = lang === 'ar'
    ? ['مودرن', 'فاخر', 'مينيمال', 'معاصر', 'كلاسيك']
    : ['Modern', 'Luxury', 'Minimal', 'Contemporary', 'Classic']
  const SORT_OPTIONS = [
    { value: 'Newest', label: t('projectsPage.sortNewest') },
    { value: 'Popular', label: t('projectsPage.sortPopular') },
    { value: 'Most Liked', label: t('projectsPage.sortLiked') },
    { value: 'Highest Rated', label: t('projectsPage.sortRated') },
  ]

  const projects360 = useMemo(() => projects.filter((p) => p.has360), [projects])

  const categoriesList = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map(c => ({ value: c.name, label: c.name_ar || c.name }))
    }
    return CATEGORIES.map(cat => ({ value: cat, label: cat }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbCategories, lang])

  const stylesList = useMemo(() => {
    if (dbStyles && dbStyles.length > 0) {
      return dbStyles.map(s => ({ value: s.name, label: s.name_ar || s.name }))
    }
    return STYLES.map(style => ({ value: style, label: style }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbStyles, lang])


  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('Newest')
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    setVisibleCount(8)
  }, [activeTab, search, selectedCategory, selectedStyle, selectedSubcategory, sortBy])

  const subcategoriesList = useMemo(() => {
    if (!dbCategories || dbCategories.length === 0) return []
    if (selectedCategory) {
      const cat = dbCategories.find(c => c.name === selectedCategory)
      if (cat && cat.subcategories) {
        return cat.subcategories.map(s => ({ value: s.name, label: s.name_ar || s.name }))
      }
      return []
    }
    const allSubs = dbCategories.flatMap(c => c.subcategories || [])
    return allSubs.map(s => ({ value: s.name, label: s.name_ar || s.name }))
  }, [dbCategories, selectedCategory])

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  const filtered = useMemo(() => {
    const source = activeTab === '360' ? projects360 : projects
    return source.filter((p) => {
      const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !selectedCategory || p.category === selectedCategory
      const matchesStyle = !selectedStyle || p.designStyle === selectedStyle
      const matchesSubcategory = !selectedSubcategory || p.subcategory === selectedSubcategory
      return matchesSearch && matchesCategory && matchesStyle && matchesSubcategory
    })
  }, [projects, projects360, activeTab, search, selectedCategory, selectedStyle, selectedSubcategory])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    if (sortBy === 'Newest') copy.reverse()
    return copy
  }, [filtered, sortBy])

  const shown = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount])

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newSet = new Set(likedProjects)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setLikedProjects(newSet)
  }

  return (
    <div className="min-h-screen bg-deep pb-24">
      {/* Full-bleed Hero */}
      <section ref={heroRef} className="relative flex h-[50vh] min-h-[400px] w-full items-center justify-center overflow-hidden mb-10 sm:mb-14">
        {/* Background Image */}
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
          <Image
            src="/about/hero-bg.png"
            alt={t('projectsPage.heroAlt')}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-6"
          style={{ opacity: contentOpacity }}
        >
          <motion.span
            className="mb-4 block text-xs tracking-[0.4em] uppercase text-[#C8A96A]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {t('projectsPage.heroLabel')}
          </motion.span>
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-heading font-bold text-ink-strong mb-4 text-balance leading-tight">
            {t('projectsPage.heroTitle')}
          </h1>
          <p className="text-sm sm:text-base text-ink-soft max-w-2xl mx-auto">
            {t('projectsPage.heroDesc')}
          </p>
        </motion.div>
      </section>

      {/* Main Content Wrapper */}
      <div className="px-4 sm:px-8">

      {/* Tab System */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="flex justify-center mb-10"
      >
        <div className="relative flex items-center gap-1 p-1 rounded-xl border border-[#C8A96A]/20 bg-surface">
          {/* Sliding indicator */}
          <motion.div
            layoutId="tab-indicator"
            className="absolute inset-y-1 rounded-lg bg-[#C8A96A]/15 border border-[#C8A96A]/30"
            style={{
              left: activeTab === 'all' ? '4px' : '50%',
              right: activeTab === 'all' ? '50%' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
          <button
            onClick={() => setActiveTab('all')}
            className={`relative z-10 px-6 sm:px-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              activeTab === 'all' ? 'text-[#C8A96A]' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            {t('projectsPage.tabAll')}
          </button>
          <button
            onClick={() => setActiveTab('360')}
            className={`relative z-10 flex items-center gap-2 px-6 sm:px-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              activeTab === '360' ? 'text-[#C8A96A]' : 'text-ink-faint hover:text-ink-soft'
            }`}
          >
            <span>{t('projectsPage.tab360')}</span>
            <span className={`text-[11px] font-bold tracking-widest ${activeTab === '360' ? 'text-[#C8A96A]' : 'text-ink-fainter'}`}>360°</span>
          </button>
        </div>
      </motion.div>

      {/* 360 Hero Banner */}
      <AnimatePresence mode="wait">
        {activeTab === '360' && (
          <motion.div
            key="banner-360"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mb-10"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[#C8A96A]/25 bg-surface p-8 sm:p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C8A96A]/5 via-transparent to-[#C8A96A]/5 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[#C8A96A] text-xs font-bold uppercase tracking-[0.3em] mb-3">{t('projectsPage.bannerLabel')}</p>
                <h2 className="font-heading font-bold text-ink-strong text-2xl sm:text-3xl mb-3 text-balance">
                  {t('projectsPage.bannerTitle')}
                </h2>
                <p className="text-ink-soft text-sm sm:text-base max-w-xl mx-auto">
                  {t('projectsPage.bannerDesc')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter — show only for All tab */}
      <AnimatePresence>
        {activeTab === 'all' && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mb-10 sm:mb-12 space-y-5"
          >
            <input
              type="text"
              placeholder={t('projectsPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-[#C8A96A]/20 rounded-lg px-5 py-3.5 text-ink-strong placeholder-ink-fainter focus:outline-none focus:border-[#C8A96A]/50 transition-colors text-sm"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="text-xs font-semibold text-[#C8A96A] uppercase mb-2 block">{t('projectsPage.filterCategory')}</label>
                <select value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full bg-surface border border-[#C8A96A]/20 rounded-lg px-3 py-2 text-ink-strong focus:outline-none focus:border-[#C8A96A]/50 transition-colors text-sm">
                  <option value="">{t('projectsPage.all')}</option>
                  {categoriesList.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#C8A96A] uppercase mb-2 block">{t('projectsPage.filterStyle')}</label>
                <select value={selectedStyle || ''} onChange={(e) => setSelectedStyle(e.target.value || null)}
                  className="w-full bg-surface border border-[#C8A96A]/20 rounded-lg px-3 py-2 text-ink-strong focus:outline-none focus:border-[#C8A96A]/50 transition-colors text-sm">
                  <option value="">{t('projectsPage.all')}</option>
                  {stylesList.map((style) => <option key={style.value} value={style.value}>{style.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#C8A96A] uppercase mb-2 block">{t('projectsPage.filterSubcategory')}</label>
                <select value={selectedSubcategory || ''} onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                  className="w-full bg-surface border border-[#C8A96A]/20 rounded-lg px-3 py-2 text-ink-strong focus:outline-none focus:border-[#C8A96A]/50 transition-colors text-sm"
                  disabled={subcategoriesList.length === 0}>
                  <option value="">{t('projectsPage.all')}</option>
                  {subcategoriesList.map((sub) => <option key={sub.value} value={sub.value}>{sub.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#C8A96A] uppercase mb-2 block">{t('projectsPage.filterSort')}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-surface border border-[#C8A96A]/20 rounded-lg px-3 py-2 text-ink-strong focus:outline-none focus:border-[#C8A96A]/50 transition-colors text-sm">
                  {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-12"
        >
          {sorted.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <p className="text-ink-soft text-base">{t('projectsPage.empty')}</p>
            </div>
          ) : (
            shown.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                i={i}
                likedProjects={likedProjects}
                toggleLike={toggleLike}
                is360Tab={activeTab === '360'}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {sorted.length > visibleCount && activeTab === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={() => setVisibleCount((c) => c + 8)}
            className="px-8 py-3 border border-[#C8A96A]/50 rounded-lg font-medium text-[#C8A96A] hover:border-[#C8A96A] hover:bg-[#C8A96A]/5 transition-all"
          >
            {t('projectsPage.loadMore')}
          </button>
        </motion.div>
      )}
      </div>
    </div>
  )
}
