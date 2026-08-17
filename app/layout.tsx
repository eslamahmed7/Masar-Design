import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Tajawal, El_Messiri, Cormorant_Garamond } from 'next/font/google'
import { HeaderWrapper } from '@/components/header-wrapper'
import { CinematicIntro } from '@/components/global/cinematic-intro'
import { GlobalBackground } from '@/components/global/global-background'
import { LenisScrollProvider } from '@/components/global/lenis-scroll-provider'
import { PageTransitionProvider } from '@/components/global/page-transition-provider'
import { CommandPalette } from '@/components/global/command-palette'
import { SearchProvider } from '@/lib/search-context'
import { SettingsPanel } from '@/components/global/settings-panel'
import { SettingsProvider } from '@/lib/settings-context'
import { LightboxProvider } from '@/components/global/image-lightbox'
import { ScrollRestoration } from '@/components/global/scroll-restoration'
import { QueryProvider } from '@/components/global/query-provider'
import './error-handler'
import './globals.css'

const arabic = Tajawal({
  variable: '--font-arabic',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
})

const arabicHeading = El_Messiri({
  variable: '--font-arabic-heading',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
})

const serifLatin = Cormorant_Garamond({
  variable: '--font-serif-latin',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = 'https://masar.studio'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'مسار | استوديو التصميم الداخلي الفاخر',
    template: '%s | مسار',
  },
  description:
    'مسار للتصميم الداخلي — نؤمن أن التصميم ليس شكلاً، بل أسلوب حياة. استوديو تصميم داخلي فاخر يحوّل المساحات إلى تجارب خالدة.',
  keywords: [
    'تصميم داخلي', 'interior design', 'luxury', 'فاخر', 'مسار', 'MASAR',
    'القاهرة', 'Egypt', '3D rendering', 'ريندر', 'فيلا', 'villa',
    'مخططات', 'floor plans', 'استشارة تصميم',
  ],
  authors: [{ name: 'MASAR Studio', url: siteUrl }],
  creator: 'MASAR Studio',
  publisher: 'MASAR Studio',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: siteUrl,
    languages: { ar: siteUrl, en: siteUrl },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'مسار | MASAR Studio',
    title: 'مسار | استوديو التصميم الداخلي الفاخر',
    description:
      'نحوّل المساحات إلى تجارب خالدة. استوديو مسار للتصميم الداخلي الفاخر في القاهرة، مصر.',
    images: [
      {
        url: '/logo-masar.png',
        width: 1200,
        height: 630,
        alt: 'مسار — استوديو التصميم الداخلي الفاخر',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مسار | استوديو التصميم الداخلي الفاخر',
    description:
      'نحوّل المساحات إلى تجارب خالدة. تصميم داخلي فاخر في القاهرة، مصر.',
    images: ['/logo-masar.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-masar.png',
    apple: '/logo-masar.png',
    shortcut: '/logo-masar.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f2ea' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1611' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'MASAR Studio',
      alternateName: 'مسار للتصميم الداخلي',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo-masar.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+201275477819',
        contactType: 'customer service',
        areaServed: 'EG',
        availableLanguage: ['Arabic', 'English'],
      },
      sameAs: [
        'https://instagram.com/',
        'https://facebook.com/',
        'https://linkedin.com/',
        'https://behance.net/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'مسار | MASAR Studio',
      description: 'استوديو التصميم الداخلي الفاخر',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: ['ar', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/projects?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}/#localbusiness`,
      name: 'MASAR Interior Design Studio',
      image: `${siteUrl}/logo-masar.png`,
      url: siteUrl,
      telephone: '+201275477819',
      email: 'masardesign1@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'منتجع النخيل جمعية 6 اكتوبر',
        addressLocality: 'مدينة السلام، القاهرة',
        addressCountry: 'EG',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      priceRange: '$$$$',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`dark bg-background ${arabic.variable} ${arabicHeading.variable} ${serifLatin.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('masar_settings')||'null')||{};var t=s.theme||'dark';var isDark=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches):(t==='dark');var r=document.documentElement;r.classList.toggle('dark',isDark);r.classList.toggle('light',!isDark);var l=s.language||'ar';r.setAttribute('lang',l);r.setAttribute('dir',l==='ar'?'rtl':'ltr');}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background font-sans antialiased">
        <QueryProvider>
        <LenisScrollProvider>
          <SettingsProvider>
            <LightboxProvider>
            <SearchProvider>
              <PageTransitionProvider>
                <ScrollRestoration />
                <CinematicIntro />
                <GlobalBackground />
                <HeaderWrapper />
                <CommandPalette />
                <SettingsPanel />
                {children}
                {process.env.NODE_ENV === 'production' && <Analytics />}
              </PageTransitionProvider>
            </SearchProvider>
            </LightboxProvider>
          </SettingsProvider>
        </LenisScrollProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
