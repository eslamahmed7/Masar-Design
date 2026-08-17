import { useStore } from '../core/store'
import { assetUrl } from '../core/ipc'

export default function LightingPanel() {
  const project = useStore((s) => s.project)
  const setActiveKind = useStore((s) => s.setActiveKind)
  const setActiveRoom = useStore((s) => s.setActiveRoom)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null
  const proj = project

  async function uploadLighting(roomId: string) {
    const res = await window.masar.dialogs.open({
      title: 'اختر بانوراما الإضاءة المطفأة (2:1)',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
    })
    if (res.canceled || !res.filePaths[0]) return
    try {
      const { relPath } = await window.masar.assets.import(proj.id, res.filePaths[0])
      mutateProject((p) => {
        const r = p.rooms.find((x) => x.id === roomId)
        if (r) r.lighting = relPath
      })
      showToast('تم رفع بانوراما الإضاءة المطفأة', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 14 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel">
          <div className="panel-header">الإضاءة — Lights ON / OFF</div>
          <div className="panel-body" style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            ارفع بانوراما إضافية لنفس الغرفة مع الإضاءة مطفأة. سيرى العميل مفتاح تبديل داخل المعاينة يبدّل بين
            الإضاءة المضاءة (البانوراما الرئيسية) والإضاءة المطفأة.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {project.rooms.map((room) => (
            <div key={room.id} className="panel" style={{ overflow: 'hidden' }}>
              <div className="panel-header">
                {room.name}
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setActiveRoom(room.id)
                    setActiveKind('rooms')
                  }}
                >
                  فتح الغرفة
                </button>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>الإضاءة مضاءة (رئيسية)</div>
                    <div style={{ height: 64, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                      {room.panorama ? (
                        <img src={assetUrl(project.id, room.panorama)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-faint)' }}>لا بانوراما</div>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>الإضاءة مطفأة</div>
                    <div style={{ height: 64, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border)', filter: 'brightness(0.8)' }}>
                      {room.lighting ? (
                        <img src={assetUrl(project.id, room.lighting)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-faint)' }}>—</div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => uploadLighting(room.id)}>
                    {room.lighting ? 'استبدال المطفأة' : '↑ رفع بانوراما المطفأة'}
                  </button>
                  {room.lighting && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        mutateProject((p) => {
                          const r = p.rooms.find((x) => x.id === room.id)
                          if (r) r.lighting = undefined
                        })
                      }
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
