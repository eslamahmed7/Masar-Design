import { useEffect, useRef, useState } from 'react'
import { useStore, uid } from '../core/store'
import { assetUrl } from '../core/ipc'
import type { FloorPlanPoint } from '../core/types'

export default function FloorPlanEditor() {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const select = useStore((s) => s.select)
  const selection = useStore((s) => s.selection)
  const placing = useStore((s) => s.placingFloorPoint)
  const setPlacing = useStore((s) => s.setPlacingFloorPoint)
  const showToast = useStore((s) => s.showToast)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [aspect, setAspect] = useState(3 / 2)
  const dragRef = useRef<{ id: string; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!project?.floorPlanImage) return
    const img = new Image()
    img.onload = () => setAspect(img.naturalWidth / img.naturalHeight)
    img.src = assetUrl(project.id, project.floorPlanImage!)
  }, [project?.floorPlanImage, project?.id])

  if (!project) return null
  const proj = project

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && useStore.getState().placingFloorPoint) {
        setPlacing(false)
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.type === 'floorplanpoint') {
        e.preventDefault()
        mutateProject((p) => {
          p.floorPlanPoints = p.floorPlanPoints.filter((x) => x.id !== selection.id)
        })
        select({ type: 'none' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection, mutateProject, select, setPlacing])

  function handleCanvasClick(e: React.MouseEvent) {
    if (!placing) return
    const t = e.target as HTMLElement
    if (t.closest('[data-fpid]')) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100))
    const id = uid()
    mutateProject((p) => {
      p.floorPlanPoints.push({ id, roomId: '', x, y })
    })
    select({ type: 'floorplanpoint', id })
    setPlacing(false)
    showToast('تمت إضافة النقطة — اربطها بغرفة من الخصائص', 'success')
  }

  async function uploadImage() {
    const res = await window.masar.dialogs.open({
      title: 'اختر صورة مخطط الطابق',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
    })
    if (res.canceled || !res.filePaths[0]) return
    try {
      const { relPath } = await window.masar.assets.import(proj.id, res.filePaths[0])
      mutateProject((p) => {
        p.floorPlanImage = relPath
      })
      showToast('تم رفع مخطط الطابق', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  function toPct(e: React.PointerEvent | PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      x: Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100))
    }
  }

  function startPointDrag(e: React.PointerEvent, point: FloorPlanPoint) {
    e.stopPropagation()
    const pct = toPct(e)
    if (!pct) return
    dragRef.current = { id: point.id, x: pct.x, y: pct.y }
    const move = (ev: PointerEvent) => {
      const pct2 = toPct(ev)
      if (pct2 && dragRef.current) {
        dragRef.current = { id: point.id, x: pct2.x, y: pct2.y }
        const el = canvasRef.current?.querySelector(`[data-fpid="${point.id}"]`) as HTMLElement | null
        if (el) {
          el.style.left = `${pct2.x}%`
          el.style.top = `${pct2.y}%`
        }
      }
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const d = dragRef.current
      dragRef.current = null
      if (d) {
        mutateProject((p) => {
          const pt = p.floorPlanPoints.find((x) => x.id === d.id)
          if (pt) {
            pt.x = d.x
            pt.y = d.y
          }
        })
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const points = proj.floorPlanPoints
    .map((pt) => ({ point: pt, room: proj.rooms.find((r) => r.id === pt.roomId) }))
    .filter((x) => x.point && !x.room?.hidden)

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 20, position: 'relative' }}>
      {!project.floorPlanImage ? (
        <div className="empty-state" style={{ height: '100%', gap: 10 }}>
          <div style={{ fontSize: 30 }}>⌗</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>لا يوجد مخطط طابق</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            ارفع صورة مخطط الشقة ثم ضع نقطة على مكان كل غرفة واربطها بالغرفة
          </div>
          <button className="btn btn-primary" onClick={uploadImage}>
            ↑ رفع صورة المخطط
          </button>
        </div>
      ) : (
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            width: '100%',
            aspectRatio: String(aspect),
            maxHeight: 'calc(100% - 40px)'
          }}
        >
          <div
            ref={canvasRef}
            className="floorplan-canvas"
            style={{ width: '100%', height: '100%', cursor: placing ? 'crosshair' : undefined }}
            onClick={handleCanvasClick}
          >
            <img src={assetUrl(project.id, project.floorPlanImage!)} alt="مخطط الطابق" />
            {points.map(({ point, room }) => {
              const isSelected = selection.type === 'floorplanpoint' && selection.id === point.id
              return (
                <div
                  key={point.id}
                  data-fpid={point.id}
                  className={`fp-point ${isSelected ? 'selected' : ''}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onPointerDown={(e) => startPointDrag(e, point)}
                  onClick={(e) => {
                    e.stopPropagation()
                    select({ type: 'floorplanpoint', id: point.id })
                  }}
                  title={room ? `${room.name} — اسحب للتحريك` : 'غير مرتبطة — انقر لفتح الخصائص'}
                >
                  <span className="fp-point-dot" />
                  {room ? <span className="fp-point-label">{room.name}</span> : <span className="fp-point-label empty">؟</span>}
                </div>
              )
            })}
            {placing && (
              <div className="fp-hint" style={{ background: 'rgba(4,18,31,0.9)' }}>
                انقر على مكان الغرفة على المخطط لوضع نقطة — ستفتح خصائصها لربطها بالغرفة
                <button className="btn btn-sm" onClick={() => setPlacing(false)}>
                  إلغاء (Esc)
                </button>
              </div>
            )}
            {!placing && <div className="fp-hint">اضغط "وضع نقطة" من الأعلى ثم انقر على المخطط — النقاط تظهر في معاينة الجولة وزر المخطط</div>}
          </div>
        </div>
      )}
    </div>
  )
}
