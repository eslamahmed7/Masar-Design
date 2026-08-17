'use client'

import { motion } from 'motion/react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

function PhoneIcon() {
  return (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}
function WhatsappIcon() {
  return (
    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}
function MailIcon() {
  return (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}
function MapPinIcon() {
  return (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

interface ContactMethodCardProps {
  icon: React.ReactNode
  title: string
  description: string
  value: string
  buttonLabel: string
  href: string
  index: number
}

function ContactMethodCard({ icon, title, description, value, buttonLabel, href, index }: ContactMethodCardProps) {
  return (
    <motion.a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative flex flex-col gap-3 sm:gap-5 rounded-xl sm:rounded-2xl border border-gold/10 bg-surface/50 p-3 sm:p-7 backdrop-blur-sm transition-all duration-500 hover:border-gold/30 hover:bg-surface/60 hover:shadow-[0_0_40px_rgba(200,169,106,0.08)]"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(40% 40% at 50% 0%, rgba(200,169,106,0.07) 0%, transparent 100%)' }}
      />

      {/* Icon */}
      <div className="flex h-8 w-8 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl border border-gold/20 bg-gold/8 text-gold transition-all duration-300 group-hover:border-gold/40 group-hover:bg-gold/12 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-7 sm:[&>svg]:w-7">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 sm:space-y-1.5">
        <h3 className="font-heading text-xs sm:text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-[8px] sm:text-sm text-foreground/50 leading-relaxed line-clamp-3 sm:line-clamp-none">{description}</p>
        <p className="font-mono text-[9px] sm:text-sm text-gold/80 mt-1 sm:mt-2">{value}</p>
      </div>

      {/* Button */}
      <div className="inline-flex items-center gap-1 sm:gap-2 self-start rounded-full border border-gold/25 px-3 py-1 sm:px-5 sm:py-2 text-[8px] sm:text-sm font-medium text-gold transition-all duration-300 group-hover:border-gold/50 group-hover:bg-gold/8">
        {buttonLabel}
        <svg className="h-2 w-2 sm:h-3.5 sm:w-3.5 rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </motion.a>
  )
}

export function ContactMethods() {
  const { t, lang } = useI18n()
  const contact = SITE_CONFIG.contact

  const methods = [
    {
      icon: <PhoneIcon />,
      title: t('contact.call.title'),
      description: t('contact.call.desc'),
      value: contact.phone,
      buttonLabel: t('contact.call.btn'),
      href: contact.phoneHref,
    },
    {
      icon: <WhatsappIcon />,
      title: t('contact.whatsapp.title'),
      description: t('contact.whatsapp.desc'),
      value: contact.phone,
      buttonLabel: t('contact.whatsapp.btn'),
      href: `https://wa.me/${contact.phone.replace(/\D/g, '')}`,
    },
    {
      icon: <MailIcon />,
      title: t('contact.email.title'),
      description: t('contact.email.desc'),
      value: contact.email,
      buttonLabel: t('contact.email.btn'),
      href: contact.emailHref,
    },
    {
      icon: <MapPinIcon />,
      title: t('contact.location.title'),
      description: t('contact.location.desc'),
      value: lang === 'ar' ? contact.address : contact.addressEn,
      buttonLabel: t('contact.location.btn'),
      href: 'https://maps.google.com',
    },
  ]

  return (
    <section className="relative py-10 sm:py-24 px-2 sm:px-6 md:px-12 lg:px-24" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background accent */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(60% 40% at 50% 50%, rgba(200,169,106,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 text-center"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-gold/60">
            {t('contact.methodsLabel')}
          </p>
          <h2 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
            {t('contact.methodsHeading')}
          </h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {methods.map((method, i) => (
            <ContactMethodCard key={method.title} {...method} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
