'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSettings } from '@/lib/admin/settings-actions'
import type { DBSettings } from '@/lib/admin/types'

interface Props {
  initialSettings: DBSettings | null
}

export function SettingsClient({ initialSettings }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    company_name: initialSettings?.company_name ?? '',
    company_name_ar: initialSettings?.company_name_ar ?? '',
    phone: initialSettings?.phone ?? '',
    email: initialSettings?.email ?? '',
    address: initialSettings?.address ?? '',
    address_ar: initialSettings?.address_ar ?? '',
    working_hours: initialSettings?.working_hours ?? '',
    working_hours_ar: initialSettings?.working_hours_ar ?? '',
    google_maps_url: initialSettings?.google_maps_url ?? '',
    default_currency: initialSettings?.default_currency ?? 'SAR',
    price_unit: initialSettings?.price_unit ?? '',
    seo_title: initialSettings?.seo_title ?? '',
    seo_description: initialSettings?.seo_description ?? '',
  })

  const handleSave = async () => {
    setSaving(true)
    await updateSettings(form)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">الإعدادات</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-gold px-5 py-2 text-sm font-medium text-[#0B0B0B] transition-all hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="معلومات الشركة">
          <Field label="اسم الشركة (إنجليزي)" value={form.company_name} onChange={v => setForm(f => ({ ...f, company_name: v }))} />
          <Field label="اسم الشركة (عربي)" value={form.company_name_ar} onChange={v => setForm(f => ({ ...f, company_name_ar: v }))} />
          <Field label="رقم الهاتف" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <Field label="البريد الإلكتروني" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="العنوان (إنجليزي)" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
          <Field label="العنوان (عربي)" value={form.address_ar} onChange={v => setForm(f => ({ ...f, address_ar: v }))} />
        </Section>

        <Section title="ساعات العمل">
          <Field label="ساعات العمل (إنجليزي)" value={form.working_hours} onChange={v => setForm(f => ({ ...f, working_hours: v }))} />
          <Field label="ساعات العمل (عربي)" value={form.working_hours_ar} onChange={v => setForm(f => ({ ...f, working_hours_ar: v }))} />
          <Field label="رابط Google Maps" value={form.google_maps_url} onChange={v => setForm(f => ({ ...f, google_maps_url: v }))} />
        </Section>

        <Section title="العملة والتسعير">
          <Field label="العملة الافتراضية" value={form.default_currency} onChange={v => setForm(f => ({ ...f, default_currency: v }))} />
          <Field label="وحدة السعر" value={form.price_unit} onChange={v => setForm(f => ({ ...f, price_unit: v }))} />
        </Section>

        <Section title="SEO">
          <Field label="Meta Title" value={form.seo_title} onChange={v => setForm(f => ({ ...f, seo_title: v }))} />
          <Field label="Meta Description" value={form.seo_description} onChange={v => setForm(f => ({ ...f, seo_description: v }))} isTextarea />
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#C8A96A]/10 bg-[#1A1916] p-5">
      <h2 className="mb-4 text-sm font-bold text-gold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({
  label, value, onChange, isTextarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void; isTextarea?: boolean
}) {
  const cls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold/50'
  return (
    <div>
      <label className="mb-1 block text-xs text-foreground/50">{label}</label>
      {isTextarea ? (
        <textarea className={cls + ' min-h-[80px] resize-y'} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}
