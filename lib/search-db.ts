import { createClient } from '@/lib/supabase/client'

export type SearchItemType = 'project' | 'service' | 'page' | 'category'

export interface SearchItem {
  id: string
  type: SearchItemType
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  category: string
  categoryEn: string
  href: string
  image?: string
  keywords: string[]
}

export const STATIC_PAGES: SearchItem[] = [
  {
    id: 'page-home', type: 'page',
    titleAr: 'الرئيسية', titleEn: 'Home',
    descriptionAr: 'الصفحة الرئيسية لمسار للتصميم الداخلي الفاخر', descriptionEn: 'MASAR Luxury Interior Design Studio home page',
    category: 'صفحة', categoryEn: 'Page', href: '/',
    keywords: ['home', 'رئيسية', 'الرئيسية', 'مسار', 'masar'],
  },
  {
    id: 'page-projects', type: 'page',
    titleAr: 'أعمالنا', titleEn: 'Our Projects',
    descriptionAr: 'استعرض معرض أعمال مسار — مشاريع التصميم الداخلي الفاخرة', descriptionEn: 'Browse MASAR interior design portfolio',
    category: 'صفحة', categoryEn: 'Page', href: '/projects',
    keywords: ['projects', 'portfolio', 'أعمال', 'مشاريع', 'معرض', 'gallery'],
  },
  {
    id: 'page-services', type: 'page',
    titleAr: 'الخدمات', titleEn: 'Services',
    descriptionAr: 'خدمات التصميم الداخلي المتكاملة التي يقدمها مسار', descriptionEn: 'Comprehensive interior design services by MASAR',
    category: 'صفحة', categoryEn: 'Page', href: '/services',
    keywords: ['services', 'خدمات', 'تصميم', 'design'],
  },
  {
    id: 'page-about', type: 'page',
    titleAr: 'عن مسار', titleEn: 'About MASAR',
    descriptionAr: 'تعرف على قصة مسار، فلسفتنا وفريقنا الإبداعي', descriptionEn: 'Learn about MASAR story, philosophy and creative team',
    category: 'صفحة', categoryEn: 'Page', href: '/about',
    keywords: ['about', 'عن', 'مسار', 'قصة', 'story', 'team', 'فريق'],
  },
  {
    id: 'page-contact', type: 'page',
    titleAr: 'تواصل معنا', titleEn: 'Contact Us',
    descriptionAr: 'تواصل مع فريق مسار لمناقشة مشروعك', descriptionEn: 'Get in touch with the MASAR team',
    category: 'صفحة', categoryEn: 'Page', href: '/contact',
    keywords: ['contact', 'تواصل', 'اتصال', 'email', 'phone', 'بريد', 'هاتف'],
  },
  {
    id: 'page-start', type: 'page',
    titleAr: 'ابدأ مشروعك', titleEn: 'Start Your Project',
    descriptionAr: 'ابدأ رحلتك مع مسار وأطلق مشروع التصميم الداخلي الخاص بك', descriptionEn: 'Begin your journey with MASAR',
    category: 'صفحة', categoryEn: 'Page', href: '/start',
    keywords: ['start', 'ابدأ', 'مشروع', 'project', 'begin', 'launch'],
  },
]

export const QUICK_ACTIONS = [
  { labelAr: 'ابدأ مشروعك', labelEn: 'Start Your Project', href: '/start', icon: 'rocket' },
  { labelAr: 'تواصل معنا', labelEn: 'Contact Us', href: '/contact', icon: 'message' },
  { labelAr: 'أعمالنا', labelEn: 'Our Projects', href: '/projects', icon: 'grid' },
  { labelAr: 'الخدمات', labelEn: 'Services', href: '/services', icon: 'layers' },
  { labelAr: 'عن مسار', labelEn: 'About MASAR', href: '/about', icon: 'info' },
]

export const SEARCH_SUGGESTIONS = [
  'فيلا', 'Luxury', 'Modern', 'غرفة نوم', '3D Render', 'مطبخ', 'Kitchen', 'Bedroom', 'Office', 'مكتب',
]

export async function fetchSearchItems(): Promise<SearchItem[]> {
  const supabase = createClient()

  const [projectsResult, servicesResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, short_description, cover_image_url, category, slug')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('sort_order'),
    supabase
      .from('services')
      .select('id, name, name_ar, short_description, cover_image_url')
      .eq('status', 'active')
      .order('sort_order'),
  ])

  const projectItems: SearchItem[] = (projectsResult.data ?? []).map((p) => ({
    id: `project-${p.id}`,
    type: 'project' as SearchItemType,
    titleAr: p.name ?? '',
    titleEn: p.name ?? '',
    descriptionAr: p.short_description ?? '',
    descriptionEn: p.short_description ?? '',
    category: p.category ?? 'مشروع',
    categoryEn: p.category ?? 'Project',
    href: `/projects/${p.slug || p.id}`,
    image: p.cover_image_url ?? undefined,
    keywords: [p.name ?? '', p.category ?? ''].filter(Boolean),
  }))

  const serviceItems: SearchItem[] = (servicesResult.data ?? []).map((s) => ({
    id: `service-${s.id}`,
    type: 'service' as SearchItemType,
    titleAr: s.name_ar ?? s.name ?? '',
    titleEn: s.name ?? '',
    descriptionAr: s.short_description ?? '',
    descriptionEn: s.short_description ?? '',
    category: 'خدمة',
    categoryEn: 'Service',
    href: '/services',
    image: s.cover_image_url ?? undefined,
    keywords: [s.name ?? '', s.name_ar ?? '', 'خدمة', 'service'].filter(Boolean),
  }))

  return [...STATIC_PAGES, ...projectItems, ...serviceItems]
}

export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query.trim()) return []

  const q = query.toLowerCase().trim()

  const scored = items.map((item) => {
    let score = 0
    const fields = [
      item.titleAr, item.titleEn,
      item.descriptionAr, item.descriptionEn,
      item.category, item.categoryEn,
      ...item.keywords,
    ].map((f) => f.toLowerCase())

    for (const field of fields) {
      if (field === q) score += 10
      else if (field.startsWith(q)) score += 6
      else if (field.includes(q)) score += 3
    }
    return { item, score }
  })

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item)
}
