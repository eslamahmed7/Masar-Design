import { createClient } from '@/lib/supabase/client'
import { optimizeImageUrl } from '@/lib/image-url'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export type HotspotInfo = {
  brand?: string
  material?: string
  fabric?: string
  color?: string
  dimensions?: string
  finish?: string
  model?: string
  note?: string
  [key: string]: string | undefined
}

export type Hotspot = {
  id: string
  x: number
  y: number
  type: 'navigate' | 'info'
  targetRoomId?: string
  label: string
  details?: HotspotInfo
}

export type TourRoom = {
  id: string
  nameAr: string
  nameEn: string
  thumbnail: string
  panorama: string
  panorama_night?: string        // optional night-mode panorama
  description: string
  hotspots: Hotspot[]
  connectedRooms: string[]
}

export type FloorPlanRoom = {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
}

export type Tour360 = {
  rooms: TourRoom[]
  floorPlan: {
    rooms: FloorPlanRoom[]
  }
}

export type Project = {
  id: string
  order: number
  title: string
  category: string
  subcategory?: string
  description: string
  image: string
  images?: string[]
  year?: string
  location?: string
  area?: string
  rooms?: number
  designStyle?: string
  clientType?: string
  has360?: boolean
  tour360?: Tour360
}

function mapDBProject(p: any): Project {
  const gallery = p.project_gallery ?? []
  const images = gallery.length > 0
    ? gallery.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((g: any) => optimizeImageUrl(g.url))
    : p.cover_image_url
      ? [optimizeImageUrl(p.cover_image_url)]
      : ['/placeholder.svg']

  const tour360 = p.tour360 as Tour360 | undefined
  if (tour360) {
    for (const room of tour360.rooms) {
      if (room.panorama) room.panorama = optimizeImageUrl(room.panorama, 2048)
      if (room.panorama_night) room.panorama_night = optimizeImageUrl(room.panorama_night, 2048)
      if (room.thumbnail) room.thumbnail = optimizeImageUrl(room.thumbnail)
    }
  }

  return {
    id: p.id,
    order: p.sort_order ?? 0,
    title: p.name ?? '',
    category: p.category ?? '',
    subcategory: p.subcategory ?? '',
    description: p.short_description ?? '',
    image: optimizeImageUrl(p.cover_image_url) || images[0] || '/placeholder.svg',
    images,
    year: p.completion_year?.toString(),
    location: p.location,
    area: p.area?.toString(),
    rooms: tour360?.rooms?.length,
    designStyle: p.style,
    clientType: p.client_type,
    has360: p.has_360 && !!tour360,
    tour360,
  }
}

async function fetchProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, project_gallery(*)')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

    return (data ?? []).map(mapDBProject)
}

export const getProjects = unstable_cache(
  cache(fetchProjects),
  ['masar-projects'],
  { revalidate: 30 },
)

async function fetchProjectById(id: string): Promise<Project | undefined> {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, project_gallery(*)')
    .eq('id', id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single()

  return data ? mapDBProject(data) : undefined
}

export const getProjectById = unstable_cache(
  cache(fetchProjectById),
  ['masar-project'],
  { revalidate: 30 },
)

export async function get360Projects(): Promise<Project[]> {
  const all = await getProjects()
  return all.filter((p) => p.has360)
}
