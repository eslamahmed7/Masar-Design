'use client'

import { motion } from 'motion/react'
import { ZoomIn } from 'lucide-react'
import type { Project } from '@/lib/projects'
import Link from 'next/link'
import { optimizeImageUrl } from '@/lib/image-url'
import { useLightbox } from '@/components/global/image-lightbox'
import { useI18n } from '@/lib/i18n'

const TIMELINE_STEPS = [
  { labelAr: 'لوحة المزاج', labelEn: 'Mood Board' },
  { labelAr: 'تصميم المفهوم', labelEn: 'Concept Design' },
  { labelAr: 'التخطيط ثنائي الأبعاد', labelEn: '2D Planning' },
  { labelAr: 'الرؤية ثلاثية الأبعاد', labelEn: '3D Visualization' },
  { labelAr: 'الرسومات التنفيذية', labelEn: 'Technical Drawings' },
  { labelAr: 'النتيجة النهائية', labelEn: 'Final Result' },
]

const MATERIALS = [
  { key: 'marble', nameAr: 'الرخام', nameEn: 'Marble', desc: 'رخام طبيعي فاخر بتصاميم فريدة' },
  { key: 'wood', nameAr: 'الخشب', nameEn: 'Wood', desc: 'خشب عالي الجودة مع لمسات نبيلة' },
  { key: 'metals', nameAr: 'المعادن', nameEn: 'Metals', desc: 'معادن براقة وعصرية' },
  { key: 'glass', nameAr: 'الزجاج', nameEn: 'Glass', desc: 'زجاج شفاف وملون فاخر' },
  { key: 'fabrics', nameAr: 'الأقمشة', nameEn: 'Fabrics', desc: 'أقمشة ناعمة وفاخرة' },
  { key: 'stone', nameAr: 'الحجر', nameEn: 'Stone', desc: 'حجر طبيعي برّاق وأنيق' },
]

export function ProjectDetailsClient({
  project,
  allProjects,
}: {
  project: Project
  allProjects: Project[]
}) {
  const { t, lang } = useI18n()
  const { open: openLightbox } = useLightbox()
  const projectImages = project.images || [project.image]
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 4)

  const openGallery = (startIndex: number) => {
    openLightbox(
      projectImages.map((src, i) => ({ src, alt: `${project.title} - ${i + 1}`, title: project.title })),
      startIndex
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-[70vh] overflow-hidden"
      >
        <motion.img
          src={optimizeImageUrl(project.image, 1200)}
          alt={project.title}
          fetchPriority="high"
          className="w-full h-full object-cover"
          animate={{ y: [0, 20] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" />

        <div className="absolute inset-0 flex flex-col items-end justify-end px-8 sm:px-12 lg:px-16 pb-16 text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-4">
              {project.category}
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6">
              {project.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {project.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-8 text-sm">
              <div>
                <p className="text-muted-foreground mb-2">{t('projectDetails.location')}</p>
                <p className="text-foreground font-medium">{project.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">{t('projectDetails.area')}</p>
                <p className="text-foreground font-medium">{project.area} {t('common.sqm')}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">{t('projectDetails.year')}</p>
                <p className="text-foreground font-medium">{project.year}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Info Cards */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-12 lg:px-16 py-10 sm:py-24"
      >
        <h2 className="text-xl sm:text-4xl font-heading font-bold mb-6 sm:mb-16 text-center">{t('projectDetails.infoTitle')}</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8 max-w-5xl mx-auto">
          {[
            { label: t('projectDetails.typeLabel'), value: project.category },
            { label: t('projectDetails.area'), value: `${project.area} ${t('projectDetails.areaValue')}` },
            { label: t('projectDetails.location'), value: project.location },
            { label: t('projectDetails.styleLabel'), value: t('projectDetails.styleValue') },
            { label: t('projectDetails.durationLabel'), value: t('projectDetails.durationValue') },
            { label: t('projectDetails.year'), value: project.year },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-3 sm:p-6 border border-gold/20 rounded-lg bg-surface/50 hover:bg-surface/70 transition-colors"
            >
              <p className="text-gold text-xs sm:text-sm font-semibold uppercase mb-1 sm:mb-3">{item.label}</p>
              <p className="text-foreground text-xs sm:text-lg font-medium">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Gallery */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-12 lg:px-16 py-10 sm:py-24 bg-surface/50"
      >
        <h2 className="text-xl sm:text-4xl font-heading font-bold mb-6 sm:mb-16 text-center">{t('projectDetails.galleryTitle')}</h2>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6 max-w-6xl mx-auto">
          {projectImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
              onClick={() => openGallery(i)}
            >
              <img
                src={optimizeImageUrl(img, 500)}
                alt={`${project.title} - ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="p-3 rounded-full bg-gold text-[#0B0B0B]"
                >
                  <ZoomIn size={24} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Design Process Timeline */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-12 lg:px-16 py-10 sm:py-24"
      >
        <h2 className="text-xl sm:text-4xl font-heading font-bold mb-6 sm:mb-16 text-center">{t('projectDetails.processTitle')}</h2>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 sm:gap-8">
            {TIMELINE_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`flex gap-8 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full bg-gold text-[#0B0B0B] flex items-center justify-center font-bold text-lg">
                    {i + 1}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-20 bg-gold/20" />
                  )}
                </div>

                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">{lang === 'ar' ? step.labelAr : step.labelEn}</h3>
                  <p className="text-muted-foreground">{lang === 'ar' ? step.labelEn : step.labelAr}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Materials */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-12 lg:px-16 py-10 sm:py-24 bg-surface/50"
      >
        <h2 className="text-xl sm:text-4xl font-heading font-bold mb-6 sm:mb-16 text-center">{t('projectDetails.materialsTitle')}</h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 max-w-6xl mx-auto">
          {MATERIALS.map((material, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group p-6 border border-gold/20 rounded-lg bg-surface/50 hover:bg-surface/70 hover:border-gold/40 transition-all duration-300"
            >
              <div className="w-full h-20 sm:h-32 bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg mb-2 sm:mb-4 group-hover:from-gold/30 group-hover:to-gold/10 transition-colors" />
              <h3 className="text-xs sm:text-lg font-heading font-bold text-foreground mb-1 sm:mb-2">{lang === 'ar' ? material.nameAr : material.nameEn}</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground mb-1 sm:mb-2">{lang === 'ar' ? material.nameEn : material.nameAr}</p>
              <p className="text-[9px] sm:text-sm text-muted-foreground/70 leading-normal line-clamp-2 sm:line-clamp-none">{lang === 'ar' ? material.desc : t(`projectDetails.materialsDesc.${material.key}`)}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Project Description */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-12 lg:px-16 py-10 sm:py-24"
      >
        <h2 className="text-xl sm:text-4xl font-heading font-bold mb-6 sm:mb-12 text-center">{t('projectDetails.aboutTitle')}</h2>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm sm:text-lg text-muted-foreground leading-relaxed space-y-4 sm:space-y-6"
          >
            <p>
              {t('projectDetails.aboutP1')}
            </p>
            <p>
              {t('projectDetails.aboutP2')}
            </p>
            <p>
              {t('projectDetails.aboutP3')}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="px-4 sm:px-12 lg:px-16 py-10 sm:py-24 bg-surface/50"
        >
          <h2 className="text-xl sm:text-4xl font-heading font-bold mb-6 sm:mb-16 text-center">{t('projectDetails.relatedTitle')}</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl mx-auto">
            {relatedProjects.map((related, i) => (
              <Link key={related.id} href={`/projects/${related.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-lg bg-surface/50 hover:bg-surface/70 transition-all cursor-pointer h-full"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={optimizeImageUrl(related.image)}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-2 sm:p-4 text-right">
                    <p className="text-gold text-[9px] sm:text-xs font-semibold uppercase mb-1 sm:mb-2">{related.category}</p>
                    <h3 className="text-foreground text-xs sm:text-base font-heading font-bold group-hover:text-gold transition-colors line-clamp-1">
                      {related.title}
                    </h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-12 lg:px-16 py-12 sm:py-24 text-center"
      >
        <h2 className="text-xl sm:text-4xl font-heading font-bold mb-4 sm:mb-8">{t('projectDetails.ctaTitle')}</h2>
        <p className="text-muted-foreground mb-6 sm:mb-12 text-sm sm:text-lg max-w-2xl mx-auto">
          {t('projectDetails.ctaDesc')}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-gold text-[#0B0B0B] font-heading font-bold text-xs sm:text-base rounded-lg hover:bg-gold/90 transition-colors"
        >
          {t('projectDetails.ctaBtn')}
        </motion.button>
      </motion.section>
    </div>
  )
}
