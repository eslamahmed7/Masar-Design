'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Plus, Filter, Eye, Pencil, Trash2, Star, StarOff,
  FolderOpen, ChevronLeft, ChevronRight, MoreHorizontal, Globe, EyeOff, Camera,
} from 'lucide-react'
import { deleteProject, toggleFeatured, updateProjectStatus } from '@/lib/admin/actions'
import type { DBProject } from '@/lib/admin/types'

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  archived: 'bg-[#C8A96A]/15 text-[#C8A96A] border-[#C8A96A]/25',
  hidden: 'bg-[#333]/60 text-[#888] border-[#444]',
}
const STATUS_LABELS: Record<string, string> = {
  published: 'منشور', draft: 'مسودة', archived: 'مؤرشف', hidden: 'مخفي', all: 'الكل',
}
const CATEGORIES = ['all', 'Residential', 'Commercial', 'Administrative']
const CATEGORY_LABELS: Record<string, string> = {
  all: 'كل الفئات', Residential: 'سكني', Commercial: 'تجاري', Administrative: 'إداري',
}

interface Props {
  projects: DBProject[]
  total: number
  currentFilter: string
  currentSearch: string
  currentCategory: string
  currentPage: number
}

export function AdminProjectsClient({
  projects, total, currentFilter, currentSearch, currentCategory, currentPage,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  const pushParams = (overrides: Record<string, string>) => {
    const p = new URLSearchParams()
    const merged = {
      filter: currentFilter,
      search: currentSearch,
      category: currentCategory,
      page: String(currentPage),
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'all' && v !== '1') p.set(k, v) })
    startTransition(() => router.push(`${pathname}?${p.toString()}`))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    pushParams({ search, page: '1' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    setDeletingId(id)
    await deleteProject(id)
    setDeletingId(null)
    router.refresh()
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await toggleFeatured(id, !current)
    router.refresh()
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateProjectStatus(id, status)
    setOpenMenu(null)
    router.refresh()
  }

  const filters = ['all', 'published', 'draft', 'archived', 'hidden', 'featured']

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">المشاريع</h1>
          <p className="text-[#888] text-sm mt-0.5">{total} مشروع</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={16} /> مشروع جديد
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status tabs */}
        <div className="flex items-center bg-[#1A1916] border border-[#C8A96A]/10 rounded-xl p-1 gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => pushParams({ filter: f, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentFilter === f
                  ? 'bg-[#C8A96A] text-[#0E0D0B]'
                  : 'text-[#888] hover:text-[#F0E6D3]'
              }`}
            >
              {f === 'featured' ? 'مميزة' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={currentCategory}
          onChange={e => pushParams({ category: e.target.value, page: '1' })}
          className="px-3 py-2 bg-[#1A1916] border border-[#C8A96A]/10 rounded-xl text-[#888] text-xs focus:outline-none focus:border-[#C8A96A]/30"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 min-w-48 max-w-xs relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="البحث عن مشروع..."
            className="w-full pr-9 pl-4 py-2 bg-[#1A1916] border border-[#C8A96A]/10 rounded-xl text-[#F0E6D3] placeholder-[#555] text-xs focus:outline-none focus:border-[#C8A96A]/30"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl">
        <div className="overflow-x-auto">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#C8A96A]/10 text-xs text-[#666] font-medium min-w-[700px]">
          <span className="w-12">صورة</span>
          <span>المشروع</span>
          <span className="w-24 text-center">الحالة</span>
          <span className="w-20 text-center">المشاهدات</span>
          <span className="w-10 text-center">مميز</span>
          <span className="w-12 text-center">360°</span>
          <span className="w-20 text-center">إجراءات</span>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen size={40} className="text-[#333] mx-auto mb-3" />
            <p className="text-[#666] text-sm">لا توجد مشاريع بهذه المعايير</p>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-lg text-xs font-bold"
            >
              <Plus size={13} /> إضافة مشروع
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#C8A96A]/8">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-[#F0E6D3]/3 transition-colors min-w-[700px] ${
                    deletingId === project.id ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#0E0D0B] border border-[#333] flex-shrink-0">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen size={13} className="text-[#444]" />
                      </div>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="min-w-0">
                    <Link href={`/admin/projects/${project.id}`} className="text-[#F0E6D3] text-sm font-medium hover:text-[#C8A96A] transition-colors truncate block">
                      {project.name}
                    </Link>
                    <p className="text-[#555] text-xs truncate">
                      {[project.category, project.subcategory, project.location].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="w-24 flex justify-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLORS[project.status]}`}>
                      {STATUS_LABELS[project.status]}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="w-20 flex items-center justify-center gap-1 text-[#666] text-xs">
                    <Eye size={11} /> {project.views_count.toLocaleString()}
                  </div>

                  {/* Featured toggle */}
                  <div className="w-10 flex justify-center">
                    <button
                      onClick={() => handleToggleFeatured(project.id, project.is_featured)}
                      className={`p-1 rounded transition-colors ${
                        project.is_featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-[#444] hover:text-yellow-400'
                      }`}
                    >
                      {project.is_featured ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
                    </button>
                  </div>

                  {/* 360 editor shortcut */}
                  <div className="w-12 flex justify-center">
                    <Link
                      href={`/admin/projects/${project.id}/360-editor`}
                      title="محرر 360°"
                      className={`flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        project.enable_360
                          ? 'text-[#C8A96A] bg-[#C8A96A]/10 hover:bg-[#C8A96A]/20 border border-[#C8A96A]/30'
                          : 'text-[#444] hover:text-[#666]'
                      }`}
                    >
                      <Camera size={12} />
                    </Link>
                  </div>

                  {/* Actions dropdown */}
                  <div className="w-20 flex items-center justify-center gap-1 relative">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="p-1.5 rounded-lg text-[#666] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-all"
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                      className="p-1.5 rounded-lg text-[#666] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/8 transition-all"
                    >
                      <MoreHorizontal size={13} />
                    </button>

                    <AnimatePresence>
                      {openMenu === project.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute left-0 top-8 z-20 w-44 bg-[#1A1916] border border-[#C8A96A]/15 rounded-xl shadow-2xl overflow-hidden"
                        >
                          <Link
                            href={`/projects/${project.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2.5 text-xs text-[#888] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/5 transition-all"
                          >
                            <Globe size={12} /> عرض في الموقع
                          </Link>
                          {project.status !== 'published' && (
                            <button
                              onClick={() => handleStatusChange(project.id, 'published')}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-emerald-400 hover:bg-emerald-950/20 transition-all"
                            >
                              <Eye size={12} /> نشر
                            </button>
                          )}
                          {project.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(project.id, 'hidden')}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#888] hover:bg-[#F0E6D3]/5 transition-all"
                            >
                              <EyeOff size={12} /> إخفاء
                            </button>
                          )}
                          <div className="border-t border-[#333] my-1" />
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-950/20 transition-all"
                          >
                            <Trash2 size={12} /> حذف
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => pushParams({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg bg-[#1A1916] border border-[#C8A96A]/10 text-[#888] disabled:opacity-30 hover:text-[#C8A96A] transition-all"
          >
            <ChevronRight size={16} />
          </button>
          <span className="text-sm text-[#888]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => pushParams({ page: String(currentPage + 1) })}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg bg-[#1A1916] border border-[#C8A96A]/10 text-[#888] disabled:opacity-30 hover:text-[#C8A96A] transition-all"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
