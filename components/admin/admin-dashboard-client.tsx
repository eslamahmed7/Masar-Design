'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import {
  FolderOpen, Eye, Heart, Star, Grid3X3, FileText,
  TrendingUp, Plus, ArrowLeft, Clock,
} from 'lucide-react'
import type { DashboardStats, DBProject } from '@/lib/admin/types'

const statusColors: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  archived: 'bg-[#C8A96A]/15 text-[#C8A96A] border-[#C8A96A]/25',
  hidden: 'bg-[#333]/60 text-[#888] border-[#444]',
}

const statusLabels: Record<string, string> = {
  published: 'منشور',
  draft: 'مسودة',
  archived: 'مؤرشف',
  hidden: 'مخفي',
}

interface Props {
  stats: DashboardStats
  recentProjects: DBProject[]
}

export function AdminDashboardClient({ stats, recentProjects }: Props) {
  const statCards = [
    {
      label: 'إجمالي المشاريع',
      value: stats.total_projects,
      icon: FolderOpen,
      color: 'text-[#C8A96A]',
      bg: 'bg-[#C8A96A]/10',
      href: '/admin/projects',
    },
    {
      label: 'المنشورة',
      value: stats.published_projects,
      icon: Eye,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      href: '/admin/projects?filter=published',
    },
    {
      label: 'المسودات',
      value: stats.draft_projects,
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      href: '/admin/projects?filter=draft',
    },
    {
      label: 'إجمالي المشاهدات',
      value: stats.total_views.toLocaleString('ar-SA'),
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      href: '/admin/projects',
    },
    {
      label: 'الإعجابات',
      value: stats.total_likes.toLocaleString('ar-SA'),
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      href: '/admin/projects',
    },
    {
      label: 'المميزة',
      value: stats.featured_projects,
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      href: '/admin/projects?filter=featured',
    },
    {
      label: 'تجربة 360°',
      value: stats.projects_with_360,
      icon: Grid3X3,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      href: '/admin/projects',
    },
  ]

  const publishedPct = stats.total_projects
    ? Math.round((stats.published_projects / stats.total_projects) * 100)
    : 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0E6D3]">لوحة التحكم</h1>
        <p className="text-[#888] text-sm mt-1">نظرة عامة على مشاريع مسار</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={card.href}
                className="block p-5 bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl hover:border-[#C8A96A]/25 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={card.color} />
                </div>
                <p className="text-3xl font-bold text-[#F0E6D3] group-hover:text-[#C8A96A] transition-colors">
                  {card.value}
                </p>
                <p className="text-[#888] text-xs mt-1">{card.label}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Second row of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.slice(4).map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + i * 0.06 }}
            >
              <Link
                href={card.href}
                className="block p-4 bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl hover:border-[#C8A96A]/25 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={card.color} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#F0E6D3] group-hover:text-[#C8A96A] transition-colors">
                      {card.value}
                    </p>
                    <p className="text-[#888] text-xs">{card.label}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent projects table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#C8A96A]/10">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#C8A96A]" />
              <h2 className="text-sm font-semibold text-[#F0E6D3]">آخر المشاريع</h2>
            </div>
            <Link href="/admin/projects" className="text-xs text-[#C8A96A] hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft size={12} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="p-8 text-center">
              <FolderOpen size={32} className="text-[#333] mx-auto mb-3" />
              <p className="text-[#666] text-sm">لا توجد مشاريع بعد</p>
              <Link
                href="/admin/projects/new"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-lg text-xs font-bold hover:bg-[#d4b87a] transition-colors"
              >
                <Plus size={13} /> أضف مشروعك الأول
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#C8A96A]/8">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F0E6D3]/3 transition-colors group"
                >
                  {/* Cover thumbnail */}
                  <div className="w-12 h-10 rounded-lg bg-[#0E0D0B] border border-[#333] overflow-hidden flex-shrink-0">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen size={14} className="text-[#444]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[#F0E6D3] text-sm font-medium truncate group-hover:text-[#C8A96A] transition-colors">
                      {project.name}
                    </p>
                    <p className="text-[#666] text-xs truncate">
                      {project.category} {project.location ? `· ${project.location}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                    <div className="flex items-center gap-1 text-[#555] text-xs">
                      <Eye size={11} /> {project.views_count}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions + mini chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Quick actions */}
          <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[#F0E6D3] mb-4">إجراءات سريعة</h2>
            <div className="space-y-2">
              <Link
                href="/admin/projects/new"
                className="flex items-center gap-3 p-3 bg-[#C8A96A]/10 hover:bg-[#C8A96A]/20 border border-[#C8A96A]/20 rounded-xl transition-all group"
              >
                <Plus size={15} className="text-[#C8A96A]" />
                <span className="text-[#F0E6D3] text-sm">إضافة مشروع جديد</span>
              </Link>
              <Link
                href="/admin/projects"
                className="flex items-center gap-3 p-3 bg-[#F0E6D3]/3 hover:bg-[#F0E6D3]/6 border border-[#C8A96A]/10 rounded-xl transition-all"
              >
                <FolderOpen size={15} className="text-[#888]" />
                <span className="text-[#888] text-sm">إدارة المشاريع</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 p-3 bg-[#F0E6D3]/3 hover:bg-[#F0E6D3]/6 border border-[#C8A96A]/10 rounded-xl transition-all"
              >
                <Eye size={15} className="text-[#888]" />
                <span className="text-[#888] text-sm">معاينة الموقع</span>
              </Link>
            </div>
          </div>

          {/* Publication rate */}
          <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[#F0E6D3] mb-3">نسبة النشر</h2>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-[#C8A96A]">{publishedPct}%</span>
              <span className="text-[#888] text-xs mb-1">من المشاريع منشورة</span>
            </div>
            <div className="h-2 bg-[#0E0D0B] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${publishedPct}%` }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                className="h-full bg-[#C8A96A] rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-[#555] mt-1.5">
              <span>{stats.published_projects} منشور</span>
              <span>{stats.total_projects} إجمالي</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
