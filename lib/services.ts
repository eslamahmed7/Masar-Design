import { createClient } from '@/lib/supabase/client'
import { optimizeImageUrl } from '@/lib/image-url'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export type Service = {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  image: string
  icon: string
  gridSize: 'small' | 'large'
  order: number
  pricing?: any
  options?: any[]
}

function mapDBService(s: any): Service {
  return {
    id: s.id,
    title: s.name ?? '',
    titleAr: s.name_ar ?? s.name ?? '',
    description: s.short_description ?? '',
    descriptionAr: s.long_description ?? s.short_description ?? '',
    image: optimizeImageUrl(s.cover_image_url) || '/placeholder.svg',
    icon: s.icon ?? 'sofa',
    gridSize: s.is_featured ? 'large' : 'small',
    order: s.sort_order ?? 0,
    pricing: Array.isArray(s.pricing) ? s.pricing[0] : s.pricing,
    options: s.options ?? [],
  }
}

async function fetchServices(): Promise<Service[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('*, pricing:service_pricing(*), options:pricing_options(*)')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })

  return (data ?? []).map(mapDBService)
}

export const getServices = unstable_cache(
  cache(fetchServices),
  ['masar-services'],
  { revalidate: 60 },
)

async function fetchServiceById(id: string): Promise<Service | undefined> {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('*, pricing:service_pricing(*), options:pricing_options(*)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  return data ? mapDBService(data) : undefined
}

export const getServiceById = unstable_cache(
  cache(fetchServiceById),
  ['masar-service'],
  { revalidate: 60 },
)
