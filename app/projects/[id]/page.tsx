import { ProjectDetailsClient } from '@/components/project-details-client'
import { getProjectById, getProjects } from '@/lib/projects'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailsPage({ params }: Props) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const allProjects = await getProjects()

  return <ProjectDetailsClient project={project} allProjects={allProjects} />
}
