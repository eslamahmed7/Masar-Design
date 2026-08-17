import { getAdminProject } from '@/lib/admin/actions'
import { ProjectWizardClient } from '@/components/admin/project-wizard-client'
import { notFound } from 'next/navigation'

export const metadata = { title: 'تعديل المشروع' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = await getAdminProject(id)
  if (!project) notFound()

  return <ProjectWizardClient mode="edit" project={project} />
}
