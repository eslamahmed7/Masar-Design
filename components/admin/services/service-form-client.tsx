'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Plus, Trash2, Loader2 } from 'lucide-react'
import { createService, updateService, upsertServicePricing, createPricingOption, clearServicePricingOptions } from '@/lib/admin/actions'
import type { DBService } from '@/lib/admin/types'

type PricingType = 'per_sqm' | 'fixed' | 'custom' | 'quote'

const pricingTypes: { value: PricingType; label: string }[] = [
  { value: 'per_sqm', label: 'سعر لكل متر مربع' },
  { value: 'fixed', label: 'سعر ثابت' },
  { value: 'custom', label: 'سعر مخصص' },
  { value: 'quote', label: 'عرض سعر عند الطلب' },
]

import { Image as ImageIcon } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/admin/actions'

interface AddonInput { name: string; nameAr: string; price: string; priceType: 'fixed' | 'percentage' }

interface Props {
  initialData?: any
}

export function ServiceFormClient({ initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Service fields
  const [name, setName] = useState(initialData?.name || '')
  const [nameAr, setNameAr] = useState(initialData?.name_ar || '')
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || '')
  const [longDesc, setLongDesc] = useState(initialData?.description || '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'active' | 'hidden'>(initialData?.status || 'active')
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)

  // Pricing
  const [pricingType, setPricingType] = useState<PricingType>(initialData?.pricing?.pricing_type || 'per_sqm')
  const [pricePerSqm, setPricePerSqm] = useState(initialData?.pricing?.price_per_sqm ? String(initialData.pricing.price_per_sqm) : '')
  const [fixedPrice, setFixedPrice] = useState(initialData?.pricing?.fixed_price ? String(initialData.pricing.fixed_price) : '')
  const [minArea, setMinArea] = useState(initialData?.pricing?.min_area ? String(initialData.pricing.min_area) : '')
  const [maxArea, setMaxArea] = useState(initialData?.pricing?.max_area ? String(initialData.pricing.max_area) : '')
  const [minOrderValue, setMinOrderValue] = useState(initialData?.pricing?.min_order_value ? String(initialData.pricing.min_order_value) : '')
  const [currency, setCurrency] = useState(initialData?.pricing?.currency || 'EGP')

  // Add-ons
  const [addons, setAddons] = useState<AddonInput[]>(
    initialData?.options?.map((o: any) => ({
      name: o.name,
      nameAr: o.name_ar || '',
      price: String(o.price),
      priceType: o.price_type
    })) || []
  )
  const [newAddon, setNewAddon] = useState<AddonInput>({ name: '', nameAr: '', price: '', priceType: 'fixed' })

  const addAddon = () => {
    if (!newAddon.name || !newAddon.price) return
    setAddons(prev => [...prev, newAddon])
    setNewAddon({ name: '', nameAr: '', price: '', priceType: 'fixed' })
  }

  const removeAddon = (i: number) => setAddons(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = () => {
    if (!name.trim()) { setError('اسم الخدمة مطلوب.'); return }
    setError('')
    startTransition(async () => {
      let finalImageUrl = coverImageUrl
      if (imageFile) {
        try {
          const buffer = await imageFile.arrayBuffer()
          const base64 = `data:${imageFile.type};base64,${Buffer.from(buffer).toString('base64')}`
          const res = await uploadToCloudinary({ base64, folder: 'masar/services' })
          if (res.url) {
            finalImageUrl = res.url
          }
        } catch (err) {
          console.error(err)
          setError('فشل في رفع الصورة.')
          return
        }
      }

      let svcId = initialData?.id
      if (svcId) {
        const svcRes = await updateService(svcId, {
          name: name.trim(),
          name_ar: nameAr.trim() || null,
          short_description: shortDesc.trim() || null,
          long_description: longDesc.trim() || null,
          cover_image_url: finalImageUrl || null,
          status,
          is_featured: isFeatured,
        })
        if (svcRes.error) { setError(svcRes.error); return }
      } else {
        const svcRes = await createService({
          name: name.trim(), name_ar: nameAr.trim() || undefined,
          short_description: shortDesc.trim() || undefined,
          long_description: longDesc.trim() || undefined,
          cover_image_url: finalImageUrl || undefined,
          status, is_featured: isFeatured,
        })
        if (svcRes.error) { setError(svcRes.error); return }
        svcId = svcRes.service!.id
      }

      // Save pricing
      if (pricingType !== 'quote') {
        await upsertServicePricing(svcId, {
          pricing_type: pricingType,
          price_per_sqm: pricePerSqm ? Number(pricePerSqm) : null,
          fixed_price: fixedPrice ? Number(fixedPrice) : null,
          min_area: minArea ? Number(minArea) : null,
          max_area: maxArea ? Number(maxArea) : null,
          min_order_value: minOrderValue ? Number(minOrderValue) : null,
          currency,
        })
      }

      // Save add-ons
      await clearServicePricingOptions(svcId)
      for (const addon of addons) {
        await createPricingOption({
          service_id: svcId, name: addon.name,
          name_ar: addon.nameAr || undefined,
          price: Number(addon.price),
          price_type: addon.priceType,
        })
      }

      router.push('/admin/services')
    })
  }

  const inputCls = 'bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2.5 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none w-full'
  const labelCls = 'block text-xs font-medium text-[#999] mb-1.5'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F0E6D3]">{initialData ? 'تعديل الخدمة' : 'خدمة جديدة'}</h1>
        <p className="text-[#888] text-sm mt-1">{initialData ? 'تعديل بيانات وإعدادات تسعير الخدمة' : 'أضف خدمة جديدة مع إعدادات التسعير'}</p>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Main Info */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5 space-y-4">
        <h2 className="text-[#F0E6D3] font-semibold text-sm border-b border-[#C8A96A]/10 pb-3">المعلومات الأساسية</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>اسم الخدمة (إنجليزي) *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: Interior Design" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>الاسم بالعربية</label>
            <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: تصميم داخلي" className={inputCls} dir="rtl" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>وصف قصير</label>
            <input value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="سطر أو سطرين لوصف الخدمة..." className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>وصف تفصيلي</label>
            <textarea value={longDesc} onChange={e => setLongDesc(e.target.value)} rows={4}
              placeholder="وصف تفصيلي للخدمة..."
              className={`${inputCls} resize-none`} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>صورة الخدمة</label>
            <div className="flex items-center gap-4 mt-2">
              <div className="relative w-32 h-32 rounded-xl border border-[#333] bg-[#0E0D0B] overflow-hidden flex items-center justify-center flex-shrink-0">
                {(imageFile || coverImageUrl) ? (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : coverImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#555]" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setImageFile(file)
                  }}
                  className="hidden"
                  id="cover_image_upload"
                />
                <label
                  htmlFor="cover_image_upload"
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#1A1916] hover:bg-[#222] border border-[#333] hover:border-[#C8A96A]/30 text-[#C8A96A] rounded-xl text-sm font-medium cursor-pointer transition-colors"
                >
                  اختر صورة
                </label>
                <p className="mt-2 text-xs text-[#888]">
                  يفضل رفع صورة بجودة عالية وتناسب المقاس المربع أو المستطيل.
                </p>
                {(imageFile || coverImageUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setCoverImageUrl('')
                    }}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 block"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>الحالة</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputCls}>
              <option value="active">نشط</option>
              <option value="hidden">مخفي</option>
            </select>
          </div>
          <div className="flex items-center pt-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#C8A96A]" />
              <span className="text-[#888] text-sm">تمييز الخدمة (Featured)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5 space-y-4">
        <h2 className="text-[#F0E6D3] font-semibold text-sm border-b border-[#C8A96A]/10 pb-3">إعدادات التسعير</h2>
        
        <div>
          <label className={labelCls}>نوع التسعير</label>
          <select value={pricingType} onChange={e => setPricingType(e.target.value as any)} className={inputCls}>
            {pricingTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {pricingType === 'per_sqm' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>السعر للمتر المربع *</label>
              <input type="number" value={pricePerSqm} onChange={e => setPricePerSqm(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>العملة</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                <option value="SAR">ريال سعودي</option>
                <option value="AED">درهم إماراتي</option>
                <option value="EGP">جنيه مصري</option>
                <option value="USD">دولار أمريكي</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>الحد الأدنى للمساحة (م²)</label>
              <input type="number" value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>الحد الأقصى للمساحة (م²)</label>
              <input type="number" value={maxArea} onChange={e => setMaxArea(e.target.value)} placeholder="اختياري" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>الحد الأدنى للطلب</label>
              <input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>
        )}

        {pricingType === 'fixed' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>السعر الثابت *</label>
              <input type="number" value={fixedPrice} onChange={e => setFixedPrice(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>العملة</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                <option value="SAR">ريال سعودي</option>
                <option value="AED">درهم إماراتي</option>
                <option value="EGP">جنيه مصري</option>
                <option value="USD">دولار أمريكي</option>
              </select>
            </div>
          </div>
        )}

        {pricingType === 'quote' && (
          <div className="bg-[#0E0D0B]/50 rounded-xl px-4 py-3 text-[#888] text-sm">
            سيتم طلب عرض السعر من العميل عبر النموذج.
          </div>
        )}
      </div>

      {/* Add-ons */}
      <div className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-5 space-y-4 overflow-hidden">
        <h2 className="text-[#F0E6D3] font-semibold text-sm border-b border-[#C8A96A]/10 pb-3">الإضافات الاختيارية</h2>
        {addons.map((a, i) => (
          <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-[#0E0D0B]/50 rounded-xl px-3 py-2.5">
            <span className="text-[#F0E6D3] text-sm flex-1 break-words min-w-0">{a.name}</span>
            {a.nameAr && <span className="text-[#888] text-xs truncate min-w-0">{a.nameAr}</span>}
            <span className="text-[#C8A96A] text-sm font-medium whitespace-nowrap">
              {a.price} {a.priceType === 'percentage' ? '%' : 'ر.س'}
            </span>
            <button onClick={() => removeAddon(i)} className="p-1 text-[#555] hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <input value={newAddon.name} onChange={e => setNewAddon(p => ({ ...p, name: e.target.value }))}
            placeholder="اسم الإضافة *" className={inputCls} />
          <input value={newAddon.nameAr} onChange={e => setNewAddon(p => ({ ...p, nameAr: e.target.value }))}
            placeholder="الاسم بالعربية" className={inputCls} />
          <input type="number" value={newAddon.price} onChange={e => setNewAddon(p => ({ ...p, price: e.target.value }))}
            placeholder="السعر" className={inputCls} />
          <select value={newAddon.priceType} onChange={e => setNewAddon(p => ({ ...p, priceType: e.target.value as any }))}
            className={inputCls}>
            <option value="fixed">مبلغ ثابت</option>
            <option value="percentage">نسبة مئوية</option>
          </select>
        </div>
        <button onClick={addAddon} className="flex items-center gap-1.5 text-xs text-[#C8A96A] hover:text-[#d4b87a] transition-colors">
          <Plus size={13} /> إضافة
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSubmit} disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {isPending ? 'جاري الحفظ...' : 'حفظ الخدمة'}
        </button>
        <button onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#222] text-[#888] rounded-xl text-sm hover:text-[#F0E6D3] transition-colors">
          <X size={15} /> إلغاء
        </button>
      </div>
    </div>
  )
}
