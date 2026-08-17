'use server'

import { createClient } from '@/lib/supabase/server'

export interface MonthlyStat {
  month: string
  year: number
  orders: number
  revenue: number
}

export interface TopService {
  name: string
  count: number
  revenue: number
}

export interface TopCoupon {
  code: string
  usage_count: number
  total_discount: number
}

export interface CategoryStat {
  name: string
  name_ar: string | null
  count: number
}

export interface StyleStat {
  name: string
  name_ar: string | null
  count: number
}

export interface AnalyticsData {
  monthlyStats: MonthlyStat[]
  topServices: TopService[]
  topCoupons: TopCoupon[]
  topCategories: CategoryStat[]
  topStyles: StyleStat[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient()

  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString()

  const [
    { data: orders },
    { data: servicesData },
    { data: couponsData },
    { data: categoriesData },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('created_at, final_total, status, service_id, project_type, coupon_code, category_id')
      .gte('created_at', twelveMonthsAgo),
    supabase
      .from('orders')
      .select('service_id, final_total')
      .not('service_id', 'is', null),
    supabase
      .from('coupons')
      .select('code, current_uses'),
    supabase
      .from('orders')
      .select('project_type, final_total')
      .not('project_type', 'is', null),
  ])

  const o = orders ?? []
  const monthlyMap = new Map<string, MonthlyStat>()

  for (const order of o) {
    const d = new Date(order.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const existing = monthlyMap.get(key) ?? { month: key, year: d.getFullYear(), orders: 0, revenue: 0 }
    existing.orders++
    if (order.status === 'completed') {
      existing.revenue += order.final_total ?? 0
    }
    monthlyMap.set(key, existing)
  }

  const monthlyStats = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month))

  const serviceCount = new Map<string, { count: number; revenue: number }>()
  for (const s of servicesData ?? []) {
    const sid = s.service_id ?? 'unknown'
    const existing = serviceCount.get(sid) ?? { count: 0, revenue: 0 }
    existing.count++
    existing.revenue += s.final_total ?? 0
    serviceCount.set(sid, existing)
  }

  const topServices = Array.from(serviceCount.entries())
    .map(([id, data]) => ({ name: id, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topCoupons = (couponsData ?? [])
    .filter(c => c.current_uses > 0)
    .map(c => ({ code: c.code, usage_count: c.current_uses, total_discount: 0 }))
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 5)

  const categoryCount = new Map<string, { count: number }>()
  for (const cat of categoriesData ?? []) {
    const type = cat.project_type ?? 'unknown'
    const existing = categoryCount.get(type) ?? { count: 0 }
    existing.count++
    categoryCount.set(type, existing)
  }

  const topCategories = Array.from(categoryCount.entries())
    .map(([name, data]) => ({ name, name_ar: null, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    monthlyStats,
    topServices,
    topCoupons,
    topCategories,
    topStyles: [],
  }
}
