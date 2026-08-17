import { getGlobalPromotions } from '@/lib/admin/actions'
import { PromotionsClient } from '@/components/admin/promotions/promotions-client'

export const metadata = { title: 'العروض العامة — مسار' }

export default async function PromotionsPage() {
  const { promotions } = await getGlobalPromotions()
  return <PromotionsClient initialPromotions={promotions} />
}
