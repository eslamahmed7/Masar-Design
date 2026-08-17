'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { ContactHero } from './contact-hero'
import { ContactMethods } from './contact-methods'
import { ContactCommsForm } from './contact-comms-form'
import { ContactSuccess } from './contact-success'
import { FaqSection } from './faq-section'
import type { DBContactMessageType, DBFaq, DBFaqCategory } from '@/lib/admin/types'

interface Props {
  messageTypes: DBContactMessageType[]
  faqs: DBFaq[]
  faqCategories: DBFaqCategory[]
}

export function ContactPageClient({ messageTypes, faqs, faqCategories }: Props) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <ContactHero />

      <AnimatePresence mode="wait">
        {submitted ? (
          <ContactSuccess key="success" onReset={() => setSubmitted(false)} />
        ) : (
          <>
            <ContactMethods />
            <div id="contact-form">
              <ContactCommsForm
                messageTypes={messageTypes}
                onSuccess={() => setSubmitted(true)}
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* FAQ always visible below */}
      {!submitted && (
        <>
          {/* Luxury divider */}
          <div className="mx-auto max-w-xs px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </div>
          <FaqSection faqs={faqs} categories={faqCategories} />
        </>
      )}
    </>
  )
}
