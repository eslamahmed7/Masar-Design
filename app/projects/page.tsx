import { Metadata } from 'next'
import { ProjectsPageClient } from '@/components/projects-page-client'
import { getProjects } from '@/lib/projects'
import { getCategories, getDesignStyles } from '@/lib/admin/actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'المشاريع | مسار للتصميم الداخلي',
  description: 'اكتشف مجموعتنا المختارة من مشاريع التصميم الداخلي الفاخرة المصممة بدقة وأناقة خالدة.',
}

export default async function ProjectsPage() {
  const [projects, { categories }, { styles }] = await Promise.all([
    getProjects(),
    getCategories(),
    getDesignStyles(),
  ])

  return (
    <ProjectsPageClient
      projects={projects}
      dbCategories={categories}
      dbStyles={styles}
    />
  )
}
