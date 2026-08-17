'use server'

import { createClient } from '@/lib/supabase/server'
import type { DBCoupon } from '@/lib/admin/types'

export async function lookupCoupon(code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle()

  if (error || !data) return { valid: false, error: 'كود الخصم غير صالح.' }

  if (data.status !== 'active') {
    return { valid: false, error: 'كود الخصم غير نشط حالياً.' }
  }

  const now = new Date()
  // Add a buffer of 12 hours to prevent fresh coupons from being invalid due to timezone/clock mismatches
  const bufferTime = new Date(now.getTime() + 12 * 3600 * 1000)

  if (data.valid_from && new Date(data.valid_from) > bufferTime) {
    return { valid: false, error: 'لم يبدأ صلاحية هذا الكود بعد.' }
  }
  if (data.valid_until && new Date(data.valid_until) < now) {
    return { valid: false, error: 'انتهت صلاحية هذا الكود.' }
  }
  if (data.max_uses && data.current_uses >= data.max_uses) {
    return { valid: false, error: 'تم استنفاد عدد مرات استخدام هذا الكود.' }
  }

  return { valid: true, coupon: data as DBCoupon }
}

export async function incrementCouponUsage(code: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('coupons')
    .select('current_uses')
    .eq('code', code.toUpperCase().trim())
    .single()
  if (data) {
    await supabase
      .from('coupons')
      .update({ current_uses: (data.current_uses ?? 0) + 1 })
      .eq('code', code.toUpperCase().trim())
  }
}

export async function getActivePublicPromotion() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_promotions')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false })

  if (error || !data || data.length === 0) return null

  const now = new Date()
  // Add a 12-hour buffer in the future for start_date, and 12-hour buffer in the past for end_date to prevent timezone mismatches
  const startBuffer = new Date(now.getTime() + 12 * 3600 * 1000)
  const endBuffer = new Date(now.getTime() - 12 * 3600 * 1000)

  // Filter active promotions in JS to bypass Postgrest OR limitations
  const activePromo = data.find(promo => {
    const startValid = !promo.start_date || new Date(promo.start_date) <= startBuffer
    const endValid = !promo.end_date || new Date(promo.end_date) >= endBuffer
    return startValid && endValid
  })

  return activePromo ?? null
}
