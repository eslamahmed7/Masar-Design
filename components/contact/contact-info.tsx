'use client'

import { motion } from 'motion/react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useI18n } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

// ─── Icons ────────────────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function MapPinIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

// ─── Social icons ─────────────────────────────────────────────────────────────
const SOCIAL_PATHS: Record<string, string> = {
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  behance:
    'M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.69.75-.63.152-1.295.235-1.99.235H0V4.51l6.938-.007zm-.094 4.552H3.33v2.858h3.294c.423 0 .784-.095 1.083-.293.3-.196.45-.535.45-1.02 0-.54-.15-.91-.46-1.11-.308-.204-.7-.306-1.173-.306v-.13zM15.49 5.43c.9 0 1.71.15 2.43.46.73.31 1.343.74 1.843 1.3.5.56.876 1.22 1.126 1.99.25.77.376 1.62.376 2.55v1.34H14.23c.04.87.325 1.56.85 2.07.52.51 1.23.77 2.12.77.64 0 1.2-.14 1.67-.43.47-.28.79-.62.96-1.02h3.29c-.5 1.44-1.27 2.5-2.33 3.17-1.07.67-2.37 1-3.91 1-1.1 0-2.09-.19-2.97-.57-.88-.38-1.62-.92-2.24-1.6-.62-.68-1.1-1.5-1.43-2.43-.33-.94-.5-1.97-.5-3.1 0-1.08.17-2.09.51-3.02.34-.93.83-1.74 1.47-2.43.64-.68 1.4-1.22 2.3-1.6.9-.38 1.9-.57 3-.57zm.21 2.55c-.78 0-1.43.23-1.93.68-.5.45-.81 1.07-.94 1.87h5.6c-.07-.82-.35-1.45-.84-1.89-.48-.44-1.11-.66-1.89-.66zM14.9 3.6H20v1.71H14.9V3.6z',
  pinterest:
    'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z',
}

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  value: string
  href?: string
  delay: number
}

function InfoCard({ icon, title, value, href, delay }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      whileHover={{ y: -6, boxShadow: '0 20px 60px oklch(0.81 0.12 84 / 0.18)' }}
      className="group relative overflow-hidden rounded-[24px] border border-border bg-card/40 p-7 backdrop-blur-md transition-all duration-500 hover:border-gold/40"
    >
      {/* Light sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -right-1/3 w-1/3 skew-x-12 bg-white/8 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
      />
      {/* Gold glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(201,168,106,0.08) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold transition-all duration-300 group-hover:border-gold/50 group-hover:bg-gold/15">
        {icon}
      </div>
      <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground">{title}</p>
      {href ? (
        <a
          href={href}
          className="block text-base font-medium text-foreground/90 transition-colors duration-300 group-hover:text-gold"
        >
          {value}
        </a>
      ) : (
        <p className="text-base font-medium leading-relaxed text-foreground/90">{value}</p>
      )}
    </motion.div>
  )
}

// ─── Social section ───────────────────────────────────────────────────────────
const EXTRA_SOCIAL = [
  { label: 'Pinterest', href: 'https://pinterest.com/', icon: 'pinterest' },
]

function SocialButton({
  icon,
  label,
  href,
  delay,
}: {
  icon: string
  label: string
  href: string
  delay: number
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      whileHover={{
        rotate: 8,
        scale: 1.12,
        boxShadow: '0 0 28px oklch(0.81 0.12 84 / 0.35)',
      }}
      whileTap={{ scale: 0.94 }}
      className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 backdrop-blur-sm transition-all duration-400 hover:border-gold/60 hover:bg-gold/10"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-muted-foreground transition-colors duration-300 group-hover:fill-gold"
        aria-hidden
      >
        <path d={SOCIAL_PATHS[icon] ?? ''} />
      </svg>
    </motion.a>
  )
}

// ─── Map placeholder ──────────────────────────────────────────────────────────
function MapSection() {
  const { t, lang } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.9, ease: EASE }}
      className="mt-16 overflow-hidden rounded-3xl border border-border shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
    >
      {/* Map header bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
            <MapPinIconSmall />
          </div>
          <span className="text-sm font-medium text-foreground/80">{lang === 'ar' ? SITE_CONFIG.contact.address : SITE_CONFIG.contact.addressEn}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">MASAR Studio</span>
      </div>
      {/* Map embed placeholder */}
      <div className="relative h-[360px] w-full bg-surface-4">
        {/* Blueprint grid background */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
          <defs>
            <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0 H0 V60" fill="none" stroke="rgba(201,168,106,0.8)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>

        {/* Concentric location rings */}
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          {[120, 90, 60].map((r, i) => (
            <motion.div
              key={r}
              animate={{ opacity: [0.08, 0.25, 0.08], scale: [1, 1.04, 1] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
              className="absolute rounded-full border border-gold"
              style={{ width: r * 2, height: r * 2 }}
            />
          ))}
          {/* Center pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold bg-gold/20 shadow-[0_0_30px_oklch(0.81_0.12_84/0.5)]">
              <MapPinIconSmall />
            </div>
            <div className="mt-2 rounded-full border border-gold/30 bg-card/80 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-medium text-gold">{t('contactInfo.studioName')}</span>
            </div>
          </div>
        </div>

        {/* Overlay text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-muted-foreground/60">
            {t('contactInfo.mapHint')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MapPinIconSmall() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ContactInfo() {
  const { t, lang } = useI18n()
  const { contact, social } = SITE_CONFIG
  const allSocial = [...social, ...EXTRA_SOCIAL]

  return (
    <section
      className="relative overflow-hidden bg-deep px-6 py-28 md:px-12"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background radial */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 40% at 50% 0%, rgba(201,168,106,0.05) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-4 font-mono text-xs uppercase tracking-[0.45em] text-gold/70"
          >
            {t('contactInfo.label')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-heading text-4xl font-bold text-foreground text-balance md:text-5xl"
          >
            {t('contactInfo.heading')}
          </motion.h2>
        </div>

        {/* Info cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={<PhoneIcon />}
            title={t('contactInfo.phone')}
            value={contact.phone}
            href={contact.phoneHref}
            delay={0}
          />
          <InfoCard
            icon={<MailIcon />}
            title={t('contactInfo.email')}
            value={contact.email}
            href={contact.emailHref}
            delay={0.1}
          />
          <InfoCard
            icon={<ClockIcon />}
            title={t('contactInfo.hours')}
            value={lang === 'ar' ? contact.hours : contact.hoursEn}
            delay={0.2}
          />
          <InfoCard
            icon={<MapPinIcon />}
            title={t('contactInfo.location')}
            value={lang === 'ar' ? contact.address : contact.addressEn}
            delay={0.3}
          />
        </div>

        {/* Social media */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground"
          >
            {t('contactInfo.followUs')}
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {allSocial.map((s, i) => (
              <SocialButton
                key={s.icon}
                icon={s.icon}
                label={s.label}
                href={s.href}
                delay={i * 0.06}
              />
            ))}
          </div>
        </div>

        {/* Map */}
        <MapSection />
      </div>
    </section>
  )
}
