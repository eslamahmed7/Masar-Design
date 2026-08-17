import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'لوحة التحكم | مسار', template: '%s | لوحة التحكم مسار' },
  robots: { index: false, follow: false },
}

// Admin routes render outside the public site shell (no header/footer/providers)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
