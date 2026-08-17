import { getSettings } from '@/lib/admin/settings-actions'
import { SettingsClient } from '@/components/admin/settings/settings-client'

export const metadata = { title: 'الإعدادات — مسار' }

export default async function SettingsPage() {
  const settings = await getSettings()
  return <SettingsClient initialSettings={settings} />
}
