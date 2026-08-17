import { useEffect, useState } from 'react'
import { useStore } from '../core/store'
import { Icon } from '../components/Icon'

export default function TitleBar() {
  const project = useStore((s) => s.project)
  const dirty = useStore((s) => s.dirty)
  const view = useStore((s) => s.view)
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.masar.window.onMaximized(setMaximized)
  }, [])

  return (
    <div className="titlebar drag-region">
      <div className="titlebar-title">
        <span className="app-mark"><Icon name="sparkles" size={12} strokeWidth={2} /></span>
        <span>Masar Editor</span>
        {view === 'workspace' && project && (
          <span className="titlebar-center">
            — {project.name}
            {dirty && <span style={{ color: 'var(--warn)' }}>•</span>}
          </span>
        )}
      </div>
      <div className="window-controls no-drag">
        <button
          className="win-btn"
          title="تصغير"
          onClick={() => window.masar.window.minimize()}
        >
          <svg width="11" height="11" viewBox="0 0 11 11">
            <rect x="1" y="5" width="9" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          className="win-btn"
          title={maximized ? 'استعادة' : 'تكبير'}
          onClick={() => window.masar.window.toggleMaximize()}
        >
          {maximized ? (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="1.5" y="3.5" width="6" height="6" />
              <path d="M3.5 1.5h6v6" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="1.5" y="1.5" width="8" height="8" />
            </svg>
          )}
        </button>
        <button
          className="win-btn close"
          title="إغلاق"
          onClick={() => window.masar.window.close()}
        >
          <svg width="11" height="11" viewBox="0 0 11 11">
            <path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
