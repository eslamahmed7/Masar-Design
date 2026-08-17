'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Eye, Heart, Star, Globe, Grid3X3, Image as ImageIcon,
  Calendar, MapPin, Maximize2, Palette, User, Tag,
  Trash2, ExternalLink, Plus, X,
} from 'lucide-react'
import { addGalleryImage, deleteGalleryImage, updateProjectStatus } from '@/lib/admin/actions'
import type { DBProject, GalleryImage } from '@/lib/admin/types'

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  archived: 'bg-[#C8A96A]/15 text-[#C8A96A] border-[#C8A96A]/25',
  hidden: 'bg-[#333]/60 text-[#888] border-[#444]',
}
const STATUS_LABELS: Record<string, string> = { published: 'منشور', draft: 'مسودة', archived: 'مؤرشف', hidden: 'مخفي' }

interface Props {
  project: DBProject & { project_gallery?: GalleryImage[] }
}

export function AdminProjectDetailClient({ project }: Props) {
  const router = useRouter()
  const [gallery, setGallery] = useState<GalleryImage[]>(project.project_gallery ?? [])
  const [addingImage, setAddingImage] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAddImage = async () => {
    if (!newImageUrl) return
    setSaving(true)
    const result = await addGalleryImage(project.id, {
      url: newImageUrl,
      alt_text: newImageAlt || undefined,
      sort_order: gallery.length,
    })
    if ('image' in result && result.image) {
      setGallery(prev => [...prev, result.image as GalleryImage])
      setNewImageUrl('')
      setNewImageAlt('')
      setAddingImage(false)
    }
    setSaving(false)
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('حذف هذه الصورة؟')) return
    await deleteGalleryImage(imageId, project.id)
    setGallery(prev => prev.filter(i => i.id !== imageId))
  }

  const handleStatusChange = async (status: string) => {
    await updateProjectStatus(project.id, status)
    router.refresh()
  }

  const infoItems = [
    { icon: MapPin, label: 'الموقع', value: project.location },
    { icon: Maximize2, label: 'المساحة', value: project.area ? `${project.area} م²` : null },
    { icon: Palette, label: 'النمط', value: project.style },
    { icon: Calendar, label: 'سنة الإنجاز', value: project.completion_year },
    { icon: Tag, label: 'الفئة', value: project.category ? `${project.category} ${project.subcategory ? `/ ${project.subcategory}` : ''}` : null },
    { icon: User, label: 'نوع العميل', value: project.client_type },
  ].filter(i => i.value)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — cover + stats */}
        <div className="space-y-4">
          {/* Cover image */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-[#1A1916] border border-[#C8A96A]/10">
            {project.cover_image_url ? (
              <img src={project.cover_image_url} alt={project.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={32} className="text-[#444]" />
              </div>
            )}
          </div>

          {/* Status control */}
          <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888]">الحالة الحالية</span>
              <span className={`px-2.5 py-1 rounded-full text-xs border ${STATUS_COLORS[project.status]}`}>
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['published', 'draft', 'hidden', 'archived'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={project.status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    project.status === s
                      ? `${STATUS_COLORS[s]} opacity-60 cursor-default`
                      : 'border-[#333] text-[#888] hover:border-[#C8A96A]/30 hover:text-[#F0E6D3]'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Eye, label: 'مشاهدات', value: project.views_count },
                { icon: Heart, label: 'إعجابات', value: project.likes_count },
                { icon: Star, label: 'مميز', value: project.is_featured ? 'نعم' : 'لا' },
                { icon: Grid3X3, label: '360°', value: project.has_360 ? 'نعم' : 'لا' },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex items-center gap-2 p-2 bg-[#0E0D0B] rounded-xl">
                    <Icon size={13} className="text-[#C8A96A] flex-shrink-0" />
                    <div>
                      <p className="text-[#F0E6D3] text-sm font-medium">{stat.value}</p>
                      <p className="text-[#666] text-[10px]">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* External links */}
          <div className="flex gap-2">
            <a
              href={`/projects/${project.slug}`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1A1916] border border-[#C8A96A]/10 rounded-xl text-[#888] text-xs hover:text-[#C8A96A] hover:border-[#C8A96A]/25 transition-all"
            >
              <Globe size={13} /> معاينة
            </a>
            {project.has_360 && (
              <a
                href={`/projects/${project.slug}/360`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1A1916] border border-[#C8A96A]/10 rounded-xl text-[#888] text-xs hover:text-[#C8A96A] hover:border-[#C8A96A]/25 transition-all"
              >
                <ExternalLink size={13} /> جولة 360°
              </a>
            )}
          </div>
        </div>

        {/* Right column — info + description */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info grid */}
          {infoItems.length > 0 && (
            <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#F0E6D3] mb-4">معلومات المشروع</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItems.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={13} className="text-[#C8A96A]" />
                      </div>
                      <div>
                        <p className="text-[#666] text-xs">{item.label}</p>
                        <p className="text-[#F0E6D3] text-sm">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {project.short_description && (
            <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#F0E6D3] mb-3">الوصف</h3>
              <p className="text-[#C0B090] text-sm leading-relaxed">{project.short_description}</p>
              {project.full_description && (
                <p className="text-[#888] text-sm leading-relaxed mt-3">{project.full_description}</p>
              )}
            </div>
          )}

          {/* Tags */}
          {[
            { label: 'المميزات', data: project.highlights, color: 'text-[#C8A96A] bg-[#C8A96A]/10 border-[#C8A96A]/20' },
            { label: 'المواد', data: project.materials, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          ].map(section => section.data?.length ? (
            <div key={section.label} className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#F0E6D3] mb-3">{section.label}</h3>
              <div className="flex flex-wrap gap-2">
                {section.data.map(tag => (
                  <span key={tag} className={`px-2.5 py-1 rounded-lg text-xs border ${section.color}`}>{tag}</span>
                ))}
              </div>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Gallery management */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-[#F0E6D3]">المعرض ({gallery.length})</h3>
          <button
            onClick={() => setAddingImage(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-lg text-[#C8A96A] text-xs hover:bg-[#C8A96A]/20 transition-all"
          >
            <Plus size={13} /> إضافة صورة
          </button>
        </div>

        {addingImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-4 bg-[#0E0D0B] border border-[#C8A96A]/15 rounded-xl space-y-3"
          >
            <input
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="رابط الصورة (Cloudinary URL)"
              dir="ltr"
              className="w-full px-4 py-2 bg-[#1A1916] border border-[#333] rounded-xl text-[#F0E6D3] text-sm focus:outline-none focus:border-[#C8A96A]/30 placeholder-[#555]"
            />
            <input
              value={newImageAlt}
              onChange={e => setNewImageAlt(e.target.value)}
              placeholder="نص بديل (Alt text)"
              className="w-full px-4 py-2 bg-[#1A1916] border border-[#333] rounded-xl text-[#F0E6D3] text-sm focus:outline-none focus:border-[#C8A96A]/30 placeholder-[#555]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddImage}
                disabled={!newImageUrl || saving}
                className="px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-[#d4b87a] transition-colors"
              >
                {saving ? 'جاري الحفظ...' : 'إضافة'}
              </button>
              <button
                onClick={() => setAddingImage(false)}
                className="px-4 py-2 bg-[#333] text-[#888] rounded-lg text-xs hover:text-[#F0E6D3] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        )}

        {gallery.length === 0 ? (
          <div className="py-10 text-center">
            <ImageIcon size={28} className="text-[#333] mx-auto mb-2" />
            <p className="text-[#555] text-sm">لا توجد صور في المعرض</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {gallery.map(img => (
              <motion.div
                key={img.id}
                layout
                className="relative aspect-square rounded-xl overflow-hidden bg-[#0E0D0B] border border-[#333] group"
              >
                <img src={img.url} alt={img.alt_text ?? ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-1.5 bg-red-950/80 border border-red-800/50 rounded-lg text-red-400 hover:bg-red-950 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
