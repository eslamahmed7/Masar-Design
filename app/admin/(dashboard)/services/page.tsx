import { getServices } from '@/lib/admin/actions'
import { ServicesClient } from '@/components/admin/services/services-client'

export const metadata = { title: 'الخدمات والأسعار — مسار' }

export default async function ServicesPage() {
  const { services } = await getServices()
  return <ServicesClient initialServices={services} />
}
