'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { Play, Compass, ChevronRight, Clock, Route, MapPin } from 'lucide-react'
import type { Project } from '@/lib/projects'
import { useI18n } from '@/lib/i18n'

type TourMode = 'guided' | 'free'

interface Props {
  project: Project
  onSelect: (mode: TourMode) => void
}

export function TourModeSelection({ project, onSelect }: Props) {
  const { t, tArr, dir } = useI18n()
  const [hovered, setHovered] = useState<TourMode | null>(null)
  const [selected, setSelected] = useState<TourMode | null>(null)

  const rooms = project.tour360!.rooms
  const guidedFeatures = tArr('tour360.modeSelect.guidedFeatures')
  const freeFeatures = tArr('tour360.modeSelect.freeFeatures')

  const handleSelect = (mode: TourMode) => {
    setSelected(mode)
    // Small delay for animation to complete before revealing tour
    setTimeout(() => onSelect(mode), 600)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: selected ? 0 : 1 }}
      transition={{ duration: selected ? 0.6 : 0.5 }}
      dir={dir}
    >
      {/* Background — blurred project image */}
      <div className="absolute inset-0">
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.6) 100%)',
        }} />
      </div>

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '160px' }}
      />

      <div className="relative z-10 w-full max-w-3xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <p className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.5em] mb-3">
            {project.title}
          </p>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-[#F5F5F5] mb-3">
            {t('tour360.modeSelect.title')}
          </h1>
          <p className="text-[#888] text-sm max-w-md mx-auto">
            {t('tour360.modeSelect.desc')}
          </p>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="flex items-center gap-1.5 text-[#666] text-xs">
              <MapPin size={11} className="text-[#C8A96A]/60" />
              <span>{t('tour360.roomsCount').replace('{count}', `${rooms.length}`)}</span>
            </div>
            <div className="w-px h-3 bg-[#333]" />
            <div className="flex items-center gap-1.5 text-[#666] text-xs">
              <Route size={11} className="text-[#C8A96A]/60" />
              <span>{t('tour360.modeSelect.fullTour')}</span>
            </div>
            <div className="w-px h-3 bg-[#333]" />
            <div className="flex items-center gap-1.5 text-[#666] text-xs">
              <Clock size={11} className="text-[#C8A96A]/60" />
              <span>{t('tour360.modeSelect.approxMinutes')}</span>
            </div>
          </div>
        </motion.div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* ── Guided Tour ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <motion.button
              onHoverStart={() => setHovered('guided')}
              onHoverEnd={() => setHovered(null)}
              onClick={() => handleSelect('guided')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-start p-7 rounded-2xl border transition-all duration-400 relative overflow-hidden group ${
                hovered === 'guided'
                  ? 'border-[#C8A96A] bg-[#C8A96A]/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {/* Shimmer on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: hovered === 'guided' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(200,169,106,0.08) 0%, transparent 60%)',
                }}
              />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                hovered === 'guided' ? 'bg-[#C8A96A] text-[#0B0B0B]' : 'bg-white/5 text-[#C8A96A] border border-[#C8A96A]/30'
              }`}>
                <Play size={20} className={hovered === 'guided' ? 'mr-0.5' : ''} />
              </div>

              <h2 className="font-heading font-bold text-[#F5F5F5] text-xl mb-2">{t('tour360.modeSelect.guidedTitle')}</h2>
              <p className="text-[#888] text-sm leading-relaxed mb-5">
                {t('tour360.modeSelect.guidedDesc')}
              </p>

              <ul className="space-y-2 mb-6">
                {guidedFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-[#666]">
                    <span className="w-1 h-1 rounded-full bg-[#C8A96A]/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${
                hovered === 'guided' ? 'text-[#C8A96A]' : 'text-[#555]'
              }`}>
                <span>{t('tour360.modeSelect.startGuided')}</span>
                <ChevronRight size={16} className={`transition-transform duration-300 ${hovered === 'guided' ? (dir === 'rtl' ? '-translate-x-1' : 'translate-x-1') : ''}`} />
              </div>

              {/* Recommended badge */}
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 bg-[#C8A96A] text-[#0B0B0B] text-[9px] font-bold uppercase tracking-wider rounded-full">
                  {t('tour360.modeSelect.recommended')}
                </span>
              </div>
            </motion.button>
          </motion.div>

          {/* ── Free Exploration ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <motion.button
              onHoverStart={() => setHovered('free')}
              onHoverEnd={() => setHovered(null)}
              onClick={() => handleSelect('free')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full h-full text-start p-7 rounded-2xl border transition-all duration-400 relative overflow-hidden ${
                hovered === 'free'
                  ? 'border-white/30 bg-white/8'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: hovered === 'free' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
              />

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
                hovered === 'free' ? 'bg-white/15 text-white border border-white/20' : 'bg-white/5 text-[#888] border border-white/10'
              }`}>
                <Compass size={20} />
              </div>

              <h2 className="font-heading font-bold text-[#F5F5F5] text-xl mb-2">{t('tour360.modeSelect.freeTitle')}</h2>
              <p className="text-[#888] text-sm leading-relaxed mb-5">
                {t('tour360.modeSelect.freeDesc')}
              </p>

              <ul className="space-y-2 mb-6">
                {freeFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-[#666]">
                    <span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${
                hovered === 'free' ? 'text-white' : 'text-[#555]'
              }`}>
                <span>{t('tour360.modeSelect.startFree')}</span>
                <ChevronRight size={16} className={`transition-transform duration-300 ${hovered === 'free' ? (dir === 'rtl' ? '-translate-x-1' : 'translate-x-1') : ''}`} />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[#444] text-xs mt-8"
        >
          {t('tour360.modeSelect.switchAnytime')}
        </motion.p>
      </div>
    </motion.div>
  )
}
