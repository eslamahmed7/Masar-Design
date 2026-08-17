import { useState } from 'react'
import { useStore } from '../core/store'
import { assetUrl } from '../core/ipc'
import { Icon } from '../components/Icon'
import type { Room } from '../core/types'

function SectionHeader({
  label,
  icon,
  count,
  sectionKey,
  onAdd,
  addTitle,
  children
}: {
  label: string
  icon: React.ReactNode
  count?: number
  sectionKey?: string
  onAdd?: () => void
  addTitle?: string
  children?: React.ReactNode
}) {
  const collapsed = useStore((s) => (sectionKey ? s.explorerCollapsed[sectionKey] : false))
  const toggle = useStore((s) => s.toggleExplorerSection)
  const open = !sectionKey || !collapsed

  return (
    <div className="tree-section">
      <button
        className="tree-section-header"
        onClick={() => sectionKey && toggle(sectionKey)}
        style={{ cursor: sectionKey ? 'pointer' : 'default' }}
      >
        {sectionKey && (
          <span className={`chevron ${open ? 'open' : ''}`}>
            <Icon name="chevron-right" size={11} />
          </span>
        )}
        <span className="tree-icon">{icon}</span>
        <span>{label}</span>
        {typeof count === 'number' && count > 0 && <span className="tree-section-count">{count}</span>}
        {onAdd && (
          <span
            className="tree-action-btn"
            title={addTitle ?? 'إضافة'}
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            style={{ marginInlineStart: 'auto' }}
          >
            <Icon name="plus" size={13} />
          </span>
        )}
      </button>
      {open && <div className="tree-children">{children}</div>}
    </div>
  )
}

export default function ProjectExplorer() {
  const project = useStore((s) => s.project)
  const activeKind = useStore((s) => s.activeKind)
  const setActiveKind = useStore((s) => s.setActiveKind)
  const activeRoomId = useStore((s) => s.activeRoomId)
  const setActiveRoom = useStore((s) => s.setActiveRoom)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  const pdfsCollapsed = useStore((s) => s.explorerCollapsed['pdfs'])
  const roomsCollapsed = useStore((s) => s.explorerCollapsed['rooms'])
  const productsViewOpen = useStore((s) => s.productsViewOpen)
  const [search, setSearch] = useState('')
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  if (!project) return null
  const proj = project

  function addRoom() {
    const room: Room = {
      id: Math.random().toString(36).slice(2, 9),
      name: `غرفة جديدة ${proj.rooms.length + 1}`,
      nameEn: '',
      description: '',
      hotspots: [],
      infoCards: [],
      materials: [],
      connectedRooms: [],
      hidden: false,
      order: proj.rooms.length
    }
    mutateProject((p) => {
      p.rooms.push(room)
    })
    setActiveRoom(room.id)
    setActiveKind('rooms')
    setEditingRoomId(room.id)
    setRenameValue(room.name)
  }

  function duplicateRoom(room: Room) {
    const copy: Room = structuredClone(room)
    copy.id = Math.random().toString(36).slice(2, 9)
    copy.name = `${room.name} (نسخة)`
    copy.hotspots = room.hotspots.map((h) => ({ ...h, id: Math.random().toString(36).slice(2, 9) }))
    copy.infoCards = room.infoCards.map((c) => ({ ...c, id: Math.random().toString(36).slice(2, 9) }))
    copy.order = proj.rooms.length
    mutateProject((p) => {
      p.rooms.push(copy)
    })
    showToast('تم نسخ الغرفة', 'success')
  }

  function removeRoom(roomId: string) {
    const room = proj.rooms.find((r) => r.id === roomId)
    window.masar.dialogs
      .message({
        type: 'warning',
        buttons: ['حذف', 'إلغاء'],
        defaultId: 1,
        cancelId: 1,
        title: 'حذف غرفة',
        message: `حذف الغرفة "${room?.name}"؟`,
        detail: 'سيتم حذف كل النقاط التفاعلية وبطاقات المعلومات المرتبطة بها.'
      })
      .then((res) => {
        if (res.response !== 0) return
        mutateProject((p) => {
          p.rooms = p.rooms.filter((r) => r.id !== roomId)
          p.floorPlanPoints = p.floorPlanPoints.filter((m) => m.roomId !== roomId)
          p.rooms.forEach((r) => {
            r.hotspots = r.hotspots.filter((h) => h.targetRoomId !== roomId)
            r.connectedRooms = r.connectedRooms.filter((c) => c !== roomId)
          })
        })
        if (useStore.getState().activeRoomId === roomId) {
          const rest = useStore.getState().project!.rooms.filter((r) => r.id !== roomId)
          useStore.getState().setActiveRoom(rest[0]?.id ?? null)
        }
        if (selection.type === 'room' && selection.id === roomId) select({ type: 'none' })
      })
  }

  function commitRename(roomId: string) {
    if (renameValue.trim()) {
      mutateProject((p) => {
        const r = p.rooms.find((x) => x.id === roomId)
        if (r) r.name = renameValue.trim()
      })
    }
    setEditingRoomId(null)
  }

  function moveRoom(roomId: string, dir: -1 | 1) {
    mutateProject((p) => {
      const idx = p.rooms.findIndex((r) => r.id === roomId)
      const target = idx + dir
      if (idx < 0 || target < 0 || target >= p.rooms.length) return
      const [room] = p.rooms.splice(idx, 1)
      p.rooms.splice(target, 0, room)
      p.rooms.forEach((r, i) => {
        r.order = i
      })
    })
  }

  const filteredRooms = proj.rooms.filter(
    (r) => !search || r.name.includes(search) || r.nameEn.toLowerCase().includes(search.toLowerCase())
  )
  const materialCount = proj.rooms.reduce((n, r) => n + r.materials.length, 0)
  const lightingCount = proj.rooms.filter((r) => r.lighting).length

  const rowProps = (kind: string) => ({
    onClick: () => setActiveKind(kind as any),
    className: `tree-row ${activeKind === kind ? 'selected' : ''}`
  })

  return (
    <div className="explorer">
      <div className="explorer-search">
        <div className="search-input-wrap">
          <span className="search-icon"><Icon name="search" size={14} /></span>
          <input
            placeholder="بحث…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="explorer-tree">
        <div className="tree-section">
          <div {...rowProps('project')} style={{ marginBottom: 2 }}>
            <span className="tree-icon">{<Icon name="home" size={15} />}</span>
            <span className="tree-label">المشروع</span>
          </div>
        </div>

        <SectionHeader
          label="الغرف"
          icon={<Icon name="door" size={14} />}
          count={proj.rooms.length}
          sectionKey="rooms"
          onAdd={addRoom}
          addTitle="إضافة غرفة"
        >
          {!roomsCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredRooms.length === 0 && (
                <div className="empty-state" style={{ padding: 10, fontSize: 12 }}>
                  {proj.rooms.length === 0 ? 'لا توجد غرف — أضف غرفة' : 'لا نتائج'}
                </div>
              )}
              {filteredRooms.map((room) => {
                const isActive = activeRoomId === room.id
                return (
                  <div
                    key={room.id}
                    className={`tree-row ${isActive ? 'selected' : ''}`}
                    onClick={() => {
                      setActiveRoom(room.id)
                      setActiveKind('rooms')
                    }}
                    onDoubleClick={() => {
                      setEditingRoomId(room.id)
                      setRenameValue(room.name)
                    }}
                  >
                    {room.thumbnail || room.panorama ? (
                      <img
                        className="tree-thumb"
                        src={assetUrl(proj.id, room.thumbnail || room.panorama)}
                        alt=""
                      />
                    ) : (
                      <span
                        className="tree-thumb"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Icon name="door" size={14} />
                      </span>
                    )}
                    {editingRoomId === room.id ? (
                      <input
                        className="input"
                        autoFocus
                        style={{ height: 22, flex: 1, minWidth: 0 }}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(room.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(room.id)
                          if (e.key === 'Escape') setEditingRoomId(null)
                        }}
                      />
                    ) : (
                      <span className="tree-label">{room.name}</span>
                    )}
                    <span
                      className={`room-status-dot ${room.panorama ? 'ok' : 'missing'}`}
                      title={room.panorama ? 'بانوراما مرفوعة' : 'بانوراما ناقصة'}
                    />
                    <span className="tree-actions">
                      <button
                        className="tree-action-btn"
                        title="أعلى"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveRoom(room.id, -1)
                        }}
                      >
                        <Icon name="chevron-right" size={12} style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                      <button
                        className="tree-action-btn"
                        title="أسفل"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveRoom(room.id, 1)
                        }}
                      >
                        <Icon name="chevron-right" size={12} style={{ transform: 'rotate(90deg)' }} />
                      </button>
                      <button
                        className="tree-action-btn"
                        title="نسخ"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateRoom(room)
                        }}
                      >
                        <Icon name="duplicate" size={12} />
                      </button>
                      <button
                        className="tree-action-btn danger"
                        title="حذف"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRoom(room.id)
                        }}
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </SectionHeader>

        <div className="tree-section">
          <div {...rowProps('floorplan')}>
            <span className="tree-icon">{<Icon name="map" size={15} />}</span>
            <span className="tree-label">مخطط الطابق</span>
            {proj.floorPlanImage && <span className="tree-section-count"><Icon name="check" size={10} /></span>}
          </div>
        </div>

        <div className="tree-section">
          <div
            className={`tree-row ${productsViewOpen ? 'selected' : ''}`}
            onClick={() => useStore.getState().openProductsView()}
          >
            <span className="tree-icon">{<Icon name="grid" size={15} />}</span>
            <span className="tree-label">قسم المنتجات</span>
            <span className="tree-section-count">{proj.products.length}</span>
          </div>
        </div>

        <SectionHeader
          label="ملفات PDF"
          icon={<Icon name="file-text" size={14} />}
          count={proj.pdfs.length}
          sectionKey="pdfs"
        >
          {!pdfsCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {proj.pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="tree-row"
                  onClick={() => {
                    setActiveKind('pdfs')
                    select({ type: 'pdf', id: pdf.id })
                  }}
                >
                  <span className="tree-icon">{<Icon name="pdf" size={15} />}</span>
                  <span className="tree-label">{pdf.name}</span>
                </div>
              ))}
              {proj.pdfs.length === 0 && (
                <div className="empty-state" style={{ padding: 10, fontSize: 12 }}>
                  لا توجد ملفات PDF
                </div>
              )}
            </div>
          )}
        </SectionHeader>

        <SectionHeader
          label="الخامات"
          icon={<span>◨</span>}
          count={materialCount}
          sectionKey="materials"
        />
        <SectionHeader
          label="الإضاءة"
          icon={<span>◐</span>}
          count={lightingCount}
          sectionKey="lighting"
        />
      </div>
    </div>
  )
}
