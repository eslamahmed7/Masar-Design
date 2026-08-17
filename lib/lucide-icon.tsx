import { type LucideProps } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const FALLBACK_ICON = 'HelpCircle'

export function LucideIcon({ name, ...props }: { name: string } & LucideProps) {
  const iconName = name in LucideIcons ? name : FALLBACK_ICON
  const Icon = (LucideIcons as any)[iconName]
  if (!Icon) return null
  return <Icon {...props} />
}
