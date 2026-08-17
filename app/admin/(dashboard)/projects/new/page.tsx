import { ProjectWizardClient } from '@/components/admin/project-wizard-client'

export const metadata = { title: 'مشروع جديد' }

export default function NewProjectPage() {
  return <ProjectWizardClient mode="create" />
}
