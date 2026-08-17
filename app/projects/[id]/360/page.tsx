import { getProjectById } from '@/lib/projects'
import { notFound } from 'next/navigation'
import { Project360PresentationClient } from '@/components/360/project-360-presentation-client'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function Project360PresentationPage({ params }: Props) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project || !project.has360) {
    notFound()
  }

  return <Project360PresentationClient project={project} />
}
