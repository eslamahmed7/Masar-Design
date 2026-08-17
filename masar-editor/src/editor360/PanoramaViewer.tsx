import { useEffect, useRef } from 'react'
import type { Hotspot } from '../core/types'

declare global {
  interface Window {
    pannellum?: any
  }
}

const PANNELLUM_JS = 'vendor/pannellum/pannellum.js'
const PANNELLUM_CSS = 'vendor/pannellum/pannellum.css'

function loadPannellum(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.pannellum) return resolve()

    if (!document.getElementById('pannellum-css')) {
      const link = document.createElement('link')
      link.id = 'pannellum-css'
      link.rel = 'stylesheet'
      link.href = PANNELLUM_CSS
      document.head.appendChild(link)
    }

    if (document.getElementById('pannellum-js')) {
      const existing = document.getElementById('pannellum-js') as HTMLScriptElement
      const done = () => (window.pannellum ? resolve() : reject(new Error('Pannellum load failed')))
      if (existing.dataset.loaded === '1') {
        window.pannellum ? resolve() : reject(new Error('Pannellum missing'))
        return
      }
      existing.addEventListener('load', done)
      return
    }

    const script = document.createElement('script')
    script.id = 'pannellum-js'
    script.src = PANNELLUM_JS
    script.async = true
    script.onload = () => {
      if (window.pannellum) resolve()
      else reject(new Error('Pannellum global missing'))
    }
    script.onerror = () => reject(new Error('تعذر تحميل محرك Pannellum'))
    document.head.appendChild(script)
  })
}

export interface PanoScene {
  id: string
  panorama: string
  hotspots: Hotspot[]
}

export interface PanoramaViewerProps {
  src?: string
  scenes?: PanoScene[]
  onLoaded?: () => void
  onError?: () => void
  onSceneChange?: (sceneId: string) => void
  onHotspotClick?: (hotspotId: string) => void
  onViewer?: (viewer: any) => void
  hfov?: number
  yaw?: number
  pitch?: number
  disabled?: boolean
}

export default function PanoramaViewer({
  src,
  scenes,
  onLoaded,
  onError,
  onSceneChange,
  onHotspotClick,
  onViewer,
  hfov = 90,
  yaw = 0,
  pitch = 0,
  disabled
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const propsRef = useRef({ onLoaded, onError, onSceneChange, onHotspotClick })
  propsRef.current = { onLoaded, onError, onSceneChange, onHotspotClick }
  const scenesKey = scenes ? scenes.map((s) => s.id).join(',') + '|' + scenes.map((s) => s.panorama).join(',') : ''

  useEffect(() => {
    let destroyed = false
    const container = containerRef.current
    if (!container) return

    loadPannellum()
      .then(() => {
        if (destroyed || !containerRef.current) return

        const baseConfig = {
          showControls: false,
          compass: false,
          hotSpotDebug: false,
          hfov,
          minHfov: 25,
          maxHfov: 110,
          yaw,
          pitch,
          mouseZoom: !disabled,
          keyboardZoom: !disabled,
          doubleClickZoom: false,
          showZoomCtrl: false,
          showFullscreenCtrl: false,
          draggable: !disabled,
          autoRotate: 0,
          preventDefaultTouch: false
        }

        let config: any
        if (scenes && scenes.length > 0) {
          const sceneMap: Record<string, any> = {}
          for (const s of scenes) {
            sceneMap[s.id] = {
              type: 'equirectangular',
              panorama: s.panorama,
              hotSpots: s.hotspots
                .filter((h) => h.visible && h.type !== 'navigate')
                .map((h) => {
                  return {
                    id: h.id,
                    pitch: h.pitch,
                    yaw: h.yaw,
                    type: 'custom',
                    cssClass: `pt-pin pt-pin-${h.type}`,
                    text: h.label,
                    clickHandlerArgs: { hid: h.id },
                    clickHandlerFunc: () => propsRef.current.onHotspotClick?.(h.id)
                  }
                })
            }
          }
          config = { ...baseConfig, scenes: sceneMap, firstScene: scenes[0].id, sceneFadeDuration: 150, autoLoad: true }
        } else {
          config = { ...baseConfig, type: 'equirectangular', panorama: src, autoLoad: true }
        }

        const viewer = window.pannellum!.viewer(containerRef.current, config)
        viewerRef.current = viewer
        onViewer?.(viewer)
        viewer.on('load', () => {
          propsRef.current.onLoaded?.()
          if (scenes && scenes.length > 1) {
            scenes.forEach((s) => {
              const img = new Image()
              img.src = s.panorama
            })
          }
        })
        viewer.on('error', () => propsRef.current.onError?.())
        if (scenes && scenes.length > 0) {
          viewer.on('scenechange', (id: string) => propsRef.current.onSceneChange?.(id))
        }
      })
      .catch(() => propsRef.current.onError?.())

    return () => {
      destroyed = true
      try {
        viewerRef.current?.destroy()
      } catch {
        /* noop */
      }
      viewerRef.current = null
    }
  }, [src, scenesKey, hfov, disabled, yaw, pitch])

  useEffect(() => {
    if (viewerRef.current) {
      try {
        viewerRef.current.setHfov(hfov)
      } catch {
        /* noop */
      }
    }
  }, [hfov])

  return (
    <div
      ref={containerRef}
      className="editor-canvas"
      style={disabled ? { pointerEvents: 'none' } : undefined}
    />
  )
}
