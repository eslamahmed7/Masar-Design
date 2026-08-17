import { useStore } from '../../core/store'
import { Field, TextInput, TextArea, Section, Toggle } from '../../components/ui'
import type { ProjectPdf } from '../../core/types'

export default function PdfInspector({ pdf }: { pdf: ProjectPdf }) {
  const project = useStore((s) => s.project)
  const mutateProject = useStore((s) => s.mutateProject)
  const select = useStore((s) => s.select)
  if (!project) return null

  const setPdf = (fn: (p: ProjectPdf) => void) => {
    mutateProject((p) => {
      const x = p.pdfs.find((y) => y.id === pdf.id)
      if (x) fn(x)
    })
  }

  function removePdf() {
    mutateProject((p) => {
      p.pdfs = p.pdfs.filter((x) => x.id !== pdf.id)
      p.rooms.forEach((r) =>
        r.hotspots.forEach((h) => {
          if (h.pdfId === pdf.id) h.pdfId = undefined
        })
      )
    })
    select({ type: 'none' })
  }

  return (
    <>
      <Section title="الملف">
        <Field label="الاسم">
          <TextInput value={pdf.name} onChange={(v) => setPdf((p) => (p.name = v))} />
        </Field>
        <Field label="الوصف">
          <TextArea value={pdf.description} onChange={(v) => setPdf((p) => (p.description = v))} rows={2} />
        </Field>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="list-sub" style={{ flex: 1 }}>{pdf.path}</span>
        </div>
      </Section>

      <Section title={`مرتبط بالغرف (${pdf.linkedRoomIds.length})`}>
        {project.rooms.map((r) => (
          <Toggle
            key={r.id}
            label={r.name}
            checked={pdf.linkedRoomIds.includes(r.id)}
            onChange={(v) =>
              setPdf((p) => {
                p.linkedRoomIds = v
                  ? [...p.linkedRoomIds, r.id]
                  : p.linkedRoomIds.filter((id) => id !== r.id)
              })
            }
          />
        ))}
        {project.rooms.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>لا توجد غرف</div>
        )}
      </Section>

      <Section title={`مرتبط بالمنتجات (${pdf.linkedProductIds.length})`}>
        {project.products.map((pr) => (
          <Toggle
            key={pr.id}
            label={pr.name}
            checked={pdf.linkedProductIds.includes(pr.id)}
            onChange={(v) =>
              setPdf((p) => {
                p.linkedProductIds = v
                  ? [...p.linkedProductIds, pr.id]
                  : p.linkedProductIds.filter((id) => id !== pr.id)
              })
            }
          />
        ))}
        {project.products.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>لا توجد منتجات</div>
        )}
      </Section>

      <Section title="إجراءات">
        <button className="btn btn-danger" onClick={removePdf}>
          حذف الملف
        </button>
      </Section>
    </>
  )
}
