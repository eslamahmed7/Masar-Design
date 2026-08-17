import { useStore } from '../../core/store'
import { assetUrl, uploadImage, uploadVideo } from '../../core/ipc'
import { Field, TextInput, TextArea, Section, KeyValueEditor } from '../../components/ui'
import type { InfoCard, Room } from '../../core/types'
import { uid } from '../../core/store'

export default function InfoCardInspector({ room, card }: { room: Room; card: InfoCard }) {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const select = useStore((s) => s.select)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null
  const proj = project

  const setCard = (fn: (c: InfoCard) => void) => {
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      const c = r?.infoCards.find((y) => y.id === card.id)
      if (c) fn(c)
    })
  }

  async function addImage() {
    try {
      const rel = await uploadImage(proj.id)
      if (!rel) return
      setCard((c) => c.images.push(rel))
      showToast('تمت إضافة الصورة', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  async function addVideo() {
    try {
      const rel = await uploadVideo(proj.id)
      if (!rel) return
      setCard((c) => c.videos.push(rel))
      showToast('تمت إضافة الفيديو', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  async function addDownload() {
    const res = await window.masar.dialogs.open({
      title: 'اختر ملفاً للتحميل',
      properties: ['openFile'],
      filters: [
        { name: 'ملفات', extensions: ['pdf', 'jpg', 'png', 'zip', 'docx', 'xlsx', 'dwg', 'skp'] }
      ]
    })
    if (res.canceled || !res.filePaths[0]) return
    try {
      const { relPath } = await window.masar.assets.import(proj.id, res.filePaths[0])
      const name = res.filePaths[0].split(/[\\/]/).pop()!
      setCard((c) => c.downloads.push({ id: uid(), name, path: relPath }))
      showToast('تمت إضافة الملف', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  return (
    <>
      <Section title="البطاقة">
        <Field label="العنوان">
          <TextInput value={card.title} onChange={(v) => setCard((c) => (c.title = v))} />
        </Field>
        <Field label="الوصف">
          <TextArea value={card.description} onChange={(v) => setCard((c) => (c.description = v))} rows={3} />
        </Field>
      </Section>

      <Section title={`الصور (${card.images.length})`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {card.images.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: 64, height: 48 }}>
              <img
                src={assetUrl(proj.id, img)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }}
              />
              <button
                className="tree-action-btn"
                style={{ position: 'absolute', top: 2, insetInlineEnd: 2, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                onClick={() => setCard((c) => (c.images = c.images.filter((_, j) => j !== i)))}
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

      <Section title={`الفيديو (${card.videos.length})`}>
        {card.videos.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="list-sub" style={{ flex: 1 }}>{v.split('/').pop()}</span>
            <button className="tree-action-btn" style={{ color: 'var(--danger)' }} onClick={() => setCard((c) => (c.videos = c.videos.filter((_, j) => j !== i)))}>
              ✕
            </button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={addVideo}>
          + إضافة فيديو
        </button>
      </Section>

      <Section title="المقاسات">
        <KeyValueEditor
          items={card.dimensions}
          onChange={(items) => setCard((c) => (c.dimensions = items))}
          keyPlaceholder="الخاصية (الطول…)"
          valuePlaceholder="القيمة (3.5م…)"
        />
      </Section>

      <Section title="المواصفات">
        <KeyValueEditor
          items={card.specifications}
          onChange={(items) => setCard((c) => (c.specifications = items))}
          keyPlaceholder="الخاصية"
          valuePlaceholder="القيمة"
        />
      </Section>

      <Section title="الملاحظات">
        <TextArea
          value={card.notes.join('\n')}
          onChange={(v) => setCard((c) => (c.notes = v.split('\n')))}
          rows={3}
        />
      </Section>

      <Section title={`التحميلات (${card.downloads.length})`}>
        {card.downloads.map((d) => (
          <div key={d.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="list-sub" style={{ flex: 1 }}>{d.name}</span>
            <button className="tree-action-btn" style={{ color: 'var(--danger)' }} onClick={() => setCard((c) => (c.downloads = c.downloads.filter((x) => x.id !== d.id)))}>
              ✕
            </button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={addDownload}>
          + إضافة ملف تحميل
        </button>
      </Section>

      <Section title={`الروابط (${card.links.length})`}>
        {card.links.map((l) => (
          <div key={l.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              className="input"
              style={{ width: '40%' }}
              placeholder="التسمية"
              value={l.label}
              onChange={(e) => setCard((c) => { const x = c.links.find((y) => y.id === l.id); if (x) x.label = e.target.value })}
            />
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="https://…"
              value={l.url}
              onChange={(e) => setCard((c) => { const x = c.links.find((y) => y.id === l.id); if (x) x.url = e.target.value })}
            />
            <button className="tree-action-btn" style={{ color: 'var(--danger)' }} onClick={() => setCard((c) => (c.links = c.links.filter((x) => x.id !== l.id)))}>
              ✕
            </button>
          </div>
        ))}
        <button
          className="btn btn-sm"
          onClick={() => setCard((c) => c.links.push({ id: uid(), label: '', url: '' }))}
        >
          + إضافة رابط
        </button>
      </Section>

      <Section title="إجراءات">
        <button
          className="btn btn-danger"
          onClick={() => {
            mutateProject((p) => {
              const r = p.rooms.find((x) => x.id === room.id)
              if (!r) return
              r.infoCards = r.infoCards.filter((c) => c.id !== card.id)
              r.hotspots.forEach((h) => {
                if (h.infoCardId === card.id) h.infoCardId = undefined
              })
            })
            select({ type: 'none' })
          }}
        >
          حذف البطاقة
        </button>
      </Section>
    </>
  )
}
