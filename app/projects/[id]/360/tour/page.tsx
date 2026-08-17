import { getProjectById } from '@/lib/projects'
import { notFound } from 'next/navigation'
import { TourEntryWrapper } from '@/components/360/tour-entry-wrapper'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ room?: string }>
}

export default async function TourPage({ params, searchParams }: Props) {
  const { id } = await params
  const { room } = await searchParams
  const project = await getProjectById(id)

  if (!project || !project.has360 || !project.tour360) {
    notFound()
  }

  return <TourEntryWrapper project={project} initialRoomId={room} />
}
