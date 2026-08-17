import { createClient } from '@/lib/supabase/server'
import { AnnouncementBanner } from './announcement-banner'

interface Row {
  id: string
  title: string | null
  title_ar: string | null
  banner_text: string | null
  banner_color: string | null
  discount_value: number | null
  discount_type: string | null
  end_date: string | null
  enable_countdown: boolean | null
}

export async function AnnouncementBannerServer() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('global_promotions')
      .select('id, title, title_ar, banner_text, banner_color, discount_value, discount_type, end_date, enable_countdown')
      .eq('is_active', true)
      .eq('show_banner', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)

    const promotions = (data ?? []).map((p: Row) => ({
      id: p.id,
      title: p.title ?? '',
      title_ar: p.title_ar,
      banner_text: p.banner_text,
      banner_color: p.banner_color ?? '#C8A96A',
      discount_value: p.discount_value ?? 0,
      discount_type: p.discount_type ?? '',
      end_date: p.end_date,
      enable_countdown: p.enable_countdown ?? false,
    }))

    if (!promotions.length) return null
    return <AnnouncementBanner promotions={promotions} />
  } catch {
    return null
  }
}
