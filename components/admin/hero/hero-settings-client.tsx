'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Image as ImageIcon, Video, Trash2, RefreshCw, Crop } from 'lucide-react'
import { updateHeroSettings } from '@/lib/admin/hero-actions'
import { uploadToCloudinary } from '@/lib/admin/actions'
import type { DBHeroSettings } from '@/lib/admin/types'
import { ImageCropperModal } from './image-cropper-modal'

interface Props {
  initialHero: DBHeroSettings | null
}

const DEFAULTS: Partial<DBHeroSettings> = {
  headline_ar: 'مساحتك تبدأ هنا',
  subtitle_ar: 'استوديو التصميم الداخلي',
  description_ar: 'نحوّل المساحات إلى تجارب معيشية استثنائية تعكس شخصيتك وتُلهم حياتك اليومية.',
  cta_primary_text: 'استكشف مشاريعنا',
  cta_primary_href: '#projects',
  cta_video_text: 'شاهد الفيديو التعريفي',
  overlay_opacity: 0.55,
  brightness: 1.0,
  blur: 0,
  hero_height: '100vh',
}

export function HeroSettingsClient({ initialHero }: Props) {
  const router = useRouter()
  const h = initialHero ?? DEFAULTS as DBHeroSettings

  const [form, setForm] = useState({
    headline_ar: h.headline_ar ?? DEFAULTS.headline_ar ?? '',
    subtitle_ar: h.subtitle_ar ?? DEFAULTS.subtitle_ar ?? '',
    description_ar: h.description_ar ?? DEFAULTS.description_ar ?? '',
    cta_primary_text: h.cta_primary_text ?? DEFAULTS.cta_primary_text ?? '',
    cta_primary_href: h.cta_primary_href ?? DEFAULTS.cta_primary_href ?? '',
    cta_video_text: h.cta_video_text ?? DEFAULTS.cta_video_text ?? '',
    overlay_opacity: h.overlay_opacity ?? 0.55,
    brightness: h.brightness ?? 1.0,
    blur: h.blur ?? 0,
    hero_height: h.hero_height ?? '100vh',
    image_url: h.image_url ?? '',
    image_public_id: h.image_public_id ?? '',
    video_url: h.video_url ?? '',
    video_public_id: h.video_public_id ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saved, setSaved] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null)

  // ── Field helper ────────────────────────────────────────────────────────
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const res = await updateHeroSettings(form)
    setSaving(false)
    if (!res.error) {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    }
  }

  // ── Upload Image ─────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setTempImageSrc(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBase64: string) => {
    setTempImageSrc(null)
    setUploadingImage(true)
    setUploadError('')
    try {
      const res = await uploadToCloudinary({ base64: croppedBase64, resourceType: 'image', folder: 'masar/hero' })
      if (res.error) {
        setUploadError(res.error)
      } else {
        set('image_url', res.url ?? '')
        set('image_public_id', res.publicId ?? '')
      }
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء الرفع')
    } finally {
      setUploadingImage(false)
    }
  }

  // ── Upload Video ─────────────────────────────────────────────────────────
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVideo(true)
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      const res = await uploadToCloudinary({ base64, resourceType: 'video', folder: 'masar/hero' })
      if (res.error) { setUploadError(res.error); setUploadingVideo(false); return }
      set('video_url', res.url ?? '')
      set('video_public_id', res.publicId ?? '')
      setUploadingVideo(false)
    }
    reader.readAsDataURL(file)
  }

  // ── Remove helpers ───────────────────────────────────────────────────────
  const removeImage = () => { set('image_url', ''); set('image_public_id', '') }
  const removeVideo = () => { set('video_url', ''); set('video_public_id', '') }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">إعدادات الهيرو</h1>
          <p className="text-xs text-[#666] mt-0.5">تحكم في مظهر ومحتوى القسم الرئيسي للصفحة الرئيسية</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#C8A96A] px-5 py-2 text-sm font-medium text-black transition-all hover:bg-[#C8A96A]/90 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'جاري الحفظ...' : saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
        </button>
      </div>

      {uploadError && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">{uploadError}</p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ── Media ─────────────────────────────────────────────────────── */}
        <Card title="الميديا">
          {/* Hero Image */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#C0B090]">صورة الهيرو</label>
            {form.image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-[#C8A96A]/20 group">
                <img src={form.image_url} alt="Hero Preview" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTempImageSrc(form.image_url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    <Crop size={12} />
                    قص وتعديل
                  </button>
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A96A]/20 border border-[#C8A96A]/40 text-[#C8A96A] text-xs hover:bg-[#C8A96A]/30 transition-colors">
                    <RefreshCw size={12} />
                    استبدال
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={removeImage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs hover:bg-red-500/30 transition-colors">
                    <Trash2 size={12} />
                    حذف
                  </button>
                </div>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingImage ? 'border-[#C8A96A]/30 bg-[#C8A96A]/5' : 'border-[#333] hover:border-[#C8A96A]/40 hover:bg-[#C8A96A]/3'}`}>
                {uploadingImage
                  ? <Loader2 size={22} className="text-[#C8A96A] animate-spin" />
                  : <ImageIcon size={22} className="text-[#555]" />
                }
                <span className="text-xs text-[#666]">{uploadingImage ? 'جاري الرفع...' : 'اسحب وأفلت أو اضغط لاختيار صورة الهيرو'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
              </label>
            )}
            <p className="text-[10px] text-[#555]">يُرفع مباشرةً إلى Cloudinary. مقاس مقترح: 1920×1080 أو أكبر.</p>
          </div>

          {/* Hero Video */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#C0B090]">فيديو تعريفي (اختياري)</label>
            {form.video_url ? (
              <div className="flex items-center gap-3 px-3 py-3 bg-[#0E0D0B] border border-[#333] rounded-xl">
                <Video size={18} className="text-[#C8A96A] shrink-0" />
                <span className="text-xs text-[#888] truncate flex-1">{form.video_url.split('/').pop()}</span>
                <div className="flex gap-2 shrink-0">
                  <label className="cursor-pointer p-1.5 rounded-lg bg-[#C8A96A]/10 text-[#C8A96A] hover:bg-[#C8A96A]/20 transition-colors">
                    <RefreshCw size={12} />
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                  <button onClick={removeVideo} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingVideo ? 'border-[#C8A96A]/30 bg-[#C8A96A]/5' : 'border-[#333] hover:border-[#C8A96A]/40'}`}>
                {uploadingVideo
                  ? <Loader2 size={20} className="text-[#C8A96A] animate-spin" />
                  : <Video size={20} className="text-[#555]" />
                }
                <span className="text-xs text-[#666]">{uploadingVideo ? 'جاري الرفع...' : 'ارفع فيديو تعريفي (MP4/MOV)'}</span>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
              </label>
            )}
            <p className="text-[10px] text-[#555]">إذا لم يُرفع فيديو، يظهر للزوار رسالة أنيقة بدلاً من مودال فارغ.</p>
          </div>
        </Card>

        {/* ── Copy ──────────────────────────────────────────────────────── */}
        <Card title="النصوص">
          <Field label="الـ Subtitle (فوق العنوان)" value={form.subtitle_ar} onChange={v => set('subtitle_ar', v)} />
          <Field label="العنوان الرئيسي (عربي)" value={form.headline_ar} onChange={v => set('headline_ar', v)} />
          <Field label="الوصف" value={form.description_ar} onChange={v => set('description_ar', v)} isTextarea />
          <Field label="نص زر CTA الأساسي" value={form.cta_primary_text} onChange={v => set('cta_primary_text', v)} />
          <Field
            label="وجهة زر CTA (anchor أو رابط)"
            value={form.cta_primary_href}
            onChange={v => set('cta_primary_href', v)}
            hint="#projects | #about | /projects"
          />
          <Field label="نص زر الفيديو" value={form.cta_video_text} onChange={v => set('cta_video_text', v)} />
        </Card>

        {/* ── Appearance ────────────────────────────────────────────────── */}
        <Card title="المظهر والأبعاد">
          {/* Hero Height */}
          <div>
            <label className="block text-xs font-medium text-[#C0B090] mb-1.5">ارتفاع الهيرو</label>
            <div className="flex gap-2">
              {['80vh', '90vh', '100vh'].map(h => (
                <button
                  key={h}
                  onClick={() => set('hero_height', h)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.hero_height === h ? 'border-[#C8A96A] bg-[#C8A96A]/15 text-[#C8A96A]' : 'border-[#333] text-[#666] hover:border-[#C8A96A]/30'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay Opacity */}
          <SliderField
            label="شفافية الـ Overlay"
            value={form.overlay_opacity}
            onChange={v => set('overlay_opacity', v)}
            min={0} max={1} step={0.05}
            display={`${Math.round(form.overlay_opacity * 100)}%`}
          />

          {/* Brightness */}
          <SliderField
            label="السطوع"
            value={form.brightness}
            onChange={v => set('brightness', v)}
            min={0.4} max={1.5} step={0.05}
            display={`${form.brightness.toFixed(2)}×`}
          />

          {/* Blur */}
          <SliderField
            label="ضبابية الصورة (blur)"
            value={form.blur}
            onChange={v => set('blur', v)}
            min={0} max={20} step={1}
            display={`${form.blur}px`}
          />
        </Card>

        {/* ── Live Preview ──────────────────────────────────────────────── */}
        <Card title="معاينة سريعة">
          <div
            className="relative w-full rounded-xl overflow-hidden"
            style={{ height: '200px', background: '#0a0905' }}
          >
            {form.image_url ? (
              <img
                src={form.image_url}
                alt="preview"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  filter: `brightness(${form.brightness}) blur(${form.blur}px)`,
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={28} className="text-[#333] mx-auto mb-2" />
                  <p className="text-xs text-[#444]">لا توجد صورة — سيظهر placeholder داخلي</p>
                </div>
              </div>
            )}
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: `rgba(0,0,0,${form.overlay_opacity})` }}
            />
            <div className="absolute bottom-4 right-4 left-4" dir="rtl">
              <p className="text-[8px] tracking-widest text-[#C8A96A] mb-0.5">{form.subtitle_ar}</p>
              <p className="text-sm font-bold text-white leading-tight truncate">{form.headline_ar}</p>
            </div>
          </div>
          <p className="text-[10px] text-[#555] text-center">معاينة تقريبية. ارفع صورة لتحديث المعاينة فورًا.</p>
        </Card>
      </div>

      {tempImageSrc && (
        <ImageCropperModal
          imageSrc={tempImageSrc}
          onClose={() => setTempImageSrc(null)}
          onCrop={handleCropComplete}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#C8A96A]/10 bg-[#1A1916] p-5 space-y-4">
      <h2 className="text-sm font-bold text-[#C8A96A]">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, isTextarea = false, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; isTextarea?: boolean; hint?: string
}) {
  const cls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[#C8A96A]/50'
  return (
    <div>
      <label className="mb-1 block text-xs text-[#888]">{label}</label>
      {isTextarea ? (
        <textarea className={cls + ' min-h-[80px] resize-y'} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={e => onChange(e.target.value)} />
      )}
      {hint && <p className="mt-0.5 text-[10px] text-[#555]">{hint}</p>}
    </div>
  )
}

function SliderField({
  label, value, onChange, min, max, step, display,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; display: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-[#888]">{label}</label>
        <span className="text-xs font-mono text-[#C8A96A]">{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#C8A96A] bg-[#333]"
      />
    </div>
  )
}
