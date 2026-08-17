import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ServiceFormClient } from '@/components/admin/services/service-form-client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch service with its pricing and options
  const { data: service, error } = await supabase
    .from('services')
    .select('*, pricing:service_pricing(*), options:pricing_options(*)')
    .eq('id', id)
    .single()

  if (error || !service) {
    notFound()
  }

  // Format pricing object correctly if it's an array
  const formattedService = {
    ...service,
    pricing: Array.isArray(service.pricing) ? service.pricing[0] : service.pricing
  }

  return <ServiceFormClient initialData={formattedService} />
}
