'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronRight, ChevronLeft, Check, AlertCircle, Loader2,
  Info, Image as ImageIcon, Settings, Search, FileText,
  Plus, X, Trash2, Upload,
} from 'lucide-react'
import { createProject, updateProject, uploadToCloudinary, addGalleryImage, deleteGalleryImage } from '@/lib/admin/actions'
import { createClient } from '@/lib/supabase/client'
import { fullProjectSchema, type FullProjectFormData } from '@/lib/admin/schemas'
import type { DBProject } from '@/lib/admin/types'
import { FileUpload } from '@/components/admin/file-upload'

const STEPS = [
  { id: 1, label: 'المعلومات الأساسية', icon: Info },
  { id: 2, label: 'الوصف والتفاصيل', icon: FileText },
  { id: 3, label: 'الوسائط', icon: ImageIcon },
  { id: 4, label: 'إعدادات الصفحة', icon: Settings },
  { id: 5, label: 'تحسين محركات البحث', icon: Search },
]

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF\-]/g, '')
}

interface GalleryImg {
  id: string
  url: string
  public_id: string
  sort_order: number
}

interface Props {
  mode: 'create' | 'edit'
  project?: DBProject & { project_gallery?: GalleryImg[] }
}

function defaultValues(project?: DBProject): Partial<FullProjectFormData> {
  if (!project) return {
    status: 'draft', is_featured: false, has_360: false,
    show_in_portfolio: true, show_on_home: false,
    enable_likes: true, enable_gallery: true, enable_video: true, enable_360: false, sort_order: 0,
  }
  return {
    ...project,
    area: project.area ?? undefined,
    completion_year: project.completion_year ?? undefined,
    highlights: project.highlights?.join(', ') ?? '',
    materials: project.materials?.join(', ') ?? '',
    lighting: project.lighting?.join(', ') ?? '',
    furniture: project.furniture?.join(', ') ?? '',
    seo_keywords: project.seo_keywords?.join(', ') ?? '',
    cover_image_url: project.cover_image_url ?? '',
    video_url: project.video_url ?? '',
    og_image_url: project.og_image_url ?? '',
    canonical_url: project.canonical_url ?? '',
  } as Partial<FullProjectFormData>
}

export function ProjectWizardClient({ mode, project }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ name: string; name_ar: string; subcategories: { name: string; name_ar: string }[] }[]>([])
  const [styles, setStyles] = useState<{ name: string; name_ar: string }[]>([])
  // Gallery state
  const [gallery, setGallery] = useState<GalleryImg[]>(
    (project?.project_gallery ?? []).map((g: any) => ({
      id: g.id, url: g.url, public_id: g.public_id ?? '', sort_order: g.sort_order ?? 0
    }))
  )
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryError, setGalleryError] = useState('')
  const [savedProjectId, setSavedProjectId] = useState<string | null>(project?.id ?? null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: catData } = await supabase
        .from('categories')
        .select('name, name_ar, subcategories(name, name_ar)')
        .eq('status', 'active')
        .order('sort_order')

      const { data: styleData } = await supabase
        .from('design_styles')
        .select('name, name_ar')
        .eq('status', 'active')
        .order('sort_order')

      if (catData) setCategories(catData as any)
      if (styleData) setStyles(styleData as any)
    }

    fetchData()
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FullProjectFormData>({
    resolver: zodResolver(fullProjectSchema) as unknown as Resolver<FullProjectFormData>,
    defaultValues: defaultValues(project),
  })

  const watchedCategory = watch('category')
  const watchedName = watch('name')

  const handleNameBlur = () => {
    if (mode === 'create' && watchedName && !watch('slug')) {
      setValue('slug', slugify(watchedName))
    }
  }

  const onSubmit = async (data: FullProjectFormData) => {
    setServerError(null)
    const result = mode === 'create'
      ? await createProject(data)
      : await updateProject(project!.id, data)

    if ('error' in result && result.error) {
      setServerError(result.error)
      return
    }
    if ('project' in result && result.project) {
      setSavedProjectId(result.project.id)
      
      // If we just created the project, save any gallery images that were uploaded
      if (mode === 'create' && gallery.length > 0) {
        for (const img of gallery) {
          await addGalleryImage(result.project.id, {
            url: img.url,
            public_id: img.public_id,
            sort_order: img.sort_order,
          })
        }
      }
    }
    router.push('/admin/projects')
  }

  const handleGalleryFiles = async (files: FileList) => {
    setGalleryUploading(true)
    setGalleryError('')
    const arr = Array.from(files)
    for (const file of arr) {
      const reader = new FileReader()
      await new Promise<void>(resolve => {
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string
          const res = await uploadToCloudinary({ base64, resourceType: 'image', folder: 'masar/projects/gallery' })
          if (!res.error && res.url) {
            if (savedProjectId) {
              const imgRes = await addGalleryImage(savedProjectId, {
                url: res.url,
                public_id: res.publicId ?? '',
                sort_order: gallery.length,
              })
              if ('image' in imgRes && imgRes.image) {
                setGallery(prev => [...prev, {
                  id: imgRes.image.id,
                  url: imgRes.image.url,
                  public_id: imgRes.image.public_id ?? '',
                  sort_order: imgRes.image.sort_order ?? 0,
                }])
              }
            } else {
              // Store temporarily for new projects
              setGallery(prev => [...prev, {
                id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                url: res.url!,
                public_id: res.publicId ?? '',
                sort_order: prev.length,
              }])
            }
          }
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }
    setGalleryUploading(false)
  }

  const handleDeleteGalleryImg = async (img: GalleryImg) => {
    if (!confirm('حذف هذه الصورة نهائياً؟')) return
    
    if (img.id.startsWith('temp-')) {
      // Just remove it from state
      setGallery(prev => prev.filter(g => g.id !== img.id))
      // It's still in Cloudinary, but it will be orphaned. That's a known tradeoff for simplicity,
      // or we can invoke an action to delete the Cloudinary asset.
      return
    }

    if (!savedProjectId) return
    await deleteGalleryImage(img.id, savedProjectId)
    setGallery(prev => prev.filter(g => g.id !== img.id))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const inputClass = "w-full px-4 py-2.5 bg-[#0E0D0B] border border-[#333] rounded-xl text-[#F0E6D3] placeholder-[#555] text-sm focus:outline-none focus:border-[#C8A96A]/50 focus:ring-1 focus:ring-[#C8A96A]/30 transition-all"
  const labelClass = "block text-xs font-medium text-[#C0B090] mb-1.5"
  const errorClass = "text-red-400 text-xs flex items-center gap-1 mt-1"

  const Toggle = ({ name, label }: { name: keyof FullProjectFormData; label: string }) => {
    const val = watch(name) as boolean
    return (
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-[#C0B090]">{label}</span>
        <button
          type="button"
          onClick={() => setValue(name, !val as any)}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${val ? 'bg-[#C8A96A]' : 'bg-[#333]'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${val ? 'right-0.5' : 'left-0.5'}`} />
        </button>
      </label>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F0E6D3]">
          {mode === 'create' ? 'إضافة مشروع جديد' : `تعديل: ${project?.name}`}
        </h1>
        <p className="text-[#888] text-sm mt-1">أكمل جميع الخطوات لنشر المشروع</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const active = step === s.id
          const done = step > s.id
          return (
            <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#C8A96A] text-[#0E0D0B]'
                    : done
                    ? 'bg-[#C8A96A]/20 text-[#C8A96A] border border-[#C8A96A]/30'
                    : 'bg-[#1A1916] text-[#666] border border-[#333]'
                }`}
              >
                {done ? <Check size={13} /> : <Icon size={13} />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${done ? 'bg-[#C8A96A]/40' : 'bg-[#333]'}`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Basic Info ─────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <h2 className="text-[#F0E6D3] font-semibold mb-4">المعلومات الأساسية</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>اسم المشروع *</label>
                    <input {...register('name')} onBlur={handleNameBlur} placeholder="فيلا النخبة" className={inputClass} />
                    {errors.name && <p className={errorClass}><AlertCircle size={11} />{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>الرابط المختصر (Slug)</label>
                    <input {...register('slug')} placeholder="villa-al-nukhba" dir="ltr" className={inputClass} />
                    {errors.slug && <p className={errorClass}><AlertCircle size={11} />{errors.slug.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>الفئة</label>
                    <select {...register('category')} className={inputClass}>
                      <option value="">اختر الفئة</option>
                      {categories.map(c => <option key={c.name} value={c.name}>{c.name_ar || c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>الفئة الفرعية</label>
                    <select {...register('subcategory')} className={inputClass}>
                      <option value="">اختر الفئة الفرعية</option>
                      {(categories.find(c => c.name === watchedCategory)?.subcategories ?? []).map(s => (
                        <option key={s.name} value={s.name}>{s.name_ar || s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>النمط</label>
                    <select {...register('style')} className={inputClass}>
                      <option value="">اختر النمط</option>
                      {styles.map(s => <option key={s.name} value={s.name}>{s.name_ar || s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>الموقع</label>
                    <input {...register('location')} placeholder="القاهرة، مدينة نصر" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>المساحة (م²)</label>
                    <input {...register('area')} type="number" placeholder="450" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>سنة الإنجاز</label>
                    <input {...register('completion_year')} type="number" placeholder="2024" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>نوع العميل</label>
                    <input {...register('client_type')} placeholder="عائلة خاصة" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>الحالة</label>
                    <select {...register('status')} className={inputClass}>
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">مؤرشف</option>
                      <option value="hidden">مخفي</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <Toggle name="is_featured" label="مشروع مميز" />
                  <Toggle name="has_360" label="يحتوي تجربة 360°" />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Descriptions ───────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <h2 className="text-[#F0E6D3] font-semibold mb-4">الوصف والتفاصيل</h2>
                <div>
                  <label className={labelClass}>وصف مختصر</label>
                  <textarea {...register('short_description')} rows={2} placeholder="وصف قصير يظهر في قائمة المشاريع..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>وصف كامل</label>
                  <textarea {...register('full_description')} rows={5} placeholder="وصف تفصيلي للمشروع، أسلوب التصميم، الرؤية الإبداعية..." className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { name: 'highlights' as const, label: 'أبرز المميزات', placeholder: 'تصميم جراج مزدوج، مسبح خاص، غرفة سينما' },
                    { name: 'materials' as const, label: 'المواد المستخدمة', placeholder: 'رخام إيطالي، خشب البلوط، نحاس مصقول' },
                    { name: 'lighting' as const, label: 'الإضاءة', placeholder: 'إضاءة كوفر مخفية، سبوت LED، نجفة مخصصة' },
                    { name: 'furniture' as const, label: 'الأثاث والديكور', placeholder: 'أثاث إيطالي فاخر، لوحات فنية أصيلة' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className={labelClass}>{field.label} <span className="text-[#555]">(مفصولة بفاصلة)</span></label>
                      <input {...register(field.name)} placeholder={field.placeholder} className={inputClass} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelClass}>ملاحظات التصميم الداخلية</label>
                  <textarea {...register('design_notes')} rows={3} placeholder="ملاحظات داخلية للفريق..." className={inputClass} />
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Media ─────────────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-6"
              >
                <h2 className="text-[#F0E6D3] font-semibold mb-4">الوسائط</h2>

                {/* Cover image */}
                <div className="space-y-3">
                  <FileUpload
                    label="صورة الغلاف"
                    folder="masar/projects"
                    accept="image/*"
                    resourceType="image"
                    currentUrl={watch('cover_image_url')}
                    onUpload={(result) => {
                      setValue('cover_image_url', result.url)
                      setValue('cover_image_public_id', result.publicId)
                    }}
                    onRemove={() => {
                      setValue('cover_image_url', '')
                      setValue('cover_image_public_id', '')
                    }}
                  />
                </div>

                {/* Video */}
                <div className="space-y-3">
                  <FileUpload
                    label="فيديو المشروع"
                    folder="masar/projects/videos"
                    accept="video/*"
                    resourceType="video"
                    currentUrl={watch('video_url')}
                    onUpload={(result) => {
                      setValue('video_url', result.url)
                      setValue('video_public_id', result.publicId)
                    }}
                    onRemove={() => {
                      setValue('video_url', '')
                      setValue('video_public_id', '')
                    }}
                  />
                </div>

                {/* Gallery Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>صور المشروع (المعرض)</label>
                    <span className="text-[10px] text-[#555]">{gallery.length} صورة</span>
                  </div>

                  {!savedProjectId && mode === 'create' && (
                    <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-800/30 rounded-xl text-amber-400 text-xs">
                      <AlertCircle size={13} /> احفظ المشروع أولاً في الخطوة الأخيرة، ثم عد لرفع الصور
                    </div>
                  )}

                  {galleryError && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle size={11} />{galleryError}
                    </p>
                  )}

                  {/* Gallery grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {gallery.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[#333]">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImg(img)}
                            className="p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Upload button */}
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-[#333] hover:border-[#C8A96A]/40 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                      {galleryUploading ? (
                        <Loader2 size={18} className="text-[#C8A96A] animate-spin" />
                      ) : (
                        <>
                          <Plus size={18} className="text-[#444]" />
                          <span className="text-[9px] text-[#555] text-center px-1">إضافة صور</span>
                        </>
                      )}
                    </div>
                  </div>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => { if (e.target.files?.length) handleGalleryFiles(e.target.files) }}
                  />
                  <p className="text-[#555] text-[10px]">يمكنك اختيار عدة صور دفعة واحدة • الصور تُرفع مباشرة على Cloudinary</p>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Page Settings ─────────────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <h2 className="text-[#F0E6D3] font-semibold mb-4">إعدادات الصفحة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 p-4 bg-[#0E0D0B] rounded-xl border border-[#333]">
                    <h3 className="text-xs font-medium text-[#C0B090]">الظهور</h3>
                    <Toggle name="show_in_portfolio" label="ظهور في المحفظة" />
                    <Toggle name="show_on_home" label="ظهور في الصفحة الرئيسية" />
                  </div>
                  <div className="space-y-4 p-4 bg-[#0E0D0B] rounded-xl border border-[#333]">
                    <h3 className="text-xs font-medium text-[#C0B090]">تفعيل الميزات</h3>
                    <Toggle name="enable_likes" label="تفعيل الإعجابات" />
                    <Toggle name="enable_gallery" label="تفعيل المعرض" />
                    <Toggle name="enable_video" label="تفعيل الفيديو" />
                    <Toggle name="enable_360" label="تفعيل تجربة 360°" />
                  </div>
                </div>
                <div className="max-w-xs">
                  <label className={labelClass}>ترتيب العرض</label>
                  <input {...register('sort_order')} type="number" placeholder="0" className={inputClass} />
                  <p className="text-[#555] text-xs mt-1">الأرقام الأصغر تظهر أولاً</p>
                </div>
              </motion.div>
            )}

            {/* ── Step 5: SEO ───────────────────────────────────────────── */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <h2 className="text-[#F0E6D3] font-semibold mb-4">تحسين محركات البحث (SEO)</h2>
                <div>
                  <label className={labelClass}>عنوان SEO</label>
                  <input {...register('seo_title')} placeholder="فيلا النخبة — تصميم داخلي فاخر | مسار" className={inputClass} />
                  <p className="text-[#555] text-xs mt-1">{(watch('seo_title') ?? '').length}/70 حرف</p>
                </div>
                <div>
                  <label className={labelClass}>وصف SEO</label>
                  <textarea {...register('seo_description')} rows={3} placeholder="وصف موجز للصفحة لمحركات البحث..." className={inputClass} />
                  <p className="text-[#555] text-xs mt-1">{(watch('seo_description') ?? '').length}/160 حرف</p>
                </div>
                <div>
                  <label className={labelClass}>الكلمات المفتاحية <span className="text-[#555]">(مفصولة بفاصلة)</span></label>
                    <input {...register('seo_keywords')} placeholder="تصميم داخلي, فيلا, القاهرة, luxury interior" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>صورة Open Graph</label>
                    <input {...register('og_image_url')} placeholder="https://..." dir="ltr" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Canonical URL</label>
                    <input {...register('canonical_url')} placeholder="https://masar.studio/projects/..." dir="ltr" className={inputClass} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Server error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-400 text-sm mt-4"
            >
              <AlertCircle size={14} /> {serverError}
            </motion.div>
          )}

          {/* Client Validation Error Summary */}
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-400 text-sm mt-4"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> 
              <div>
                <p className="font-semibold mb-1">يرجى مراجعة الخطوات السابقة!</p>
                <p className="text-xs opacity-90">هناك حقول مطلوبة غير مكتملة أو تحتوي على أخطاء تمنع حفظ المشروع.</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1916] border border-[#C8A96A]/10 text-[#888] rounded-xl text-sm disabled:opacity-30 hover:text-[#F0E6D3] hover:border-[#C8A96A]/25 transition-all"
          >
            <ChevronRight size={16} /> السابق
          </button>

          <span className="text-[#555] text-xs">
            {step} / {STEPS.length}
          </span>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C8A96A]/15 border border-[#C8A96A]/30 text-[#C8A96A] rounded-xl text-sm hover:bg-[#C8A96A]/25 transition-all"
            >
              التالي <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-[#d4b87a] transition-all"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> جاري الحفظ...</>
              ) : (
                <><Check size={14} /> {mode === 'create' ? 'إنشاء المشروع' : 'حفظ التعديلات'}</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
