import { useStore } from '../core/store'
import { Icon } from './Icon'

export default function AboutDialog() {
  const setModal = useStore((s) => s.setModal)
  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <div className="modal" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center', gap: 8 }}>
          <div className="app-mark" style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, var(--mint-200), var(--mint-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-800)', boxShadow: '0 8px 32px rgba(147,243,197,0.35)' }}>
            <Icon name="sparkles" size={30} strokeWidth={1.6} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Masar Editor</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>الإصدار 0.1.0</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 300 }}>
            محرر الجولات الافتراضية 360° — برنامج سطح مكتب احترافي لإنشاء وتحرير ونشر مشاريع التصميم الداخلي.
          </div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setModal(null)}>
            موافق
          </button>
        </div>
      </div>
    </div>
  )
}
