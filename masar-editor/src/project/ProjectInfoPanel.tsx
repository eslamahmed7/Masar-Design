import { useStore } from '../core/store'
import { assetUrl } from '../core/ipc'
import { Icon } from '../components/Icon'

export default function ProjectInfoPanel() {
  const project = useStore((s) => s.project)
  const setModal = useStore((s) => s.setModal)
  const setPreviewOpen = useStore((s) => s.setPreviewOpen)
  if (!project) return null

  const hotspots = project.rooms.reduce((n, r) => n + r.hotspots.length, 0)
  const infocards = project.rooms.reduce((n, r) => n + r.infoCards.length, 0)
  const materials = project.rooms.reduce((n, r) => n + r.materials.length, 0)
  const lighting = project.rooms.filter((r) => r.lighting).length

  const stats: { label: string; value: string }[] = [
    { label: 'الغرف', value: String(project.rooms.length) },
    { label: 'النقاط التفاعلية', value: String(hotspots) },
    { label: 'بطاقات المعلومات', value: String(infocards) },
    { label: 'المنتجات', value: String(project.products.length) },
    { label: 'ملفات PDF', value: String(project.pdfs.length) },
    { label: 'الخامات البديلة', value: String(materials) },
    { label: 'غرف بإضاءة مطفأة', value: String(lighting) },
    { label: 'مخطط الطابق', value: project.floorPlanImage ? 'مرفوع' : '—' }
  ]

  const readyRooms = project.rooms.filter((r) => r.panorama).length

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {project.coverPath ? (
            <img
              src={assetUrl(project.id, project.coverPath)}
              alt=""
              style={{ width: 120, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
            />
          ) : (
            <div style={{ width: 120, height: 80, borderRadius: 10, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="building" size={28} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{project.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
              {project.clientName && `العميل: ${project.clientName}`}
              {project.companyName && ` • الشركة: ${project.companyName}`}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 2 }}>
              {project.location || 'لا يوجد موقع'}
            </div>
          </div>
          <button className="btn" onClick={() => setModal('project')}>
            <Icon name="edit" size={13} /> تحرير البيانات
          </button>
        </div>

        {project.description && (
          <div className="panel">
            <div className="panel-header">الوصف</div>
            <div className="panel-body" style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 13 }}>
              {project.description}
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">إحصائيات المشروع</div>
          <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ padding: 12, background: 'var(--bg-panel-alt)', borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-bright)' }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">جاهزية النشر</div>
          <div className="panel-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-input)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${project.rooms.length ? (readyRooms / project.rooms.length) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-dim), var(--accent-bright))',
                    borderRadius: 4,
                    transition: 'width 0.3s'
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {readyRooms}/{project.rooms.length} غرفة جاهزة
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary" onClick={() => setPreviewOpen(true)}>
                <Icon name="play" size={13} /> معاينة الجولة
              </button>
              <button className="btn" onClick={() => window.masar.projects.export(project.id)}>
                <Icon name="package" size={13} /> تصدير المشروع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
