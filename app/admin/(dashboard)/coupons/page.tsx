import { getCoupons } from '@/lib/admin/actions'
import { CouponsClient } from '@/components/admin/coupons/coupons-client'

export const metadata = { title: 'كوبونات الخصم — مسار' }

export default async function CouponsPage() {
  const { coupons } = await getCoupons()
  return <CouponsClient initialCoupons={coupons} />
}
