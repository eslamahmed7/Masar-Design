'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DBHeroSettings } from './types'

// ── Hero Settings CRUD ────────────────────────────────────────────────────────

export async function getHeroSettings(): Promise<DBHeroSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hero_settings')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  return data as DBHeroSettings | null
}

export async function updateHeroSettings(
  input: Partial<DBHeroSettings>
): Promise<{ hero?: DBHeroSettings; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: existing } = await supabase
    .from('hero_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  }

  let result
  if (existing) {
    result = await supabase
      .from('hero_settings')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('hero_settings')
      .insert(payload)
      .select()
      .single()
  }

  if (result.error) return { error: result.error.message }

  revalidatePath('/', 'layout')
return { hero: result.data as DBHeroSettings }
}
