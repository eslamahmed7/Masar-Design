'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateOrderNumber } from '@/lib/orders/order-number'
import { sendEmail, getPromotionEmailTemplate } from '../email'
import type {
  DBProject, DashboardStats, DBCategory, DBSubcategory, DBDesignStyle,
  DBService, DBServicePricing, DBPricingOption,
  DBOrder, DBOrderNote, DBOrderTimeline, OrderStatus,
  DBCoupon, DBGlobalPromotion,
  DBContactMessageType, DBContactMessage,
  ContactMessageStatus,
  DBFaqCategory, DBFaq,
} from './types'
import type { FullProjectFormData } from './schemas'

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!adminRow) {
    await supabase.auth.signOut()
    return { error: 'هذا الحساب لا يملك صلاحيات الإدارة.' }
  }
  return { success: true }
}

export async function adminLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_users').select('*').eq('id', user.id).single()
  return data
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const [{ data: projects }, { data: orders }] = await Promise.all([
    supabase.from('projects').select('status, is_featured, has_360, views_count, likes_count').is('deleted_at', null),
    supabase.from('orders').select('status, final_total, project_area'),
  ])

  const p = projects ?? []
  const o = orders ?? []
  return {
    total_projects: p.length,
    published_projects: p.filter(x => x.status === 'published').length,
    draft_projects: p.filter(x => x.status === 'draft').length,
    total_views: p.reduce((s, x) => s + (x.views_count ?? 0), 0),
    total_likes: p.reduce((s, x) => s + (x.likes_count ?? 0), 0),
    featured_projects: p.filter(x => x.is_featured).length,
    projects_with_360: p.filter(x => x.has_360).length,
    total_orders: o.length,
    pending_orders: o.filter(x => x.status === 'pending').length,
    total_revenue: o.filter(x => x.status === 'completed').reduce((s, x) => s + (x.final_total ?? 0), 0),
    completed_orders: o.filter(x => x.status === 'completed').length,
    cancelled_orders: o.filter(x => x.status === 'cancelled').length,
    avg_order_value: (() => {
      const completed = o.filter(x => x.status === 'completed' && x.final_total)
      return completed.length ? Math.round(completed.reduce((s, x) => s + (x.final_total ?? 0), 0) / completed.length) : 0
    })(),
    avg_project_area: (() => {
      const withArea = o.filter(x => x.project_area)
      return withArea.length ? Math.round(withArea.reduce((s, x) => s + (x.project_area ?? 0), 0) / withArea.length) : 0
    })(),
  }
}

// ── Projects CRUD ─────────────────────────────────────────────────────────────

export async function getAdminProjects(opts?: {
  status?: string; search?: string; category?: string; page?: number; pageSize?: number
}) {
  const supabase = await createClient()
  const { status, search, category, page = 1, pageSize = 20 } = opts ?? {}

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (category && category !== 'all') query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) return { projects: [], total: 0, error: error.message }
  return { projects: (data ?? []) as DBProject[], total: count ?? 0 }
}

export async function getAdminProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_gallery(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as DBProject & { project_gallery: any[] }
}

function parseTagField(val?: string): string[] | null {
  if (!val) return null
  return val.split(',').map(s => s.trim()).filter(Boolean)
}

function buildProjectPayload(form: FullProjectFormData) {
  return {
    name: form.name, slug: form.slug, location: form.location || null,
    area: form.area || null, category: form.category || null,
    subcategory: form.subcategory || null, style: form.style || null,
    completion_year: form.completion_year || null, client_type: form.client_type || null,
    status: form.status, is_featured: form.is_featured, has_360: form.has_360,
    short_description: form.short_description || null,
    full_description: form.full_description || null,
    highlights: parseTagField(form.highlights), materials: parseTagField(form.materials),
    lighting: parseTagField(form.lighting), furniture: parseTagField(form.furniture),
    design_notes: form.design_notes || null,
    cover_image_url: form.cover_image_url || null,
    cover_image_public_id: form.cover_image_public_id || null,
    video_url: form.video_url || null, video_public_id: form.video_public_id || null,
    seo_title: form.seo_title || null, seo_description: form.seo_description || null,
    seo_keywords: parseTagField(form.seo_keywords), og_image_url: form.og_image_url || null,
    canonical_url: form.canonical_url || null,
    show_in_portfolio: form.show_in_portfolio, show_on_home: form.show_on_home,
    enable_likes: form.enable_likes, enable_gallery: form.enable_gallery,
    enable_video: form.enable_video, enable_360: form.enable_360,
    sort_order: form.sort_order,
  }
}

export async function createProject(form: FullProjectFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const payload = { ...buildProjectPayload(form), created_by: user?.id, updated_by: user?.id }
  const { data, error } = await supabase.from('projects').insert(payload).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { project: data as DBProject }
}

export async function updateProject(id: string, form: FullProjectFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const payload = { ...buildProjectPayload(form), updated_by: user?.id }
  const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { project: data as DBProject }
}

export async function updateProjectStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

async function deleteCloudinaryAsset(publicId: string | null) {
  if (!publicId) return
  try {
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, err)
  }
}

function extractPublicIdFromUrl(url: string | null): string | null {
  if (!url || !url.includes('cloudinary.com')) return null
  try {
    const parts = url.split('/image/upload/')
    if (parts.length < 2) return null
    const rightPath = parts[1]
    const subParts = rightPath.split('/')
    if (subParts[0].startsWith('v') && /^\d+$/.test(subParts[0].slice(1))) {
      subParts.shift()
    }
    const pathWithExt = subParts.join('/')
    const extIndex = pathWithExt.lastIndexOf('.')
    if (extIndex !== -1) {
      return pathWithExt.substring(0, extIndex)
    }
    return pathWithExt
  } catch (_) {
    return null
  }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  // 1. Fetch project and gallery details
  const { data: project } = await supabase
    .from('projects')
    .select('cover_image_public_id, video_public_id, project_gallery(public_id)')
    .eq('id', id)
    .single()

  if (project) {
    // 2. Delete cover image and video
    if (project.cover_image_public_id) {
      await deleteCloudinaryAsset(project.cover_image_public_id)
    }
    if (project.video_public_id) {
      await deleteCloudinaryAsset(project.video_public_id)
    }

    // 3. Delete gallery images
    if (project.project_gallery && Array.isArray(project.project_gallery)) {
      for (const img of project.project_gallery) {
        if (img.public_id) {
          await deleteCloudinaryAsset(img.public_id)
        }
      }
    }
  }

  // 4. Delete gallery rows first (foreign key constraint)
  await supabase.from('project_gallery').delete().eq('project_id', id)

  // 5. Delete project row
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function toggleFeatured(id: string, is_featured: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ is_featured }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Tour 360 ──────────────────────────────────────────────────────────────────

export async function updateTour360(
  projectId: string,
  tour360: {
    rooms: Array<{
      id: string
      nameAr: string
      nameEn: string
      panorama: string
      panorama_public_id?: string
      thumbnail: string
      thumbnail_public_id?: string
      description: string
      hotspots: Array<{
        id: string
        x: number
        y: number
        type: 'navigate' | 'info'
        targetRoomId?: string
        label: string
        details?: Record<string, string | undefined>
      }>
      connectedRooms: string[]
    }>
    floorPlan: {
      imageUrl?: string
      imagePublicId?: string
      rooms: Array<{
        id: string
        x: number
        y: number
        w: number
        h: number
        label: string
      }>
    }
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('projects')
    .update({
      tour360: tour360 as any,
      has_360: tour360.rooms.length > 0,
      updated_by: user?.id,
    })
    .eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

// Permanently delete one room from tour360 JSONB + its Cloudinary assets
export async function deleteRoom360(projectId: string, roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: proj } = await supabase
    .from('projects')
    .select('tour360')
    .eq('id', projectId)
    .single()

  if (!proj?.tour360) return { error: 'No tour data found' }

  const tour = proj.tour360 as any
  const room = (tour.rooms ?? []).find((r: any) => r.id === roomId)

  if (room) {
    if (room.panorama_public_id) await deleteCloudinaryAsset(room.panorama_public_id)
    if (room.thumbnail_public_id) await deleteCloudinaryAsset(room.thumbnail_public_id)
  }

  const newRooms = (tour.rooms ?? []).filter((r: any) => r.id !== roomId)
  const newFloorPlan = {
    ...(tour.floorPlan ?? {}),
    rooms: ((tour.floorPlan?.rooms ?? []) as any[]).filter((r: any) => r.id !== roomId),
  }

  const { error } = await supabase
    .from('projects')
    .update({
      tour360: { ...tour, rooms: newRooms, floorPlan: newFloorPlan },
      has_360: newRooms.length > 0,
      updated_by: user.id,
    })
    .eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function addGalleryImage(projectId: string, image: {
  url: string; public_id?: string; alt_text?: string; sort_order?: number
  width?: number; height?: number; format?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_gallery').insert({ project_id: projectId, ...image }).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { image: data }
}

export async function deleteGalleryImage(imageId: string, projectId: string) {
  const supabase = await createClient()

  // Fetch image detail to delete from Cloudinary
  const { data: img } = await supabase
    .from('project_gallery')
    .select('public_id')
    .eq('id', imageId)
    .single()

  if (img && img.public_id) {
    await deleteCloudinaryAsset(img.public_id)
  }

  const { error } = await supabase.from('project_gallery').delete().eq('id', imageId)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('sort_order')
  if (error) return { categories: [], error: error.message }
  return { categories: (data ?? []) as DBCategory[] }
}

export async function createCategory(input: {
  name: string; name_ar?: string; icon?: string; description?: string
  cover_image_url?: string; status?: string; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { category: data as DBCategory }
}

export async function updateCategory(id: string, input: Partial<DBCategory>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { category: data as DBCategory }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // Fetch cover_image_url to delete from Cloudinary
  const { data: category } = await supabase
    .from('categories')
    .select('cover_image_url')
    .eq('id', id)
    .single()

  if (category && category.cover_image_url) {
    const publicId = extractPublicIdFromUrl(category.cover_image_url)
    if (publicId) {
      await deleteCloudinaryAsset(publicId)
    }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function createSubcategory(input: {
  category_id: string; name: string; name_ar?: string; icon?: string
  description?: string; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('subcategories').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { subcategory: data as DBSubcategory }
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('subcategories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getDesignStyles() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('design_styles').select('*').order('sort_order')
  if (error) return { styles: [], error: error.message }
  return { styles: (data ?? []) as DBDesignStyle[] }
}

export async function createDesignStyle(input: {
  name: string; name_ar?: string; icon?: string; description?: string
  preview_image_url?: string; status?: string; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('design_styles').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { style: data as DBDesignStyle }
}

export async function deleteDesignStyle(id: string) {
  const supabase = await createClient()

  // Fetch preview_image_url to delete from Cloudinary
  const { data: style } = await supabase
    .from('design_styles')
    .select('preview_image_url')
    .eq('id', id)
    .single()

  if (style && style.preview_image_url) {
    const publicId = extractPublicIdFromUrl(style.preview_image_url)
    if (publicId) {
      await deleteCloudinaryAsset(publicId)
    }
  }

  const { error } = await supabase.from('design_styles').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateDesignStyle(id: string, input: Partial<{
  name: string; name_ar: string | null; icon: string | null; description: string | null;
  preview_image_url: string | null; status: string; sort_order: number;
}>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('design_styles').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { style: data as DBDesignStyle }
}

// ── Services ──────────────────────────────────────────────────────────────────

export async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*, pricing:service_pricing(*), options:pricing_options(*)')
    .order('sort_order')
  if (error) return { services: [], error: error.message }
  return { services: (data ?? []) as DBService[] }
}

export async function createService(input: {
  name: string; name_ar?: string; short_description?: string; long_description?: string
  cover_image_url?: string; icon?: string; status?: string; is_featured?: boolean; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('services').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { service: data as DBService }
}

export async function updateService(id: string, input: Partial<DBService>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('services').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { service: data as DBService }
}

export async function deleteService(id: string) {
  const supabase = await createClient()

  // Fetch cover_image_url to delete from Cloudinary
  const { data: service } = await supabase
    .from('services')
    .select('cover_image_url')
    .eq('id', id)
    .single()

  if (service && service.cover_image_url) {
    const publicId = extractPublicIdFromUrl(service.cover_image_url)
    if (publicId) {
      await deleteCloudinaryAsset(publicId)
    }
  }

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function upsertServicePricing(serviceId: string, input: {
  pricing_type: string; price_per_sqm?: number | null; min_area?: number | null
  max_area?: number | null; min_order_value?: number | null; fixed_price?: number | null; currency?: string
}) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('service_pricing').select('id').eq('service_id', serviceId).single()
  let result
  if (existing) {
    result = await supabase.from('service_pricing').update(input).eq('service_id', serviceId).select().single()
  } else {
    result = await supabase.from('service_pricing').insert({ service_id: serviceId, ...input }).select().single()
  }
  if (result.error) return { error: result.error.message }
  revalidatePath('/', 'layout')
  return { pricing: result.data as DBServicePricing }
}

export async function createPricingOption(input: {
  service_id: string; name: string; name_ar?: string; description?: string
  price: number; price_type?: string; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('pricing_options').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { option: data as DBPricingOption }
}

export async function deletePricingOption(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pricing_options').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function clearServicePricingOptions(serviceId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pricing_options').delete().eq('service_id', serviceId)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(opts?: {
  status?: string; search?: string; serviceId?: string; categoryId?: string
  dateFrom?: string; dateTo?: string; page?: number; pageSize?: number
}) {
  const supabase = await createClient()
  const { status, search, serviceId, categoryId, dateFrom, dateTo, page = 1, pageSize = 20 } = opts ?? {}

  let query = supabase
    .from('orders')
    .select(`*, categories(name, name_ar), subcategories(name, name_ar), design_styles(name, name_ar), services(name, name_ar, pricing:service_pricing(currency))`, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (serviceId) query = query.eq('service_id', serviceId)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`)
  }

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) return { orders: [], total: 0, error: error.message }
  return { orders: (data ?? []) as DBOrder[], total: count ?? 0 }
}

export async function getUnreadOrdersCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  return count ?? 0
}

export async function getOrder(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, categories(name, name_ar), subcategories(name, name_ar), design_styles(name, name_ar), services(name, name_ar, pricing:service_pricing(currency)), coupons(code)`)
    .eq('id', id)
    .single()
  if (error) return null
  return data as DBOrder
}

export async function getOrderNotes(orderId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_notes')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as DBOrderNote[]
}

export async function deleteOrder(id: string) {
  const supabase = await createClient()
  // Ensure the user is an admin
  const adminData = await getAdminUser()
  if (!adminData) return { error: 'Unauthorized' }

  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}

export async function getOrderTimeline(orderId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_timeline')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as DBOrderTimeline[]
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminData = await getAdminUser()

  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) return { error: error.message }

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار', under_review: 'قيد المراجعة', approved: 'تمت الموافقة',
    rejected: 'مرفوض', in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي',
  }

  await supabase.from('order_timeline').insert({
    order_id: id,
    action: `status_${status}`,
    label: `تم تغيير الحالة إلى: ${statusLabels[status] ?? status}`,
    actor_id: user?.id ?? null,
    actor_name: adminData?.full_name ?? adminData?.email ?? 'Admin',
  })

  revalidatePath('/', 'layout')
return { success: true }
}

export async function addOrderNote(orderId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminData = await getAdminUser()

  const { data, error } = await supabase.from('order_notes').insert({
    order_id: orderId, content,
    admin_id: user?.id ?? null,
    admin_name: adminData?.full_name ?? adminData?.email ?? 'Admin',
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { note: data as DBOrderNote }
}

export async function createOrder(input: Omit<DBOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  const order_number = await generateOrderNumber(supabase)
  const { data, error } = await supabase.from('orders').insert({ ...input, order_number }).select().single()
  if (error) return { error: error.message }

  // Add timeline entry
  await supabase.from('order_timeline').insert({
    order_id: data.id, action: 'created', label: 'تم إنشاء الطلب',
    actor_name: input.customer_name,
  })

  revalidatePath('/', 'layout')
  return { order: data as DBOrder }
}

export async function exportOrdersCsv(opts?: { status?: string }) {
  const supabase = await createClient()
  let query = supabase.from('orders').select('order_number, customer_name, customer_phone, customer_email, project_area, final_total, status, created_at')
  if (opts?.status && opts.status !== 'all') query = query.eq('status', opts.status)
  const { data } = await query.order('created_at', { ascending: false })
  return data ?? []
}

// ── Coupons ────────────────────────────────────────────────────────────────────

export async function generateCouponCode(length = 8) {
  const supabase = await createClient()
  const prefixes = ['MASAR', 'SALE', 'DISC']
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  for (let attempt = 0; attempt < 20; attempt++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    let suffix = ''
    for (let i = 0; i < length - prefix.length; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)]
    }
    const code = `${prefix}-${suffix}`

    const { data } = await supabase.from('coupons').select('id').eq('code', code).maybeSingle()
    if (!data) return { code }
  }

  // Fallback: fully random
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return { code }
}

export async function getCoupons() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return { coupons: [], error: error.message }
  return { coupons: (data ?? []) as DBCoupon[] }
}

export async function createCoupon(input: {
  code: string; description?: string; discount_type: string; discount_value: number
  max_discount?: number | null; min_order_value?: number | null; valid_from?: string | null
  valid_until?: string | null; max_uses?: number | null; status?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('coupons').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { coupon: data as DBCoupon }
}

export async function updateCoupon(id: string, input: Partial<DBCoupon>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('coupons').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { coupon: data as DBCoupon }
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function validateCoupon(code: string, opts?: {
  orderValue?: number; serviceId?: string; categoryId?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'active')
    .single()

  if (error || !data) return { valid: false, error: 'كود الخصم غير صالح.' }

  const now = new Date()
  if (data.valid_from && new Date(data.valid_from) > now) return { valid: false, error: 'لم يبدأ صلاحية هذا الكود بعد.' }
  if (data.valid_until && new Date(data.valid_until) < now) return { valid: false, error: 'انتهت صلاحية هذا الكود.' }
  if (data.max_uses && data.current_uses >= data.max_uses) return { valid: false, error: 'تم استنفاد عدد مرات استخدام هذا الكود.' }
  if (data.min_order_value && opts?.orderValue && opts.orderValue < data.min_order_value) {
    return { valid: false, error: `الحد الأدنى للطلب ${data.min_order_value} ${data.currency ?? 'ريال'}.` }
  }

  return { valid: true, coupon: data as DBCoupon }
}

// ── Global Promotions ──────────────────────────────────────────────────────────

export async function getGlobalPromotions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_promotions')
    .select('*')
    .order('priority', { ascending: false })
  if (error) return { promotions: [], error: error.message }
  return { promotions: (data ?? []) as DBGlobalPromotion[] }
}

export async function getActivePromotion(): Promise<DBGlobalPromotion | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('global_promotions')
    .select('*')
    .eq('is_active', true)
    .eq('show_banner', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('priority', { ascending: false })
    .limit(1)
    .single()
  return data as DBGlobalPromotion | null
}

export async function createPromotion(input: {
  title: string; title_ar?: string; description?: string; discount_value: number
  discount_type?: string; applicable_to?: string; start_date?: string | null
  end_date?: string | null; is_active?: boolean; show_banner?: boolean
  banner_text?: string; banner_color?: string; enable_countdown?: boolean; priority?: number
  send_email_to_subscribers?: boolean
}) {
  const { send_email_to_subscribers, ...dbInput } = input
  const supabase = await createClient()
  const { data, error } = await supabase.from('global_promotions').insert(dbInput).select().single()
  if (error) return { error: error.message }
  
  if (send_email_to_subscribers && data.is_active) {
    // Fire and forget
    sendPromotionEmails(data)
  }

  revalidatePath('/', 'layout')
  return { promotion: data as DBGlobalPromotion }
}

export async function updatePromotion(id: string, input: Partial<DBGlobalPromotion> & { send_email_to_subscribers?: boolean }) {
  const { send_email_to_subscribers, ...dbInput } = input
  const supabase = await createClient()
  const { data, error } = await supabase.from('global_promotions').update(dbInput).eq('id', id).select().single()
  if (error) return { error: error.message }

  if (send_email_to_subscribers && data.is_active) {
    // Fire and forget
    sendPromotionEmails(data)
  }

  revalidatePath('/', 'layout')
  return { promotion: data as DBGlobalPromotion }
}

async function sendPromotionEmails(promotion: any) {
  try {
    const { subscribers } = await getNewsletterSubscribers()
    if (!subscribers || subscribers.length === 0) return

    const activeEmails = subscribers.map(s => s.email)
    const discountText = promotion.discount_type === 'percentage' 
      ? `%\${promotion.discount_value}` 
      : `\${promotion.discount_value} ريال`

    const html = getPromotionEmailTemplate(
      promotion.title_ar || promotion.title,
      promotion.description || '',
      discountText,
      ''
    )

    // Send emails in batches or all at once via BCC depending on provider limits
    // Here we'll just send to everyone directly since nodemailer handles arrays
    await sendEmail({
      to: activeEmails,
      subject: `خصم جديد من مسار: \${promotion.title_ar || promotion.title}`,
      html
    })
  } catch (error) {
    console.error('Failed to send promotion emails:', error)
  }
}

export async function deletePromotion(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('global_promotions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── File Upload ──────────────────────────────────────────────────────────────

export async function uploadToCloudinary(data: { base64: string; resourceType?: 'image' | 'video'; folder?: string }) {
  try {
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const result = await cloudinary.uploader.upload(data.base64, {
      folder: data.folder || 'masar',
      resource_type: data.resourceType || 'image',
    })

    return { url: result.secure_url, publicId: result.public_id }
  } catch {
    return { error: 'فشل رفع الملف إلى Cloudinary' }
  }
}

// ── Upload to Supabase Storage (documents) ────────────────────────────────────

export async function uploadToSupabaseStorage(data: {
  file: string // base64
  fileName: string
  mimeType: string
  bucket?: string
}) {
  try {
    const supabase = await createClient()
    const bucket = data.bucket || 'contact-attachments'
    const fileExt = data.fileName.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const base64 = data.file.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: data.mimeType, upsert: false })

    if (error) return { error: error.message }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return { url: urlData.publicUrl, path }
  } catch {
    return { error: 'فشل رفع الملف' }
  }
}

// ── Contact Message Types ─────────────────────────────────────────────────────

export async function getContactMessageTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_message_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) return { types: [], error: error.message }
  return { types: (data ?? []) as DBContactMessageType[] }
}

export async function getAllContactMessageTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_message_types')
    .select('*')
    .order('sort_order')
  if (error) return { types: [], error: error.message }
  return { types: (data ?? []) as DBContactMessageType[] }
}

export async function createContactMessageType(input: {
  label_ar: string; label_en?: string; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contact_message_types').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { type: data as DBContactMessageType }
}

export async function updateContactMessageType(id: string, input: Partial<DBContactMessageType>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contact_message_types').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { type: data as DBContactMessageType }
}

export async function deleteContactMessageType(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_message_types').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Contact Messages ──────────────────────────────────────────────────────────

export async function getContactMessages(opts?: {
  status?: ContactMessageStatus | 'all'
  search?: string
  typeId?: string
  hasAttachment?: boolean
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()
  const { status, search, typeId, hasAttachment, dateFrom, dateTo, page = 1, pageSize = 20 } = opts ?? {}

  let query = supabase
    .from('contact_messages')
    .select(
      `*, contact_message_types(label_ar, label_en)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (typeId) query = query.eq('message_type_id', typeId)
  if (hasAttachment) query = query.not('attachment_url', 'is', null)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  if (search) {
    query = query.or(
      `message_number.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) return { messages: [], total: 0, error: error.message }
  return { messages: (data ?? []) as DBContactMessage[], total: count ?? 0 }
}

export async function getContactMessage(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*, contact_message_types(label_ar, label_en)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as DBContactMessage
}

export async function getUnreadContactMessagesCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')
  return count ?? 0
}

export async function createContactMessage(input: {
  name: string
  phone: string
  email?: string
  message_type_id?: string
  message: string
  attachment_url?: string
  attachment_name?: string
  attachment_type?: string
  attachment_size?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .insert({ ...input, message_number: '' }) // trigger fills message_number
    .select()
    .single()
  if (error) return { error: error.message }
  return { message: data as DBContactMessage }
}

export async function updateContactMessageStatus(id: string, status: ContactMessageStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}


export async function updateContactMessageNotes(id: string, admin_notes: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').update({ admin_notes }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteContactMessage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').update({ status: 'trashed' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function permanentlyDeleteContactMessage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function restoreContactMessage(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').update({ status: 'closed' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}



export async function exportContactMessagesCsv(opts?: { status?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('contact_messages')
    .select('message_number, name, phone, email, status, created_at')
  if (opts?.status && opts.status !== 'all') query = query.eq('status', opts.status)
  const { data } = await query.order('created_at', { ascending: false })
  return data ?? []
}


// ── FAQ Categories ────────────────────────────────────────────────────────────

export async function getFaqCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) return { categories: [], error: error.message }
  return { categories: (data ?? []) as DBFaqCategory[] }
}

export async function getAllFaqCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .order('sort_order')
  if (error) return { categories: [], error: error.message }
  return { categories: (data ?? []) as DBFaqCategory[] }
}

export async function createFaqCategory(input: {
  name_ar: string; name_en?: string; sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('faq_categories').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { category: data as DBFaqCategory }
}

export async function updateFaqCategory(id: string, input: Partial<DBFaqCategory>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('faq_categories').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { category: data as DBFaqCategory }
}

export async function deleteFaqCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('faq_categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { success: true }
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export async function getFaqs(opts?: { categoryId?: string; search?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('faqs')
    .select('*, faq_categories(name_ar, name_en)')
    .eq('is_active', true)
    .eq('is_archived', false)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (opts?.categoryId) query = query.eq('category_id', opts.categoryId)
  if (opts?.search) {
    query = query.or(
      `question_ar.ilike.%${opts.search}%,answer_ar.ilike.%${opts.search}%`
    )
  }

  const { data, error } = await query
  if (error) return { faqs: [], error: error.message }
  return { faqs: (data ?? []) as DBFaq[] }
}

export async function getAllFaqs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*, faq_categories(name_ar, name_en)')
    .order('sort_order')
    .order('created_at', { ascending: false })
  if (error) return { faqs: [], error: error.message }
  return { faqs: (data ?? []) as DBFaq[] }
}

export async function createFaq(input: {
  question_ar: string
  answer_ar: string
  category_id?: string | null
  sort_order?: number
  is_active?: boolean
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('faqs').insert(input).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { faq: data as DBFaq }
}

export async function updateFaq(id: string, input: Partial<Omit<DBFaq, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('faqs').update(input).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { faq: data as DBFaq }
}

export async function deleteFaq(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('faqs').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
return { success: true }
}

export async function reorderFaqs(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient()
  const updates = items.map(({ id, sort_order }) =>
    supabase.from('faqs').update({ sort_order }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/', 'layout')
return { success: true }
}


// ── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') { // unique violation
      return { error: 'هذا البريد مسجل مسبقاً.' }
    }
    return { error: error.message }
  }
  return { success: true, subscriber: data }
}

export async function unsubscribeFromNewsletter(email: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq('email', email)
  
  if (error) return { error: error.message }
  return { success: true }
}

export async function getNewsletterSubscribers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })
  
  if (error) return { error: error.message, subscribers: [] }
  return { subscribers: data }
}

export async function deleteNewsletterSubscriber(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/newsletter')
  return { success: true }
}

export async function sendCustomNewsletter(subject: string, htmlContent: string) {
  try {
    const supabase = await createClient()
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)
      
    if (!subscribers || subscribers.length === 0) {
      return { error: 'لا يوجد مشتركون نشطون لإرسال الرسالة إليهم.' }
    }

    const activeEmails = subscribers.map((s: any) => s.email)
    
    const finalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1a1a1a; margin: 0;">مسار</h1>
          <p style="color: #666; margin: 5px 0 0 0;">مساحتك الخاصة، بتصميم يليق بك</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); color: #1a1a1a;">
          ${htmlContent}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>لقد استلمت هذه الرسالة لاشتراكك في نشرتنا البريدية.</p>
          <p>© ${new Date().getFullYear()} مسار. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    `;

    const success = await sendEmail({
      to: activeEmails,
      subject,
      html: finalHtml
    })

    if (!success) return { error: 'فشل إرسال البريد الإلكتروني. يرجى التحقق من إعدادات SMTP.' }
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
