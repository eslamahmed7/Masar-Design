import { useState } from 'react'
import { useStore } from '../core/store'
import { assetUrl, uploadImage } from '../core/ipc'
import { Field, TextInput, TextArea } from '../components/ui'
import { Icon } from '../components/Icon'

export default function ProjectPropertiesDialog() {
  const project = useStore((s) => s.project)
  const setModal = useStore((s) => s.setModal)
  const mutateProject = useStore((s) => s.mutateProject)
  const showToast = useStore((s) => s.showToast)
  const [name, setName] = useState(project?.name ?? '')
  const [clientName, setClientName] = useState(project?.clientName ?? '')
  const [companyName, setCompanyName] = useState(project?.companyName ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [location, setLocation] = useState(project?.location ?? '')
  if (!project) return null
  const proj = project

  async function replaceCover() {
    try {
      const rel = await uploadImage(proj.id)
      if (!rel) return
      mutateProject((p) => {
        p.coverPath = rel
      })
      showToast('تم تحديث الغلاف', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  async function replaceLogo() {
    const res = await window.masar.dialogs.open({
      title: 'اختر الشعار',
      properties: ['openFile'],
      filters: [{ name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp', 'svg'] }]
    })
    if (res.canceled || !res.filePaths[0]) return
    try {
      const { relPath } = await window.masar.assets.import(proj.id, res.filePaths[0])
      mutateProject((p) => {
        p.logoPath = relPath
      })
      showToast('تم تحديث الشعار', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'فشل الرفع', 'error')
    }
  }

  function save() {
    mutateProject((p) => {
      p.name = name.trim() || p.name
      p.clientName = clientName.trim()
      p.companyName = companyName.trim()
      p.description = description
      p.location = location.trim()
    })
    setModal(null)
    showToast('تم تحديث بيانات المشروع', 'success')
  }

  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>خصائص المشروع</span>
          <button className="btn btn-icon" onClick={() => setModal(null)}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="full">
              <Field label="اسم المشروع">
                <TextInput value={name} onChange={setName} />
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
                <TextInput value={location} onChange={setLocation} />
              </Field>
            </div>
            <div className="full">
              <Field label="الوصف">
                <TextArea value={description} onChange={setDescription} rows={3} />
              </Field>
            </div>
            <div className="full">
              <Field label="الغلاف">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {project.coverPath ? (
                    <img
                      src={assetUrl(project.id, project.coverPath)}
                      alt=""
                      style={{ width: 96, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                    />
                  ) : (
                    <div style={{ width: 96, height: 60, borderRadius: 6, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 18 }}>
                      ▣
                    </div>
                  )}
                  <button className="btn btn-sm" onClick={replaceCover}>
                    {project.coverPath ? 'استبدال الغلاف' : '↑ رفع الغلاف'}
                  </button>
                </div>
              </Field>
            </div>
            <div className="full">
              <Field label="الشعار">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {project.logoPath ? (
                    <img
                      src={assetUrl(project.id, project.logoPath)}
                      alt=""
                      style={{ height: 44, maxWidth: 140, objectFit: 'contain', borderRadius: 6, background: 'var(--bg-input)', padding: 4 }}
                    />
                  ) : (
                    <div style={{ width: 96, height: 44, borderRadius: 6, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 16 }}>
                      شعار
                    </div>
                  )}
                  <button className="btn btn-sm" onClick={replaceLogo}>
                    {project.logoPath ? 'استبدال الشعار' : '↑ رفع الشعار'}
                  </button>
                </div>
              </Field>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => setModal(null)}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={save}>
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  )
}
