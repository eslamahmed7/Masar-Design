'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, FileIcon } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/admin/actions'

interface UploadResult {
  url: string
  publicId: string
}

interface Props {
  accept?: string
  folder?: string
  resourceType?: 'image' | 'video'
  currentUrl?: string
  onUpload: (result: UploadResult) => void
  onRemove?: () => void
  label?: string
}

export function FileUpload({
  accept = 'image/*',
  folder = 'masar',
  resourceType = 'image',
  currentUrl,
  onUpload,
  onRemove,
  label,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleFile = async (file: File) => {
    setError('')
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string

        // Show local preview immediately
        if (resourceType === 'image') {
          setPreview(base64)
        }

        const res = await uploadToCloudinary({ base64, resourceType, folder })

        if (res.error) {
          setError(res.error)
          setUploading(false)
          return
        }

        const resultUrl = res.url ?? ''
        if (resourceType !== 'image') {
          setPreview(resultUrl)
        }

        onUpload({ url: resultUrl, publicId: res.publicId ?? '' })
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError('فشل قراءة الملف')
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleClear = () => {
    setPreview('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-medium text-[#C0B090] mb-1.5">{label}</label>}

      {preview && resourceType === 'image' ? (
        <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-[#C8A96A]/20 group">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1 left-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : preview && resourceType === 'video' ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0E0D0B] border border-[#333] rounded-xl">
          <FileIcon size={14} className="text-[#C8A96A]" />
          <span className="text-xs text-[#888] truncate flex-1">{preview.split('/').pop()}</span>
          <button type="button" onClick={handleClear} className="p-0.5 text-[#555] hover:text-red-400">
            <X size={12} />
          </button>
        </div>
      ) : null}

      <div
        ref={dragRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-1.5 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading
            ? 'border-[#C8A96A]/30 bg-[#C8A96A]/5'
            : 'border-[#333] hover:border-[#C8A96A]/40 hover:bg-[#C8A96A]/3'
        }`}
      >
        {uploading ? (
          <Loader2 size={20} className="text-[#C8A96A] animate-spin" />
        ) : (
          <Upload size={18} className="text-[#666]" />
        )}
        <span className="text-xs text-[#666]">
          {uploading ? 'جاري الرفع...' : 'اسحب وأفلت الملف هنا أو اضغط للاختيار'}
        </span>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
