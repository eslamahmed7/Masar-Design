import { create } from 'zustand'
import type {
  ExplorerKind,
  HotspotType,
  Project,
  ProjectMeta,
  Selection
} from './types'
import { flatToYawPitch } from '../editor360/panoMath'

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
}

export function migrateProject(p: Project): Project {
  for (const r of p.rooms) {
    for (const h of r.hotspots) {
      if (typeof h.yaw !== 'number') {
        const old = h as unknown as { x: number; y: number }
        const yp = flatToYawPitch(old.x ?? 50, old.y ?? 50)
        h.yaw = yp.yaw
        h.pitch = yp.pitch
        delete (h as { x?: number }).x
        delete (h as { y?: number }).y
      }
    }
  }
  const oldMarkers = (p as unknown as { floorPlanMarkers?: { roomId: string; x: number; y: number; w: number; h: number }[] }).floorPlanMarkers
  if (!Array.isArray(p.floorPlanPoints)) {
    p.floorPlanPoints = (oldMarkers ?? []).map((m) => ({
      id: uid(),
      roomId: m.roomId,
      x: Math.max(2, Math.min(98, m.x + (m.w ?? 18) / 2)),
      y: Math.max(2, Math.min(98, m.y + (m.h ?? 14) / 2))
    }))
  }
  delete (p as { floorPlanMarkers?: unknown }).floorPlanMarkers
  return p
}

interface AppState {
  view: 'start' | 'workspace'
  recent: ProjectMeta[]
  project: Project | null
  dirty: boolean
  saving: boolean
  savedAt: number | null
  saveError: string | null

  modal: string | null
  activeKind: ExplorerKind
  activeRoomId: string | null
  selection: Selection

  placingHotspot: HotspotType | null
  placingFloorPoint: boolean
  showHotspots: boolean
  explorerVisible: boolean
  inspectorVisible: boolean
  explorerCollapsed: Record<string, boolean>
  previewOpen: boolean
  toast: { id: number; message: string; kind?: 'info' | 'error' | 'success' } | null

  productsViewOpen: boolean
  productsPickTarget: { roomId: string; hotspotId: string } | null

  undoStack: Project[]
  redoStack: Project[]

  setView: (v: 'start' | 'workspace') => void
  setModal: (m: string | null) => void
  loadRecent: () => Promise<void>
  openProject: (p: Project) => void
  clearProject: () => void

  mutateProject: (fn: (p: Project) => void, opts?: { silent?: boolean }) => void
  saveProject: () => Promise<boolean>

  setActiveKind: (k: ExplorerKind) => void
  setActiveRoom: (id: string | null) => void
  select: (s: Selection) => void

  setPlacingHotspot: (t: HotspotType | null) => void
  setPlacingFloorPoint: (v: boolean) => void
  setShowHotspots: (v: boolean) => void
  setExplorerVisible: (v: boolean) => void
  setInspectorVisible: (v: boolean) => void
  toggleExplorerSection: (key: string) => void
  setPreviewOpen: (v: boolean) => void
  showToast: (message: string, kind?: 'info' | 'error' | 'success') => void

  openProductsView: (pick?: { roomId: string; hotspotId: string } | null) => void
  closeProductsView: () => void
  pickProduct: (productId: string) => void

  undo: () => void
  redo: () => void
}

export const useStore = create<AppState>((set, get) => ({
  view: 'start',
  recent: [],
  project: null,
  dirty: false,
  saving: false,
  savedAt: null,
  saveError: null,

  modal: null,
  activeKind: 'rooms',
  activeRoomId: null,
  selection: { type: 'none' },

  placingHotspot: null,
  placingFloorPoint: false,
  showHotspots: true,
  explorerVisible: true,
  inspectorVisible: true,
  explorerCollapsed: { materials: true, lighting: true, pdfs: true },
  previewOpen: false,
  toast: null,

  productsViewOpen: false,
  productsPickTarget: null,

  undoStack: [],
  redoStack: [],

  setView: (v) => set({ view: v }),
  setModal: (m) => set({ modal: m }),

  loadRecent: async () => {
    try {
      const recent = await window.masar.projects.list()
      set({ recent })
    } catch {
      set({ recent: [] })
    }
  },

  openProject: (p) => {
    set({
      project: migrateProject(p),
      view: 'workspace',
      dirty: false,
      savedAt: p.updatedAt,
      activeKind: 'rooms',
      activeRoomId: p.rooms[0]?.id ?? null,
      selection: { type: 'none' },
      placingHotspot: null,
      previewOpen: false,
      undoStack: [],
      redoStack: []
    })
  },

  clearProject: () => {
    set({
      project: null,
      view: 'start',
      dirty: false,
      activeRoomId: null,
      selection: { type: 'none' },
      placingHotspot: null,
      productsViewOpen: false,
      productsPickTarget: null,
      undoStack: [],
      redoStack: []
    })
  },

  mutateProject: (fn, opts) => {
    const { project } = get()
    if (!project) return
    const next = structuredClone(project)
    fn(next)
    next.updatedAt = Date.now()
    const undoStack = [...get().undoStack, project].slice(-60)
    set({ project: next, dirty: !opts?.silent, undoStack, redoStack: [] })
  },

  saveProject: async () => {
    const { project } = get()
    if (!project) return false
    set({ saving: true, saveError: null })
    try {
      const res = await window.masar.projects.save(project)
      set({ saving: false, dirty: false, savedAt: res.savedAt })
      get().loadRecent()
      return true
    } catch (e: any) {
      set({ saving: false, saveError: e?.message ?? 'فشل الحفظ' })
      return false
    }
  },

  setActiveKind: (k) => {
    set({ activeKind: k, placingHotspot: null })
    if (k === 'rooms') {
      const { project, activeRoomId } = get()
      if (project && activeRoomId && !project.rooms.some((r) => r.id === activeRoomId)) {
        set({ activeRoomId: project.rooms[0]?.id ?? null })
      }
    }
  },

  setActiveRoom: (id) => {
    set({ activeRoomId: id, placingHotspot: null, selection: { type: 'none' } })
  },

  select: (s) => set({ selection: s }),

  setPlacingHotspot: (t) => set({ placingHotspot: t, selection: { type: 'none' } }),
  setPlacingFloorPoint: (v) => set({ placingFloorPoint: v, selection: { type: 'none' } }),
  setShowHotspots: (v) => set({ showHotspots: v }),

  setExplorerVisible: (v) => set({ explorerVisible: v }),
  setInspectorVisible: (v) => set({ inspectorVisible: v }),
  toggleExplorerSection: (key) =>
    set((s) => ({
      explorerCollapsed: { ...s.explorerCollapsed, [key]: !s.explorerCollapsed[key] }
    })),
  setPreviewOpen: (v) => set({ previewOpen: v }),
  showToast: (message, kind = 'info') => {
    set({ toast: { id: Date.now(), message, kind } })
  },

  openProductsView: (pick = null) => set({ productsViewOpen: true, productsPickTarget: pick }),
  closeProductsView: () =>
    set((s) => {
      const next: Partial<AppState> = { productsViewOpen: false, productsPickTarget: null }
      if (!s.productsPickTarget && s.view === 'workspace') next.view = 'start'
      return next
    }),
  pickProduct: (productId) => {
    const { productsPickTarget, project } = get()
    if (productsPickTarget && project) {
      const next = structuredClone(project)
      const room = next.rooms.find((r) => r.id === productsPickTarget.roomId)
      const h = room?.hotspots.find((x) => x.id === productsPickTarget.hotspotId)
      if (h) h.productId = productId
      next.updatedAt = Date.now()
      const undoStack = [...get().undoStack, project].slice(-60)
      set({ project: next, dirty: true, undoStack, redoStack: [] })
    }
    set({ productsViewOpen: false, productsPickTarget: null })
  },

  undo: () => {
    const { undoStack, project } = get()
    if (undoStack.length === 0 || !project) return
    const prev = undoStack[undoStack.length - 1]
    set({
      project: prev,
      dirty: true,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, project].slice(-60)
    })
  },
  redo: () => {
    const { redoStack, project } = get()
    if (redoStack.length === 0 || !project) return
    const next = redoStack[redoStack.length - 1]
    set({
      project: next,
      dirty: true,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, project].slice(-60)
    })
  }
}))
