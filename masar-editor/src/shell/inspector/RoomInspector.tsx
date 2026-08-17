import { useStore } from '../../core/store'
import { assetUrl, uploadImage } from '../../core/ipc'
import { Field, TextInput, TextArea, Section, Thumb, Toggle } from '../../components/ui'
import type { Room } from '../../core/types'

export default function RoomInspector({ room }: { room: Room }) {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  if (!project) return null
  const proj = project

  const setRoom = (fn: (r: Room) => void) => {
    mutateProject((p) => {
      const r = p.rooms.find((x) => x.id === room.id)
      if (r) fn(r)
    })
  }

  async function uploadPanorama(roomId: string, field: 'panorama' | 'lighting' | 'thumbnail' | 'material', variantId?: string) {
    try {
      const rel = await uploadImage(proj.id)
      if (!rel) return
      mutateProject((p) => {
        const r = p.rooms.find((x) => x.id === roomId)
        if (!r) return
        if (field === 'panorama') r.panorama = rel
        else if (field === 'lighting') r.lighting = rel
        else if (field === 'thumbnail') r.thumbnail = rel
        else if (variantId) {
          const v = r.materials.find((m) => m.id === variantId)
          if (v) v.panorama = rel
        }
      })
      showToast('تم رفع الصورة', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  function addMaterial() {
    setRoom((r) => {
      r.materials.push({
        id: Math.random().toString(36).slice(2, 9),
        label: `خامة ${r.materials.length + 1}`
      })
    })
  }

  function removeMaterial(id: string) {
    setRoom((r) => {
      r.materials = r.materials.filter((m) => m.id !== id)
    })
  }

  return (
    <>
      <Section title="معلومات الغرفة">
        <Field label="اسم الغرفة">
          <TextInput value={room.name} onChange={(v) => setRoom((r) => (r.name = v))} />
        </Field>
        <Field label="الاسم بالإنجليزية">
          <TextInput value={room.nameEn} onChange={(v) => setRoom((r) => (r.nameEn = v))} placeholder="Living Room" />
        </Field>
        <Field label="الوصف">
          <TextArea value={room.description} onChange={(v) => setRoom((r) => (r.description = v))} rows={2} />
        </Field>
        <Toggle
          label="إظهار الغرفة في المعاينة والنشر"
          checked={!room.hidden}
          onChange={(v) => setRoom((r) => (r.hidden = !v))}
        />
      </Section>

      <Section title="البانوراما الرئيسية (360° — نسبة 2:1)">
        <Thumb
          src={room.panorama ? assetUrl(project.id, room.panorama) : ''}
          label="رفع بانوراما 360"
          onUpload={() => uploadPanorama(room.id, 'panorama')}
          onRemove={() => setRoom((r) => (r.panorama = undefined))}
        />
        <Field label="صورة مصغرة">
          <Thumb
            src={room.thumbnail ? assetUrl(project.id, room.thumbnail) : ''}
            label="رفع مصغرة"
            height={56}
            onUpload={() => uploadPanorama(room.id, 'thumbnail')}
            onRemove={() => setRoom((r) => (r.thumbnail = undefined))}
          />
        </Field>
      </Section>

      <Section title="الإضاءة — Lights OFF (اختياري)">
        <Thumb
          src={room.lighting ? assetUrl(project.id, room.lighting) : ''}
          label="بانوراما الإضاءة المطفأة"
          onUpload={() => uploadPanorama(room.id, 'lighting')}
          onRemove={() => setRoom((r) => (r.lighting = undefined))}
        />
        <div style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>
          يبدّل العميل بين الإضاءة المضاءة والمطفأة داخل المعاينة.
        </div>
      </Section>

      <Section title={`الخامات البديلة (${room.materials.length})`}>
        {room.materials.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <TextInput value={m.label} onChange={(v) => setRoom((r) => { const x = r.materials.find((y) => y.id === m.id); if (x) x.label = v })} />
              <button className="btn btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => removeMaterial(m.id)}>✕</button>
            </div>
            <Thumb
              src={m.panorama ? assetUrl(project.id, m.panorama) : ''}
              label="رفع بانوراما الخامة"
              height={56}
              onUpload={() => uploadPanorama(room.id, 'material', m.id)}
              onRemove={() => setRoom((r) => { const x = r.materials.find((y) => y.id === m.id); if (x) x.panorama = undefined })}
            />
          </div>
        ))}
        <button className="btn btn-sm" onClick={addMaterial}>
          + إضافة خامة بديلة
        </button>
      </Section>
    </>
  )
}
