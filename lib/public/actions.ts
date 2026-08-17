'use server'

import { createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/orders/order-number'

export async function validateCouponCode(
  code: string,
  orderValue?: number
): Promise<{ valid: boolean; error?: string; data?: { discount_type: string; discount_value: number; max_discount: number | null; code: string } }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('validate_coupon_code', { code })

    if (error) return { valid: false, error: 'فشل التحقق من الكود.' }

    const result = data as {
      valid: boolean
      error?: string
      discount_type: string
      discount_value: number
      max_discount: number | null
      min_order_value: number | null
      code: string
    }

    if (!result.valid) return { valid: false, error: result.error || 'كود الخصم غير صالح.' }

    if (result.min_order_value && orderValue && orderValue < result.min_order_value) {
      return { valid: false, error: `الحد الأدنى للطلب ${result.min_order_value} جنيه.` }
    }

    return {
      valid: true,
      data: {
        discount_type: result.discount_type,
        discount_value: result.discount_value,
        max_discount: result.max_discount,
        code: result.code,
      },
    }
  } catch {
    return { valid: false, error: 'حدث خطأ أثناء التحقق من الكود.' }
  }
}

export async function submitContactOrder(input: {
  name: string
  email: string
  phone: string
  contactMethod: string
  projectType: string
  city: string
  country: string
  budget: string
  style: string
  delivery: string
  description: string
  serviceId: string | null
  serviceName: string
  area: string
  pricePerSqm: string
  subtotal: string
  promotionDiscount: string
  couponCode: string
  couponDiscount: string
  finalTotal: string
}) {
  try {
    const supabase = await createClient()
    const orderNumber = await generateOrderNumber(supabase)

    const areaNum = parseFloat(input.area) || 0
    const priceSqm = parseFloat(input.pricePerSqm) || 0
    const sub = parseFloat(input.subtotal) || 0
    const promo = parseFloat(input.promotionDiscount) || 0
    const coup = parseFloat(input.couponDiscount) || 0
    const total = parseFloat(input.finalTotal) || 0

    const notes = [
      `طريقة التواصل: ${input.contactMethod}`,
      input.budget ? `الميزانية: ${input.budget}` : '',
      input.delivery ? `وقت التسليم: ${input.delivery}` : '',
      input.description ? `الوصف: ${input.description}` : '',
    ].filter(Boolean).join('\n')

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: input.name,
        customer_email: input.email,
        customer_phone: input.phone,
        project_type: input.projectType || null,
        city: input.city || null,
        country: input.country || 'EG',
        service_id: input.serviceId || null,
        project_area: areaNum || null,
        price_per_sqm: priceSqm || null,
        subtotal: sub || null,
        global_discount_value: promo || 0,
        coupon_code: input.couponCode || null,
        coupon_discount_value: coup || 0,
        final_total: total || null,
        currency: 'EGP',
        project_notes: notes || null,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select('id')
      .single()

    if (error) return { error: error.message }

    await supabase.from('order_timeline').insert({
      order_id: order.id,
      action: 'created',
      label: 'تم إنشاء الطلب عبر الموقع',
      actor_name: input.name,
    })

    return { success: true, orderId: order.id, orderNumber }
  } catch {
    return { error: 'حدث خطأ أثناء إرسال الطلب.' }
  }
}
