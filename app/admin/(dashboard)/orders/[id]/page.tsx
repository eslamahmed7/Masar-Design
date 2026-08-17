import { getOrder, getOrderNotes, getOrderTimeline } from '@/lib/admin/actions'
import { OrderDetailClient } from '@/components/admin/orders/order-detail-client'
import { notFound } from 'next/navigation'

export const metadata = { title: 'تفاصيل الطلب — مسار' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const [order, notes, timeline] = await Promise.all([
    getOrder(id),
    getOrderNotes(id),
    getOrderTimeline(id),
  ])
  if (!order) notFound()
  
  return <OrderDetailClient order={order} initialNotes={notes} initialTimeline={timeline} />
}
