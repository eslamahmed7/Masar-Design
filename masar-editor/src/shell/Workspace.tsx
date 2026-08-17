import { useRef, useState } from 'react'
import { useStore } from '../core/store'
import { Icon, type IconName } from '../components/Icon'
import TitleBar from './TitleBar'
import Toolbar from './Toolbar'
import ProjectExplorer from './ProjectExplorer'
import PropertiesInspector from './PropertiesInspector'
import StatusBar from './StatusBar'
import RoomEditor from '../editor360/RoomEditor'
import FloorPlanEditor from '../editor360/FloorPlanEditor'
import ProductsView from '../features/ProductsView'
import PdfsPanel from '../features/PdfsPanel'
import MaterialsPanel from '../features/MaterialsPanel'
import LightingPanel from '../features/LightingPanel'
import ProjectInfoPanel from '../project/ProjectInfoPanel'
import PreviewViewer from '../preview/PreviewViewer'

const TABS: { kind: any; label: string; icon: IconName }[] = [
  { kind: 'rooms', label: 'الغرف', icon: 'door' },
  { kind: 'floorplan', label: 'مخطط الطابق', icon: 'map' },
  { kind: 'pdfs', label: 'PDF', icon: 'file-text' },
  { kind: 'materials', label: 'الخامات', icon: 'layers' },
  { kind: 'lighting', label: 'الإضاءة', icon: 'lightbulb' },
  { kind: 'project', label: 'المشروع', icon: 'building' }
]

export default function Workspace({ onOpenProject, onHome }: { onOpenProject: (id: string) => void; onHome: () => void }) {
  const project = useStore((s) => s.project)
  const activeKind = useStore((s) => s.activeKind)
  const setActiveKind = useStore((s) => s.setActiveKind)
  const activeRoomId = useStore((s) => s.activeRoomId)
  const explorerVisible = useStore((s) => s.explorerVisible)
  const inspectorVisible = useStore((s) => s.inspectorVisible)
  const previewOpen = useStore((s) => s.previewOpen)
  const setPreviewOpen = useStore((s) => s.setPreviewOpen)
  const productsViewOpen = useStore((s) => s.productsViewOpen)
  const [explorerWidth, setExplorerWidth] = useState(268)
  const resizerRef = useRef<HTMLDivElement>(null)

  function startResize(e: React.PointerEvent) {
    const startX = e.clientX
    const startW = explorerWidth
    const move = (ev: PointerEvent) => {
      const dir = document.documentElement.dir === 'rtl' ? -1 : 1
      setExplorerWidth(Math.max(200, Math.min(420, startW + (ev.clientX - startX) * dir)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  if (!project) {
    return (
      <div className="app-root">
        <TitleBar />
        <StatusBar />
      </div>
    )
  }

  const activeRoom = project.rooms.find((r) => r.id === activeRoomId) ?? null

  return (
    <div className="app-root">
      <TitleBar />
      <Toolbar onHome={onHome} />
      <div className="workspace">
        {explorerVisible && (
          <>
            <div className="sidebar">
              <ProjectExplorer />
            </div>
            <div ref={resizerRef} className="sidebar-resizer" onPointerDown={startResize} />
          </>
        )}

        <div className="center">
          <div className="center-tabs">
            {TABS.map((t) => (
              <button
                key={t.kind}
                className={`center-tab ${activeKind === t.kind ? 'active' : ''}`}
                onClick={() => setActiveKind(t.kind)}
              >
                <span className="icon-inline">{<Icon name={t.icon} size={15} />}</span>
                {t.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            {explorerVisible ? (
              <button className="toolbar-btn" title="إخفاء المستكشف (Ctrl+B)" onClick={() => useStore.getState().setExplorerVisible(false)}>
                ◀
              </button>
            ) : (
              <button className="toolbar-btn" title="إظهار المستكشف (Ctrl+B)" onClick={() => useStore.getState().setExplorerVisible(true)}>
                ▶
              </button>
            )}
            {inspectorVisible ? (
              <button className="toolbar-btn" title="إخفاء الخصائص (Ctrl+I)" onClick={() => useStore.getState().setInspectorVisible(false)}>
                ▶
              </button>
            ) : (
              <button className="toolbar-btn" title="إظهار الخصائص (Ctrl+I)" onClick={() => useStore.getState().setInspectorVisible(true)}>
                ◀
              </button>
            )}
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {activeKind === 'rooms' && (activeRoom ? <RoomEditor key={activeRoom.id} room={activeRoom} /> : <div className="empty-state" style={{ height: '100%' }}>اختر غرفة</div>)}
            {activeKind === 'floorplan' && <FloorPlanEditor />}
            {activeKind === 'pdfs' && <PdfsPanel />}
            {activeKind === 'materials' && <MaterialsPanel />}
            {activeKind === 'lighting' && <LightingPanel />}
            {activeKind === 'project' && <ProjectInfoPanel />}
          </div>
        </div>

        {inspectorVisible && (
          <div className="inspector">
            <PropertiesInspector />
          </div>
        )}
      </div>
      <StatusBar />

      {previewOpen && <PreviewViewer onClose={() => setPreviewOpen(false)} />}
      {productsViewOpen && <ProductsView />}
    </div>
  )
}
