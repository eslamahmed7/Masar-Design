import React from 'react'
import { Icon } from './Icon'

export function Field({
  label,
  children,
  hint
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && <div style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>{hint}</div>}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      className="input"
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <input
      className="input"
      type="number"
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const v = parseFloat(e.target.value)
        onChange(Number.isFinite(v) ? v : 0)
      }}
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      className="textarea"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      className="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ color: value ? undefined : 'var(--text-faint)' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="checkbox" style={{ opacity: disabled ? 0.5 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="inspector-section">
      <div className="inspector-section-title">{title}</div>
      {children}
    </div>
  )
}

export function Thumb({
  src,
  label,
  onUpload,
  onRemove,
  height = 90
}: {
  src: string
  label: string
  onUpload?: () => void
  onRemove?: () => void
  height?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          height,
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-strong)',
          background: 'var(--bg-input)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {src ? (
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'var(--text-faint)', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Icon name="image" size={22} />
            {label}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm" style={{ flex: 1 }} onClick={onUpload}>
          ↑ رفع
        </button>
        {src && onRemove && (
          <button className="btn btn-sm btn-danger" onClick={onRemove}>
            حذف
          </button>
        )}
      </div>
    </div>
  )
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder,
  valuePlaceholder
}: {
  items: { key: string; value: string }[]
  onChange: (items: { key: string; value: string }[]) => void
  keyPlaceholder: string
  valuePlaceholder: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder={keyPlaceholder}
            value={item.key}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...next[i], key: e.target.value }
              onChange(next)
            }}
          />
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder={valuePlaceholder}
            value={item.value}
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...next[i], value: e.target.value }
              onChange(next)
            }}
          />
          <button
            className="btn btn-icon btn-sm"
            style={{ color: 'var(--danger)' }}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
      <button
        className="btn btn-sm"
        onClick={() => onChange([...items, { key: '', value: '' }])}
      >
        <Icon name="plus" size={12} /> إضافة سطر
      </button>
    </div>
  )
}
