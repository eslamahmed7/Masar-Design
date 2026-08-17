import type { Metadata } from 'next'
import { getAllFaqs, getAllFaqCategories } from '@/lib/admin/actions'
import { FaqsClient } from '@/components/admin/faqs/faqs-client'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | مسار Admin',
}

export default async function FaqsPage() {
  const [{ faqs }, { categories }] = await Promise.all([
    getAllFaqs(),
    getAllFaqCategories(),
  ])

  return <FaqsClient initialFaqs={faqs} initialCategories={categories} />
}
