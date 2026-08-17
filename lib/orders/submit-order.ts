'use server'

import { createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from './order-number'
import { uploadImage } from '@/lib/cloudinary'

export interface OrderFormInput {
  projectType: string
  projectName: string
  city: string
  country: string
  area: string
  clientName: string
  mobile: string
  whatsapp: string
  email: string
  styles: string[]
  communication: string[]
  serviceId?: string | null
  subtotal?: number | null
  finalTotal?: number | null
  couponCode?: string | null
  couponDiscountValue?: number
  globalDiscountValue?: number
  globalDiscountPct?: number
  pricePerSqm?: number | null
  currency?: string
  uploadedFiles?: { name: string; url: string }[]
  servicesBreakdown?: string
}

export async function uploadOrderFile(formData: FormData) {
  try {
    const file = formData.get('file') as File | null
    if (!file) return { error: 'No file provided' }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`
    
    const res = await uploadImage(base64, { folder: 'masar/orders' })
    return { url: res.secure_url }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function submitOrder(input: OrderFormInput) {
  const supabase = await createClient()
  const orderNumber = await generateOrderNumber(supabase)

  const { data, error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    customer_name: input.clientName || '',
    customer_phone: input.mobile || '',
    customer_email: input.email || '',
    country: input.country || 'SA',
    project_name: input.projectName || null,
    project_type: input.projectType || null,
    city: input.city || null,
    project_area: input.area ? Number(input.area) : null,
    service_id: input.serviceId || null,
    subtotal: input.subtotal || null,
    final_total: input.finalTotal || null,
    coupon_code: input.couponCode || null,
    coupon_discount_value: input.couponDiscountValue || 0,
    global_discount_value: input.globalDiscountValue || 0,
    global_discount_pct: input.globalDiscountPct || 0,
    price_per_sqm: input.pricePerSqm || null,
    project_notes: [
      input.whatsapp ? `رقم الواتساب: ${input.whatsapp}` : '',
      input.styles.length ? `أنماط التصميم: ${input.styles.join('، ')}` : '',
      input.communication.length ? `وسائل التواصل: ${input.communication.join('، ')}` : '',
      input.servicesBreakdown ? `الخدمات المطلوبة:\n${input.servicesBreakdown}` : '',
    ].filter(Boolean).join('\n\n') || null,
    uploaded_files: input.uploadedFiles?.length ? input.uploadedFiles : null,
    status: 'pending',
    payment_status: 'unpaid',
    currency: input.currency || 'SAR',
  }).select().single()

  if (error) return { error: error.message }

  await supabase.from('order_timeline').insert({
    order_id: data.id,
    action: 'created',
    label: 'تم إنشاء الطلب عبر الموقع',
    actor_name: 'زائر الموقع',
  })

  return { orderId: data.id, orderNumber: data.order_number }
}
