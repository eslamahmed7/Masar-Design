import { useState } from 'react'
import { useStore } from '../core/store'
import { Icon, type IconName } from '../components/Icon'
import type { HotspotType } from '../core/types'

const HOTSPOT_TOOLS: { type: HotspotType; label: string; icon: IconName }[] = [
  { type: 'navigate', label: 'انتقال', icon: 'navigate' },
  { type: 'info', label: 'معلومات', icon: 'info' },
  { type: 'external', label: 'رابط خارجي', icon: 'external' },
  { type: 'pdf', label: 'PDF', icon: 'pdf' },
  { type: 'product', label: 'منتج', icon: 'product' }
]

export default function Toolbar({ onHome }: { onHome: () => void }) {
  const project = useStore((s) => s.project)
  const dirty = useStore((s) => s.dirty)
  const saving = useStore((s) => s.saving)
  const activeKind = useStore((s) => s.activeKind)
  const placingHotspot = useStore((s) => s.placingHotspot)
  const setPlacingHotspot = useStore((s) => s.setPlacingHotspot)
  const saveProject = useStore((s) => s.saveProject)
  const setPreviewOpen = useStore((s) => s.setPreviewOpen)
  const undoStack = useStore((s) => s.undoStack)
  const redoStack = useStore((s) => s.redoStack)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  const placingFloorPoint = useStore((s) => s.placingFloorPoint)
  const setPlacingFloorPoint = useStore((s) => s.setPlacingFloorPoint)
  const showHotspots = useStore((s) => s.showHotspots)
  const setShowHotspots = useStore((s) => s.setShowHotspots)
  const [hotspotMenuOpen, setHotspotMenuOpen] = useState(false)

  const isRoomKind = activeKind === 'rooms'
  const isFloorPlan = activeKind === 'floorplan'

  async function handleSave() {
    if (!project) return
    const ok = await saveProject()
    showToast(ok ? 'تم حفظ المشروع' : 'فشل الحفظ', ok ? 'success' : 'error')
  }

  function startPlacement(type: HotspotType) {
    setPlacingHotspot(type)
    setHotspotMenuOpen(false)
    showToast(`انقر على البانوراما لوضع نقطة: ${type === 'navigate' ? 'انتقال' : type === 'info' ? 'معلومات' : type === 'external' ? 'رابط خارجي' : type === 'pdf' ? 'ملف PDF' : 'منتج'}`)
  }

  function deleteSelection() {
    if (!project) return
    if (selection.type === 'hotspot') {
      mutateProject((p) => {
        const room = p.rooms.find((r) => r.id === selection.roomId)
        if (room) room.hotspots = room.hotspots.filter((h) => h.id !== selection.id)
      })
      select({ type: 'none' })
    } else if (selection.type === 'room') {
      removeRoom(selection.id)
    } else if (selection.type === 'product') {
      mutateProject((p) => {
        p.products = p.products.filter((pr) => pr.id !== selection.id)
      })
      select({ type: 'none' })
    }
  }

  function removeRoom(roomId: string) {
    if (!project) return
    const name = project.rooms.find((r) => r.id === roomId)?.name ?? 'الغرفة'
    window.masar.dialogs
      .message({
        type: 'warning',
        buttons: ['حذف', 'إلغاء'],
        defaultId: 0,
        cancelId: 1,
        title: 'حذف غرفة',
        message: `حذف الغرفة "${name}"؟`,
        detail: 'سيتم حذف نقاط الاتصال المرتبطة بها.'
      })
      .then((res) => {
        if (res?.response !== 0) return
        mutateProject((p) => {
          p.rooms = p.rooms.filter((r) => r.id !== roomId)
          p.floorPlanPoints = p.floorPlanPoints.filter((m) => m.roomId !== roomId)
          p.rooms.forEach((r) => {
            r.hotspots = r.hotspots.filter((h) => h.targetRoomId !== roomId)
            r.connectedRooms = r.connectedRooms.filter((c) => c !== roomId)
          })
        })
        if (useStore.getState().activeRoomId === roomId) {
          const remaining = project.rooms.filter((r) => r.id !== roomId)
          useStore.getState().setActiveRoom(remaining[0]?.id ?? null)
        }
        select({ type: 'none' })
      })
  }

  async function pickFloorPlanImage() {
    if (!project) return
    const res = await window.masar.dialogs.open({
      title: 'اختر صورة مخطط الطابق',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
    })
    if (res.canceled || !res.filePaths[0]) return
    try {
      const { relPath } = await window.masar.assets.import(project.id, res.filePaths[0])
      mutateProject((p) => {
        p.floorPlanImage = relPath
      })
      showToast('تم رفع مخطط الطابق', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل رفع المخطط', 'error')
    }
  }

  return (
    <div className="toolbar">
      <button className="toolbar-btn" disabled={undoStack.length === 0} onClick={undo} title="تراجع (Ctrl+Z)">
        <Icon name="undo" size={14} />
      </button>
      <button className="toolbar-btn" disabled={redoStack.length === 0} onClick={redo} title="إعادة (Ctrl+Shift+Z)">
        <Icon name="redo" size={14} />
      </button>
      <span className="toolbar-sep" />
      {isRoomKind && (
        <>
          <div style={{ position: 'relative' }}>
            <button
              className={`toolbar-btn ${placingHotspot ? 'active' : ''}`}
              onClick={() => setHotspotMenuOpen((o) => !o)}
              title="وضع نقطة تفاعلية"
            >
              <Icon name="plus" size={14} />
              وضع نقطة
              <Icon name="chevron-down" size={12} />
            </button>
            {hotspotMenuOpen && (
              <div
                className="panel"
                style={{
                  position: 'absolute',
                  top: 36,
                  insetInlineStart: 0,
                  zIndex: 100,
                  width: 190,
                  padding: 5,
                  boxShadow: 'var(--shadow-pop)',
                  borderRadius: 10
                }}
              >
                {HOTSPOT_TOOLS.map((t) => (
                  <div key={t.type} className="list-row" onClick={() => startPlacement(t.type)}>
                    <span className="tree-icon">{<Icon name={t.icon} size={15} />}</span>
                    <span className="list-title">نقطة {t.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className={`toolbar-btn ${!showHotspots ? 'active' : ''}`}
            title="إظهار / إخفاء النقاط"
            onClick={() => setShowHotspots(!showHotspots)}
          >
            <Icon name={showHotspots ? 'eye' : 'eye-off'} size={14} /> النقاط
          </button>
          {(selection.type === 'hotspot' || selection.type === 'room' || selection.type === 'floorplanpoint') && (
            <button className="toolbar-btn" style={{ color: 'var(--danger)' }} onClick={deleteSelection}>
              <Icon name="trash" size={14} /> حذف المحدد
            </button>
          )}
        </>
      )}
      {isFloorPlan && (
        <>
          <button className="toolbar-btn" onClick={pickFloorPlanImage}>
            <Icon name="upload" size={14} /> رفع صورة المخطط
          </button>
          <button
            className={`toolbar-btn ${placingFloorPoint ? 'active' : ''}`}
            onClick={() => {
              setPlacingFloorPoint(!placingFloorPoint)
              if (!placingFloorPoint) showToast('انقر على المخطط لوضع نقطة ثم اربطها بغرفة', 'success')
            }}
            title="وضع نقطة وربطها بغرفة"
          >
            <Icon name="plus" size={14} /> وضع نقطة
          </button>
          {(selection.type === 'floorplanpoint' || placingFloorPoint) && (
            <button
              className="toolbar-btn"
              style={{ color: 'var(--danger)' }}
              onClick={() => {
                setPlacingFloorPoint(false)
                if (selection.type === 'floorplanpoint') {
                  mutateProject((p) => {
                    p.floorPlanPoints = p.floorPlanPoints.filter((x) => x.id !== selection.id)
                  })
                  select({ type: 'none' })
                }
              }}
            >
              <Icon name="trash" size={14} /> حذف النقطة
            </button>
          )}
          {project?.floorPlanImage && (
            <button
              className="toolbar-btn"
              style={{ color: 'var(--danger)' }}
              onClick={() =>
                mutateProject((p) => {
                  p.floorPlanImage = undefined
                })
              }
            >
              <Icon name="trash" size={14} /> إزالة الصورة
            </button>
          )}
          <span className="toolbar-sep" />
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>انقر على المخطط لوضع النقاط واسحبها لتعديل مواقعها</span>
        </>
      )}

      <div className="toolbar-right">
        <button className="btn btn-ghost btn-sm" onClick={onHome} title="العودة للصفحة الرئيسية">
          <Icon name="home" size={13} /> الرئيسية
        </button>
        <span className={`badge ${dirty ? 'badge-accent' : ''}`}>
          {saving ? 'جاري الحفظ…' : dirty ? 'تعديلات غير محفوظة' : 'محفوظ'}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => setPreviewOpen(true)} title="معاينة الجولة (F5)">
          <Icon name="play" size={13} /> معاينة
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={!project || !dirty || saving}
          title="حفظ المشروع (Ctrl+S)"
        >
          <Icon name="save" size={13} /> حفظ
        </button>
      </div>
    </div>
  )
}
