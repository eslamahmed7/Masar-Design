'use client'

import {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X, Search, Share2, ChevronDown, ChevronUp, Map, List, Image as ImageIcon,
  ArrowLeft, Info, Navigation, Check, Bookmark, BookmarkCheck,
  Play, Pause, SkipForward, SkipBack, RotateCcw, LogOut, Compass,
  Camera, Sun, Moon, Glasses, Download,
} from 'lucide-react'
import type { Project, TourRoom, Hotspot } from '@/lib/projects'
import { useI18n } from '@/lib/i18n'

/* ─────────────────────────────────────────────────────────────────
   Pannellum type shim — the package exposes a global on window
───────────────────────────────────────────────────────────────── */
declare global {
  interface Window {
    pannellum?: any
  }
}

/* ─────────────────────────────────────────────────────────────────
   Hotspot pin
───────────────────────────────────────────────────────────────── */
function HotspotPin({
  hotspot,
  onNavigate,
  onInfo,
}: {
  hotspot: Hotspot
  onNavigate: (id: string) => void
  onInfo?: (h: Hotspot) => void
}) {
  const isNav = hotspot.type === 'navigate'
  return (
    <motion.button
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      onClick={() => isNav ? onNavigate(hotspot.targetRoomId!) : onInfo?.(hotspot)}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className={`absolute -inset-3 rounded-full border ${isNav ? 'border-[#C8A96A]/50' : 'border-white/30'}`}
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <div className={`relative w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-sm shadow-lg ${
        isNav
          ? 'bg-[#C8A96A]/20 border-[#C8A96A]/70 text-[#C8A96A]'
          : 'bg-black/40 border-white/30 text-white'
      }`}>
        {isNav ? <Navigation size={14} /> : <Info size={14} />}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-medium border border-white/10 backdrop-blur-sm">
          {hotspot.label}
        </span>
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Info panel
───────────────────────────────────────────────────────────────── */
function InfoPanel({ hotspot, onClose }: { hotspot: Hotspot; onClose: () => void }) {
  const { t } = useI18n()
  const entries = Object.entries(hotspot.details ?? {}).filter(([, v]) => v)
  const labelMap: Record<string, string> = {
    brand: t('tour360.fieldLabels.brand'),
    material: t('tour360.fieldLabels.material'),
    fabric: t('tour360.fieldLabels.fabric'),
    color: t('tour360.fieldLabels.color'),
    dimensions: t('tour360.fieldLabels.dimensions'),
    finish: t('tour360.fieldLabels.finish'),
    model: t('tour360.fieldLabels.model'),
    note: t('tour360.fieldLabels.note'),
  }
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-sm bg-[#111111] border border-[#C8A96A]/25 rounded-2xl p-6 shadow-2xl"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <X size={16} className="text-[#888]" />
        </button>
        <p className="text-[#C8A96A] text-xs font-bold uppercase tracking-[0.3em] mb-2">{t('tour360.itemDetails')}</p>
        <h3 className="font-heading font-bold text-[#F5F5F5] text-lg mb-5">{hotspot.label}</h3>
        <div className="space-y-3">
          {entries.map(([key, val]) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <span className="text-[#666] text-xs pt-0.5">{labelMap[key] ?? key}</span>
              <span className="text-[#F5F5F5] text-sm font-medium text-right">{val}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Floor plan
───────────────────────────────────────────────────────────────── */
function FloorPlanPanel({
  project, currentRoomId, onRoomSelect,
}: { project: Project; currentRoomId: string; onRoomSelect: (id: string) => void }) {
  const { t } = useI18n()
  const fp = project.tour360!.floorPlan
  return (
    <div className="relative bg-[#0E0E0E] border border-[#C8A96A]/20 rounded-xl p-4 select-none">
      <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 text-center">{t('tour360.floorplan')}</p>
      <div className="relative" style={{ paddingBottom: '70%' }}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 border border-[#C8A96A]/15 rounded-lg" />
          {fp.rooms.map((r) => {
            const isCurrent = r.id === currentRoomId
            return (
              <button key={r.id} onClick={() => onRoomSelect(r.id)}
                className="absolute transition-all duration-200"
                style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}>
                <div className={`w-full h-full rounded border text-[8px] font-medium flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-[#C8A96A]/30 border-[#C8A96A] text-[#C8A96A] shadow-[0_0_12px_rgba(200,169,106,0.4)]'
                    : 'bg-[#1a1a1a] border-[#333] text-[#555] hover:border-[#C8A96A]/40 hover:text-[#ABABAB]'
                }`}>
                  <span className="truncate px-0.5 leading-none">{r.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Journey progress indicator
───────────────────────────────────────────────────────────────── */
function JourneyProgress({ visitedCount, totalCount }: { visitedCount: number; totalCount: number }) {
  const { t, tArr } = useI18n()
  const steps = tArr('tour360.steps')
  const activeStep = visitedCount === 0 ? 1 : visitedCount < totalCount ? 2 : 3
  return (
    <div className="flex flex-col items-center gap-1">
      {steps.map((s, i) => {
        const done = i < activeStep
        const active = i === activeStep
        return (
          <div key={i} className="flex flex-col items-center">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-medium transition-all duration-500 ${
              active ? 'bg-[#C8A96A]/20 border border-[#C8A96A]/50 text-[#C8A96A]'
              : done ? 'text-[#C8A96A]/40' : 'text-[#333]'
            }`}>
              <span className={`w-1 h-1 rounded-full ${active ? 'bg-[#C8A96A] animate-pulse' : done ? 'bg-[#C8A96A]/40' : 'bg-[#333]'}`} />
              {s}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px h-3 transition-all duration-700 ${done ? 'bg-[#C8A96A]/30' : 'bg-[#222]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Guided tour room card (overlaid during auto-advance)
───────────────────────────────────────────────────────────────── */
function GuidedRoomCard({ room, onDismiss }: { room: TourRoom; onDismiss: () => void }) {
  const { lang } = useI18n()
  return (
    <motion.div
      className="absolute bottom-36 left-1/2 -translate-x-1/2 z-30 w-80 pointer-events-auto"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.5 }}
    >
      <div className="bg-black/70 border border-[#C8A96A]/25 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-widest mb-1">{lang === 'ar' ? room.nameEn : room.nameAr}</p>
            <h3 className="font-heading font-bold text-[#F5F5F5] text-xl">{lang === 'ar' ? room.nameAr : room.nameEn}</h3>
          </div>
          <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 mt-1">
            <X size={14} className="text-[#555]" />
          </button>
        </div>
        <p className="text-[#ABABAB] text-sm leading-relaxed">{room.description}</p>
        {room.hotspots.filter(h => h.type === 'info').length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {room.hotspots.filter(h => h.type === 'info').map(h => (
              <span key={h.id} className="text-[10px] px-2 py-0.5 rounded-full border border-[#C8A96A]/20 text-[#C8A96A]/70">
                {h.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Completion overlay
───────────────────────────────────────────────────────────────── */
function CompletionOverlay({
  project, bookmarkedRooms, rooms, onViewRoom, onClose, onFreeExplore,
}: {
  project: Project
  bookmarkedRooms: Set<string>
  rooms: TourRoom[]
  onViewRoom: (id: string) => void
  onClose: () => void
  onFreeExplore: () => void
}) {
  const router = useRouter()
  const { t, lang } = useI18n()
  const allProjects = useMemo(() => [
    { id: 'luxury-living-room', title: t('tour360.similarProjectNames.livingRoom.title'), category: t('tour360.similarProjectNames.livingRoom.category'), image: '/interiors/living-room.png' },
    { id: 'modern-bedroom', title: t('tour360.similarProjectNames.bedroom.title'), category: t('tour360.similarProjectNames.bedroom.category'), image: '/interiors/bedroom.png' },
    { id: 'luxury-kitchen', title: t('tour360.similarProjectNames.kitchen.title'), category: t('tour360.similarProjectNames.kitchen.category'), image: '/interiors/kitchen.png' },
  ], [t])
  const bookmarked = rooms.filter(r => bookmarkedRooms.has(r.id))

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div
        className="relative w-full max-w-2xl py-12"
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-0 left-0 p-2 rounded-full hover:bg-white/10 transition-colors">
          <X size={16} className="text-[#555]" />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full border-2 border-[#C8A96A] flex items-center justify-center mx-auto mb-6"
          >
            <Check size={28} className="text-[#C8A96A]" />
          </motion.div>
          <p className="text-[#C8A96A] text-xs font-bold uppercase tracking-[0.4em] mb-3">{t('tour360.completion.title')}</p>
          <h2 className="font-heading font-bold text-3xl text-[#F5F5F5] mb-4">{t('tour360.completion.heading')}</h2>
          <p className="text-[#888] text-sm max-w-md mx-auto">{t('tour360.completion.subheading')}</p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <motion.button
            onClick={() => router.push(`/start?style=${encodeURIComponent(project.designStyle ?? '')}&type=${encodeURIComponent(project.category)}&ref=${project.id}`)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#C8A96A] text-[#0B0B0B] font-heading font-bold text-base rounded-xl overflow-hidden shadow-[0_0_40px_rgba(200,169,106,0.3)] hover:shadow-[0_0_60px_rgba(200,169,106,0.5)] transition-all"
          >
            <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-white/20" />
            <span className="relative">{t('tour360.completion.startProject')}</span>
          </motion.button>
          <button
            onClick={() => router.push(`/start?style=${encodeURIComponent(project.designStyle ?? '')}&type=${encodeURIComponent(project.category)}&ref=${project.id}&prefill=true`)}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#C8A96A]/30 text-[#C8A96A] font-medium text-sm rounded-xl hover:bg-[#C8A96A]/10 transition-all"
          >
            {t('tour360.completion.similarDesign')}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex justify-center gap-4 mb-12">
          <button onClick={onFreeExplore} className="text-[#888] text-xs hover:text-[#ABABAB] transition-colors">
            {t('tour360.completion.freeExplore')}
          </button>
          <span className="text-[#333]">·</span>
          <Link href="/projects" className="text-[#888] text-xs hover:text-[#ABABAB] transition-colors">
            {t('tour360.completion.backToPortfolio')}
          </Link>
          <span className="text-[#333]">·</span>
          <Link href="/projects" className="text-[#888] text-xs hover:text-[#ABABAB] transition-colors">
            {t('tour360.completion.moreProjects')}
          </Link>
        </div>

        {/* Bookmarked rooms */}
        {bookmarked.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#1E1E1E]" />
              <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.3em]">{t('tour360.completion.likedRooms')}</p>
              <div className="h-px flex-1 bg-[#1E1E1E]" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
              {bookmarked.map(r => (
                <motion.button key={r.id} onClick={() => { onViewRoom(r.id); onClose() }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex-shrink-0 relative rounded-xl overflow-hidden border border-[#C8A96A]/30 hover:border-[#C8A96A] transition-all"
                  style={{ width: 110, height: 80 }}>
                  <Image src={r.thumbnail} alt={lang === 'ar' ? r.nameAr : r.nameEn} fill className="object-cover" sizes="110px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white font-medium">{lang === 'ar' ? r.nameAr : r.nameEn}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Similar projects */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#1E1E1E]" />
            <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.3em]">{t('tour360.completion.similarProjects')}</p>
            <div className="h-px flex-1 bg-[#1E1E1E]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {allProjects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="relative rounded-xl overflow-hidden border border-white/5 hover:border-[#C8A96A]/30 transition-all aspect-[4/3] group">
                  <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="200px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-[10px] text-[#C8A96A]/70 mb-0.5">{p.category}</p>
                    <p className="text-white text-xs font-medium leading-tight">{p.title}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Pannellum 360 viewer core
   Loads the Pannellum CSS + JS from the npm package, creates
   a full-screen equirectangular sphere, and handles hotspot
   overlay positioning via CSS2D-style manual math.
───────────────────────────────────────────────────────────────── */
function PannellumViewer({
  room,
  onLoaded,
  transitioning,
  isNight,
  vrMode,
  containerRef: externalRef,
  onNavigate,
}: {
  room: TourRoom
  onLoaded?: () => void
  transitioning: boolean
  isNight?: boolean
  vrMode?: boolean
  containerRef?: React.RefObject<HTMLDivElement | null>
  onNavigate?: (id: string) => void
}) {
  const { t } = useI18n()
  const internalRef = useRef<HTMLDivElement>(null)
  const containerRef = externalRef ?? internalRef
  const viewerRef = useRef<any>(null)
  const loaded = useRef(false)

  const panoramaUrl = isNight && room.panorama_night ? room.panorama_night : room.panorama

  /* load Pannellum CSS + JS once */
  useEffect(() => {
    if (document.getElementById('pannellum-css')) return
    const link = document.createElement('link')
    link.id = 'pannellum-css'
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    if (!window.pannellum) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
      script.async = true
      script.onload = () => initViewer()
      document.body.appendChild(script)
    } else {
      initViewer()
    }

    function initViewer() {
      if (!containerRef.current || viewerRef.current) return
      viewerRef.current = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        showControls: false,
        mouseZoom: true,
        touchZoom: true,
        gyroscope: true,
        compass: false,
        hotSpotDebug: false,
        minHfov: 50,
        maxHfov: 120,
        hfov: 100,
        pitch: 0,
        yaw: 0,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        orientationOnByDefault: true,
        draggable: true,
        hotSpots: [],
        onLoad: () => {
          loaded.current = true
          onLoaded?.()
        },
      })
    }

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy() } catch { /* ignore */ }
        viewerRef.current = null
        loaded.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panoramaUrl])

  return (
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: transitioning ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={containerRef} className="w-full h-full" />
      {/* Night tint overlay */}
      {isNight && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(rgba(10,15,40,0.35), rgba(5,10,30,0.25))',
            mixBlendMode: 'multiply',
          }}
        />
      )}
      {/* compass hint */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm"
        >
          <Compass size={11} className="text-[#C8A96A]" />
          <span className="text-[#ABABAB] text-[10px] tracking-wider">{t('tour360.hint')}</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Main tour viewer
───────────────────────────────────────────────────────────────── */
export function TourViewerClient({
  project,
  initialRoomId,
  initialMode = 'free',
}: {
  project: Project
  initialRoomId?: string
  initialMode?: 'guided' | 'free'
}) {
  const router = useRouter()
  const { t, lang, dir } = useI18n()
  const rooms = project.tour360!.rooms

  const [currentRoom, setCurrentRoom] = useState<TourRoom>(
    () => rooms.find((r) => r.id === initialRoomId) ?? rooms[0]
  )
  const [transitioning, setTransitioning] = useState(false)
  const [activeInfoHotspot, setActiveInfoHotspot] = useState<Hotspot | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showRoomList, setShowRoomList] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useState(false)
  const [showMiniGallery, setShowMiniGallery] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bookmarkedRooms, setBookmarkedRooms] = useState<Set<string>>(new Set())
  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(new Set([rooms[0].id]))
  const [showCompletion, setShowCompletion] = useState(false)
  const [showCompletionToast, setShowCompletionToast] = useState(false)
  const [showJourneyProgress, setShowJourneyProgress] = useState(false)
  // New feature states
  const [isNightMode, setIsNightMode] = useState(false)
  const [isVrMode, setIsVrMode] = useState(false)
  const [screenshotDone, setScreenshotDone] = useState(false)
  const pannellumContainerRef = useRef<HTMLDivElement>(null)

  // Guided tour state — initialised from the mode the user selected
  const [guidedMode, setGuidedMode] = useState(initialMode === 'guided')
  const [guidedPlaying, setGuidedPlaying] = useState(initialMode === 'guided')
  const [guidedRoomIndex, setGuidedRoomIndex] = useState(0)
  const [showRoomCard, setShowRoomCard] = useState(false)
  const guidedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Update URL
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('room', currentRoom.id)
    window.history.replaceState({}, '', url.toString())
  }, [currentRoom])

  // Track visited rooms & show completion toast when all rooms seen
  useEffect(() => {
    setVisitedRooms(prev => {
      const next = new Set(prev)
      next.add(currentRoom.id)
      if (next.size === rooms.length && prev.size < rooms.length) {
        // Show a non-interruptive floating toast first
        setTimeout(() => setShowCompletionToast(true), 1800)
      }
      return next
    })
  }, [currentRoom, rooms.length])

  const navigateToRoom = useCallback((roomId: string, delay = 500) => {
    const target = rooms.find((r) => r.id === roomId)
    if (!target || target.id === currentRoom.id) return
    setTransitioning(true)
    setShowRoomCard(false)
    setTimeout(() => {
      setCurrentRoom(target)
      setTransitioning(false)
    }, delay)
  }, [rooms, currentRoom.id])

  // Guided tour auto-advance — re-runs whenever the guided room index advances
  useEffect(() => {
    if (!guidedMode || !guidedPlaying) return
    const room = rooms[guidedRoomIndex]
    if (!room) { setGuidedPlaying(false); setShowCompletion(true); return }
    // Navigate to the target room
    navigateToRoom(room.id, 500)
    // Show the room info card after transition completes
    const cardTimer = setTimeout(() => setShowRoomCard(true), 800)
    // Schedule advance to next room after 8 s
    guidedTimerRef.current = setTimeout(() => {
      setGuidedRoomIndex(prev => prev + 1)
    }, 8000)
    return () => {
      clearTimeout(cardTimer)
      if (guidedTimerRef.current) clearTimeout(guidedTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidedMode, guidedPlaying, guidedRoomIndex])

  const pauseGuided = () => setGuidedPlaying(false)
  const resumeGuided = () => setGuidedPlaying(true)
  const skipGuidedNext = () => {
    const nextIdx = guidedRoomIndex + 1
    if (nextIdx >= rooms.length) { setGuidedPlaying(false); setShowCompletion(true); return }
    setShowRoomCard(false)
    setGuidedRoomIndex(nextIdx)
  }
  const skipGuidedPrev = () => {
    setShowRoomCard(false)
    setGuidedRoomIndex(prev => Math.max(0, prev - 1))
  }
  const restartGuided = () => {
    setShowRoomCard(false)
    setGuidedRoomIndex(0)
    setGuidedPlaying(true)
  }
  const exitGuided = () => {
    setGuidedMode(false)
    setGuidedPlaying(false)
    setShowRoomCard(false)
  }

  const toggleBookmark = (roomId: string) => {
    setBookmarkedRooms(prev => {
      const next = new Set(prev)
      if (next.has(roomId)) next.delete(roomId)
      else next.add(roomId)
      return next
    })
  }

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/projects/${project.id}/360/tour?room=${currentRoom.id}`
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { /* ignore */ }
  }, [project.id, currentRoom.id])

  const filteredRooms = rooms.filter(r =>
    r.nameAr.includes(searchQuery) || r.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const closePanel = () => {
    setShowSearch(false); setShowRoomList(false)
    setShowFloorPlan(false); setShowMiniGallery(false)
  }

  /* ── Screenshot handler ── */
  const handleScreenshot = useCallback(async () => {
    try {
      // Grab the pannellum canvas
      const canvas = pannellumContainerRef.current?.querySelector('canvas')
      if (!canvas) return
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${project.title}-${currentRoom.nameAr || currentRoom.nameEn}.jpg`
      a.click()
      setScreenshotDone(true)
      setTimeout(() => setScreenshotDone(false), 2000)
    } catch { /* ignore */ }
  }, [project.title, currentRoom])

  /* ── VR Mode toggle ── */
  const handleVrToggle = useCallback(() => {
    setIsVrMode(v => {
      const next = !v
      if (next && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else if (!next && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsVrMode(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className={`fixed inset-0 text-[#F5F5F5] overflow-hidden transition-colors duration-1000 ${isNightMode ? 'bg-[#020408]' : 'bg-[#050404]'}`} dir={dir}>

      {/* VR mode split-screen overlay */}
      {isVrMode && (
        <div className="absolute inset-0 z-[100] pointer-events-none">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-white text-xs border border-white/20">
            {t('tour360.vrInstruction')}
          </div>
        </div>
      )}

      {/* ── Real Pannellum 360 sphere ─────────────────────────── */}
      <AnimatePresence mode="wait">
        <PannellumViewer
          key={currentRoom.id + (isNightMode ? '_night' : '_day')}
          room={currentRoom}
          transitioning={transitioning}
          isNight={isNightMode}
          containerRef={pannellumContainerRef}
          onNavigate={navigateToRoom}
        />
      </AnimatePresence>

      {/* ── Screen-fixed Navigation Hotspots ──────────────────── */}
      <AnimatePresence>
        {!transitioning && !guidedMode && currentRoom.hotspots.filter(hs => hs.type === 'navigate').map((hs) => (
          <HotspotPin key={hs.id} hotspot={hs} onNavigate={navigateToRoom} />
        ))}
      </AnimatePresence>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Exit button — glass style */}
          <Link
            href={`/projects/${project.id}/360`}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 transition-colors backdrop-blur-sm text-xs text-[#ABABAB] hover:text-white"
          >
            <ArrowLeft size={14} className="text-[#C8A96A]" />
            <span className="hidden sm:inline">{t('tour360.exit')}</span>
          </Link>
          <div className="hidden sm:block">
            <p className="text-[10px] text-[#888] uppercase tracking-widest">{project.title}</p>
            <p className="text-[#F5F5F5] font-heading font-semibold text-sm">{lang === 'ar' ? currentRoom.nameAr : currentRoom.nameEn}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Journey progress toggle */}
          <button
            onClick={() => setShowJourneyProgress(v => !v)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 transition-colors backdrop-blur-sm text-[10px] text-[#ABABAB]"
          >
            <span>{t('tour360.roomsCount').replace('{count}', `${visitedRooms.size}/${rooms.length}`)}</span>
          </button>

          {/* Day / Night toggle */}
          <motion.button
            onClick={() => setIsNightMode(v => !v)}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className={`p-2 rounded-full border transition-all backdrop-blur-sm ${
              isNightMode
                ? 'bg-indigo-900/60 border-indigo-400/50 text-indigo-300'
                : 'bg-black/40 border-white/10 hover:bg-black/70 text-[#ABABAB]'
            }`}
            title={isNightMode ? t('tour360.dayMode') : t('tour360.nightMode')}
          >
            <AnimatePresence mode="wait">
              <motion.div key={isNightMode ? 'moon' : 'sun'}
                initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.25 }}
              >
                {isNightMode ? <Moon size={16} className="text-indigo-300" /> : <Sun size={16} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Screenshot */}
          <motion.button
            onClick={handleScreenshot}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className="p-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 transition-colors backdrop-blur-sm"
            title={t('tour360.screenshot')}
          >
            {screenshotDone
              ? <Check size={16} className="text-[#C8A96A]" />
              : <Camera size={16} className="text-[#ABABAB]" />}
          </motion.button>

          {/* VR Mode */}
          <motion.button
            onClick={handleVrToggle}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className={`p-2 rounded-full border transition-all backdrop-blur-sm ${
              isVrMode
                ? 'bg-purple-900/60 border-purple-400/50 text-purple-300'
                : 'bg-black/40 border-white/10 hover:bg-black/70 text-[#ABABAB]'
            }`}
            title={t('tour360.vrMode')}
          >
            <Glasses size={16} />
          </motion.button>

          {/* Bookmark current room */}
          <button
            onClick={() => toggleBookmark(currentRoom.id)}
            className="p-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            {bookmarkedRooms.has(currentRoom.id)
              ? <BookmarkCheck size={16} className="text-[#C8A96A]" />
              : <Bookmark size={16} className="text-[#ABABAB]" />}
          </button>

          {/* Search */}
          <button
            onClick={() => { setShowSearch(!showSearch); setShowRoomList(false); setShowFloorPlan(false); setShowMiniGallery(false) }}
            className="p-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <Search size={16} className="text-[#ABABAB]" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            {copied ? <Check size={16} className="text-[#C8A96A]" /> : <Share2 size={16} className="text-[#ABABAB]" />}
          </button>
        </div>
      </div>

      {/* ── Journey progress sidebar ─────────────────────────── */}
      <AnimatePresence>
        {showJourneyProgress && (
          <motion.div
            className="absolute top-20 left-4 z-30 pointer-events-auto"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <div className="bg-black/70 border border-[#C8A96A]/20 rounded-xl p-3 backdrop-blur-md">
              <JourneyProgress visitedCount={visitedRooms.size} totalCount={rooms.length} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search dropdown ───────────────────────────────────── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-72 pointer-events-auto"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          >
            <div className="bg-[#111] border border-[#C8A96A]/25 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <Search size={14} className="text-[#C8A96A]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('tour360.searchPlaceholder')}
                  className="flex-1 bg-transparent text-[#F5F5F5] placeholder-[#555] text-sm focus:outline-none"
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredRooms.map((r) => (
                  <button key={r.id}
                    onClick={() => { navigateToRoom(r.id); setShowSearch(false); setSearchQuery('') }}
                    className={`w-full text-right px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${r.id === currentRoom.id ? 'text-[#C8A96A]' : 'text-[#ABABAB]'}`}
                  >
                    <span>{lang === 'ar' ? r.nameAr : r.nameEn}</span>
                    <span className="text-[10px] text-[#555]">{lang === 'ar' ? r.nameEn : r.nameAr}</span>
                  </button>
                ))}
                {filteredRooms.length === 0 && <p className="px-4 py-4 text-[#555] text-sm text-center">{t('tour360.noResults')}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Guided tour room card ─────────────────────────────── */}
      <AnimatePresence>
        {guidedMode && showRoomCard && (
          <GuidedRoomCard room={currentRoom} onDismiss={() => setShowRoomCard(false)} />
        )}
      </AnimatePresence>

      {/* ── Guided tour controls ──────────────────────────────── */}
      <AnimatePresence>
        {guidedMode && (
          <motion.div
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-black/70 border border-[#C8A96A]/25 rounded-2xl backdrop-blur-md shadow-xl">
              {/* Restart */}
              <button onClick={restartGuided} className="p-2 rounded-full hover:bg-white/10 transition-colors" title={t('tour360.restart')}>
                <RotateCcw size={14} className="text-[#888]" />
              </button>
              {/* Prev */}
              <button onClick={skipGuidedPrev} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipBack size={16} className="text-[#ABABAB]" />
              </button>
              {/* Play / Pause */}
              <button
                onClick={guidedPlaying ? pauseGuided : resumeGuided}
                className="w-10 h-10 rounded-full bg-[#C8A96A] flex items-center justify-center hover:bg-[#d4b87a] transition-colors"
              >
                {guidedPlaying
                  ? <Pause size={16} className="text-[#0B0B0B]" />
                  : <Play size={16} className="text-[#0B0B0B] mr-0.5" />}
              </button>
              {/* Next */}
              <button onClick={skipGuidedNext} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipForward size={16} className="text-[#ABABAB]" />
              </button>
              {/* Exit guided */}
              <button onClick={exitGuided} className="p-2 rounded-full hover:bg-white/10 transition-colors" title={t('tour360.exitGuided')}>
                <LogOut size={14} className="text-[#888]" />
              </button>

              {/* Progress dots */}
              <div className="flex gap-1 mx-2">
                {rooms.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i < guidedRoomIndex ? 'bg-[#C8A96A]/60'
                    : i === guidedRoomIndex ? 'bg-[#C8A96A] scale-125'
                    : 'bg-[#333]'
                  }`} />
                ))}
              </div>

              <span className="text-[#555] text-[10px] min-w-[36px] text-center">
                {guidedRoomIndex + 1}/{rooms.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom HUD ───────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-auto">
        {/* Panel toggles */}
        <div className="flex justify-center gap-2 mb-3 px-4">
          {[
            { id: 'rooms', icon: List, label: t('tour360.panelRooms'), state: showRoomList, toggle: () => { setShowRoomList(v => !v); setShowFloorPlan(false); setShowMiniGallery(false); setShowSearch(false) } },
            { id: 'floor', icon: Map, label: t('tour360.panelFloor'), state: showFloorPlan, toggle: () => { setShowFloorPlan(v => !v); setShowRoomList(false); setShowMiniGallery(false); setShowSearch(false) } },
            { id: 'gallery', icon: ImageIcon, label: t('tour360.panelGallery'), state: showMiniGallery, toggle: () => { setShowMiniGallery(v => !v); setShowRoomList(false); setShowFloorPlan(false); setShowSearch(false) } },
          ].map((btn) => (
            <button key={btn.id} onClick={btn.toggle}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200 backdrop-blur-sm ${
                btn.state
                  ? 'bg-[#C8A96A]/20 border-[#C8A96A]/60 text-[#C8A96A]'
                  : 'bg-black/50 border-white/10 text-[#ABABAB] hover:border-white/25'
              }`}>
              <btn.icon size={13} />
              <span className="hidden sm:inline">{btn.label}</span>
              {btn.state ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            </button>
          ))}
        </div>

        {/* Expandable panels */}
        <AnimatePresence>
          {showRoomList && (
            <motion.div key="room-list"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-gradient-to-t from-black/95 via-black/90 to-transparent border-t border-white/5 backdrop-blur-md">
              <div className="px-4 sm:px-8 py-4">
                <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 text-center">{t('tour360.panelRooms')}</p>
                <div className="flex gap-3 overflow-x-auto pb-2 justify-start sm:justify-center">
                  {rooms.map((r) => {
                    const isCurrent = r.id === currentRoom.id
                    const isVisited = visitedRooms.has(r.id)
                    const isBookmarked = bookmarkedRooms.has(r.id)
                    return (
                      <button key={r.id} onClick={() => { navigateToRoom(r.id); setShowRoomList(false) }}
                        className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 min-w-[80px] ${
                          isCurrent ? 'border-[#C8A96A]/60 bg-[#C8A96A]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}>
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image src={r.thumbnail} alt={lang === 'ar' ? r.nameAr : r.nameEn} fill className="object-cover" sizes="48px" />
                          {isCurrent && <div className="absolute inset-0 bg-[#C8A96A]/20" />}
                          {isVisited && !isCurrent && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C8A96A]/70 border border-black/50" />
                          )}
                          {isBookmarked && (
                            <div className="absolute bottom-1 right-1">
                              <BookmarkCheck size={8} className="text-[#C8A96A]" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium leading-tight text-center ${isCurrent ? 'text-[#C8A96A]' : 'text-[#888]'}`}>
                          {lang === 'ar' ? r.nameAr : r.nameEn}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {showFloorPlan && (
            <motion.div key="floor-plan"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-black/90 border-t border-white/5 backdrop-blur-md">
              <div className="px-4 sm:px-8 py-4 max-w-sm mx-auto">
                <FloorPlanPanel project={project} currentRoomId={currentRoom.id}
                  onRoomSelect={(id) => { navigateToRoom(id); setShowFloorPlan(false) }} />
              </div>
            </motion.div>
          )}

          {showMiniGallery && (
            <motion.div key="mini-gallery"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-black/90 border-t border-white/5 backdrop-blur-md">
              <div className="px-4 sm:px-8 py-4">
                <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 text-center">{t('tour360.quickGallery')}</p>
                <div className="flex gap-3 overflow-x-auto pb-2 justify-start sm:justify-center">
                  {rooms.map((r) => {
                    const isCurrent = r.id === currentRoom.id
                    return (
                      <motion.button key={r.id} onClick={() => { navigateToRoom(r.id); setShowMiniGallery(false) }}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className={`flex-shrink-0 relative rounded-xl overflow-hidden border transition-all duration-200 ${isCurrent ? 'border-[#C8A96A]' : 'border-transparent hover:border-white/30'}`}
                        style={{ width: 120, height: 80 }}>
                        <Image src={r.thumbnail} alt={lang === 'ar' ? r.nameAr : r.nameEn} fill className="object-cover" sizes="120px" />
                        <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-[10px] text-white font-medium">{lang === 'ar' ? r.nameAr : r.nameEn}</span>
                        </div>
                        {isCurrent && (
                          <div className="absolute inset-0 bg-[#C8A96A]/15 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#C8A96A]" />
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current room label bar */}
        <div className="px-6 py-3 bg-gradient-to-t from-black to-transparent flex items-center justify-between">
          <div>
            <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-widest">{t('tour360.currentRoom')}</p>
            <h2 className="font-heading font-semibold text-[#F5F5F5] text-sm">{lang === 'ar' ? currentRoom.nameAr : currentRoom.nameEn}</h2>
          </div>
          <p className="text-[#555] text-xs hidden sm:block max-w-xs text-left">{currentRoom.description}</p>
          <div className="flex items-center gap-1 text-[#555] text-xs">
            <span>{visitedRooms.size}</span>
            <span>/</span>
            <span>{rooms.length}</span>
          </div>
        </div>
      </div>

      {/* ── Transition overlay ────────────────────────────────── */}
      <AnimatePresence>
        {transitioning && (
          <motion.div className="absolute inset-0 bg-black z-20"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} />
        )}
      </AnimatePresence>

      {/* ── Info detail panel ─────────────────────────────────── */}
      <AnimatePresence>
        {activeInfoHotspot && (
          <InfoPanel hotspot={activeInfoHotspot} onClose={() => setActiveInfoHotspot(null)} />
        )}
      </AnimatePresence>

      {/* ── Completion floating toast (non-interruptive, shows first) ── */}
      <AnimatePresence>
        {showCompletionToast && !showCompletion && (
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4 px-5 py-3.5 bg-black/80 border border-[#C8A96A]/40 rounded-2xl backdrop-blur-md shadow-2xl">
              <div className="w-8 h-8 rounded-full bg-[#C8A96A]/20 border border-[#C8A96A]/40 flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-[#C8A96A]" />
              </div>
              <div>
                <p className="text-[#F5F5F5] text-sm font-medium">{t('tour360.completion.heading')}</p>
                <p className="text-[#888] text-xs">{t('tour360.toastReady')}</p>
              </div>
              <button
                onClick={() => { setShowCompletionToast(false); setShowCompletion(true) }}
                className="px-4 py-1.5 bg-[#C8A96A] text-[#0B0B0B] text-xs font-bold rounded-lg hover:bg-[#d4b87a] transition-colors flex-shrink-0"
              >
                {t('tour360.discover')}
              </button>
              <button
                onClick={() => setShowCompletionToast(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={12} className="text-[#555]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Completion full overlay ───────────────────────────── */}
      <AnimatePresence>
        {showCompletion && (
          <CompletionOverlay
            project={project}
            bookmarkedRooms={bookmarkedRooms}
            rooms={rooms}
            onViewRoom={(id) => navigateToRoom(id)}
            onClose={() => setShowCompletion(false)}
            onFreeExplore={() => { setGuidedMode(false); setShowCompletion(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
