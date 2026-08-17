import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tour360EditorClient } from '@/components/admin/tour-360-editor'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name').eq('id', id).single()
  return { title: `محرر 360° — ${data?.name ?? ''}` }
}

export default async function Tour360EditorPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, tour360, enable_360, has_360')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!project) notFound()

  return <Tour360EditorClient project={project} />
}
