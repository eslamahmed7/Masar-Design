'use server'

import { createClient } from '@/lib/supabase/server'
import type { DBSettings } from './types'

export async function getSettings(): Promise<DBSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle()
  return data as DBSettings | null
}

export async function updateSettings(input: Partial<DBSettings>) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('settings').select('id').limit(1).maybeSingle()

  const { data: { user } } = await supabase.auth.getUser()
  const payload = { ...input, updated_by: user?.id ?? null }

  let result
  if (existing) {
    result = await supabase.from('settings').update(payload).eq('id', existing.id).select().single()
  } else {
    result = await supabase.from('settings').insert(payload).select().single()
  }

  if (result.error) return { error: result.error.message }
  return { settings: result.data as DBSettings }
}
