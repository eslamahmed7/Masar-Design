import { useStore } from '../core/store'
import RoomInspector from './inspector/RoomInspector'
import HotspotInspector from './inspector/HotspotInspector'
import InfoCardInspector from './inspector/InfoCardInspector'
import ProductInspector from './inspector/ProductInspector'
import PdfInspector from './inspector/PdfInspector'

export default function PropertiesInspector() {
  const project = useStore((s) => s.project)
  const selection = useStore((s) => s.selection)
  const activeKind = useStore((s) => s.activeKind)
  const activeRoomId = useStore((s) => s.activeRoomId)
  const select = useStore((s) => s.select)
  const mutateProject = useStore((s) => s.mutateProject)

  if (!project) return null

  let title = 'الخصائص'
  let body: React.ReactNode = (
    <div className="empty-state" style={{ fontSize: 12 }}>
      اختر عنصراً لعرض خصائصه
    </div>
  )

  if (selection.type === 'hotspot') {
    const room = project.rooms.find((r) => r.id === selection.roomId)
    const hotspot = room?.hotspots.find((h) => h.id === selection.id)
    if (room && hotspot) {
      title = 'نقطة تفاعلية'
      body = <HotspotInspector room={room} hotspot={hotspot} />
    }
  } else if (selection.type === 'infocard') {
    const room = project.rooms.find((r) => r.id === selection.roomId)
    const card = room?.infoCards.find((c) => c.id === selection.id)
    if (room && card) {
      title = 'بطاقة معلومات'
      body = <InfoCardInspector room={room} card={card} />
    }
  } else if (selection.type === 'product') {
    const product = project.products.find((p) => p.id === selection.id)
    if (product) {
      title = 'منتج'
      body = <ProductInspector product={product} />
    }
  } else if (selection.type === 'pdf') {
    const pdf = project.pdfs.find((p) => p.id === selection.id)
    if (pdf) {
      title = 'ملف PDF'
      body = <PdfInspector pdf={pdf} />
    }
  } else if (selection.type === 'room') {
    const room = project.rooms.find((r) => r.id === selection.id)
    if (room) {
      title = `الغرفة — ${room.name}`
      body = <RoomInspector room={room} />
    }
  } else if (selection.type === 'none' && activeKind === 'rooms' && activeRoomId) {
    const room = project.rooms.find((r) => r.id === activeRoomId)
    if (room) {
      title = `الغرفة — ${room.name}`
      body = <RoomInspector room={room} />
    }
  } else if (selection.type === 'floorplanpoint') {
    const point = project.floorPlanPoints.find((m) => m.id === selection.id)
    if (point) {
      const linkedRoom = project.rooms.find((r) => r.id === point.roomId)
      title = linkedRoom ? `نقطة الغرفة — ${linkedRoom.name}` : 'نقطة مخطط (غير مرتبطة)'
      body = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            اسحب النقطة على المخطط لضبط موقعها، أو عدّل القيم هنا:
          </div>
          {(['x', 'y'] as const).map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 30, color: 'var(--text-faint)', fontSize: 12 }}>{k} %</span>
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                value={Math.round(point[k] * 100) / 100}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                  mutateProject((p) => {
                    const pt = p.floorPlanPoints.find((x) => x.id === point.id)
                    if (pt) pt[k] = v
                  })
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>ربط النقطة بغرفة</span>
            <select
              className="input"
              value={point.roomId}
              onChange={(e) =>
                mutateProject((p) => {
                  const pt = p.floorPlanPoints.find((x) => x.id === point.id)
                  if (pt) pt.roomId = e.target.value
                })
              }
            >
              <option value="">— غير مرتبطة —</option>
              {project.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              mutateProject((p) => {
                p.floorPlanPoints = p.floorPlanPoints.filter((x) => x.id !== point.id)
              })
              select({ type: 'none' })
            }}
          >
            حذف النقطة
          </button>
        </div>
      )
    }
  } else if (selection.type === 'none' && activeKind === 'floorplan') {
    title = 'مخطط الطابق'
    body = (
      <div className="empty-state" style={{ fontSize: 12 }}>
        ضع نقطة على المخطط واربطها بغرفة — تظهر النقاط في زر المخطط داخل الجولة
      </div>
    )
  } else if (selection.type === 'none' && activeKind === 'products') {
    title = 'مكتبة المنتجات'
    body = (
      <div className="empty-state" style={{ fontSize: 12 }}>
        المنتج يُنشأ مرة واحدة ويُستخدم في أي عدد من الغرف والنقاط
      </div>
    )
  } else if (selection.type === 'none' && activeKind === 'pdfs') {
    title = 'ملفات PDF'
    body = (
      <div className="empty-state" style={{ fontSize: 12 }}>
        اربط ملفات PDF بالمشروع أو بغرف محددة
      </div>
    )
  } else if (selection.type === 'none' && activeKind === 'materials') {
    title = 'الخامات'
    body = (
      <div className="empty-state" style={{ fontSize: 12 }}>
        اختر غرفة لعرض خاماتها البديلة
      </div>
    )
  } else if (selection.type === 'none' && activeKind === 'lighting') {
    title = 'الإضاءة'
    body = (
      <div className="empty-state" style={{ fontSize: 12 }}>
        اختر غرفة لإدارة بانوراما الإضاءة المطفأة
      </div>
    )
  }

  return (
    <>
      <div className="inspector-header">{title}</div>
      <div className="inspector-body">{body}</div>
    </>
  )
}
