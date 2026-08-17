import type { IconName } from '../components/Icon'
import type { NavStyle } from './types'

export const NAV_STYLES: { value: NavStyle; label: string; icon: IconName; desc: string }[] = [
  { value: 'compass', label: 'بوصلة', icon: 'navigate', desc: 'افتراضي' },
  { value: 'arrow', label: 'سهم', icon: 'nav-arrow', desc: 'سهم نحو الوجهة' },
  { value: 'circle', label: 'دائرة', icon: 'nav-circle', desc: 'سهم داخل دائرة' },
  { value: 'diamond', label: 'معيّن', icon: 'nav-diamond', desc: 'شكل ماسي' },
  { value: 'door', label: 'باب', icon: 'door', desc: 'باب انتقال' },
  { value: 'flag', label: 'علم', icon: 'nav-flag', desc: 'علم وجهة' }
]

export function navStyleIcon(s?: NavStyle): IconName {
  return NAV_STYLES.find((x) => x.value === (s ?? 'compass'))?.icon ?? 'navigate'
}