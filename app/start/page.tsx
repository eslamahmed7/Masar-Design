import type { Metadata } from 'next'
import { StartJourney } from '@/components/start/start-journey'

export const metadata: Metadata = {
  title: 'ابدأ مشروعك | مسار للتصميم الداخلي الفاخر',
  description:
    'ابدأ رحلتك التصميمية مع مسار — أخبرنا عن مشروعك وسيقوم فريقنا بالتواصل معك لتحويل رؤيتك إلى واقع استثنائي.',
}

export default function StartPage() {
  return <StartJourney />
}
