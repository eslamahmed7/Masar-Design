'use client'

import { AboutHero } from './about-hero'
import { AboutPhilosophy } from './about-philosophy'
import { HowWeThink } from './how-we-think'
import { OurValues } from './our-values'
import { CreativeTools } from './creative-tools'
import { BehindEveryDesign } from './behind-every-design'
import { AboutGallery } from './about-gallery'
import { AboutCta } from './about-cta'
import { SmoothScroll } from '@/components/smooth-scroll'
import { SiteFooter } from '@/components/site-footer'

type ProjectImage = { src: string; alt: string }

export function AboutPageShell({ projectImages = [] }: { projectImages?: ProjectImage[] }) {
  return (
    <SmoothScroll>
      <main>
        <AboutHero />
        <AboutPhilosophy />
        <HowWeThink />
        <OurValues />
        <CreativeTools />
        <BehindEveryDesign />
        <AboutGallery projectImages={projectImages} />
        <AboutCta />
      </main>
      <SiteFooter />
    </SmoothScroll>
  )
}

