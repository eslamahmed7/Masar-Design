import { createClient } from '@/lib/supabase/client'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export type ServiceShowcase = {
  id: string
  titleAr: string
  titleEn: string
  subtitleEn: string
  descriptionAr: string
  descriptionEn: string
  image: string
  imageSide: 'right' | 'left'
  features: string[]
  featuresEn: string[]
  cta: string
  ctaEn: string
  blueprint?: boolean
}

const FALLBACK_SHOWCASES: ServiceShowcase[] = [
  {
    id: 'interior-design',
    titleAr: 'التصميم الداخلي',
    titleEn: 'Interior Design',
    subtitleEn: 'Interior Design',
    descriptionAr: 'نصمّم مساحات تعكس أسلوب حياتك وتوازن بين الجمال والوظيفة. كل تفصيلة مدروسة بعناية لتمنحك تجربة معيشية استثنائية تدوم.',
    descriptionEn: 'We design spaces that reflect your lifestyle, balancing beauty and function. Every detail is carefully considered to give you an exceptional, lasting living experience.',
    image: '/services/interior-design.png',
    imageSide: 'right',
    features: [ 'تصميم يعكس أسلوب حياتك', 'استغلال ذكي للمساحات', 'توزيع الأثاث بانسجام', 'اختيار الهوية البصرية للمكان' ],
    featuresEn: [ 'Design reflecting your lifestyle', 'Smart use of space', 'Harmonious furniture layout', 'Visual identity of the space' ],
    cta: 'اعرف المزيد',
    ctaEn: 'Learn More',
  },
  {
    id: '2d-design',
    titleAr: 'تصميم 2D',
    titleEn: '2D Design',
    subtitleEn: '2D Design',
    descriptionAr: 'مخططات دقيقة تضع الأساس لكل مشروع ناجح. ندرس توزيع الفراغات وحركة التنقل لنمنحك رؤية واضحة قبل أن تبدأ رحلة التنفيذ.',
    descriptionEn: 'Precise plans lay the foundation for every successful project. We study the distribution of spaces and movement to give you a clear vision before execution begins.',
    image: '/services/2d-design.png',
    imageSide: 'left',
    features: [ 'تخطيط المساحات', 'توزيع الأثاث', 'المخططات الأرضية', 'التخطيط الوظيفي', 'دراسة حركة التنقل' ],
    featuresEn: [ 'Space planning', 'Furniture layout', 'Floor plans', 'Functional planning', 'Movement study' ],
    cta: 'اعرف المزيد',
    ctaEn: 'Learn More',
    blueprint: true,
  },
  {
    id: '3d-visualization',
    titleAr: 'التصميم ثلاثي الأبعاد',
    titleEn: '3D Visualization',
    subtitleEn: '3D Visualization',
    descriptionAr: 'نحوّل التصميم إلى صور واقعية تنبض بالحياة. تقنيات إضاءة وخامات دقيقة تتيح لك رؤية مشروعك بأدق تفاصيله قبل التنفيذ.',
    descriptionEn: 'We turn design into lifelike, photorealistic images. Precise lighting and material techniques let you see your project in its finest detail before execution.',
    image: '/services/3d-visualization.png',
    imageSide: 'right',
    features: [ 'صور واقعية فوتوغرافية', 'محاكاة الإضاءة', 'معاينة الخامات', 'تصور الأثاث', 'دراسة الألوان' ],
    featuresEn: [ 'Photorealistic images', 'Lighting simulation', 'Material preview', 'Furniture visualization', 'Color studies' ],
    cta: 'استكشف الخدمة',
    ctaEn: 'Explore Service',
  },
  {
    id: 'technical-drawings',
    titleAr: 'المخططات التنفيذية',
    titleEn: 'Technical Drawings',
    subtitleEn: 'Technical Drawings',
    descriptionAr: 'وثائق تنفيذية شاملة تترجم التصميم إلى واقع. رسومات دقيقة تضمن تنفيذاً سلساً ومطابقاً للرؤية بأعلى معايير الجودة.',
    descriptionEn: 'Comprehensive execution documents that translate design into reality. Precise drawings ensure smooth execution matching the vision at the highest quality standards.',
    image: '/services/technical-drawings.png',
    imageSide: 'left',
    features: [ 'رسومات المصنع', 'المخططات الكهربائية', 'مخططات الأسقف', 'مخططات الأرضيات', 'الأبعاد التفصيلية', 'وثائق تقنية جاهزة' ],
    featuresEn: [ 'Shop drawings', 'Electrical plans', 'Ceiling plans', 'Floor plans', 'Detailed dimensions', 'Contractor-ready documents' ],
    cta: 'اعرف المزيد',
    ctaEn: 'Learn More',
    blueprint: true,
  },
  {
    id: 'material-selection',
    titleAr: 'اختيار الخامات والألوان',
    titleEn: 'Material Selection',
    subtitleEn: 'Material Selection',
    descriptionAr: 'ننتقي أرقى الخامات العالمية بعناية فائقة. من الرخام الإيطالي إلى الأخشاب الطبيعية، كل خامة تُختار لتروي قصة الفخامة والأناقة.',
    descriptionEn: 'We select the finest global materials with great care. From Italian marble to natural wood, every material is chosen to tell a story of luxury and elegance.',
    image: '/services/material-selection.png',
    imageSide: 'right',
    features: [ 'اختيار الرخام', 'اختيار الأخشاب', 'الإضاءة', 'لوحة الألوان', 'الخامات الفاخرة', 'تشطيبات الأثاث' ],
    featuresEn: [ 'Marble selection', 'Wood selection', 'Lighting', 'Color palette', 'Luxury materials', 'Furniture finishes' ],
    cta: 'اعرف المزيد',
    ctaEn: 'Learn More',
  },
  {
    id: 'furniture-styling',
    titleAr: 'تنسيق الأثاث',
    titleEn: 'Furniture Styling',
    subtitleEn: 'Furniture Styling',
    descriptionAr: 'نضفي الروح الأخيرة على مساحتك من خلال تنسيق أثاث متكامل. توازن مدروس بين القطع والإكسسوارات لخلق انسجام بصري آسر.',
    descriptionEn: 'We add the final spirit to your space through complete furniture styling. A balanced composition of pieces and accessories creates a captivating visual harmony.',
    image: '/services/furniture-styling.png',
    imageSide: 'left',
    features: [ 'توزيع الأثاث', 'الديكور', 'الإكسسوارات', 'اختيار اللوحات الفنية', 'التنسيق العام', 'التوازن البصري' ],
    featuresEn: [ 'Furniture layout', 'Decor', 'Accessories', 'Artwork selection', 'Overall styling', 'Visual balance' ],
    cta: 'ابدأ مشروعك',
    ctaEn: 'Start Your Project',
  },
]

async function fetchServiceShowcases(): Promise<ServiceShowcase[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('id, name, name_ar, long_description, cover_image_url')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })

  const dbServices = (data ?? []).reduce<Record<string, any>>((acc, s) => {
    acc[s.id] = s
    return acc
  }, {} as Record<string, any>)

  return FALLBACK_SHOWCASES.map((showcase) => {
    const db = dbServices[showcase.id]
    if (!db) return showcase
    return {
      ...showcase,
      titleAr: db.name_ar ?? showcase.titleAr,
      titleEn: db.name ?? showcase.titleEn,
      subtitleEn: db.name ?? showcase.subtitleEn,
      descriptionAr: db.long_description ?? showcase.descriptionAr,
      descriptionEn: showcase.descriptionEn,
      image: db.cover_image_url ?? showcase.image,
    }
  })
}

export const getServiceShowcases = unstable_cache(
  cache(fetchServiceShowcases),
  ['masar-service-showcases'],
  { revalidate: 60 },
)

export type JourneyStage = {
  number: string
  titleAr: string
  titleEn: string
  icon: string
  points: string[]
  pointsEn: string[]
}

export const JOURNEY_STAGES: JourneyStage[] = [
  { number: '01', titleAr: 'الاستشارة الأولية', titleEn: 'Initial Consultation', icon: 'meeting', points: ['التعرف على احتياجات العميل', 'فهم الرؤية', 'تحديد المتطلبات', 'دراسة المشروع'], pointsEn: ['Understanding client needs', 'Understanding the vision', 'Defining requirements', 'Project study'] },
  { number: '02', titleAr: 'رفع المقاسات وتحليل الموقع', titleEn: 'Measurements & Site Analysis', icon: 'blueprint', points: ['زيارة الموقع', 'رفع القياسات', 'تحليل الفراغ', 'دراسة الإضاءة'], pointsEn: ['Site visit', 'Taking measurements', 'Space analysis', 'Lighting study'] },
  { number: '03', titleAr: 'تصميم 2D', titleEn: '2D Design', icon: 'floorplan', points: ['تخطيط المساحات', 'توزيع الأثاث', 'المخططات الأرضية', 'التوزيع الوظيفي'], pointsEn: ['Space planning', 'Furniture layout', 'Floor plans', 'Functional layout'] },
  { number: '04', titleAr: 'تصميم 3D', titleEn: '3D Design', icon: 'cube', points: ['صور واقعية فوتوغرافية', 'الإضاءة', 'الخامات', 'تصور الأثاث'], pointsEn: ['Photorealistic visuals', 'Lighting', 'Materials', 'Furniture visualization'] },
  { number: '05', titleAr: 'المخططات التنفيذية', titleEn: 'Technical Drawings', icon: 'technical', points: ['رسومات المصنع', 'المخططات الكهربائية', 'مخططات الأسقف', 'الأبعاد'], pointsEn: ['Shop drawings', 'Electrical plans', 'Ceiling plans', 'Dimensions'] },
  { number: '06', titleAr: 'اختيار الخامات', titleEn: 'Material Selection', icon: 'materials', points: ['الرخام', 'الأخشاب', 'الدهانات', 'الإضاءة', 'الأثاث'], pointsEn: ['Marble', 'Wood', 'Paints', 'Lighting', 'Furniture'] },
  { number: '07', titleAr: 'التسليم النهائي للتصميم', titleEn: 'Final Design Delivery', icon: 'portfolio', points: ['العرض النهائي', 'حزمة المشروع', 'ملفات التصميم الكاملة', 'جاهز للعميل'], pointsEn: ['Final presentation', 'Project package', 'Complete design files', 'Ready for client'] },
]

export type WhyCard = {
  number: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  icon: string
}

export const WHY_CARDS: WhyCard[] = [
  { number: '01', titleAr: 'تصميم مخصص بالكامل', titleEn: 'Fully Custom Design', descriptionAr: 'كل مشروع يتم تصميمه خصيصاً ليناسب احتياجات العميل وأسلوب حياته.', descriptionEn: 'Every project is designed specifically to fit the client\u2019s needs and lifestyle.', icon: 'sparkles' },
  { number: '02', titleAr: 'واقعية عالية في التصور', titleEn: 'High-Fidelity Visualization', descriptionAr: 'تصميمات ثلاثية الأبعاد تساعدك على رؤية مشروعك قبل التنفيذ.', descriptionEn: '3D designs help you see your project before execution.', icon: 'eye' },
  { number: '03', titleAr: 'اهتمام بأدق التفاصيل', titleEn: 'Attention to the Finest Details', descriptionAr: 'كل خامة وكل لون وكل قطعة أثاث يتم اختيارها بعناية لتحقيق أفضل نتيجة.', descriptionEn: 'Every material, color, and furniture piece is carefully chosen for the best result.', icon: 'gem' },
  { number: '04', titleAr: 'حلول عملية وجمالية', titleEn: 'Practical & Aesthetic Solutions', descriptionAr: 'تصميم يجمع بين الوظيفة والراحة والجمال في كل مساحة.', descriptionEn: 'Design that combines function, comfort, and beauty in every space.', icon: 'layers' },
]

export const WHY_STATS = [
  { value: 120, suffix: '+', labelAr: 'تصميم مكتمل', labelEn: 'Designs Completed' },
  { value: 5, suffix: '+', labelAr: 'سنوات خبرة', labelEn: 'Years of Experience' },
  { value: 100, suffix: '%', labelAr: 'تصميم مخصص', labelEn: 'Custom Design' },
]
