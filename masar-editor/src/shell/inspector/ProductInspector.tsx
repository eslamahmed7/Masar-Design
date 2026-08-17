import { useStore } from '../../core/store'
import { assetUrl, uploadImage } from '../../core/ipc'
import { Field, TextInput, TextArea, Section } from '../../components/ui'
import type { Product } from '../../core/types'

export default function ProductInspector({ product }: { product: Product }) {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const select = useStore((s) => s.select)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null
  const proj = project

  const setProduct = (fn: (p: Product) => void) => {
    mutateProject((p) => {
      const pr = p.products.find((x) => x.id === product.id)
      if (pr) fn(pr)
    })
  }

  async function addImage() {
    try {
      const rel = await uploadImage(proj.id)
      if (!rel) return
      setProduct((p) => p.images.push(rel))
      showToast('تمت إضافة الصورة', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  function removeProduct() {
    mutateProject((p) => {
      p.products = p.products.filter((x) => x.id !== product.id)
      p.rooms.forEach((r) =>
        r.hotspots.forEach((h) => {
          if (h.productId === product.id) h.productId = undefined
        })
      )
    })
    select({ type: 'none' })
  }

  return (
    <>
      <Section title="المنتج">
        <Field label="اسم المنتج">
          <TextInput value={product.name} onChange={(v) => setProduct((p) => (p.name = v))} />
        </Field>
        <Field label="التصنيف">
          <TextInput value={product.category} onChange={(v) => setProduct((p) => (p.category = v))} placeholder="أرائك، إضاءة، ديكور…" />
        </Field>
        <Field label="الوصف">
          <TextArea value={product.description} onChange={(v) => setProduct((p) => (p.description = v))} rows={2} />
        </Field>
      </Section>

      <Section title={`الصور (${product.images.length})`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {product.images.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: 64, height: 48 }}>
              <img
                src={assetUrl(proj.id, img)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
              />
              <button
                className="tree-action-btn"
                style={{ position: 'absolute', top: 2, insetInlineEnd: 2, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                onClick={() => setProduct((p) => (p.images = p.images.filter((_, j) => j !== i)))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-sm" onClick={addImage}>
          + إضافة صورة
        </button>
      </Section>

      <Section title="المواصفات">
        <Field label="المقاسات">
          <TextInput value={product.dimensions} onChange={(v) => setProduct((p) => (p.dimensions = v))} placeholder="120 × 80 × 45 سم" />
        </Field>
        <Field label="الخامة">
          <TextInput value={product.material} onChange={(v) => setProduct((p) => (p.material = v))} />
        </Field>
        <Field label="اللون">
          <TextInput value={product.color} onChange={(v) => setProduct((p) => (p.color = v))} />
        </Field>
        <Field label="رابط الشراء">
          <TextInput value={product.buyUrl} onChange={(v) => setProduct((p) => (p.buyUrl = v))} placeholder="https://…" />
        </Field>
        <Field label="الوسوم (افصل بفاصلة)">
          <TextInput value={product.tags.join('، ')} onChange={(v) => setProduct((p) => (p.tags = v.split(/[,،]/).map((t) => t.trim()).filter(Boolean)))} />
        </Field>
      </Section>

      <Section title="إجراءات">
        <button className="btn btn-danger" onClick={removeProduct}>
          حذف المنتج
        </button>
      </Section>
    </>
  )
}
