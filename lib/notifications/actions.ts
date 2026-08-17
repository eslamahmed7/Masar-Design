'use server'

import { createClient } from '@/lib/supabase/server'
import type { DBNotification } from '@/lib/admin/types'

export async function createNotification(input: {
  user_id?: string | null
  type: string
  title: string
  title_ar: string
  message?: string | null
  message_ar?: string | null
  link?: string | null
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('notifications').insert({
    user_id: input.user_id ?? null,
    type: input.type,
    title: input.title,
    title_ar: input.title_ar,
    message: input.message ?? null,
    message_ar: input.message_ar ?? null,
    link: input.link ?? null,
    is_read: false,
  }).select().single()

  if (error) return { error: error.message }
  return { notification: data as DBNotification }
}

export async function getNotifications(opts?: {
  limit?: number
  unreadOnly?: boolean
}) {
  const supabase = await createClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 50)

  if (opts?.unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) return { notifications: [], error: error.message }
  return { notifications: (data ?? []) as DBNotification[] }
}

export async function getUnreadCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  return { count: count ?? 0 }
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
}

export async function deleteNotification(id: string) {
  const supabase = await createClient()
  await supabase.from('notifications').delete().eq('id', id)
}
