'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight, Plus, Trash2, Save, Loader2, Image as ImageIcon, Move,
  Crosshair, Info, Navigation, Edit3, Check, X, AlertCircle,
  Eye, Layers, MapPin, ChevronDown, ChevronUp, GripVertical,
  ZoomIn, LayoutGrid, Home, Camera, Link2, Moon,
} from 'lucide-react'
import Link from 'next/link'
import { uploadToCloudinary, updateTour360, deleteRoom360 } from '@/lib/admin/actions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HotspotDetails {
  brand?: string
  material?: string
  color?: string
  dimensions?: string
  note?: string
  [key: string]: string | undefined
}

interface Hotspot {
  id: string
  x: number
  y: number
  type: 'navigate' | 'info'
  targetRoomId?: string
  label: string
  details?: HotspotDetails
}

interface TourRoom {
  id: string
  nameAr: string
  nameEn: string
  panorama: string
  panorama_public_id?: string
  panorama_night?: string
  panorama_night_public_id?: string
  thumbnail: string
  thumbnail_public_id?: string
  description: string
  hotspots: Hotspot[]
  connectedRooms: string[]
}

interface FloorPlanRoom {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
}

interface FloorPlan {
  imageUrl?: string
  imagePublicId?: string
  rooms: FloorPlanRoom[]
}

interface Tour360 {
  rooms: TourRoom[]
  floorPlan: FloorPlan
}

interface ProjectData {
  id: string
  name: string
  slug: string
  tour360?: Tour360 | null
  enable_360: boolean
  has_360: boolean
}

interface Props {
  project: ProjectData
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyRoom(): TourRoom {
  return {
    id: uid(),
    nameAr: '',
    nameEn: '',
    panorama: '',
    panorama_public_id: '',
    thumbnail: '',
    thumbnail_public_id: '',
    description: '',
    hotspots: [],
    connectedRooms: [],
  }
}

function emptyFloorPlanRoom(rooms: TourRoom[]): FloorPlanRoom {
  const id = rooms.length > 0 ? rooms[rooms.length - 1].id : uid()
  return { id, x: 10, y: 10, w: 20, h: 15, label: '' }
}

// ─── Hotspot Placement Tool ────────────────────────────────────────────────────

interface HotspotPickerProps {
  panoramaUrl: string
  hotspots: Hotspot[]
  allRooms: TourRoom[]
  currentRoomId: string
  onAdd: (h: Hotspot) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<Hotspot>) => void
}

function HotspotPicker({ panoramaUrl, hotspots, allRooms, currentRoomId, onAdd, onRemove, onUpdate }: HotspotPickerProps) {
  const imgRef = useRef<HTMLDivElement>(null)
  const [placing, setPlacing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100 * 10) / 10
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100 * 10) / 10
    const newHotspot: Hotspot = {
      id: uid(),
      x, y,
      type: 'navigate',
      label: 'انتقل إلى...',
      targetRoomId: allRooms.find(r => r.id !== currentRoomId)?.id,
    }
    onAdd(newHotspot)
    setPlacing(false)
  }, [placing, allRooms, currentRoomId, onAdd])

  const editingHotspot = hotspots.find(h => h.id === editingId)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#888]">وضع نقطة:</span>
        <button
          type="button"
          onClick={() => setPlacing(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            placing
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'border-[#333] text-[#888] hover:border-blue-500/40 hover:text-blue-400'
          }`}
        >
          <Navigation size={12} /> انتقال لغرفة
        </button>
        {placing && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[#C8A96A] animate-pulse"
          >
            ← اضغط على الصورة لتحديد الموقع
          </motion.span>
        )}
        <button
          type="button"
          onClick={() => setPlacing(false)}
          className={`mr-auto px-2 py-1 text-xs text-[#555] hover:text-[#888] transition-colors ${!placing ? 'invisible' : ''}`}
        >
          إلغاء
        </button>
      </div>

      {/* Panorama with hotspots overlay */}
      {panoramaUrl ? (
        <div
          ref={imgRef}
          onClick={handleImageClick}
          className={`relative w-full overflow-hidden rounded-xl border border-[#333] select-none ${
            placing ? 'cursor-crosshair border-[#C8A96A]/50' : 'cursor-default'
          }`}
        >
          <img
            src={panoramaUrl}
            alt="panorama"
            className="w-full h-auto block pointer-events-none"
            draggable={false}
          />
          {/* Overlay for placing mode */}
          {placing && (
            <div className="absolute inset-0 bg-[#C8A96A]/5 border-2 border-[#C8A96A]/40 rounded-xl pointer-events-none">
              <div className="absolute top-2 left-2 bg-[#0E0D0B]/80 px-2 py-1 rounded-lg text-[10px] text-[#C8A96A] flex items-center gap-1">
                <Crosshair size={10} /> اضغط لوضع النقطة
              </div>
            </div>
          )}
          {/* Hotspot markers */}
          {hotspots.filter(h => h.type === 'navigate').map(h => (
            <button
              key={h.id}
              type="button"
              onClick={e => { e.stopPropagation(); setEditingId(editingId === h.id ? null : h.id) }}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all z-10 group ${
                editingId === h.id ? 'scale-125' : 'hover:scale-110'
              }`}
            >
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg bg-blue-600/90 border-blue-400 text-white">
                <Navigation size={12} />
              </div>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-[#0E0D0B]/90 text-[10px] text-[#F0E6D3] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {h.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-xl border-2 border-dashed border-[#333] text-[#555] text-sm">
          ارفع صورة البانوراما أولاً لتتمكن من وضع النقاط
        </div>
      )}

      {/* Hotspot list */}
      {hotspots.filter(h => h.type === 'navigate').length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#666] font-medium">النقاط التفاعلية ({hotspots.filter(h => h.type === 'navigate').length})</p>
          {hotspots.filter(h => h.type === 'navigate').map(h => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#0E0D0B] border border-[#2A2925] rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#F0E6D3]/3"
                onClick={() => setEditingId(editingId === h.id ? null : h.id)}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20 text-blue-400">
                  <Navigation size={10} />
                </div>
                <span className="text-xs text-[#C0B090] flex-1 truncate">{h.label}</span>
                <span className="text-[10px] text-[#555]">({h.x}%, {h.y}%)</span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(h.id) }}
                  className="p-0.5 text-[#444] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
                {editingId === h.id ? <ChevronUp size={12} className="text-[#555]" /> : <ChevronDown size={12} className="text-[#555]" />}
              </div>

              <AnimatePresence>
                {editingId === h.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-3 space-y-2.5 border-t border-[#2A2925]"
                  >
                    <div className="space-y-3">
                      <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] text-[#666]">اسم النقطة</label>
                        <input
                          value={h.label}
                          onChange={e => onUpdate(h.id, { label: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#1A1916] border border-[#333] rounded-lg text-xs text-[#F0E6D3] focus:outline-none focus:border-[#C8A96A]/40"
                          placeholder="مثال: انتقال إلى المطبخ"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-[#666]">انتقال إلى غرفة</label>
                        <select
                          value={h.targetRoomId ?? ''}
                          onChange={e => onUpdate(h.id, { targetRoomId: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#1A1916] border border-[#333] rounded-lg text-xs text-[#F0E6D3] focus:outline-none focus:border-[#C8A96A]/40"
                        >
                          <option value="">-- اختر غرفة --</option>
                          {allRooms.map(r => (
                            <option key={r.id} value={r.id}>{r.nameAr || r.nameEn || 'بدون اسم'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Floor Plan Editor ─────────────────────────────────────────────────────────

interface FloorPlanEditorProps {
  floorPlan: FloorPlan
  rooms: TourRoom[]
  onChange: (fp: FloorPlan) => void
}

function FloorPlanEditor({ floorPlan, rooms, onChange }: FloorPlanEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [resizing, setResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, ox: 0, oy: 0, ow: 0, oh: 0 })
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const CANVAS_W = 600
  const CANVAS_H = 400

  const updateRoom = (id: string, patch: Partial<FloorPlanRoom>) => {
    onChange({
      ...floorPlan,
      rooms: floorPlan.rooms.map(r => r.id === id ? { ...r, ...patch } : r)
    })
  }

  const addRoom = () => {
    const existingIds = new Set(floorPlan.rooms.map(r => r.id))
    const unlinked = rooms.find(r => !existingIds.has(r.id))
    const newRoom: FloorPlanRoom = {
      id: unlinked?.id ?? uid(),
      label: unlinked?.nameAr || unlinked?.nameEn || 'غرفة جديدة',
      x: 5 + floorPlan.rooms.length * 5,
      y: 5 + floorPlan.rooms.length * 5,
      w: 25,
      h: 20,
    }
    onChange({ ...floorPlan, rooms: [...floorPlan.rooms, newRoom] })
    setSelectedRoomId(newRoom.id)
  }

  const removeRoom = (id: string) => {
    onChange({ ...floorPlan, rooms: floorPlan.rooms.filter(r => r.id !== id) })
    if (selectedRoomId === id) setSelectedRoomId(null)
  }

  const handleMouseDown = (e: React.MouseEvent, id: string, mode: 'drag' | 'resize') => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedRoomId(id)
    const room = floorPlan.rooms.find(r => r.id === id)!
    if (mode === 'drag') {
      setDragging(id)
      setDragStart({ mx: e.clientX, my: e.clientY, ox: room.x, oy: room.y, ow: room.w, oh: room.h })
    } else {
      setResizing(id)
      setDragStart({ mx: e.clientX, my: e.clientY, ox: room.x, oy: room.y, ow: room.w, oh: room.h })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = 100 / rect.width
    const scaleY = 100 / rect.height
    const dx = (e.clientX - dragStart.mx) * scaleX
    const dy = (e.clientY - dragStart.my) * scaleY

    if (dragging) {
      updateRoom(dragging, {
        x: Math.max(0, Math.min(75, dragStart.ox + dx)),
        y: Math.max(0, Math.min(75, dragStart.oy + dy)),
      })
    } else if (resizing) {
      updateRoom(resizing, {
        w: Math.max(8, dragStart.ow + dx),
        h: Math.max(6, dragStart.oh + dy),
      })
    }
  }, [dragging, resizing, dragStart])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setResizing(null)
  }, [])

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, resizing, handleMouseMove, handleMouseUp])

  const handleUploadFloorPlan = async (file: File) => {
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      const res = await uploadToCloudinary({ base64, resourceType: 'image', folder: 'masar/floorplans' })
      if (!res.error) {
        onChange({ ...floorPlan, imageUrl: res.url ?? '', imagePublicId: res.publicId ?? '' })
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const selectedRoom = floorPlan.rooms.find(r => r.id === selectedRoomId)
  const tourRoomOf = (id: string) => rooms.find(r => r.id === id)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={addRoom}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96A]/15 border border-[#C8A96A]/30 text-[#C8A96A] rounded-lg text-xs hover:bg-[#C8A96A]/25 transition-all"
        >
          <Plus size={12} /> إضافة غرفة للخريطة
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#333] text-[#888] rounded-lg text-xs hover:border-[#555] hover:text-[#C0B090] transition-all"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
          {floorPlan.imageUrl ? 'تغيير صورة المخطط' : 'رفع صورة مخطط الأرضية'}
        </button>
        {floorPlan.imageUrl && (
          <button
            type="button"
            onClick={() => onChange({ ...floorPlan, imageUrl: '', imagePublicId: '' })}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-800/40 text-red-400 rounded-lg text-xs hover:bg-red-950/20 transition-all"
          >
            <Trash2 size={12} /> حذف صورة المخطط
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFloorPlan(f) }}
        />
        <span className="text-[10px] text-[#555] mr-auto">اسحب المربعات لتحريكها • اسحب الزاوية لتغيير الحجم</span>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full rounded-xl border border-[#333] overflow-hidden select-none"
        style={{ aspectRatio: '3/2', background: '#0E0D0B' }}
        onClick={() => setSelectedRoomId(null)}
      >
        {/* Background floor plan image */}
        {floorPlan.imageUrl && (
          <img
            src={floorPlan.imageUrl}
            alt="floor plan"
            className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none"
          />
        )}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(200,169,106,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,106,0.06) 1px, transparent 1px)',
            backgroundSize: '8.33% 8.33%',
          }}
        />

        {/* Empty state */}
        {floorPlan.rooms.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#444] pointer-events-none">
            <LayoutGrid size={32} />
            <span className="text-xs">أضف غرف للمخطط لتبدأ</span>
          </div>
        )}

        {/* Room blocks */}
        {floorPlan.rooms.map(room => {
          const tourRoom = tourRoomOf(room.id)
          const isSelected = selectedRoomId === room.id
          return (
            <div
              key={room.id}
              onMouseDown={e => handleMouseDown(e, room.id, 'drag')}
              onClick={e => { e.stopPropagation(); setSelectedRoomId(room.id) }}
              style={{
                position: 'absolute',
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.w}%`,
                height: `${room.h}%`,
                cursor: dragging === room.id ? 'grabbing' : 'grab',
              }}
              className={`border-2 rounded-lg transition-all group ${
                isSelected
                  ? 'border-[#C8A96A] bg-[#C8A96A]/15 shadow-lg shadow-[#C8A96A]/20 z-20'
                  : 'border-[#C8A96A]/40 bg-[#C8A96A]/8 hover:border-[#C8A96A]/70 z-10'
              }`}
            >
              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center p-1">
                <span className="text-[10px] text-[#C8A96A] font-medium text-center leading-tight line-clamp-2 pointer-events-none">
                  {room.label || tourRoom?.nameAr || 'غرفة'}
                </span>
              </div>

              {/* Resize handle */}
              <div
                onMouseDown={e => handleMouseDown(e, room.id, 'resize')}
                className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize opacity-0 group-hover:opacity-100 flex items-end justify-end pr-0.5 pb-0.5"
              >
                <div className="w-2 h-2 border-b-2 border-r-2 border-[#C8A96A]" />
              </div>

              {/* Thumbnail preview */}
              {tourRoom?.thumbnail && (
                <img
                  src={tourRoom.thumbnail}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-10 rounded-md pointer-events-none"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Selected room properties */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-[#0E0D0B] border border-[#C8A96A]/20 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#C8A96A]">تعديل الغرفة المحددة</p>
              <button type="button" onClick={() => removeRoom(selectedRoom.id)} className="p-1 text-[#444] hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#888] mb-1 block">ربط بالغرفة</label>
                <select
                  value={selectedRoom.id}
                  onChange={e => {
                    const newId = e.target.value
                    const tourRoom = rooms.find(r => r.id === newId)
                    onChange({
                      ...floorPlan,
                      rooms: floorPlan.rooms.map(r =>
                        r.id === selectedRoom.id
                          ? { ...r, id: newId, label: tourRoom?.nameAr || tourRoom?.nameEn || r.label }
                          : r
                      )
                    })
                    setSelectedRoomId(newId)
                  }}
                  className="w-full px-2 py-1.5 bg-[#1A1916] border border-[#333] rounded-lg text-xs text-[#F0E6D3] focus:outline-none"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.nameAr || r.nameEn || `غرفة ${r.id.slice(0, 4)}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#888] mb-1 block">التسمية في الخريطة</label>
                <input
                  value={selectedRoom.label}
                  onChange={e => updateRoom(selectedRoom.id, { label: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[#1A1916] border border-[#333] rounded-lg text-xs text-[#F0E6D3] focus:outline-none focus:border-[#C8A96A]/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['x', 'y', 'w', 'h'] as const).map(prop => (
                <div key={prop}>
                  <label className="text-[10px] text-[#888] mb-1 block uppercase">{prop === 'w' ? 'العرض' : prop === 'h' ? 'الارتفاع' : prop === 'x' ? 'المحور X' : 'المحور Y'}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={Math.round(selectedRoom[prop] * 10) / 10}
                    onChange={e => updateRoom(selectedRoom.id, { [prop]: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1 bg-[#1A1916] border border-[#333] rounded-lg text-xs text-[#F0E6D3] focus:outline-none text-center"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Room Card ─────────────────────────────────────────────────────────────────

interface RoomCardProps {
  room: TourRoom
  allRooms: TourRoom[]
  index: number
  isExpanded: boolean
  onToggle: () => void
  onChange: (patch: Partial<TourRoom>) => void
  onDelete: () => void
}

function RoomCard({ room, allRooms, index, isExpanded, onToggle, onChange, onDelete }: RoomCardProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'hotspots'>('info')
  const [uploadingPano, setUploadingPano] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const panoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File, type: 'panorama' | 'thumbnail' | 'panorama_night') => {
    if (type === 'panorama') setUploadingPano(true)
    else if (type === 'thumbnail') setUploadingThumb(true)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      const folder = type === 'panorama'
        ? 'masar/360/panoramas'
        : type === 'panorama_night'
        ? 'masar/360/panoramas/night'
        : 'masar/360/thumbnails'
      const res = await uploadToCloudinary({ base64, resourceType: 'image', folder })
      if (!res.error) {
        if (type === 'panorama') onChange({ panorama: res.url ?? '', panorama_public_id: res.publicId ?? '' })
        else if (type === 'thumbnail') onChange({ thumbnail: res.url ?? '', thumbnail_public_id: res.publicId ?? '' })
        else if (type === 'panorama_night') onChange({ panorama_night: res.url ?? '', panorama_night_public_id: res.publicId ?? '' })
      }
      if (type === 'panorama') setUploadingPano(false)
      else if (type === 'thumbnail') setUploadingThumb(false)
    }
    reader.readAsDataURL(file)
  }

  const addHotspot = (h: Hotspot) => onChange({ hotspots: [...room.hotspots, h] })
  const removeHotspot = (id: string) => onChange({ hotspots: room.hotspots.filter(h => h.id !== id) })
  const updateHotspot = (id: string, patch: Partial<Hotspot>) => {
    onChange({ hotspots: room.hotspots.map(h => h.id === id ? { ...h, ...patch } : h) })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1916] border border-[#C8A96A]/15 rounded-2xl overflow-hidden"
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#F0E6D3]/2 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#C8A96A]/15 text-[#C8A96A] text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>

        {room.thumbnail ? (
          <img src={room.thumbnail} alt="" className="w-10 h-8 rounded-lg object-cover border border-[#333] flex-shrink-0" />
        ) : (
          <div className="w-10 h-8 rounded-lg bg-[#0E0D0B] border border-[#333] flex items-center justify-center flex-shrink-0">
            <Camera size={12} className="text-[#444]" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[#F0E6D3] text-sm font-medium truncate">{room.nameAr || room.nameEn || `غرفة ${index + 1}`}</p>
          <p className="text-[#555] text-[10px]">
            {room.panorama ? '✓ بانوراما' : '○ بدون بانوراما'} · {room.hotspots.length} نقطة
          </p>
        </div>

        <div className="flex items-center gap-1">
          {room.panorama && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-950/20 transition-all"
          >
            <Trash2 size={13} />
          </button>
          {isExpanded ? <ChevronUp size={16} className="text-[#555]" /> : <ChevronDown size={16} className="text-[#555]" />}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#C8A96A]/10"
          >
            {/* Tab bar */}
            <div className="flex border-b border-[#2A2925]">
              {(['info', 'hotspots'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-[#C8A96A] border-b-2 border-[#C8A96A]'
                      : 'text-[#555] hover:text-[#888]'
                  }`}
                >
                  {tab === 'info' ? (
                    <span className="flex items-center justify-center gap-1.5"><Info size={12} /> معلومات الغرفة</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <MapPin size={12} /> النقاط التفاعلية
                      {room.hotspots.length > 0 && (
                        <span className="bg-[#C8A96A]/20 text-[#C8A96A] text-[10px] px-1.5 rounded-full">{room.hotspots.length}</span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Info tab */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#888] mb-1.5 block">اسم الغرفة (عربي) *</label>
                      <input
                        value={room.nameAr}
                        onChange={e => onChange({ nameAr: e.target.value })}
                        placeholder="مثال: غرفة المعيشة"
                        className="w-full px-3 py-2 bg-[#0E0D0B] border border-[#333] rounded-xl text-[#F0E6D3] text-sm placeholder-[#444] focus:outline-none focus:border-[#C8A96A]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] mb-1.5 block">اسم الغرفة (إنجليزي)</label>
                      <input
                        value={room.nameEn}
                        onChange={e => onChange({ nameEn: e.target.value })}
                        placeholder="e.g. Living Room"
                        dir="ltr"
                        className="w-full px-3 py-2 bg-[#0E0D0B] border border-[#333] rounded-xl text-[#F0E6D3] text-sm placeholder-[#444] focus:outline-none focus:border-[#C8A96A]/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#888] mb-1.5 block">وصف الغرفة</label>
                    <textarea
                      value={room.description}
                      onChange={e => onChange({ description: e.target.value })}
                      rows={2}
                      placeholder="وصف مختصر للغرفة..."
                      className="w-full px-3 py-2 bg-[#0E0D0B] border border-[#333] rounded-xl text-[#F0E6D3] text-sm placeholder-[#444] focus:outline-none focus:border-[#C8A96A]/50 resize-none"
                    />
                  </div>

                  {/* Media uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Panorama upload */}
                    <div>
                      <label className="text-[10px] text-[#888] mb-1.5 block flex items-center gap-1">
                        <Eye size={10} /> صورة البانوراما 360° *
                      </label>
                      {room.panorama ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#C8A96A]/30 group" style={{ aspectRatio: '2/1' }}>
                          <img src={room.panorama} alt="panorama" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => panoInputRef.current?.click()}
                              className="px-2 py-1 bg-[#C8A96A] text-[#0E0D0B] rounded-lg text-[10px] font-medium"
                            >
                              تغيير
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange({ panorama: '', panorama_public_id: '' })}
                              className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px]"
                            >
                              حذف
                            </button>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/60 text-[#C8A96A] text-[9px] px-1.5 py-0.5 rounded">360°</div>
                        </div>
                      ) : (
                        <div
                          onClick={() => panoInputRef.current?.click()}
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#333] hover:border-[#C8A96A]/40 cursor-pointer transition-colors p-6"
                          style={{ aspectRatio: '2/1' }}
                        >
                          {uploadingPano ? (
                            <Loader2 size={20} className="text-[#C8A96A] animate-spin" />
                          ) : (
                            <>
                              <Eye size={20} className="text-[#444]" />
                              <span className="text-xs text-[#555]">رفع صورة البانوراما</span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={panoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'panorama') }}
                      />
                    </div>

                    {/* Thumbnail upload */}
                    <div>
                      <label className="text-[10px] text-[#888] mb-1.5 block flex items-center gap-1">
                        <ImageIcon size={10} /> صورة مصغرة للغرفة
                      </label>
                      {room.thumbnail ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#333] group" style={{ aspectRatio: '2/1' }}>
                          <img src={room.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => thumbInputRef.current?.click()}
                              className="px-2 py-1 bg-[#C8A96A] text-[#0E0D0B] rounded-lg text-[10px] font-medium"
                            >
                              تغيير
                            </button>
                            <button
                              type="button"
                              onClick={() => onChange({ thumbnail: '', thumbnail_public_id: '' })}
                              className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px]"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => thumbInputRef.current?.click()}
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#333] hover:border-[#C8A96A]/40 cursor-pointer transition-colors p-6"
                          style={{ aspectRatio: '2/1' }}
                        >
                          {uploadingThumb ? (
                            <Loader2 size={20} className="text-[#C8A96A] animate-spin" />
                          ) : (
                            <>
                              <ImageIcon size={20} className="text-[#444]" />
                              <span className="text-xs text-[#555]">رفع صورة مصغرة</span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'thumbnail') }}
                      />
                    </div>
                  </div>

                  {/* Night panorama upload (optional) */}
                  <div>
                    <label className="text-[10px] text-[#888] mb-1.5 block flex items-center gap-1">
                      <Moon size={10} className="text-indigo-400" /> بانوراما الليل (اختياري)
                    </label>
                    {room.panorama_night ? (
                      <div className="flex items-center gap-2 p-2 bg-indigo-950/30 border border-indigo-800/30 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="text-[10px] text-indigo-300 truncate flex-1">تم رفع بانوراما الليل</span>
                        <button
                          type="button"
                          onClick={() => onChange({ panorama_night: '', panorama_night_public_id: '' } as any)}
                          className="text-red-400 text-[10px] hover:text-red-300 flex-shrink-0"
                        >حذف</button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'; input.accept = 'image/*'
                          input.onchange = (e) => {
                            const f = (e.target as HTMLInputElement).files?.[0]
                            if (f) handleUpload(f, 'panorama_night' as any)
                          }
                          input.click()
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-800/30 hover:border-indigo-600/40 cursor-pointer transition-colors py-3 text-[10px] text-indigo-500"
                      >
                        <Moon size={12} className="text-indigo-500" /> رفع بانوراما الليل
                      </div>
                    )}
                    <p className="text-[#444] text-[9px] mt-1">إذا لم ترفع بانوراما الليل، ستُضاف فلتر لوني فقط</p>
                  </div>

                  {/* Connected rooms */}
                  {allRooms.filter(r => r.id !== room.id).length > 0 && (
                    <div>
                      <label className="text-[10px] text-[#888] mb-2 block flex items-center gap-1">
                        <Link2 size={10} /> الغرف المتصلة (اختياري)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {allRooms.filter(r => r.id !== room.id).map(other => (
                          <button
                            key={other.id}
                            type="button"
                            onClick={() => {
                              const connected = room.connectedRooms.includes(other.id)
                                ? room.connectedRooms.filter(id => id !== other.id)
                                : [...room.connectedRooms, other.id]
                              onChange({ connectedRooms: connected })
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                              room.connectedRooms.includes(other.id)
                                ? 'border-[#C8A96A]/50 bg-[#C8A96A]/15 text-[#C8A96A]'
                                : 'border-[#333] text-[#666] hover:border-[#555]'
                            }`}
                          >
                            {other.nameAr || other.nameEn || `غرفة ${other.id.slice(0, 4)}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hotspots tab */}
              {activeTab === 'hotspots' && (
                <HotspotPicker
                  panoramaUrl={room.panorama}
                  hotspots={room.hotspots}
                  allRooms={allRooms}
                  currentRoomId={room.id}
                  onAdd={addHotspot}
                  onRemove={removeHotspot}
                  onUpdate={updateHotspot}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

type TabType = 'rooms' | 'floorplan' | 'preview'

export function Tour360EditorClient({ project }: Props) {
  const router = useRouter()

  // Load existing tour data or initialize empty
  const initialTour: Tour360 = project.tour360 ?? { rooms: [], floorPlan: { rooms: [] } }

  const [rooms, setRooms] = useState<TourRoom[]>(initialTour.rooms ?? [])
  const [floorPlan, setFloorPlan] = useState<FloorPlan>(initialTour.floorPlan ?? { rooms: [] })
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('rooms')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => { setIsDirty(true) }, [rooms, floorPlan])
  useEffect(() => { setIsDirty(false) }, []) // reset on mount

  const updateRoom = (id: string, patch: Partial<TourRoom>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  const addRoom = () => {
    const room = emptyRoom()
    setRooms(prev => [...prev, room])
    setExpandedRoomId(room.id)
    setActiveTab('rooms')
  }

  const deleteRoom = async (id: string) => {
    if (!confirm('حذف هذه الغرفة نهائياً؟ سيتم حذف الصور من Cloudinary أيضاً.')) return
    // Optimistic UI update first
    setRooms(prev => prev.filter(r => r.id !== id))
    if (expandedRoomId === id) setExpandedRoomId(null)
    setFloorPlan(fp => ({ ...fp, rooms: fp.rooms.filter(r => r.id !== id) }))
    // Permanent DB + Cloudinary deletion
    const result = await deleteRoom360(project.id, id)
    if ('error' in result && result.error) {
      setSaveError('فشل الحذف: ' + result.error)
      // Re-fetch is handled by revalidatePath on server side
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const result = await updateTour360(project.id, { rooms, floorPlan })

    if ('error' in result && result.error) {
      setSaveError(result.error)
    } else {
      setSaveSuccess(true)
      setIsDirty(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    setSaving(false)
  }

  const completedRooms = rooms.filter(r => r.panorama && r.nameAr).length
  const totalHotspots = rooms.reduce((sum, r) => sum + r.hotspots.length, 0)

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'rooms', label: 'الغرف', icon: <Home size={14} /> },
    { id: 'floorplan', label: 'مخطط الأرضية', icon: <LayoutGrid size={14} /> },
    { id: 'preview', label: 'معاينة', icon: <Eye size={14} /> },
  ]

  return (
    <div className="min-h-screen bg-[#0E0D0B] text-[#F0E6D3]" dir="rtl">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0E0D0B]/95 backdrop-blur border-b border-[#C8A96A]/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="p-2 rounded-xl text-[#888] hover:text-[#F0E6D3] hover:bg-[#F0E6D3]/8 transition-all"
          >
            <ArrowRight size={18} />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#C8A96A]/20 flex items-center justify-center flex-shrink-0">
                <Camera size={11} className="text-[#C8A96A]" />
              </div>
              <h1 className="text-base font-semibold text-[#F0E6D3] truncate">محرر 360° — {project.name}</h1>
            </div>
            <p className="text-[10px] text-[#555] mt-0.5 mr-7">
              {rooms.length} غرفة · {completedRooms} مكتملة · {totalHotspots} نقطة تفاعلية
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && !saveSuccess && (
              <span className="text-[10px] text-amber-400/80 hidden sm:block">• تعديلات غير محفوظة</span>
            )}

            {project.has_360 && (
              <Link
                href={`/projects/${project.slug}/360/tour`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 border border-[#333] text-[#888] rounded-xl text-xs hover:border-[#555] hover:text-[#C0B090] transition-all"
              >
                <Eye size={13} /> معاينة
              </Link>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#C8A96A] text-[#0E0D0B] hover:bg-[#d4b87a]'
              } disabled:opacity-60`}
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> جاري الحفظ...</>
              ) : saveSuccess ? (
                <><Check size={14} /> تم الحفظ!</>
              ) : (
                <><Save size={14} /> حفظ التغييرات</>
              )}
            </button>
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-950/40 border-t border-red-800/30 px-6 py-2 flex items-center gap-2 text-red-400 text-xs"
            >
              <AlertCircle size={13} /> {saveError}
              <button onClick={() => setSaveError(null)} className="mr-auto"><X size={13} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'الغرف', value: rooms.length, icon: <Home size={16} />, color: 'text-[#C8A96A]' },
            { label: 'مكتملة', value: completedRooms, icon: <Check size={16} />, color: 'text-emerald-400' },
            { label: 'نقاط تفاعلية', value: totalHotspots, icon: <MapPin size={16} />, color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-4 flex items-center gap-3">
              <div className={`${stat.color} opacity-70`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-[#F0E6D3]">{stat.value}</p>
                <p className="text-xs text-[#555]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex items-center bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl p-1 gap-1 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#C8A96A] text-[#0E0D0B] shadow-sm'
                  : 'text-[#666] hover:text-[#F0E6D3]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Rooms Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            {/* Add room button */}
            <button
              type="button"
              onClick={addRoom}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#C8A96A]/25 rounded-2xl text-sm text-[#C8A96A]/70 hover:text-[#C8A96A] hover:border-[#C8A96A]/50 hover:bg-[#C8A96A]/5 transition-all"
            >
              <Plus size={16} /> إضافة غرفة جديدة
            </button>

            {rooms.length === 0 && (
              <div className="text-center py-16 text-[#444]">
                <Camera size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm mb-1">لا توجد غرف بعد</p>
                <p className="text-xs text-[#555]">أضف غرفة وارفع الصور البانورامية لبدء بناء الجولة</p>
              </div>
            )}

            <AnimatePresence>
              {rooms.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  allRooms={rooms}
                  index={i}
                  isExpanded={expandedRoomId === room.id}
                  onToggle={() => setExpandedRoomId(expandedRoomId === room.id ? null : room.id)}
                  onChange={(patch) => updateRoom(room.id, patch)}
                  onDelete={() => deleteRoom(room.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Floor Plan Tab ─────────────────────────────────────────────── */}
        {activeTab === 'floorplan' && (
          <div className="bg-[#1A1916] border border-[#C8A96A]/15 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-[#F0E6D3] font-semibold mb-1">مخطط الأرضية التفاعلي</h2>
              <p className="text-xs text-[#666]">
                ارسم خريطة الشقة بتحديد مواضع الغرف. يمكنك أيضاً رفع صورة مخطط الأرضية كخلفية.
              </p>
            </div>
            {rooms.length === 0 ? (
              <div className="text-center py-16 text-[#444]">
                <LayoutGrid size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm mb-2">أضف غرفاً أولاً</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="text-xs text-[#C8A96A] hover:underline"
                >
                  الذهاب إلى تبويب الغرف
                </button>
              </div>
            ) : (
              <FloorPlanEditor
                floorPlan={floorPlan}
                rooms={rooms}
                onChange={setFloorPlan}
              />
            )}
          </div>
        )}

        {/* ── Preview Tab ────────────────────────────────────────────────── */}
        {activeTab === 'preview' && (
          <div className="bg-[#1A1916] border border-[#C8A96A]/15 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-[#F0E6D3] font-semibold mb-1">معاينة بيانات الجولة</h2>
              <p className="text-xs text-[#666]">ملخص كامل لبيانات الجولة قبل الحفظ</p>
            </div>

            {rooms.map((room, i) => (
              <div key={room.id} className="border border-[#2A2925] rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#0E0D0B]">
                  <span className="text-xs font-bold text-[#C8A96A] w-6 text-center">{i + 1}</span>
                  {room.thumbnail && <img src={room.thumbnail} alt="" className="w-10 h-8 rounded object-cover" />}
                  <div>
                    <p className="text-sm font-medium">{room.nameAr}</p>
                    <p className="text-[10px] text-[#555]">{room.nameEn}</p>
                  </div>
                  <div className="mr-auto flex items-center gap-3 text-[10px] text-[#666]">
                    {room.panorama && <span className="text-emerald-400">✓ بانوراما</span>}
                    {room.thumbnail && <span className="text-emerald-400">✓ مصغرة</span>}
                    <span>{room.hotspots.length} نقطة</span>
                  </div>
                </div>
                {room.hotspots.length > 0 && (
                  <div className="px-4 py-3 space-y-1">
                    {room.hotspots.map(h => (
                      <div key={h.id} className="flex items-center gap-2 text-[10px] text-[#666]">
                        <div className={`w-3 h-3 rounded-full ${h.type === 'navigate' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <span className="text-[#888]">{h.label}</span>
                        <span>({h.x}%, {h.y}%)</span>
                        {h.type === 'navigate' && h.targetRoomId && (
                          <span className="text-[#555]">→ {rooms.find(r => r.id === h.targetRoomId)?.nameAr ?? '?'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {rooms.length === 0 && (
              <p className="text-center text-[#555] text-sm py-8">لا توجد غرف للمعاينة</p>
            )}

            {rooms.length > 0 && (
              <div className="pt-4 border-t border-[#2A2925] flex items-center justify-between">
                <div className="text-xs text-[#666] space-y-1">
                  <p>مخطط الأرضية: {floorPlan.rooms.length} غرفة مضافة</p>
                  {floorPlan.imageUrl && <p className="text-emerald-400">✓ صورة مخطط الأرضية مرفوعة</p>}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] disabled:opacity-60 transition-all"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  حفظ الجولة
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
