import { useStore } from '../core/store'
import { Icon } from './Icon'

const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: 'Ctrl+N', desc: 'مشروع جديد' },
  { keys: 'Ctrl+O', desc: 'فتح مشروع' },
  { keys: 'Ctrl+S', desc: 'حفظ المشروع' },
  { keys: 'Ctrl+E', desc: 'تصدير المشروع' },
  { keys: 'Ctrl+B', desc: 'إظهار/إخفاء مستكشف المشروع' },
  { keys: 'Ctrl+I', desc: 'إظهار/إخفاء لوحة الخصائص' },
  { keys: 'F5', desc: 'معاينة الجولة' },
  { keys: 'Delete', desc: 'حذف النقطة المحددة' },
  { keys: 'Esc', desc: 'إلغاء وضع النقطة / إلغاء التحديد' },
  { keys: 'سحب النقطة', desc: 'تحريك النقطة التفاعلية' },
  { keys: 'الزر الأيمن على النقطة', desc: 'القائمة المختصرة' },
  { keys: 'نقر مزدوج على غرفة المخطط', desc: 'فتح الغرفة في المحرر' }
]

export default function ShortcutsDialog() {
  const setModal = useStore((s) => s.setModal)
  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>اختصارات لوحة المفاتيح</span>
          <button className="btn btn-icon" onClick={() => setModal(null)}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="modal-body" style={{ gap: 4 }}>
          {SHORTCUTS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ minWidth: 140, fontSize: 12, color: 'var(--accent-bright)', fontWeight: 600, fontFamily: 'Consolas, monospace' }}>
                {s.keys}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
