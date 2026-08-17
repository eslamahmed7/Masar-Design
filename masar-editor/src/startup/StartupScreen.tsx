import { useEffect } from 'react'
import { useStore } from '../core/store'
import { Icon } from '../components/Icon'
import TitleBar from '../shell/TitleBar'

export default function StartupScreen({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const recent = useStore((s) => s.recent)
  const setModal = useStore((s) => s.setModal)
  const loadRecent = useStore((s) => s.loadRecent)

  useEffect(() => {
    loadRecent()
  }, [])

  async function openFolder() {
    const res = await window.masar.dialogs.open({
      title: 'فتح مشروع Masar',
      properties: ['openFile'],
      filters: [{ name: 'Masar Project', extensions: ['json'] }]
    })
    if (res.canceled || !res.filePaths[0]) return
    const id = res.filePaths[0].replace(/\\/g, '/').split('/').pop()!.replace(/\.json$/, '')
    await onOpenProject(id)
  }

  return (
    <div className="app-root">
      <TitleBar />
      <div className="start-screen">
        <div className="start-content">
          <div className="start-logo">
            <div className="app-mark">
              <Icon name="sparkles" size={38} strokeWidth={1.6} />
            </div>
            <h1>Masar Editor</h1>
            <p>محرر الجولات الافتراضية 360° — مشاريع التصميم الداخلي</p>
          </div>

          <div className="start-actions">
            <button className="btn btn-primary" onClick={() => setModal('new')}>
              <Icon name="plus" size={15} /> مشروع جديد
            </button>
            <button className="btn" onClick={openFolder}>
              <Icon name="folder" size={15} /> فتح مشروع
            </button>
          </div>

          <div className="start-recent">
            <div className="start-recent-title">
              <span>المشاريع الأخيرة</span>
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <span className="empty-icon"><Icon name="folder" size={22} /></span>
                <span style={{ fontSize: 13 }}>لا توجد مشاريع بعد — أنشئ مشروعك الأول</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recent.map((p) => (
                  <div key={p.id} className="start-recent-card" onClick={() => onOpenProject(p.id)}>
                    {p.coverPath ? (
                      <img className="start-recent-cover" src={p.coverPath} alt="" />
                    ) : (
                      <div className="start-recent-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="building" size={22} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                        {p.clientName ? `العميل: ${p.clientName}` : 'بدون عميل'}
                        {p.companyName ? ` • ${p.companyName}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                      {new Date(p.updatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
