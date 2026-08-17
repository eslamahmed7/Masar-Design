import { getAdminProject } from '@/lib/admin/actions'
import { AdminProjectDetailClient } from '@/components/admin/admin-project-detail-client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Camera } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getAdminProject(id)
  return { title: project?.name ?? 'مشروع' }
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProjectDetailPage({ params }: Props) {
  const { id } = await params
  const project = await getAdminProject(id)
  if (!project) notFound()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">{project.name}</h1>
          <p className="text-[#888] text-sm mt-0.5">{project.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {project.enable_360 && (
            <Link
              href={`/admin/projects/${id}/360-editor`}
              className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A]/15 border border-[#C8A96A]/30 text-[#C8A96A] rounded-xl text-sm font-bold hover:bg-[#C8A96A]/25 transition-colors"
            >
              <Camera size={14} /> محرر 360°
            </Link>
          )}
          <Link
            href={`/admin/projects/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
          >
            <Pencil size={14} /> تعديل
          </Link>
        </div>
      </div>
      <AdminProjectDetailClient project={project} />
    </div>
  )
}
