import { useStore } from '../core/store'
import { assetUrl } from '../core/ipc'
import { Field, TextInput } from '../components/ui'

export default function MaterialsPanel() {
  const project = useStore((s) => s.project)
  const setActiveKind = useStore((s) => s.setActiveKind)
  const setActiveRoom = useStore((s) => s.setActiveRoom)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null
  const proj = project

  const roomsWithMaterials = project.rooms.filter((r) => r.materials.length > 0)
  const roomsWithout = project.rooms.filter((r) => r.materials.length === 0)

  async function uploadVariant(roomId: string, variantId: string) {
    const res = await window.masar.dialogs.open({
      title: 'اختر بانوراما الخامة (2:1)',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
    })
    if (res.canceled || !res.filePaths[0]) return
    try {
      const { relPath } = await window.masar.assets.import(proj.id, res.filePaths[0])
      mutateProject((p) => {
        const r = p.rooms.find((x) => x.id === roomId)
        const v = r?.materials.find((m) => m.id === variantId)
        if (v) v.panorama = relPath
      })
      showToast('تم رفع بانوراما الخامة', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 14 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel">
          <div className="panel-header">الخامات البديلة</div>
          <div className="panel-body" style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            كل خامة = بانوراما كاملة لنفس الغرفة بمادة مختلفة. يبدّل العميل بين الخامات داخل المعاينة لرؤية المظهر
            المختلف لكل خامة. أضف الخامات من غرفة داخل الغرف، أو من هنا مباشرة.
          </div>
        </div>

        {roomsWithMaterials.map((room) => (
          <div key={room.id} className="panel">
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
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {room.materials.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 90, height: 50, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border)', flexShrink: 0 }}>
                    {m.panorama ? (
                      <img src={assetUrl(project.id, m.panorama)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <Field label="">
                    <TextInput
                      value={m.label}
                      onChange={(v) =>
                        mutateProject((p) => {
                          const x = p.rooms.find((r) => r.id === room.id)?.materials.find((y) => y.id === m.id)
                          if (x) x.label = v
                        })
                      }
                    />
                  </Field>
                  <button className="btn btn-sm" onClick={() => uploadVariant(room.id, m.id)}>
                    {m.panorama ? 'استبدال' : '↑ رفع البانوراما'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      mutateProject((p) => {
                        const r = p.rooms.find((x) => x.id === room.id)
                        if (r) r.materials = r.materials.filter((y) => y.id !== m.id)
                      })
                    }
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {roomsWithout.length > 0 && (
          <div className="panel">
            <div className="panel-header">غرف بدون خامات بديلة</div>
            <div className="panel-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {roomsWithout.map((r) => (
                <button
                  key={r.id}
                  className="btn btn-sm"
                  onClick={() => {
                    mutateProject((p) => {
                      const room = p.rooms.find((x) => x.id === r.id)
                      if (room) {
                        room.materials.push({
                          id: Math.random().toString(36).slice(2, 9),
                          label: `خامة ${room.materials.length + 1}`
                        })
                      }
                    })
                  }}
                >
                  + خامة لـ "{r.name}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
