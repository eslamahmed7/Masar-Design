import type { Metadata } from 'next'
import { SmoothScroll } from '@/components/smooth-scroll'
import { SiteFooter } from '@/components/site-footer'
import { ContactPageClient } from '@/components/contact/contact-page-client'
import { getContactMessageTypes, getFaqs, getFaqCategories } from '@/lib/admin/actions'

export const metadata: Metadata = {
  title: 'تواصل معنا | مسار للتصميم الداخلي',
  description:
    'تواصل مع فريق مسار للتصميم الداخلي الفاخر. نحن هنا للإجابة على استفساراتك واقتراحاتك.',
}

export default async function ContactPage() {
  const [{ types }, { faqs }, { categories }] = await Promise.all([
    getContactMessageTypes(),
    getFaqs(),
    getFaqCategories(),
  ])

  return (
    <SmoothScroll>
      <main className="relative bg-deep">
        <ContactPageClient
          messageTypes={types}
          faqs={faqs}
          faqCategories={categories}
        />
      </main>
      <SiteFooter />
    </SmoothScroll>
  )
}
