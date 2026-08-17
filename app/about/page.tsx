import type { Metadata } from 'next'
import { AboutPageShell } from '@/components/about/about-page-shell'
import { getProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'عن مسار | استوديو التصميم الداخلي الفاخر',
  description:
    'تعرّف على مسار — استوديو التصميم الداخلي الذي يؤمن بأن كل مساحة تبدأ بفكرة، ونحن نحوّلها إلى تجربة معيشية استثنائية.',
}

export default async function AboutPage() {
  const projects = await getProjects()
  // Collect all images from all projects (cover + gallery images)
  const allImages = projects.flatMap(p => [
    { src: p.image, alt: p.title },
    ...(p.images?.slice(1).map(src => ({ src, alt: p.title })) ?? []),
  ]).filter(img => img.src && !img.src.includes('placeholder'))

  return <AboutPageShell projectImages={allImages} />
}
