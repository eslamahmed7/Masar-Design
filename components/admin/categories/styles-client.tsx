'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Plus, Pencil, Trash2, Check, X, Loader2, Palette, Image as ImageIcon,
  Trophy, Building2, Sprout, Flower2, Hammer, Wrench, Sparkles, Sofa,
  Crown, Gem, Brush, Layers, Box, Armchair, Wine, Landmark
} from 'lucide-react'
import { createDesignStyle, deleteDesignStyle, uploadToCloudinary, updateDesignStyle } from '@/lib/admin/actions'
import type { DBDesignStyle } from '@/lib/admin/types'

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy, Building2, Sprout, Flower2, Hammer, Wrench, Sparkles, Sofa,
  Crown, Gem, Brush, Palette, Layers, Box, Armchair, Wine, Landmark
}

const PRESET_ICONS = Object.keys(ICON_MAP)

const ICON_NAMES_AR: Record<string, string> = {
  Trophy: 'كأس / كلاسيكي',
  Building2: 'مبنى شاهق / مودرن',
  Sprout: 'نبتة منزلية / بوهيمي',
  Flower2: 'وردة / طبيعة',
  Hammer: 'مطرقة / صناعي',
  Wrench: 'مفتاح أدوات / صناعي',
  Sparkles: 'بريق / فخامة',
  Sofa: 'أريكة',
  Crown: 'تاج / ملكي',
  Gem: 'جوهرة / فاخر',
  Brush: 'فرشاة / فني',
  Palette: 'لوحة ألوان',
  Layers: 'طبقات',
  Box: 'صندوق',
  Armchair: 'أثاث مريح',
  Wine: 'كأس زجاجي',
  Landmark: 'معلم تاريخي / كلاسيكي'
}

function StyleIcon({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) {
  const Icon = ICON_MAP[name]
  if (Icon) return <Icon size={size} className={className} />
  return <span className={className} style={{ fontSize: size }}>{name || '🎨'}</span>
}

interface Props { initialStyles: DBDesignStyle[] }

export function StylesClient({ initialStyles }: Props) {
  const [styles, setStyles] = useState<DBDesignStyle[]>(initialStyles)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [description, setDescription] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      const res = await uploadToCloudinary({ base64, resourceType: 'image', folder: 'masar/styles' })
      if (res.error) {
        setUploadError(res.error)
      } else {
        setPreviewUrl(res.url ?? '')
      }
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const handleEditClick = (style: DBDesignStyle) => {
    setEditingId(style.id)
    setName(style.name)
    setNameAr(style.name_ar || '')
    setIcon(style.icon || PRESET_ICONS[0])
    setDescription(style.description || '')
    setPreviewUrl(style.preview_image_url || '')
    setCreating(true)
  }

  const handleCreate = () => {
    if (!name.trim()) return
    startTransition(async () => {
      if (editingId) {
        const res = await updateDesignStyle(editingId, {
          name: name.trim(),
          name_ar: nameAr.trim() || null,
          icon: icon.trim() || null,
          description: description.trim() || null,
          preview_image_url: previewUrl.trim() || null,
        })
        if (res.style) {
          setStyles(prev => prev.map(s => s.id === editingId ? res.style! : s))
          setName(''); setNameAr(''); setIcon(PRESET_ICONS[0]); setDescription(''); setPreviewUrl('')
          setEditingId(null)
          setCreating(false)
        }
      } else {
        const res = await createDesignStyle({
          name: name.trim(), name_ar: nameAr.trim() || undefined,
          icon: icon.trim() || undefined, description: description.trim() || undefined,
          preview_image_url: previewUrl.trim() || undefined,
        })
        if (res.style) {
          setStyles(prev => [...prev, res.style!])
          setName(''); setNameAr(''); setIcon(PRESET_ICONS[0]); setDescription(''); setPreviewUrl('')
          setCreating(false)
        }
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('حذف نمط التصميم هذا؟')) return
    startTransition(async () => {
      await deleteDesignStyle(id)
      setStyles(prev => prev.filter(s => s.id !== id))
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">أنماط التصميم</h1>
          <p className="text-[#888] text-sm mt-1">إدارة أنماط وأساليب التصميم</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={15} /> نمط جديد
        </button>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1A1916] border border-[#C8A96A]/30 rounded-2xl p-5 space-y-3"
          >
            <h3 className="text-[#F0E6D3] font-semibold text-sm">{editingId ? 'تعديل النمط' : 'نمط جديد'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم *"
                className="bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none" />
              <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="الاسم بالعربية"
                className="bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none" dir="rtl" />
              {/* Icon Picker Grid */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#C0B090] mb-2">اختر أيقونة النمط</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#0E0D0B] border border-[#333] rounded-xl max-h-24 overflow-y-auto">
                  {PRESET_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      title={ICON_NAMES_AR[iconName] ?? iconName}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${icon === iconName ? 'bg-[#C8A96A] text-[#0E0D0B] scale-110 shadow-lg' : 'hover:bg-white/5 bg-transparent text-[#F0E6D3]'}`}
                    >
                      <StyleIcon name={iconName} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* File Uploader */}
              <div className="col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-[#C0B090]">صورة المعاينة</label>
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#C8A96A]/20 w-full h-24 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPreviewUrl('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xs font-semibold"
                    >
                      حذف الصورة
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 border border-dashed rounded-xl cursor-pointer transition-colors ${uploadingImage ? 'border-[#C8A96A]/30 bg-[#C8A96A]/5' : 'border-[#333] hover:border-[#C8A96A]/40'}`}>
                    {uploadingImage ? (
                      <Loader2 size={16} className="text-[#C8A96A] animate-spin" />
                    ) : (
                      <ImageIcon size={16} className="text-[#555]" />
                    )}
                    <span className="text-xs text-[#666]">{uploadingImage ? 'جاري الرفع...' : 'اضغط لرفع صورة من جهازك'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                )}
                {uploadError && <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>}
              </div>

              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="الوصف" rows={2}
                className="col-span-2 bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-xs font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} حفظ
              </button>
              <button onClick={() => { setCreating(false); setEditingId(null); setName(''); setNameAr(''); setIcon(PRESET_ICONS[0]); setDescription(''); setPreviewUrl('') }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#222] text-[#888] rounded-xl text-xs hover:text-[#F0E6D3] transition-colors">
                <X size={13} /> إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {styles.length === 0 && (
          <div className="col-span-4 text-center py-16 text-[#555]">
            <Palette size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد أنماط بعد.</p>
          </div>
        )}
        {styles.map((style, i) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl overflow-hidden group hover:border-[#C8A96A]/25 transition-all"
          >
            {style.preview_image_url ? (
              <div className="h-28 overflow-hidden">
                <img src={style.preview_image_url} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ) : (
              <div className="h-28 bg-gradient-to-br from-[#C8A96A]/10 to-[#C8A96A]/5 flex items-center justify-center text-[#C8A96A]">
                <StyleIcon name={style.icon ?? '🎨'} size={48} />
              </div>
            )}
            <div className="p-3">
              <p className="text-[#F0E6D3] font-medium text-sm">{style.name}</p>
              {style.name_ar && <p className="text-[#888] text-xs mt-0.5">{style.name_ar}</p>}
              {style.description && <p className="text-[#666] text-xs mt-1 line-clamp-2">{style.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  style.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-[#333]/60 text-[#888] border-[#444]'
                }`}>
                  {style.status === 'active' ? 'نشط' : 'مخفي'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEditClick(style)}
                    className="p-1.5 text-[#555] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(style.id)}
                    className="p-1.5 text-[#555] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
