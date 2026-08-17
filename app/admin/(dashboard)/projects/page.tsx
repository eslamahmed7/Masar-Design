import { getAdminProjects } from '@/lib/admin/actions'
import { AdminProjectsClient } from '@/components/admin/admin-projects-client'

export const metadata = { title: 'المشاريع' }

interface Props {
  searchParams: Promise<{ filter?: string; search?: string; category?: string; page?: string }>
}

export default async function AdminProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = params.filter ?? 'all'
  const search = params.search ?? ''
  const category = params.category ?? 'all'
  const page = Number(params.page ?? 1)

  const { projects, total } = await getAdminProjects({
    status: filter === 'featured' ? undefined : filter,
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    page,
    pageSize: 20,
  })

  // Client-side featured filter (DB doesn't have featured as a status)
  const filtered = filter === 'featured' ? projects.filter(p => p.is_featured) : projects

  return (
    <AdminProjectsClient
      projects={filtered}
      total={filter === 'featured' ? filtered.length : total}
      currentFilter={filter}
      currentSearch={search}
      currentCategory={category}
      currentPage={page}
    />
  )
}
