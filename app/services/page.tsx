import type { Metadata } from 'next'
import { SmoothScroll } from '@/components/smooth-scroll'
import { SiteFooter } from '@/components/site-footer'
import { ServicesHero } from '@/components/services/services-hero'
import { ServiceShowcase } from '@/components/services/service-showcase'
import { MasarJourney } from '@/components/services/masar-journey'
import { WhyMasar } from '@/components/services/why-masar'
import { ServicesFinalCta } from '@/components/services/services-final-cta'
import { getServiceShowcases } from '@/lib/services-page-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الخدمات | مسار للتصميم الداخلي',
  description:
    'خدمات مسار للتصميم الداخلي الفاخر — من التصميم الداخلي والمخططات ثنائية وثلاثية الأبعاد إلى المخططات التنفيذية واختيار الخامات وتنسيق الأثاث.',
}

export default async function ServicesPage() {
  const showcases = await getServiceShowcases()

  return (
    <SmoothScroll>
      <main className="relative bg-deep">
        <ServicesHero />

        {showcases.map((service, index) => (
          <ServiceShowcase key={service.id} service={service} index={index} />
        ))}

        <MasarJourney />
        <WhyMasar />
        <ServicesFinalCta />
      </main>
      <SiteFooter />
    </SmoothScroll>
  )
}
