'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Maximize2, Calendar, Users, Home, Palette, ZoomIn, ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/projects'
import { useI18n } from '@/lib/i18n'
import { useLightbox } from '@/components/global/image-lightbox'

export function Project360PresentationClient({ project }: { project: Project }) {
  const router = useRouter()
  const { t, dir } = useI18n()
  const { open: openLightbox } = useLightbox()

  const images = project.images || [project.image]

  const openGallery = (index: number) => {
    openLightbox(
      images.map((src, i) => ({ src, alt: `${project.title} - ${i + 1}`, title: project.title })),
      index
    )
  }

  const infoCards = [
    { icon: Home, label: t('projectDetails.typeLabel'), value: project.category },
    { icon: Maximize2, label: t('projectDetails.area'), value: `${project.area} ${t('tour360.presentation.sqm')}` },
    { icon: MapPin, label: t('projectDetails.location'), value: project.location ?? '—' },
    { icon: Palette, label: t('projectDetails.styleLabel'), value: project.designStyle ?? t('tour360.presentation.fallbackStyle') },
    { icon: Calendar, label: t('projectDetails.year'), value: project.year ?? '—' },
    { icon: Users, label: t('tour360.presentation.clientType'), value: project.clientType ?? t('tour360.presentation.fallbackClient') },
  ]

  return (
    <>
      <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5]">
        {/* Cinematic Hero */}
        <section className="relative h-[85vh] overflow-hidden">
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              priority
              className="object-cover"
            />
          </motion.div>

          {/* Layered overlays for cinematic depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/20 to-transparent" />
          <div className={`absolute inset-0 ${dir === 'rtl' ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-[#0B0B0B]/60 via-transparent to-transparent`} />

          {/* Breadcrumb */}
          <div className={`absolute top-28 z-10 ${dir === 'rtl' ? 'right-8 sm:right-12' : 'left-8 sm:left-12'}`}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center gap-2 text-xs text-[#C8A96A]/70"
            >
              <Link href="/projects" className="hover:text-[#C8A96A] transition-colors">{t('tour360.presentation.projectsLink')}</Link>
              <span>/</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 border border-[#C8A96A] rounded-full text-[8px] flex items-center justify-center font-bold leading-none">360</span>
                {t('tour360.presentation.experience360')}
              </span>
            </motion.div>
          </div>

          {/* Hero content */}
          <div className={`absolute inset-0 flex flex-col items-end justify-end px-8 sm:px-12 lg:px-16 pb-16 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-2xl"
            >
              {/* 360 badge */}
              <div className={`flex mb-5 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C8A96A] rounded-full text-xs font-bold text-[#C8A96A] tracking-widest uppercase bg-[#C8A96A]/5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A] animate-pulse" />
                  {t('tour360.presentation.experience360')}
                </span>
              </div>

              <p className="text-[#C8A96A] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 sm:mb-4">
                {project.category}
              </p>
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-heading font-bold mb-3 sm:mb-5 text-balance leading-tight">
                {project.title}
              </h1>
              <p className="text-xs sm:text-base text-[#ABABAB] leading-relaxed mb-4 sm:mb-8 max-w-lg">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm">
                <div>
                  <p className="text-[#666] mb-0.5 sm:mb-1 text-[10px] sm:text-xs">{t('projectDetails.location')}</p>
                  <p className="text-[#F5F5F5] font-medium text-xs sm:text-base">{project.location}</p>
                </div>
                <div>
                  <p className="text-[#666] mb-0.5 sm:mb-1 text-[10px] sm:text-xs">{t('projectDetails.area')}</p>
                  <p className="text-[#F5F5F5] font-medium text-xs sm:text-base">{project.area} {t('tour360.presentation.sqm')}</p>
                </div>
                {project.rooms && (
                  <div>
                    <p className="text-[#666] mb-0.5 sm:mb-1 text-[10px] sm:text-xs">{t('tour360.presentation.rooms')}</p>
                    <p className="text-[#F5F5F5] font-medium text-xs sm:text-base">{project.rooms} {t('tour360.presentation.rooms')}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#666] mb-0.5 sm:mb-1 text-[10px] sm:text-xs">{t('projectDetails.year')}</p>
                  <p className="text-[#F5F5F5] font-medium text-xs sm:text-base">{project.year}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[#C8A96A]/50 text-[10px] uppercase tracking-widest">{t('tour360.presentation.discover')}</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-px h-8 bg-gradient-to-b from-[#C8A96A]/60 to-transparent"
            />
          </motion.div>
        </section>

        {/* Info Cards */}
        <section className="px-4 sm:px-12 lg:px-16 py-10 sm:py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-3xl font-heading font-bold mb-6 sm:mb-12 text-center"
          >
            {t('projectDetails.infoTitle')}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
            {infoCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-3 sm:p-5 border border-[#C8A96A]/15 rounded-xl bg-[#111111] hover:bg-[#151515] hover:border-[#C8A96A]/30 transition-all duration-300"
              >
                <card.icon size={14} className="text-[#C8A96A] mb-2 sm:mb-3 sm:w-[18px] sm:h-[18px]" />
                <p className="text-[#888] text-[9px] sm:text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-1.5">{card.label}</p>
                <p className="text-[#F5F5F5] text-xs sm:text-sm font-medium">{card.value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Project Description */}
        <section className="px-4 sm:px-12 lg:px-16 py-10 sm:py-16 bg-[#0E0E0E]">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl sm:text-3xl font-heading font-bold mb-4 sm:mb-8"
            >
              {t('projectDetails.aboutTitle')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-[#ABABAB] text-xs sm:text-base leading-relaxed mb-4 sm:mb-6"
            >
              {project.description}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-[#888] text-[10px] sm:text-sm leading-relaxed"
            >
              {t('tour360.presentation.aboutP1')}
            </motion.p>
          </div>
        </section>

        {/* Gallery */}
        <section className="px-4 sm:px-12 lg:px-16 py-10 sm:py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-3xl font-heading font-bold mb-6 sm:mb-12 text-center"
          >
            {t('projectDetails.galleryTitle')}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-xl cursor-pointer ${i === 0 ? 'col-span-2 row-span-2 aspect-[16/9]' : 'aspect-square'}`}
                onClick={() => openGallery(i)}
              >
                <Image
                  src={img}
                  alt={`${project.title} - ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-full bg-[#C8A96A] text-[#0B0B0B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ZoomIn size={20} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Cinematic CTA — Enter 360 Experience */}
        <section className="px-8 sm:px-12 lg:px-16 py-24 relative overflow-hidden">
          {/* Background ambiance */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C8A96A]/3 to-transparent pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center relative z-10"
          >
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px w-16 bg-gradient-to-l from-[#C8A96A]/60 to-transparent" />
              <span className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-[0.4em]">{t('tour360.presentation.readyToEnter')}</span>
              <div className="h-px w-16 bg-gradient-to-r from-[#C8A96A]/60 to-transparent" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-5 text-balance">
              {t('tour360.presentation.enterTitle')}
            </h2>
            <p className="text-[#ABABAB] text-base mb-12 max-w-md mx-auto">
              {t('tour360.presentation.enterDesc')}
            </p>

            <motion.button
              onClick={() => router.push(`/projects/${project.id}/360/tour`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 py-3 sm:py-5 bg-[#C8A96A] text-[#0B0B0B] font-heading font-bold text-sm sm:text-lg rounded-xl overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(200,169,106,0.25)] hover:shadow-[0_0_60px_rgba(200,169,106,0.4)]"
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-white/20" />
              <span className="relative">{t('tour360.presentation.enter360Btn')}</span>
              <ArrowRight size={16} className={`relative transition-transform duration-300 sm:w-5 sm:h-5 ${dir === 'rtl' ? 'group-hover:translate-x-[-4px]' : 'group-hover:translate-x-[4px]'}`} />
            </motion.button>

            <p className="mt-4 sm:mt-6 text-[#555] text-[10px] sm:text-xs">
              {t('tour360.presentation.panoramicNote')}
            </p>
          </motion.div>
        </section>
      </div>
    </>
  )
}
