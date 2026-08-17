'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, RotateCw, Crop, Move } from 'lucide-react'

interface ImageCropperModalProps {
  imageSrc: string
  onClose: () => void
  onCrop: (croppedBase64: string) => void
}

export function ImageCropperModal({ imageSrc, onClose, onCrop }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9) // default 16:9
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [naturalAspect, setNaturalAspect] = useState(16 / 9)

  // Reset parameters when image changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })

    if (imageSrc) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setNaturalAspect(img.naturalWidth / img.naturalHeight)
      }
      img.src = imageSrc
    }
  }, [imageSrc])

  // Drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch support for mobile panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    setOffset({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y
    })
  }

  const handleRotate = () => {
    setRotation(r => (r + 90) % 360)
  }

  const handleCrop = () => {
    const img = imgRef.current
    if (!img) return

    // Create a temporary canvas to draw the cropped image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions based on target aspect ratio
    // We export a high-quality high-res image
    const targetWidth = 1920
    const targetHeight = Math.round(1920 / aspectRatio)
    canvas.width = targetWidth
    canvas.height = targetHeight

    // Fill background black (in case of empty edges)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    // Calculate canvas center coordinates
    const cx = targetWidth / 2
    const cy = targetHeight / 2

    ctx.save()
    // Move to canvas center
    ctx.translate(cx, cy)
    // Rotate canvas
    ctx.rotate((rotation * Math.PI) / 180)

    // Determine scale factors based on zoom and fit
    const scaleX = (targetWidth / img.naturalWidth) * zoom
    const scaleY = (targetHeight / img.naturalHeight) * zoom
    // Cover crop area
    const fitScale = Math.max(scaleX, scaleY)

    // Draw the image, applying zoom, scale, offset and rotation
    // We map client offsets back to canvas dimensions
    const clientRect = containerRef.current?.getBoundingClientRect()
    const containerWidth = clientRect?.width || 1
    const containerHeight = clientRect?.height || 1

    const scaleFactorToNatural = img.naturalWidth / containerWidth
    const mappedOffsetX = offset.x * scaleFactorToNatural * (targetWidth / img.naturalWidth)
    const mappedOffsetY = offset.y * scaleFactorToNatural * (targetHeight / img.naturalHeight)

    const dw = img.naturalWidth * fitScale
    const dh = img.naturalHeight * fitScale

    ctx.drawImage(
      img,
      -dw / 2 + mappedOffsetX,
      -dh / 2 + mappedOffsetY,
      dw,
      dh
    )

    ctx.restore()

    // Export as Base64 JPEG
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92)
    onCrop(croppedBase64)
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#C8A96A]/20 bg-[#1A1916] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Crop size={16} className="text-[#C8A96A]" />
            <h3 className="text-sm font-bold text-foreground">تعديل وقص الصورة</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#666] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-black/40 p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden select-none">
          {/* Crop Frame container */}
          <div
            ref={containerRef}
            className="relative w-full max-w-xl aspect-video rounded-lg overflow-hidden border border-white/10 bg-[#0c0c0c] cursor-move flex items-center justify-center"
            style={{
              aspectRatio: aspectRatio.toString(),
              maxHeight: '400px'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Draggable & Zoomable Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="To Crop"
              crossOrigin="anonymous"
              className="pointer-events-none select-none max-w-full max-h-full"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            />

            {/* Grid Overlays */}
            <div className="absolute inset-0 border-2 border-dashed border-[#C8A96A]/40 pointer-events-none flex flex-col justify-between">
              <div className="w-full flex justify-between h-1/3 border-b border-dashed border-[#C8A96A]/20">
                <div className="h-full w-1/3 border-l border-dashed border-[#C8A96A]/20" />
                <div className="h-full w-1/3 border-l border-dashed border-[#C8A96A]/20" />
              </div>
              <div className="w-full flex justify-between h-1/3 border-b border-dashed border-[#C8A96A]/20">
                <div className="h-full w-1/3 border-l border-dashed border-[#C8A96A]/20" />
                <div className="h-full w-1/3 border-l border-dashed border-[#C8A96A]/20" />
              </div>
            </div>

            {/* Indicator */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1.5 pointer-events-none">
              <Move size={10} className="text-[#C8A96A]" />
              <span className="text-[10px] text-white/70">اضغط واسحب للتحريك داخل الإطار</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-white/5 bg-[#12110e] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Zoom slider */}
            <div className="flex items-center gap-3 flex-1">
              <ZoomIn size={16} className="text-[#C8A96A]" />
              <span className="text-xs text-white/50 w-8 shrink-0">التكبير</span>
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-[#C8A96A] bg-[#2a2924]"
              />
              <span className="text-xs font-mono text-[#C8A96A] shrink-0 w-8 text-left">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Presets and rotation */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Rotation */}
              <button
                onClick={handleRotate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/5 bg-white/5 text-xs text-white/80 hover:bg-white/10 transition-colors"
              >
                <RotateCw size={12} className="text-[#C8A96A]" />
                تدوير 90°
              </button>

              {/* Ratio Selector */}
              <div className="flex items-center rounded-lg border border-white/5 bg-white/5 p-0.5">
                {[
                  { label: '16:9', val: 16 / 9 },
                  { label: '21:9', val: 21 / 9 },
                  { label: 'حر', val: naturalAspect }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setAspectRatio(item.val)
                      setOffset({ x: 0, y: 0 })
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${Math.abs(aspectRatio - item.val) < 0.01 ? 'bg-[#C8A96A] text-black' : 'text-white/60 hover:text-white'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-white/5 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleCrop}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#C8A96A] text-black font-semibold text-xs hover:bg-[#C8A96A]/90 transition-colors"
            >
              <Crop size={13} />
              قص وحفظ الصورة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
