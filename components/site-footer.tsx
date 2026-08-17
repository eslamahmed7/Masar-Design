'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useI18n } from '@/lib/i18n'

// ─── Social icons SVG paths ───────────────────────────────────────────────────
const SOCIAL_PATHS: Record<string, string> = {
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  behance:
    'M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.69.75-.63.152-1.295.235-1.99.235H0V4.51l6.938-.007zm-.094 4.552H3.33v2.858h3.294c.423 0 .784-.095 1.083-.293.3-.196.45-.535.45-1.02 0-.54-.15-.91-.46-1.11-.308-.204-.7-.306-1.173-.306v-.13zM15.49 5.43c.9 0 1.71.15 2.43.46.73.31 1.343.74 1.843 1.3.5.56.876 1.22 1.126 1.99.25.77.376 1.62.376 2.55v1.34H14.23c.04.87.325 1.56.85 2.07.52.51 1.23.77 2.12.77.64 0 1.2-.14 1.67-.43.47-.28.79-.62.96-1.02h3.29c-.5 1.44-1.27 2.5-2.33 3.17-1.07.67-2.37 1-3.91 1-1.1 0-2.09-.19-2.97-.57-.88-.38-1.62-.92-2.24-1.6-.62-.68-1.1-1.5-1.43-2.43-.33-.94-.5-1.97-.5-3.1 0-1.08.17-2.09.51-3.02.34-.93.83-1.74 1.47-2.43.64-.68 1.4-1.22 2.3-1.6.9-.38 1.9-.57 3-.57zm.21 2.55c-.78 0-1.43.23-1.93.68-.5.45-.81 1.07-.94 1.87h5.6c-.07-.82-.35-1.45-.84-1.89-.48-.44-1.11-.66-1.89-.66zM14.9 3.6H20v1.71H14.9V3.6z',
}

function SocialIcon({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.12, rotate: 6 }}
      whileTap={{ scale: 0.94 }}
      className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/50 backdrop-blur-sm transition-all duration-400 hover:border-gold/60 hover:bg-gold/10 hover:shadow-[0_0_22px_oklch(0.81_0.12_84/0.3)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-muted-foreground transition-colors duration-300 group-hover:fill-gold"
        aria-hidden
      >
        <path d={SOCIAL_PATHS[icon] ?? ''} />
      </svg>
    </motion.a>
  )
}

// ─── Glass contact card ───────────────────────────────────────────────────────
function ContactCard({
  icon,
  label,
  value,
  href,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px oklch(0.81 0.12 84 / 0.18)' }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-3 sm:p-4 backdrop-blur-md transition-all duration-400 hover:border-gold/40"
    >
      {/* light sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/10 opacity-0 transition-opacity group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
      />
      <div className="mb-1.5 sm:mb-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
        {icon}
      </div>
      <p className="mb-0.5 text-[10px] sm:text-xs text-muted-foreground">{label}</p>
      {href ? (
        <a href={href} className="text-[11px] sm:text-sm font-medium text-foreground/90 transition-colors hover:text-gold break-all">
          {value}
        </a>
      ) : (
        <p className="text-[11px] sm:text-sm font-medium text-foreground/90">{value}</p>
      )}
    </motion.div>
  )
}

import { subscribeToNewsletter } from '@/lib/admin/actions'

// ─── Newsletter block ─────────────────────────────────────────────────────────
function NewsletterBlock() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { t, dir } = useI18n()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMessage('')
    
    const res = await subscribeToNewsletter(email)
    if (res.error) {
      setErrorMessage(res.error)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-[oklch(0.13_0.005_60)]"
      aria-label={t('footer.newsletterAria')}
      dir={dir}
    >
      {/* top gold line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-3 font-sans text-xs tracking-[0.38em] text-gold"
        >
          {t('footer.newsletter')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          {t('footer.newsletterTitle')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-muted-foreground"
        >
          {t('footer.newsletterDesc')}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          {status === 'success' ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-base text-gold"
            >
              {t('footer.newsletterSuccess')}
            </motion.p>
          ) : (
            <>
              <div className="relative w-full sm:w-80 flex flex-col gap-2">
                <input
                  type="email"
                  required
                  disabled={status === 'loading'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  dir={dir}
                  className="w-full rounded-full border border-border bg-card/60 px-6 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur-md transition-all focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-50"
                />
                {status === 'error' && (
                  <p className="text-sm text-red-500 absolute -bottom-6 w-full text-center">{errorMessage}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative overflow-hidden rounded-full border border-gold/50 bg-gradient-to-l from-gold/25 to-gold/10 px-8 py-3.5 text-sm font-medium text-gold backdrop-blur-sm transition-all hover:border-gold/80 hover:shadow-[0_0_28px_oklch(0.81_0.12_84/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 group-hover:animate-[light-sweep_0.9s_ease-out] group-hover:opacity-100"
                />
                <span className="relative z-10">{status === 'loading' ? t('footer.newsletterLoading') : t('footer.newsletterSubscribe')}</span>
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  )
}

// ─── Footer background layers ─────────────────────────────────────────────────
function FooterBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* noise */}
      <div className="noise-layer absolute inset-0 opacity-[0.03]" />
      {/* radial glow */}
      <div
        className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-30"
        style={{ background: 'radial-gradient(ellipse, oklch(0.81 0.12 84 / 0.08) 0%, transparent 70%)' }}
      />
      {/* blueprint grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice">
        <g stroke="var(--gold)" strokeWidth="0.5" fill="none">
          {[70, 140, 210, 280, 350, 420, 490, 560, 630].map((y) => (
            <line key={y} x1="0" y1={y} x2="1400" y2={y} />
          ))}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="700" />
          ))}
        </g>
      </svg>
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 100%, transparent 40%, oklch(0.08 0.004 60 / 0.7) 100%)' }}
      />
    </div>
  )
}

// ─── Column stagger wrapper ───────────────────────────────────────────────────
function Col({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Icon components ─────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}
function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}
function MapPinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ─── Main Footer ─────────────────────────────────────────────────────────────
export function SiteFooter() {
  const [isMounted, setIsMounted] = useState(false)
  const { contact, social, nav, services, brand } = SITE_CONFIG
  const { t, dir, lang } = useI18n()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-96" />

  return (
    <>
      <NewsletterBlock />

      <footer
        className="relative overflow-hidden bg-[oklch(0.10_0.005_60)] pb-8 pt-20"
        dir={dir}
        role="contentinfo"
        aria-label={t('footer.footerAria')}
      >
        <FooterBackground />

        {/* top gold rule */}
        <div className="absolute right-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* ── Four columns ── */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
            {/* Col 1: Brand */}
            <Col delay={0}>
              <a href="/" className="group mb-4 inline-flex items-center gap-2" aria-label={t('footer.homeLinkAria')}>
                <img
                  src="/masar-logo.png"
                  alt={t('footer.logoAlt')}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <div>
                  <div className="mb-0.5 font-heading text-xl sm:text-3xl font-semibold text-gold transition-all duration-300 group-hover:tracking-wide">
                    {lang === 'ar' ? brand.nameAr : brand.nameEn}
                  </div>
                  <div className="text-[9px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground/70">{lang === 'ar' ? brand.taglineAr : brand.taglineEn}</div>
                </div>
              </a>
              <p className="max-w-[220px] text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {lang === 'ar' ? brand.descriptionAr : brand.descriptionEn}
              </p>
              {/* social icons */}
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                {social.map((s) => (
                  <SocialIcon key={s.icon} icon={s.icon} label={s.label} href={s.href} />
                ))}
              </div>
            </Col>

            {/* Col 2: Quick Links */}
            <Col delay={0.1}>
              <h3 className="mb-3 sm:mb-5 font-heading text-[11px] sm:text-sm font-medium uppercase tracking-[0.22em] sm:tracking-[0.28em] text-gold">
                {t('footer.quickLinks')}
              </h3>
              <nav aria-label={t('footer.quickLinks')}>
                <ul className="flex flex-col gap-2 sm:gap-3">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="group flex items-center gap-2 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span
                          aria-hidden
                          className="block h-px w-0 rounded-full bg-gold transition-all duration-300 group-hover:w-3 sm:group-hover:w-4"
                        />
                        {lang === 'ar' ? item.labelAr : item.labelEn}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Col>

            {/* Col 3: Services */}
            <Col delay={0.18}>
              <h3 className="mb-3 sm:mb-5 font-heading text-[11px] sm:text-sm font-medium uppercase tracking-[0.22em] sm:tracking-[0.28em] text-gold">
                {t('footer.ourServices')}
              </h3>
              <ul className="flex flex-col gap-2 sm:gap-3">
                {services.map((s) => (
                  <li key={s.titleAr}>
                    <a
                      href={s.href}
                      className="group flex items-center gap-2 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span
                        aria-hidden
                        className="block h-px w-0 rounded-full bg-gold transition-all duration-300 group-hover:w-3 sm:group-hover:w-4"
                      />
                      {lang === 'ar' ? s.titleAr : s.titleEn}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Col 4: Contact — spans full width on the 2-col mobile grid */}
            <Col delay={0.26}>
              <h3 className="mb-3 sm:mb-5 font-heading text-[11px] sm:text-sm font-medium uppercase tracking-[0.22em] sm:tracking-[0.28em] text-gold">
                {t('footer.contactUs')}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <ContactCard
                  icon={<PhoneIcon />}
                  label={t('footer.phone')}
                  value={contact.phone}
                  href={contact.phoneHref}
                  delay={0.34}
                />
                <ContactCard
                  icon={<MailIcon />}
                  label={t('footer.email')}
                  value={contact.email}
                  href={contact.emailHref}
                  delay={0.40}
                />
                <ContactCard
                  icon={<MapPinIcon />}
                  label={t('footer.location')}
                  value={lang === 'ar' ? contact.address : contact.addressEn}
                  delay={0.46}
                />
                <ContactCard
                  icon={<ClockIcon />}
                  label={t('footer.workHours')}
                  value={lang === 'ar' ? contact.hours : contact.hoursEn}
                  delay={0.52}
                />
              </div>
            </Col>
          </div>

          {/* ── Bottom bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"
          >
            <p className="text-center text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <p className="text-xs text-muted-foreground/40">
              {lang === 'ar' ? 'استوديو التصميم الداخلي الفاخر' : 'Luxury Interior Design Studio'}
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  )
}
