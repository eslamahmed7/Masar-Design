import { getDesignStyles } from '@/lib/admin/actions'
import { StylesClient } from '@/components/admin/categories/styles-client'

export const metadata = { title: 'أنماط التصميم — مسار' }

export default async function StylesPage() {
  const { styles } = await getDesignStyles()
  return <StylesClient initialStyles={styles} />
}
