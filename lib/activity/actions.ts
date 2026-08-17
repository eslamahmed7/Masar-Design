'use server'

import { createClient } from '@/lib/supabase/server'
import type { DBActivityLog } from '@/lib/admin/types'

export async function logActivity(input: {
  admin_id?: string | null
  admin_name?: string | null
  action: string
  action_label: string
  target_type: string
  target_id?: string | null
  metadata?: Record<string, unknown> | null
  ip_address?: string | null
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('activity_logs').insert({
    admin_id: input.admin_id ?? null,
    admin_name: input.admin_name ?? null,
    action: input.action,
    action_label: input.action_label,
    target_type: input.target_type,
    target_id: input.target_id ?? null,
    metadata: input.metadata ?? null,
    ip_address: input.ip_address ?? null,
  }).select().single()

  if (error) return { error: error.message }
  return { log: data as DBActivityLog }
}

export async function getActivityLogs(opts?: {
  limit?: number
  offset?: number
  targetType?: string
  action?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(opts?.offset ?? 0, (opts?.offset ?? 0) + (opts?.limit ?? 50) - 1)

  if (opts?.targetType) query = query.eq('target_type', opts.targetType)
  if (opts?.action) query = query.eq('action', opts.action)

  const { data, error, count } = await query
  if (error) return { logs: [], total: 0, error: error.message }
  return { logs: (data ?? []) as DBActivityLog[], total: count ?? 0 }
}

export async function getRecentActivity(limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as DBActivityLog[]
}
