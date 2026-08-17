import { getNewsletterSubscribers } from '@/lib/admin/actions'
import { NewsletterClient } from '@/components/admin/newsletter/newsletter-client'

export const metadata = {
  title: 'النشرة البريدية | مسار',
}

export const revalidate = 0

export default async function NewsletterPage() {
  const { subscribers, error } = await getNewsletterSubscribers()

  return <NewsletterClient initialSubscribers={subscribers || []} error={error} />
}
