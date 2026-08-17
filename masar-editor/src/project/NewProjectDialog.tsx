import { useState } from 'react'
import { useStore } from '../core/store'
import { Field, TextInput, TextArea } from '../components/ui'
import { Icon } from '../components/Icon'
import type { Project } from '../core/types'

export default function NewProjectDialog() {
  const setModal = useStore((s) => s.setModal)
  const openProject = useStore((s) => s.openProject)
  const setActiveKind = useStore((s) => s.setActiveKind)
  const showToast = useStore((s) => s.showToast)
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [coverPath, setCoverPath] = useState<string | null>(null)
  const [logoPath, setLogoPath] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  async function pickCover() {
    const res = await window.masar.dialogs.open({
      title: 'اختر صورة الغلاف',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp'] }]
    })
    if (!res.canceled && res.filePaths[0]) setCoverPath(res.filePaths[0])
  }

  async function pickLogo() {
    const res = await window.masar.dialogs.open({
      title: 'اختر الشعار',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp', 'svg'] }]
    })
    if (!res.canceled && res.filePaths[0]) setLogoPath(res.filePaths[0])
  }

  async function create() {
    if (!name.trim()) {
      showToast('أدخل اسم المشروع', 'error')
      return
    }
    setCreating(true)
    try {
      const project: Project = {
        id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
        name: name.trim(),
        clientName: clientName.trim(),
        companyName: companyName.trim(),
        description,
        location: location.trim(),
        coverPath: null,
        logoPath: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rooms: [],
        floorPlanPoints: [],
        products: [],
        pdfs: []
      }
      const created = await window.masar.projects.create(project, coverPath, logoPath)
      openProject(created)
      setActiveKind('rooms')
      setModal(null)
      showToast(`تم إنشاء المشروع "${created.name}"`, 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'تعذر إنشاء المشروع', 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>مشروع جديد</span>
          <button className="btn btn-icon" onClick={() => setModal(null)}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="full">
              <Field label="اسم المشروع *">
                <TextInput value={name} onChange={setName} placeholder="مثال: فيلا العليا — دور أرضي" />
              </Field>
            </div>
            <Field label="اسم العميل">
              <TextInput value={clientName} onChange={setClientName} />
            </Field>
            <Field label="اسم الشركة">
              <TextInput value={companyName} onChange={setCompanyName} />
            </Field>
            <div className="full">
              <Field label="الموقع">
                <TextInput value={location} onChange={setLocation} placeholder="مثال: الرياض، حي الياسمين" />
              </Field>
            </div>
            <div className="full">
              <Field label="الوصف">
                <TextArea value={description} onChange={setDescription} rows={2} />
              </Field>
            </div>
            <Field label="الغلاف">
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={pickCover}>
                  {coverPath ? (<><Icon name="check" size={12} /> تم الاختيار</>) : (<><Icon name="upload" size={12} /> اختيار صورة</>)}
                </button>
                {coverPath && (
                  <button className="btn btn-sm btn-danger" onClick={() => setCoverPath(null)}>
                    <Icon name="x" size={12} />
                  </button>
                )}
              </div>
            </Field>
            <Field label="الشعار">
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={pickLogo}>
                  {logoPath ? (<><Icon name="check" size={12} /> تم الاختيار</>) : (<><Icon name="upload" size={12} /> اختيار صورة</>)}
                </button>
                {logoPath && (
                  <button className="btn btn-sm btn-danger" onClick={() => setLogoPath(null)}>
                    <Icon name="x" size={12} />
                  </button>
                )}
              </div>
            </Field>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setModal(null)}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={create} disabled={creating}>
            {creating ? 'جاري الإنشاء…' : 'إنشاء المشروع'}
          </button>
        </div>
      </div>
    </div>
  )
}
