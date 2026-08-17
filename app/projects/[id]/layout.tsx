import { Metadata } from 'next'
import { getProjects } from '@/lib/projects'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const projects = await getProjects()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return {
      title: 'مشروع غير موجود | مسار',
      description: 'المشروع الذي تبحث عنه غير موجود.',
    }
  }

  return {
    title: `${project.title} | مسار للتصميم الداخلي`,
    description: project.description,
  }
}

export default function ProjectDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
