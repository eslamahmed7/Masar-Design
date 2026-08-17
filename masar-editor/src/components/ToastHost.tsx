import { useEffect } from 'react'
import { useStore } from '../core/store'
import { Icon } from './Icon'

export default function ToastHost() {
  const toast = useStore((s) => s.toast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => {
      useStore.setState({ toast: null })
    }, 2800)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null
  return (
    <div className={`toast ${toast.kind === 'error' ? 'toast-error' : toast.kind === 'success' ? 'toast-success' : 'toast-info'}`}>
      <Icon name={toast.kind === 'error' ? 'x' : toast.kind === 'success' ? 'check' : 'info'} size={14} />
      {toast.message}
    </div>
  )
}
