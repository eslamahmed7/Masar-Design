import { redirect } from 'next/navigation'
import { getAdminUser, getUnreadContactMessagesCount, getUnreadOrdersCount } from '@/lib/admin/actions'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [admin, unreadContactMessages, unreadOrders] = await Promise.all([
    getAdminUser(),
    getUnreadContactMessagesCount(),
    getUnreadOrdersCount(),
  ])
  if (!admin) redirect('/admin/login')

  return (
    <AdminShell admin={admin} unreadContactMessages={unreadContactMessages} unreadOrders={unreadOrders}>
      {children}
    </AdminShell>
  )
}
