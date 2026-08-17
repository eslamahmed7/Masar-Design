import { getOrders } from '@/lib/admin/actions'
import { OrdersClient } from '@/components/admin/orders/orders-client'

export const metadata = { title: 'الطلبات — مسار' }

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams
  const { orders, total } = await getOrders({
    status: sp.status,
    search: sp.search,
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 25,
  })
  return <OrdersClient initialOrders={orders} total={total} />
}
