import { useStore } from '../../core/store'
import { Field, TextInput, SelectInput, Toggle, Section } from '../../components/ui'
import { Icon } from '../../components/Icon'
import { NAV_STYLES } from '../../core/navStyles'
import type { Hotspot, HotspotType, Room } from '../../core/types'

const TYPE_LABELS: Record<HotspotType, string> = {
  navigate: 'انتقال إلى غرفة',
  info: 'بطاقة معلومات',
  external: 'رابط خارجي',
  pdf: 'ملف PDF',
  product: 'منتج'
}

export default function HotspotInspector({ room, hotspot }: { room: Room; hotspot: Hotspot }) {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const select = useStore((s) => s.select)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null

  const setHotspot = (fn: (h: Hotspot) => void) => {
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      const h = r?.hotspots.find((y) => y.id === hotspot.id)
      if (h) fn(h)
    })
  }

  function changeType(t: HotspotType) {
    setHotspot((h) => {
      h.type = t
      if (t !== 'navigate') h.targetRoomId = undefined
      if (t !== 'info') h.infoCardId = undefined
      if (t !== 'external') h.url = undefined
      if (t !== 'pdf') h.pdfId = undefined
      if (t !== 'product') h.productId = undefined
    })
  }

  function createInfoCard() {
    const cardId = Math.random().toString(36).slice(2, 9)
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      if (!r) return
      r.infoCards.push({
        id: cardId,
        title: 'بطاقة معلومات جديدة',
        description: '',
        images: [],
        videos: [],
        dimensions: [],
        specifications: [],
        notes: [],
        downloads: [],
        links: []
      })
      const h = r.hotspots.find((y) => y.id === hotspot.id)
      if (h) {
        h.type = 'info'
        h.infoCardId = cardId
      }
    })
    select({ type: 'infocard', roomId: room.id, id: cardId })
    showToast('تم إنشاء بطاقة معلومات وربطها بالنقطة', 'success')
  }

  const otherRooms = project.rooms.filter((r) => r.id !== room.id)
  const linkedCard = room.infoCards.find((c) => c.id === hotspot.infoCardId)
  const linkedPdf = project.pdfs.find((p) => p.id === hotspot.pdfId)
  const linkedProduct = project.products.find((p) => p.id === hotspot.productId)

  return (
    <>
      <Section title="خصائص النقطة">
        <Field label="النوع">
          <SelectInput
            value={hotspot.type}
            onChange={(v) => changeType(v as HotspotType)}
            options={(Object.keys(TYPE_LABELS) as HotspotType[]).map((t) => ({
              value: t,
              label: TYPE_LABELS[t]
            }))}
          />
        </Field>
        <Field label="التسمية (نص تحت الزر — يمكن إدخال أكثر من سطر)">
          <textarea
            className="input"
            rows={3}
            value={hotspot.label}
            style={{ width: '100%', resize: 'vertical', minHeight: 56, lineHeight: 1.5 }}
            onChange={(e) => setHotspot((h) => (h.label = e.target.value))}
          />
        </Field>
        <Toggle
          label="النقطة مرئية"
          checked={hotspot.visible}
          onChange={(v) => setHotspot((h) => (h.visible = v))}
        />
        <Field label="الموضع (درجات)">
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              className="input"
              type="number"
              min={-180}
              max={180}
              value={Math.round(hotspot.yaw)}
              onChange={(e) => setHotspot((h) => (h.yaw = Math.max(-180, Math.min(180, parseFloat(e.target.value) || 0))))}
              style={{ width: '50%' }}
              title="أفقي ياو °"
            />
            <input
              className="input"
              type="number"
              min={-90}
              max={90}
              value={Math.round(hotspot.pitch)}
              onChange={(e) => setHotspot((h) => (h.pitch = Math.max(-90, Math.min(90, parseFloat(e.target.value) || 0))))}
              style={{ width: '50%' }}
              title="رأسي بيتش °"
            />
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>
            أو اسحب النقطة مباشرة على البانوراما (بالدرجات من موضع الكاميرا)
          </div>
        </Field>
      </Section>

      {hotspot.type === 'navigate' && (
        <>
          <Section title="شكل زر التنقل">
            <div className="nav-style-grid">
              {NAV_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`nav-style-opt ${
                    hotspot.navStyle === s.value || (!hotspot.navStyle && s.value === 'compass') ? 'active' : ''
                  }`}
                  onClick={() => setHotspot((h) => (h.navStyle = s.value))}
                  title={s.desc}
                >
                  <Icon name={s.icon} size={18} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </Section>
          <Section title="الوجهة">
            <Field label="الغرفة المستهدفة">
              <SelectInput
                value={hotspot.targetRoomId ?? ''}
                onChange={(v) => setHotspot((h) => (h.targetRoomId = v || undefined))}
                placeholder={otherRooms.length ? 'اختر غرفة…' : 'لا توجد غرف أخرى'}
                options={otherRooms.map((r) => ({ value: r.id, label: r.name }))}
              />
            </Field>
          </Section>
        </>
      )}

      {hotspot.type === 'info' && (
        <Section title="بطاقة المعلومات">
          <Field label="البطاقة المرتبطة">
            <SelectInput
              value={hotspot.infoCardId ?? ''}
              onChange={(v) => setHotspot((h) => (h.infoCardId = v || undefined))}
              placeholder={room.infoCards.length ? 'اختر بطاقة…' : 'لا توجد بطاقات'}
              options={room.infoCards.map((c) => ({ value: c.id, label: c.title }))}
            />
          </Field>
          {linkedCard ? (
            <button className="btn btn-sm" onClick={() => select({ type: 'infocard', roomId: room.id, id: linkedCard.id })}>
              <Icon name="edit" size={12} /> تحرير البطاقة "{linkedCard.title}"
            </button>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={createInfoCard}>
              <Icon name="plus" size={12} /> إنشاء بطاقة معلومات وربطها
            </button>
          )}
        </Section>
      )}

      {hotspot.type === 'external' && (
        <Section title="الرابط الخارجي">
          <Field label="الرابط (URL)">
            <TextInput value={hotspot.url ?? ''} onChange={(v) => setHotspot((h) => (h.url = v))} placeholder="https://…" />
          </Field>
        </Section>
      )}

      {hotspot.type === 'pdf' && (
        <Section title="ملف PDF">
          <Field label="الملف المرتبط">
            <SelectInput
              value={hotspot.pdfId ?? ''}
              onChange={(v) => setHotspot((h) => (h.pdfId = v || undefined))}
              placeholder={project.pdfs.length ? 'اختر ملف…' : 'لا توجد ملفات — أضفها من قسم PDF'}
              options={project.pdfs.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>
          {linkedPdf && (
            <button className="btn btn-sm" onClick={() => select({ type: 'pdf', id: linkedPdf.id })}>
              <Icon name="edit" size={12} /> تحرير الملف
            </button>
          )}
        </Section>
      )}

      {hotspot.type === 'product' && (
        <Section title="منتج">
          <Field label="المنتج المرتبط">
            <SelectInput
              value={hotspot.productId ?? ''}
              onChange={(v) => setHotspot((h) => (h.productId = v || undefined))}
              placeholder={project.products.length ? 'اختر منتجاً…' : 'لا توجد منتجات — أضفها من قسم المنتجات'}
              options={project.products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => useStore.getState().openProductsView({ roomId: room.id, hotspotId: hotspot.id })}
          >
            <Icon name="grid" size={12} /> اختيار من قسم المنتجات
          </button>
          {linkedProduct && (
            <button className="btn btn-sm" onClick={() => select({ type: 'product', id: linkedProduct.id })}>
              <Icon name="edit" size={12} /> تحرير المنتج
            </button>
          )}
        </Section>
      )}

      <Section title="إجراءات">
        <button
          className="btn btn-danger"
          onClick={() => {
            mutateProject((p) => {
              const r = p.rooms.find((x) => x.id === room.id)
              if (r) r.hotspots = r.hotspots.filter((h) => h.id !== hotspot.id)
            })
            select({ type: 'none' })
          }}
        >
          حذف النقطة
        </button>
      </Section>
    </>
  )
}
