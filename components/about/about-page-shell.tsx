'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LogoIntro } from './logo-intro'
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

const SESSION_KEY = 'masar_about_intro_seen'

type ProjectImage = { src: string; alt: string }

export function AboutPageShell({ projectImages = [] }: { projectImages?: ProjectImage[] }) {
  // Show intro only once per browser session
  const [showIntro, setShowIntro] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY)
    if (!seen) {
      setShowIntro(true)
    } else {
      setContentReady(true)
    }
  }, [])

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setShowIntro(false)
    setContentReady(true)
  }, [])

  return (
    <>
      {/* Logo intro — renders over everything, only first visit */}
      <AnimatePresence>{showIntro && <LogoIntro onComplete={handleIntroComplete} />}</AnimatePresence>

      {/* Page content fades in after intro */}
      <AnimatePresence>
        {contentReady && (
          <motion.div
            key="about-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
