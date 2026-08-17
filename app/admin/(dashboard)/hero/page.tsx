import { getHeroSettings } from '@/lib/admin/hero-actions'
import { HeroSettingsClient } from '@/components/admin/hero/hero-settings-client'

export const metadata = { title: 'إعدادات الهيرو — مسار' }

export default async function HeroSettingsPage() {
  const hero = await getHeroSettings()
  return <HeroSettingsClient initialHero={hero} />
}
