import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../core/store'
import { assetUrl } from '../core/ipc'
import { Icon } from '../components/Icon'
import PanoramaViewer from '../editor360/PanoramaViewer'
import { projectPin } from '../editor360/panoMath'
import { navStyleIcon } from '../core/navStyles'
import type { NavStyle } from '../core/types'
import type { Hotspot, InfoCard, Product, Room } from '../core/types'
import LandingPage from './LandingPage'
import './preview.css'

export default function PreviewViewer({ onClose }: { onClose: () => void }) {
  const project = useStore((s) => s.project)
  const showHotspots = useStore((s) => s.showHotspots)
  const [phase, setPhase] = useState<'landing' | 'tour'>('landing')
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [night, setNight] = useState(false)
  const [activeInfo, setActiveInfo] = useState<{ hotspot: Hotspot; card?: InfoCard } | null>(null)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [showRooms, setShowRooms] = useState(false)
  const [showFloor, setShowFloor] = useState(false)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [shotDone, setShotDone] = useState(false)
  const [swooshKey, setSwooshKey] = useState(0)
  const [swooshOn, setSwooshOn] = useState(false)
  const viewerRef = useRef<any>(null)
  const viewerBoxRef = useRef<HTMLDivElement>(null)
  const navLayerRef = useRef<HTMLDivElement>(null)
  const navPinEls = useRef<Record<string, HTMLElement | null>>({})

  const rooms = useMemo(
    () => (project ? project.rooms.filter((r) => !r.hidden) : []),
    [project]
  )

  const currentRoom: Room | null = useMemo(
    () => rooms.find((r) => r.id === currentRoomId) ?? null,
    [rooms, currentRoomId]
  )
  const currentIdx = currentRoom ? rooms.findIndex((r) => r.id === currentRoom.id) : -1

  const navTargets = useMemo(() => {
    if (!currentRoom) return []
    return (currentRoom.hotspots ?? [])
      .filter((h) => h.visible && h.type === 'navigate' && h.targetRoomId)
      .map((h) => {
        const target = rooms.find((r) => r.id === h.targetRoomId)
        return target && target.panorama
          ? { id: h.id, yaw: h.yaw, pitch: h.pitch, style: h.navStyle, label: h.label || target.name, target }
          : null
      })
      .filter(
        (x): x is { id: string; yaw: number; pitch: number; style: NavStyle | undefined; label: string; target: Room } => !!x
      )
  }, [currentRoom, rooms])

  const navTargetsRef = useRef(navTargets)
  navTargetsRef.current = navTargets

  const scenes = useMemo(() => {
    if (!project) return []
    return rooms
      .filter((r) => r.panorama)
      .map((r) => ({
        id: r.id,
        panorama: assetUrl(project.id, night ? r.lighting ?? r.panorama! : r.panorama!),
        hotspots: r.hotspots
      }))
  }, [project, rooms, night])

  const enterTour = useCallback(() => {
    setPhase('tour')
    setLoading(true)
    const first = rooms[0]
    if (first) {
      setCurrentRoomId(first.id)
      setVisited(new Set([first.id]))
    }
    setShowRooms(false)
    setShowFloor(false)
  }, [rooms])

  const goToRoom = useCallback(
    (roomId: string) => {
      if (!roomId || !viewerRef.current) return
      const room = rooms.find((r) => r.id === roomId)
      if (!room || !room.panorama) {
        useStore.getState().showToast('لا توجد بانوراما لهذه الغرفة', 'error')
        return
      }
      try {
        viewerRef.current.loadScene(roomId)
        setVisited((v) => new Set(v).add(roomId))
        setShowFloor(false)
        setShowRooms(false)
      } catch {
        /* noop */
      }
    },
    [rooms]
  )

  useEffect(() => {
    if (!navLayerRef.current || navTargets.length === 0) return
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < 50) return
      last = t
      const v = viewerRef.current
      const box = viewerBoxRef.current
      if (!v || !box) return
      const rect = box.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      let yaw: number
      let pitch: number
      let hfov: number
      try {
        yaw = v.getYaw()
        pitch = v.getPitch()
        hfov = v.getHfov()
      } catch {
        return
      }
      navTargetsRef.current.forEach((nt) => {
        const el = navPinEls.current[nt.id]
        if (!el) return
        const pr = projectPin(nt.yaw, nt.pitch, yaw, pitch, hfov, rect.width, rect.height)
        if (!pr.visible) {
          el.style.display = 'none'
          return
        }
        el.style.display = ''
        const w = el.offsetWidth || 120
        const h = el.offsetHeight || 48
        el.style.transform = `translate(${Math.round(pr.x - w / 2)}px, ${Math.round(pr.y - h / 2)}px)`
      })
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [navTargets.length])

  useEffect(() => {
    if (!swooshOn) return
    const t = setTimeout(() => setSwooshOn(false), 500)
    return () => clearTimeout(t)
  }, [swooshOn])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (activeInfo || activeProduct) {
          setActiveInfo(null)
          setActiveProduct(null)
        } else if (showFloor || showRooms) {
          setShowFloor(false)
          setShowRooms(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, activeInfo, activeProduct, showFloor, showRooms])

  if (!project) return null
  const proj = project

  function handleHotspotClick(hotspotId: string) {
    const h = currentRoom?.hotspots.find((x) => x.id === hotspotId)
    if (!h) return
    if (h.type === 'info') {
      setActiveInfo({ hotspot: h, card: currentRoom?.infoCards.find((c) => c.id === h.infoCardId) })
    } else if (h.type === 'product' && h.productId) {
      const p = proj.products.find((x) => x.id === h.productId)
      if (p) setActiveProduct(p)
    } else if (h.type === 'external' && h.url) {
      window.masar.dialogs.openExternal(h.url)
    } else if (h.type === 'pdf' && h.pdfId) {
      const pdf = proj.pdfs.find((x) => x.id === h.pdfId)
      if (pdf) window.masar.dialogs.openPath(pdf.path)
    }
  }

  async function takeScreenshot() {
    const canvas = viewerBoxRef.current?.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    await window.masar.dialogs.saveImage(`${proj.name}-${currentRoom?.name ?? 'room'}.jpg`, dataUrl)
    setShotDone(true)
    setTimeout(() => setShotDone(false), 1500)
  }

  const floorPoints = proj.floorPlanPoints
    .map((pt) => ({ point: pt, room: rooms.find((r) => r.id === pt.roomId) }))
    .filter((x) => x.point && x.room)

  return (
    <div className="preview-root" dir="rtl">
      {phase === 'landing' ? (
        <LandingPage project={proj} onEnterTour={enterTour} onClose={onClose} onProductClick={(p) => setActiveProduct(p)} />
      ) : (
        <div className={`preview-tour ${showHotspots ? '' : 'pt-hide-hotspots'}`}>
          <div ref={viewerBoxRef} className="pt-viewer">
            {scenes.length > 0 ? (
              <PanoramaViewer
                key={`${night}-${proj.id}`}
                scenes={scenes}
                hfov={75}
                onViewer={(v) => {
                  viewerRef.current = v
                }}
                onLoaded={() => setLoading(false)}
                onSceneChange={(id) => {
                  setCurrentRoomId(id)
                  setVisited((v) => new Set(v).add(id))
                  setSwooshKey((k) => k + 1)
                  setSwooshOn(true)
                }}
                onHotspotClick={handleHotspotClick}
              />
            ) : (
              <div className="pt-noimg" style={{ height: '100%' }}>
                <Icon name="door" size={40} />
                <div style={{ marginTop: 10, fontSize: 14, color: 'var(--text-muted)' }}>لا توجد غرف ببانوراما — أضف بانوراما لأي غرفة من المحرر</div>
              </div>
            )}

            {loading && <div className="pt-transition" />}
            {swooshOn && <div key={swooshKey} className="pt-swoosh" />}

            {/* top bar */}
            <div className="pt-topbar">
              <div className="pt-top-right">
                <button type="button" className="pt-btn" onClick={onClose}>
                  <Icon name="x" size={13} /> <span>خروج</span>
                </button>
                <div className="pt-project-info">
                  <div className="pt-project-name">{project.name}</div>
                  <div className="pt-room-name">{currentRoom?.name ?? ''}</div>
                </div>
              </div>
              <div className="pt-top-left">
                <button
                  className={`pt-btn ${night ? 'pt-night' : ''}`}
                  onClick={() => setNight((n) => !n)}
                  title="تبديل الإضاءة"
                >
                  <Icon name={night ? 'sun' : 'moon'} size={15} />
                </button>
                <button className="pt-btn" onClick={takeScreenshot} title="لقطة شاشة">
                  {shotDone ? <Icon name="check" size={15} /> : <Icon name="camera" size={15} />}
                </button>
              </div>
            </div>

            {/* bottom controls */}
            <div className="pt-hud">
              <button
                className={`pt-hud-btn pt-hud-btn-floor ${showFloor ? 'active' : ''}`}
                onClick={() => {
                  setShowFloor((v) => !v)
                  setShowRooms(false)
                }}
              >
                {proj.floorPlanImage ? (
                  <img className="pt-hud-floor-thumb" src={assetUrl(proj.id, proj.floorPlanImage)} alt="مخطط الطابق" />
                ) : (
                  <Icon name="map" size={14} />
                )}
                <span>المخطط</span>
              </button>
              <button
                className={`pt-hud-btn ${showRooms ? 'active' : ''}`}
                onClick={() => {
                  setShowRooms((v) => !v)
                  setShowFloor(false)
                }}
              >
                <Icon name="door" size={14} /> الغرف ({visited.size}/{rooms.length})
              </button>
            </div>

            {/* screen-projected navigation pins (follow the camera) */}
            <div className="pt-nav-layer" ref={navLayerRef}>
              {navTargets.map((nt) => (
                <button
                  key={nt.id}
                  type="button"
                  ref={(el) => {
                    navPinEls.current[nt.id] = el
                  }}
                  className={`pt-navpin pt-navpin-${nt.style ?? 'compass'}`}
                  onClick={() => goToRoom(nt.target.id)}
                >
                  <span className="pt-navpin-glyph">
                    <Icon name={navStyleIcon(nt.style)} size={16} strokeWidth={2} />
                  </span>
                  <span className="pt-navpin-label">{nt.label}</span>
                </button>
              ))}
            </div>

            {showRooms && (
              <div className="pt-panel pt-panel-rooms">
                <div className="pt-room-strip">
                  {rooms.map((r) => (
                    <button
                      key={r.id}
                      className={`pt-room-card-mini ${r.id === currentRoomId ? 'active' : ''} ${r.panorama ? '' : 'disabled'}`}
                      onClick={() => goToRoom(r.id)}
                    >
                      {r.thumbnail || r.panorama ? (
                        <img src={assetUrl(project.id, r.thumbnail || r.panorama!)} alt="" />
                      ) : (
                        <div className="pt-noimg"><Icon name="door" size={18} /></div>
                      )}
                      <span>{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* room label bar */}
            <div className="pt-label-bar">
              <div>
                <div className="pt-label-current">الغرفة الحالية</div>
                <div className="pt-label-name">{currentRoom?.name ?? ''}</div>
              </div>
              {currentRoom?.description && <div className="pt-label-desc">{currentRoom.description}</div>}
              <span className="pt-label-count">
                {currentIdx + 1}/{rooms.length}
              </span>
            </div>
          </div>

          {/* floor plan modal */}
          {showFloor && (
            <div className="pt-floor-modal" onClick={() => setShowFloor(false)}>
              <button className="pt-floor-close" onClick={() => setShowFloor(false)}>
                <Icon name="x" size={15} />
              </button>
              {proj.floorPlanImage ? (
                <div className="pt-floor-wrap" onClick={(e) => e.stopPropagation()}>
                  <img src={assetUrl(proj.id, proj.floorPlanImage)} alt="مخطط الطابق" />
                  {floorPoints.map(({ point, room }) => (
                    <button
                      key={point.id}
                      className={`pt-floor-point ${room!.id === currentRoomId ? 'active' : ''}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onClick={() => goToRoom(room!.id)}
                      title={`الانتقال إلى ${room!.name}`}
                    >
                      <span className="pt-floor-dot" />
                      <span className="pt-floor-tag">{room!.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="pt-floor-none">
                  <Icon name="map" size={30} />
                  <div>لا يوجد مخطط طابق لهذا المشروع</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* info modal */}
      {activeInfo && (
        <div className="pt-modal-backdrop" onClick={() => setActiveInfo(null)}>
          <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pt-modal-head">
              <div>
                <div className="pt-modal-label">تفاصيل</div>
                <div className="pt-modal-title">{activeInfo.card?.title ?? activeInfo.hotspot.label}</div>
              </div>
              <button className="pt-modal-x" onClick={() => setActiveInfo(null)}>
                <Icon name="x" size={14} />
              </button>
            </div>
            {activeInfo.card ? (
              <div className="pt-modal-body">
                {activeInfo.card.description && (
                  <div className="pt-modal-desc">{activeInfo.card.description}</div>
                )}
                {activeInfo.card.images.length > 0 && (
                  <div className="pt-modal-images">
                    {activeInfo.card.images.map((img, i) => (
                      <img key={i} src={assetUrl(project.id, img)} alt="" />
                    ))}
                  </div>
                )}
                {activeInfo.card.dimensions.length > 0 && (
                  <div className="pt-modal-section">
                    <div className="pt-modal-subtitle">المقاسات</div>
                    {activeInfo.card.dimensions.map((d, i) => (
                      <div key={i} className="pt-kv">
                        <span>{d.key}</span>
                        <span>{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeInfo.card.specifications.length > 0 && (
                  <div className="pt-modal-section">
                    <div className="pt-modal-subtitle">المواصفات</div>
                    {activeInfo.card.specifications.map((d, i) => (
                      <div key={i} className="pt-kv">
                        <span>{d.key}</span>
                        <span>{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeInfo.card.notes.length > 0 && (
                  <div className="pt-modal-section">
                    <div className="pt-modal-subtitle">ملاحظات</div>
                    {activeInfo.card.notes.map((n, i) => (
                      <div key={i} className="pt-note">• {n}</div>
                    ))}
                  </div>
                )}
                {activeInfo.card.videos.length > 0 && (
                  <div className="pt-modal-section">
                    <div className="pt-modal-subtitle">فيديو</div>
                    {activeInfo.card.videos.map((v, i) => (
                      <button key={i} className="btn btn-sm" onClick={() => window.masar.dialogs.openPath(v)}>
                        <Icon name="play" size={12} /> تشغيل {v.split('/').pop()}
                      </button>
                    ))}
                  </div>
                )}
                {activeInfo.card.downloads.length > 0 && (
                  <div className="pt-modal-section">
                    <div className="pt-modal-subtitle">التحميلات</div>
                    {activeInfo.card.downloads.map((d) => (
                      <button key={d.id} className="btn btn-sm" onClick={() => window.masar.dialogs.openPath(d.path)}>
                        <Icon name="download" size={12} /> {d.name}
                      </button>
                    ))}
                  </div>
                )}
                {activeInfo.card.links.length > 0 && (
                  <div className="pt-modal-section">
                    <div className="pt-modal-subtitle">روابط</div>
                    {activeInfo.card.links.map((l) => (
                      <button key={l.id} className="btn btn-sm" onClick={() => window.masar.dialogs.openExternal(l.url)}>
                        <Icon name="link" size={12} /> {l.label || l.url}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-modal-body">
                <div className="pt-modal-desc">لا توجد بيانات إضافية لهذه النقطة</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* product modal */}
      {activeProduct && (
        <div className="pt-modal-backdrop" onClick={() => setActiveProduct(null)}>
          <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pt-modal-head">
              <div>
                <div className="pt-modal-label">منتج</div>
                <div className="pt-modal-title">{activeProduct.name}</div>
              </div>
              <button className="pt-modal-x" onClick={() => setActiveProduct(null)}>
                <Icon name="x" size={14} />
              </button>
            </div>
            <div className="pt-modal-body">
              {activeProduct.images.length > 0 && (
                <div className="pt-modal-images">
                  {activeProduct.images.map((img, i) => (
                    <img key={i} src={assetUrl(project.id, img)} alt="" />
                  ))}
                </div>
              )}
              {activeProduct.description && <div className="pt-modal-desc">{activeProduct.description}</div>}
              <div className="pt-modal-section">
                {[
                  ['التصنيف', activeProduct.category],
                  ['المقاسات', activeProduct.dimensions],
                  ['الخامة', activeProduct.material],
                  ['اللون', activeProduct.color]
                ]
                  .filter(([, v]) => v)
                  .map(([k, v], i) => (
                    <div key={i} className="pt-kv">
                      <span>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
              </div>
              {activeProduct.buyUrl && (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => window.masar.dialogs.openExternal(activeProduct.buyUrl!)}>
                  <Icon name="cart" size={14} /> رابط الشراء
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
