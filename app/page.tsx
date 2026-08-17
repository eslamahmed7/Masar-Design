import { SmoothScroll } from '@/components/smooth-scroll'
import { HeroSection } from '@/components/hero-section'
import { AboutSection } from '@/components/about-section'
import { ProjectsSection } from '@/components/projects-section'
import { ServicesSection } from '@/components/services-section'
import { CtaSection } from '@/components/cta-section'
import { SiteFooter } from '@/components/site-footer'
import { getProjects } from '@/lib/projects'
import { getServices } from '@/lib/services'
import { getHeroSettings } from '@/lib/admin/hero-actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [projects, services, hero] = await Promise.all([
    getProjects(),
    getServices(),
    getHeroSettings(),
  ])

  return (
    <SmoothScroll>
      <main className="relative bg-background">
        <HeroSection hero={hero} />
        <AboutSection />
        <ProjectsSection projects={projects} />
        <ServicesSection services={services} />
        <CtaSection />
      </main>
      <SiteFooter />
    </SmoothScroll>
  )
}
