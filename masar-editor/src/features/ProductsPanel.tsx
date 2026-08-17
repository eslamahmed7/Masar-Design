import { useMemo, useState } from 'react'
import { useStore } from '../core/store'
import { assetUrl } from '../core/ipc'
import type { Product } from '../core/types'

export default function ProductsPanel({ onPick }: { onPick?: (id: string) => void }) {
  const project = useStore((s) => s.project)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = useMemo(() => {
    if (!project) return []
    const set = new Set<string>()
    project.products.forEach((p) => p.category && set.add(p.category))
    return [...set]
  }, [project])

  if (!project) return null

  const filtered = project.products.filter(
    (p) =>
      (!search || p.name.includes(search) || p.tags.some((t) => t.includes(search))) &&
      (!category || p.category === category)
  )

  function addProduct() {
    const product: Product = {
      id: Math.random().toString(36).slice(2, 9),
      name: 'منتج جديد',
      category: '',
      description: '',
      images: [],
      dimensions: '',
      material: '',
      color: '',
      buyUrl: '',
      tags: [],
      createdAt: Date.now()
    }
    mutateProject((p) => {
      p.products.unshift(product)
    })
    select({ type: 'product', id: product.id })
    showToast('تم إنشاء المنتج', 'success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 10, padding: 12, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <input className="input" style={{ width: 240 }} placeholder="بحث…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" style={{ width: 180 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{filtered.length} منتج</span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={addProduct}>
          + منتج جديد
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 26 }}>◆</div>
            <div>لا توجد منتجات</div>
            <div style={{ fontSize: 12 }}>
              المنتج يُنشأ مرة واحدة في المكتبة ويُستخدم في أي عدد من الغرف والنقاط
            </div>
            <button className="btn btn-sm btn-primary" onClick={addProduct} style={{ marginTop: 4 }}>
              + إنشاء منتج
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filtered.map((p) => (
              <div
                key={p.id}
                className="panel"
                style={{
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderColor: selection.type === 'product' && selection.id === p.id ? 'var(--accent)' : undefined
                }}
                onClick={() => (onPick ? onPick(p.id) : select({ type: 'product', id: p.id }))}
              >
                <div style={{ height: 120, background: 'var(--bg-input)', position: 'relative' }}>
                  {p.images[0] ? (
                    <img src={assetUrl(project.id, p.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 20 }}>◆</div>
                  )}
                  {p.category && (
                    <span className="badge" style={{ position: 'absolute', top: 6, insetInlineEnd: 6, background: 'rgba(0,0,0,0.65)', color: 'var(--accent-bright)' }}>
                      {p.category}
                    </span>
                  )}
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  {p.dimensions && <div className="list-sub" style={{ marginTop: 2 }}>{p.dimensions}</div>}
                  {(p.material || p.color) && (
                    <div className="list-sub" style={{ marginTop: 1 }}>
                      {[p.material, p.color].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
