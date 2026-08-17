'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useSettings, type Theme, type Language } from '@/lib/settings-context'
import { useI18n } from '@/lib/i18n'

// ── Toggle ────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ${
        checked
          ? 'border-gold/50 bg-gold/20'
          : 'border-gold/15 bg-gold/5'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full border transition-all duration-200 ${
          checked
            ? 'border-gold bg-gold translate-x-5'
            : 'border-gold/30 bg-gold/20 translate-x-0.5'
        }`}
        style={{ transition: 'transform 0.2s ease, background-color 0.2s ease' }}
      />
    </button>
  )
}

// ── Segmented control ─────────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-gold/15 bg-gold/5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-all duration-200 ${
            value === opt.value
              ? 'bg-gold text-[#0B0B0B]'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export function SettingsPanel() {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    reduceMotion,
    setReduceMotion,
    cursorEffects,
    setCursorEffects,
    isPanelOpen,
    closePanel,
  } = useSettings()
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            className="fixed inset-0 z-[190] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
          />

          {/* Panel — slides in from left (RTL: right side of the logical end) */}
          <motion.aside
            key="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t('settings.title')}
            className="fixed bottom-0 left-4 top-24 z-[191] flex w-72 flex-col overflow-hidden rounded-2xl border border-gold/20 shadow-2xl"
            style={{ background: 'var(--panel-surface)', backdropFilter: 'blur(24px)' }}
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t('settings.title')}</p>
                <p className="text-xs text-muted-foreground/50">{t('settings.subtitle')}</p>
              </div>
              <button
                onClick={closePanel}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/15 text-muted-foreground/60 transition-colors hover:text-gold"
                aria-label={t('common.close')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">

              {/* Theme */}
              <Section title={t('settings.appearance')}>
                <SegmentedControl<Theme>
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { label: t('settings.dark'), value: 'dark' },
                    { label: t('settings.light'), value: 'light' },
                    { label: t('settings.system'), value: 'system' },
                  ]}
                />
                <p className="text-[11px] text-muted-foreground/40">
                  {t('settings.systemHint')}
                </p>
              </Section>

              {/* Language */}
              <Section title={t('settings.language')}>
                <SegmentedControl<Language>
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { label: 'العربية', value: 'ar' },
                    { label: 'English', value: 'en' },
                  ]}
                />
                <p className="text-[11px] text-muted-foreground/40">
                  {t('settings.languageHint')}
                </p>
              </Section>

              {/* Reduce motion */}
              <Section title={t('settings.accessibility')}>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gold/10 bg-gold/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-foreground/90">{t('settings.reduceMotion')}</p>
                    <p className="text-[11px] text-muted-foreground/50">{t('settings.reduceMotionHint')}</p>
                  </div>
                  <Toggle
                    checked={reduceMotion}
                    onChange={setReduceMotion}
                    label={t('settings.reduceMotion')}
                  />
                </div>
              </Section>

              {/* Cursor effects */}
              <Section title={t('settings.cursorEffects')}>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-gold/10 bg-gold/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-foreground/90">{t('settings.cursorEffectsTitle')}</p>
                    <p className="text-[11px] text-muted-foreground/50">{t('settings.cursorEffectsHint')}</p>
                  </div>
                  <Toggle
                    checked={cursorEffects}
                    onChange={setCursorEffects}
                    label={t('settings.cursorEffects')}
                  />
                </div>
              </Section>

            </div>

            {/* Footer */}
            <div className="border-t border-gold/10 px-5 py-4">
              <p className="text-center font-heading text-xs text-gold/30">MASAR — مسار</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
