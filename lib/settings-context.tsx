'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type Language = 'ar' | 'en'

export interface Settings {
  theme: Theme
  language: Language
  reduceMotion: boolean
  cursorEffects: boolean
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  language: 'ar',
  reduceMotion: false,
  cursorEffects: true,
}

const STORAGE_KEY = 'masar_settings'

interface SettingsContextValue extends Settings {
  setTheme: (t: Theme) => void
  setLanguage: (l: Language) => void
  setReduceMotion: (v: boolean) => void
  setCursorEffects: (v: boolean) => void
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function load(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function save(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {}
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = load()
    setSettings(stored)
    setMounted(true)
  }, [])

  // Apply theme to <html> — always dark
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.add('dark')
    root.classList.remove('light')
  }, [mounted])

  // Apply dir + lang to <html>
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.setAttribute('lang', settings.language)
    root.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr')
  }, [settings.language, mounted])

  // Persist on change
  useEffect(() => {
    if (!mounted) return
    save(settings)
  }, [settings, mounted])

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const value: SettingsContextValue = {
    ...settings,
    setTheme: (t) => update('theme', t),
    setLanguage: (l) => update('language', l),
    setReduceMotion: (v) => update('reduceMotion', v),
    setCursorEffects: (v) => update('cursorEffects', v),
    isPanelOpen,
    openPanel: () => setIsPanelOpen(true),
    closePanel: () => setIsPanelOpen(false),
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider')
  return ctx
}
