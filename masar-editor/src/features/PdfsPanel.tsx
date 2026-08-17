import { useStore } from '../core/store'
import type { ProjectPdf } from '../core/types'

export default function PdfsPanel() {
  const project = useStore((s) => s.project)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null
  const proj = project

  async function addPdf() {
    const res = await window.masar.dialogs.open({
      title: 'اختر ملف PDF',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
    if (res.canceled || !res.filePaths.length) return
    try {
      for (const fp of res.filePaths) {
        const { relPath } = await window.masar.assets.import(proj.id, fp)
        const pdf: ProjectPdf = {
          id: Math.random().toString(36).slice(2, 9),
          name: fp.split(/[\\/]/).pop()!.replace(/\.pdf$/i, ''),
          path: relPath,
          description: '',
          linkedRoomIds: [],
          linkedProductIds: []
        }
        mutateProject((p) => {
          p.pdfs.unshift(pdf)
        })
        select({ type: 'pdf', id: pdf.id })
      }
      showToast('تمت إضافة الملفات', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          ملفات PDF المشروع ({project.pdfs.length}) — تُربط بالمشروع كاملاً أو بغرف محددة أو بنقاط تفاعلية
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={addPdf}>
          + إضافة ملف PDF
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {project.pdfs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 26 }}>▤</div>
            <div>لا توجد ملفات PDF</div>
            <div style={{ fontSize: 12 }}>ارفع المخططات والكتالوجات والجداول لربطها بالمشروع</div>
            <button className="btn btn-sm btn-primary" onClick={addPdf} style={{ marginTop: 4 }}>
              + إضافة ملف
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {project.pdfs.map((pdf) => {
              const rooms = pdf.linkedRoomIds.map((id) => project.rooms.find((r) => r.id === id)?.name).filter(Boolean)
              const active = selection.type === 'pdf' && selection.id === pdf.id
              return (
                <div
                  key={pdf.id}
                  className="panel"
                  style={{ cursor: 'pointer', borderColor: active ? 'var(--accent)' : undefined }}
                  onClick={() => select({ type: 'pdf', id: pdf.id })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                    <div style={{ width: 40, height: 52, background: 'var(--danger-bg)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 800, fontSize: 11 }}>
                      PDF
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.name}</div>
                      <div className="list-sub" style={{ marginTop: 2 }}>
                        {rooms.length ? `مرتبط بـ: ${rooms.join('، ')}` : 'غير مرتبط بغرف'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
