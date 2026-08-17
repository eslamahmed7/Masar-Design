import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../core/store'
import { assetUrl, uploadImage } from '../core/ipc'
import { Icon, type IconName } from '../components/Icon'
import PanoramaViewer from './PanoramaViewer'
import { projectPin, unprojectPin } from './panoMath'
import { navStyleIcon } from '../core/navStyles'
import type { Hotspot, HotspotType, Room } from '../core/types'

const PIN_STYLE: Record<HotspotType, { color: string; bg: string; icon: IconName }> = {
  navigate: { color: '#93f3c5', bg: 'rgba(147,243,197,0.18)', icon: 'navigate' },
  info: { color: '#eaf4ff', bg: 'rgba(234,244,255,0.14)', icon: 'info' },
  external: { color: '#7cc4f5', bg: 'rgba(124,196,245,0.18)', icon: 'external' },
  pdf: { color: '#ff7b72', bg: 'rgba(255,123,114,0.18)', icon: 'pdf' },
  product: { color: '#c2a8ff', bg: 'rgba(194,168,255,0.18)', icon: 'product' }
}

const DEFAULT_LABELS: Record<HotspotType, string> = {
  navigate: 'انتقل إلى…',
  info: 'معلومات',
  external: 'رابط خارجي',
  pdf: 'ملف PDF',
  product: 'منتج'
}

type ViewMode = { kind: 'main' } | { kind: 'lighting' } | { kind: 'material'; id: string }

export default function RoomEditor({ room }: { room: Room }) {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const select = useStore((s) => s.select)
  const selection = useStore((s) => s.selection)
  const placingHotspot = useStore((s) => s.placingHotspot)
  const setPlacingHotspot = useStore((s) => s.setPlacingHotspot)
  const showHotspots = useStore((s) => s.showHotspots)
  const showToast = useStore((s) => s.showToast)
  const setInspectorVisible = useStore((s) => s.setInspectorVisible)

  const [viewMode, setViewMode] = useState<ViewMode>({ kind: 'main' })
  const [loaded, setLoaded] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; hotspotId: string } | null>(null)
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const pressRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragRef = useRef<{ id: string; el: HTMLElement; startX: number; startY: number } | null>(null)
  const updateRef = useRef<() => void>(() => {})

  const roomIndex = project?.rooms.findIndex((r) => r.id === room.id) ?? 0

  useEffect(() => {
    setViewMode({ kind: 'main' })
    setLoaded(false)
  }, [room.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (ctxMenu) {
        if (e.key === 'Escape') setCtxMenu(null)
        return
      }
      if (e.key === 'Escape') {
        if (placingHotspot) setPlacingHotspot(null)
        else select({ type: 'none' })
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.type === 'hotspot') {
        e.preventDefault()
        mutateProject((p) => {
          const r = p.rooms.find((x) => x.id === selection.roomId)
          if (r) r.hotspots = r.hotspots.filter((h) => h.id !== selection.id)
        })
        select({ type: 'none' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ctxMenu, placingHotspot, selection, mutateProject, select, setPlacingHotspot])

  const updatePins = useCallback(() => {
    const v = viewerRef.current
    const el = containerRef.current
    if (!v || !el) return
    const canvas = el.querySelector('canvas')
    const rect = (canvas ?? el).getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    let hfov: number
    let yaw: number
    let pitch: number
    try {
      hfov = v.getHfov()
      yaw = v.getYaw()
      pitch = v.getPitch()
    } catch {
      return
    }
    el.querySelectorAll<HTMLElement>('[data-hid]').forEach((pinEl) => {
      const id = pinEl.dataset.hid
      const hp = room.hotspots.find((x) => x.id === id)
      if (!hp || !hp.visible) {
        pinEl.style.display = 'none'
        return
      }
      const pr = projectPin(hp.yaw, hp.pitch, yaw, pitch, hfov, rect.width, rect.height)
      if (!pr.visible) {
        pinEl.style.display = 'none'
        return
      }
      pinEl.style.display = ''
      const w = pinEl.offsetWidth || 34
      const h = pinEl.offsetHeight || 34
      pinEl.style.left = `${pr.x - w / 2}px`
      pinEl.style.top = `${pr.y - h / 2}px`
    })
  }, [room.hotspots])

  updateRef.current = updatePins

  useEffect(() => {
    updateRef.current()
  }, [room.hotspots])

  useEffect(() => {
    function onResize() {
      updateRef.current()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    function onDown(e: PointerEvent) {
      pressRef.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    }
    function onUp(e: PointerEvent) {
      const p = pressRef.current
      pressRef.current = null
      if (!p) return
      if (Math.abs(e.clientX - p.x) > 5 || Math.abs(e.clientY - p.y) > 5) return
      const v = viewerRef.current
      const el = containerRef.current
      if (!v || !el) return
      const canvas = el.querySelector('canvas')
      const rect = (canvas ?? el).getBoundingClientRect()
      if (placingHotspot) {
        const ex = e.clientX - rect.left
        const ey = e.clientY - rect.top
        const { yaw, pitch } = unprojectPin(
          ex,
          ey,
          v.getYaw(),
          v.getPitch(),
          v.getHfov(),
          rect.width,
          rect.height
        )
        const type = placingHotspot
        const id = Math.random().toString(36).slice(2, 9)
        mutateProject((p) => {
          const r = p.rooms.find((x) => x.id === room.id)
          if (!r) return
          const hs: Hotspot = {
            id,
            type,
            yaw,
            pitch,
            label: DEFAULT_LABELS[type],
            visible: true
          }
          r.hotspots.push(hs)
        })
        select({ type: 'hotspot', roomId: room.id, id })
        setPlacingHotspot(null)
        setInspectorVisible(true)
        setGhost(null)
        showToast('تمت إضافة النقطة — عيّن خصائصها من اليمين', 'success')
        updateRef.current()
      } else {
        setCtxMenu(null)
      }
    }
    const el = containerRef.current
    el?.addEventListener('pointerdown', onDown)
    el?.addEventListener('pointerup', onUp)
    return () => {
      el?.removeEventListener('pointerdown', onDown)
      el?.removeEventListener('pointerup', onUp)
    }
  }, [placingHotspot, mutateProject, select, room.id, setPlacingHotspot, showToast])

  if (!project) return null
  const proj = project

  const modePanorama =
    viewMode.kind === 'main'
      ? room.panorama
      : viewMode.kind === 'lighting'
        ? room.lighting
        : room.materials.find((m) => m.id === viewMode.id)?.panorama

  const panoramaSrc = modePanorama ? assetUrl(proj.id, modePanorama) : ''

  function startDrag(e: React.PointerEvent, h: Hotspot) {
    e.stopPropagation()
    setCtxMenu(null)
    const el = containerRef.current
    const canvas = el?.querySelector('canvas')
    const rect = (canvas ?? el)?.getBoundingClientRect()
    const pinEl = (e.target as HTMLElement).closest('[data-hid]') as HTMLElement | null
    if (!rect || !pinEl) return
    dragRef.current = { id: h.id, el: pinEl, startX: e.clientX, startY: e.clientY }
    pinEl.style.transition = 'none'

    const move = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d || d.id !== h.id) return
      pinEl.style.left = `${ev.clientX - rect.left - pinEl.offsetWidth / 2}px`
      pinEl.style.top = `${ev.clientY - rect.top - pinEl.offsetHeight / 2}px`
    }
    const up = (ev: PointerEvent) => {
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const v = viewerRef.current
      if (!v) return
      const { yaw, pitch } = unprojectPin(
        ev.clientX - rect.left,
        ev.clientY - rect.top,
        v.getYaw(),
        v.getPitch(),
        v.getHfov(),
        rect.width,
        rect.height
      )
      mutateProject((p) => {
        const r = p.rooms.find((x) => x.id === room.id)
        const hs = r?.hotspots.find((y) => y.id === h.id)
        if (hs) {
          hs.yaw = yaw
          hs.pitch = pitch
        }
      })
      updateRef.current()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function openCtxMenu(e: React.MouseEvent, h: Hotspot) {
    e.preventDefault()
    e.stopPropagation()
    select({ type: 'hotspot', roomId: room.id, id: h.id })
    setCtxMenu({ x: e.clientX, y: e.clientY, hotspotId: h.id })
  }

  function toggleHotspotVisibility(id: string) {
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      const h = r?.hotspots.find((y) => y.id === id)
      if (h) h.visible = !h.visible
    })
    updateRef.current()
  }

  function duplicateHotspot(h: Hotspot) {
    const copy = { ...h, id: Math.random().toString(36).slice(2, 9), yaw: Math.min(180, h.yaw + 3) }
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      r?.hotspots.push(copy)
    })
    select({ type: 'hotspot', roomId: room.id, id: copy.id })
    updateRef.current()
  }

  function removeHotspot(id: string) {
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      if (r) r.hotspots = r.hotspots.filter((h) => h.id !== id)
    })
    select({ type: 'none' })
  }

  async function uploadPanorama() {
    try {
      const rel = await uploadImage(proj.id)
      if (!rel) return
      mutateProject((p) => {
        const r = p.rooms.find((x) => x.id === room.id)
        if (r) {
          if (viewMode.kind === 'main') r.panorama = rel
          else if (viewMode.kind === 'lighting') r.lighting = rel
          else {
            const m = r.materials.find((x) => x.id === viewMode.id)
            if (m) m.panorama = rel
          }
        }
      })
      showToast('تم رفع البانوراما', 'success')
      const img = new Image()
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight
        if (ratio < 1.6 || ratio > 2.4) {
          showToast(`تنبيه: الصورة بنسبة 1:${(1 / ratio).toFixed(1)} وليست 2:1 — ستظهر ممدودة في الجولة 360`, 'error')
        }
      }
      img.src = assetUrl(proj.id, rel)
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  const visibleHotspots = room.hotspots.filter((h) => h.visible)

  function handleCanvasMove(e: React.PointerEvent) {
    if (!placingHotspot) {
      if (ghost) setGhost(null)
      return
    }
    const el = containerRef.current
    const canvas = el?.querySelector('canvas')
    const rect = (canvas ?? el)?.getBoundingClientRect()
    if (!rect) return
    setGhost({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={containerRef}
      className="editor-canvas"
      style={{ cursor: placingHotspot ? 'crosshair' : undefined }}
      onPointerMove={handleCanvasMove}
      onPointerLeave={() => setGhost(null)}
      onContextMenu={(e) => {
        e.preventDefault()
        setCtxMenu(null)
      }}
    >
      {panoramaSrc ? (
        <>
          <PanoramaViewer
            key={`${room.id}-${viewMode.kind}-${viewMode.kind === 'material' ? viewMode.id : ''}`}
            src={panoramaSrc}
            onLoaded={() => {
              setLoaded(true)
              updateRef.current()
            }}
            onViewer={(v) => {
              viewerRef.current = v
              v.on('load', () => updateRef.current())
              v.on('animateMove', () => updateRef.current())
              v.on('yawchange', () => updateRef.current())
              v.on('pitchchange', () => updateRef.current())
              v.on('zoomchange', () => updateRef.current())
              updateRef.current()
            }}
          />
          {!loaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
              <span style={{ color: 'var(--text-faint)', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--text-faint)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                جارٍ تحميل البانوراما…
              </span>
            </div>
          )}

          {showHotspots &&
            visibleHotspots.map((h) => {
              const style = PIN_STYLE[h.type]
              const isSelected = selection.type === 'hotspot' && selection.id === h.id
              const glyph = h.type === 'navigate' ? navStyleIcon(h.navStyle) : style.icon
              return (
                <div
                  key={h.id}
                  data-hid={h.id}
                  className={`hotspot-pin ${isSelected ? 'selected' : ''}`}
                  style={{ display: 'none', color: style.color }}
                  onPointerDown={(e) => startDrag(e, h)}
                  onClick={(e) => {
                    e.stopPropagation()
                    select({ type: 'hotspot', roomId: room.id, id: h.id })
                  }}
                  onContextMenu={(e) => openCtxMenu(e, h)}
                >
                  <span className="hotspot-label-tip">{h.label}</span>
                  <span className="hotspot-ring" />
                  <span className="hotspot-core" style={{ background: style.bg, borderColor: style.color }}>
                    <span className="icon-inline">{<Icon name={glyph} size={15} strokeWidth={2} />}</span>
                  </span>
                </div>
              )
            })}

          {placingHotspot && ghost && (
            <div
              className="placement-ghost"
              style={{
                left: ghost.x,
                top: ghost.y,
                color: PIN_STYLE[placingHotspot].color,
                ['--ghost-bg' as string]: PIN_STYLE[placingHotspot].bg,
                ['--ghost-border' as string]: PIN_STYLE[placingHotspot].color
              }}
            >
              <span className="hotspot-ring" />
              <span
                className="hotspot-core"
                style={{
                  background: PIN_STYLE[placingHotspot].bg,
                  borderColor: PIN_STYLE[placingHotspot].color
                }}
              >
                <span className="icon-inline">
                  <Icon name={PIN_STYLE[placingHotspot].icon} size={15} strokeWidth={2} />
                </span>
              </span>
            </div>
          )}

          {placingHotspot && (
            <div className="place-banner">
              <span style={{ fontWeight: 700 }}>انقر على البانوراما لوضع نقطة {DEFAULT_LABELS[placingHotspot]}</span>
              <button className="btn btn-sm" onClick={() => setPlacingHotspot(null)}>
                إلغاء (Esc)
              </button>
            </div>
          )}

          {ctxMenu && (
            <div
              className="hotspot-context-menu"
              style={{ top: Math.min(ctxMenu.y, window.innerHeight - 220), left: Math.min(ctxMenu.x, window.innerWidth - 190) }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const h = room.hotspots.find((x) => x.id === ctxMenu.hotspotId)
                if (!h) return null
                return (
                  <>
                    <div className="ctx-item" onClick={() => { setCtxMenu(null); select({ type: 'hotspot', roomId: room.id, id: h.id }) }}>
                      <Icon name="settings" size={14} /> الخصائص
                    </div>
                    <div className="ctx-item" onClick={() => { toggleHotspotVisibility(h.id); setCtxMenu(null) }}>
                      <Icon name={h.visible ? 'eye-off' : 'eye'} size={14} />
                      {h.visible ? 'إخفاء النقطة' : 'إظهار النقطة'}
                    </div>
                    <div className="ctx-item" onClick={() => { duplicateHotspot(h); setCtxMenu(null) }}>
                      <Icon name="duplicate" size={14} /> نسخ النقطة
                    </div>
                    <div className="ctx-sep" />
                    <div className="ctx-item danger" onClick={() => { removeHotspot(h.id); setCtxMenu(null) }}>
                      <Icon name="trash" size={14} /> حذف النقطة
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </>
      ) : (
        <div className="editor-empty" style={{ flexDirection: 'column', gap: 14 }}>
          <div className="empty-icon" style={{ width: 64, height: 64, borderRadius: 18 }}>
            <Icon name="image" size={30} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>لا توجد بانوراما لهذه الغرفة</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            ارفع صورة بانورامية (Equirectangular — نسبة 2:1) لتشغيل محرر الـ360
          </div>
          <button className="btn btn-primary" onClick={uploadPanorama}>
            <Icon name="upload" size={14} /> رفع بانوراما 360
          </button>
        </div>
      )}

      {/* ===== Top overlay: modes ===== */}
      <div className="editor-toolbar-overlay">
        <span className="mode-chip" style={{ fontWeight: 700, color: 'var(--text)' }}>
          {room.name}
        </span>
        <span style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <button className={`mode-chip ${viewMode.kind === 'main' ? 'active' : ''}`} onClick={() => setViewMode({ kind: 'main' })}>
          <Icon name="sun" size={13} /> الإضاءة مضاءة
        </button>
        <button
          className={`mode-chip ${viewMode.kind === 'lighting' ? 'active' : ''}`}
          onClick={() => {
            setViewMode({ kind: 'lighting' })
            setLoaded(false)
          }}
          title={room.lighting ? 'بانوراما الإضاءة المطفأة' : 'لم ترفع بعد'}
        >
          <Icon name="moon" size={13} /> إضاءة مطفأة {!room.lighting && <span style={{ color: 'var(--warn)' }}>—</span>}
        </button>
        {room.materials.map((m) => (
          <button
            key={m.id}
            className={`mode-chip ${viewMode.kind === 'material' && viewMode.id === m.id ? 'active' : ''}`}
            onClick={() => {
              setViewMode({ kind: 'material', id: m.id })
              setLoaded(false)
            }}
            title={m.panorama ? 'بانوراما الخامة' : 'لم ترفع بعد'}
          >
            <Icon name="layers" size={13} /> {m.label} {!m.panorama && <span style={{ color: 'var(--warn)' }}>—</span>}
          </button>
        ))}
      </div>

      {/* ===== Bottom overlay: room nav ===== */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          insetInlineStart: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(4,18,31,0.85)',
          border: '1px solid rgba(147,243,197,0.2)',
          borderRadius: 999,
          padding: '5px 14px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          zIndex: 30
        }}
      >
        <button
          className="toolbar-btn"
          disabled={roomIndex <= 0}
          onClick={() => {
            const rooms = useStore.getState().project?.rooms ?? []
            const next = rooms[roomIndex - 1]
            if (next) useStore.getState().setActiveRoom(next.id)
          }}
        >
          <Icon name="chevron-right" size={15} style={{ transform: 'scaleX(-1)' }} />
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {roomIndex + 1} / {proj.rooms.length} — {room.hotspots.length} نقاط
        </span>
        <button
          className="toolbar-btn"
          disabled={roomIndex >= proj.rooms.length - 1}
          onClick={() => {
            const rooms = useStore.getState().project?.rooms ?? []
            const next = rooms[roomIndex + 1]
            if (next) useStore.getState().setActiveRoom(next.id)
          }}
        >
          <Icon name="chevron-right" size={15} />
        </button>
      </div>
    </div>
  )
}
