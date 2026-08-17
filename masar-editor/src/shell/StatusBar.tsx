import { useStore } from '../core/store'
import { Icon } from '../components/Icon'

const KIND_LABELS: Record<string, string> = {
  project: 'خصائص المشروع',
  rooms: 'الغرف',
  floorplan: 'مخطط الطابق',
  products: 'مكتبة المنتجات',
  pdfs: 'ملفات PDF',
  materials: 'الخامات',
  lighting: 'الإضاءة'
}

export default function StatusBar() {
  const project = useStore((s) => s.project)
  const dirty = useStore((s) => s.dirty)
  const saving = useStore((s) => s.saving)
  const savedAt = useStore((s) => s.savedAt)
  const activeKind = useStore((s) => s.activeKind)
  const view = useStore((s) => s.view)

  if (view !== 'workspace' || !project) {
    return (
      <div className="statusbar">
        <span className="status-item">Masar Editor v0.1.0</span>
        <span className="spacer" />
        <span className="status-item">جاهز</span>
      </div>
    )
  }

  const hotspots = project.rooms.reduce((n, r) => n + r.hotspots.length, 0)
  const infocards = project.rooms.reduce((n, r) => n + r.infoCards.length, 0)
  const materials = project.rooms.reduce((n, r) => n + r.materials.length, 0)

  return (
    <div className="statusbar">
      <span className="status-item">
        <span className={`dot ${dirty ? 'dot-dirty' : 'dot-clean'}`} />
        {saving ? 'جاري الحفظ…' : dirty ? 'تعديلات غير محفوظة' : savedAt ? `آخر حفظ ${new Date(savedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : 'لا تغييرات'}
      </span>
      <span className="status-item">▪ {KIND_LABELS[activeKind] ?? ''}</span>
      <span className="status-item"><Icon name="door" size={12} /> {project.rooms.length} غرف</span>
      <span className="status-item"><Icon name="navigate" size={12} /> {hotspots} نقاط</span>
      <span className="status-item"><Icon name="file-text" size={12} /> {infocards} بطاقات</span>
      <span className="status-item"><Icon name="grid" size={12} /> {project.products.length} منتجات</span>
      <span className="status-item"><Icon name="pdf" size={12} /> {project.pdfs.length} PDF</span>
      <span className="status-item"><Icon name="layers" size={12} /> {materials} خامات</span>
      <span className="spacer" />
      <span className="status-item" style={{ color: 'var(--text-faint)' }}>
        {project.clientName ? `العميل: ${project.clientName}` : ''} {project.location ? `— ${project.location}` : ''}
      </span>
    </div>
  )
}
