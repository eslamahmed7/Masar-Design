import { getDashboardStats, getAdminProjects } from '@/lib/admin/actions'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

export const metadata = { title: 'لوحة التحكم — مسار' }

export default async function DashboardHomePage() {
  const [stats, { projects }] = await Promise.all([
    getDashboardStats(),
    getAdminProjects({ pageSize: 5 }),
  ])
  return <AdminDashboardClient stats={stats} recentProjects={projects} />
}
