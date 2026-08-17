import { useEffect } from 'react'
import { useStore } from './core/store'
import StartupScreen from './startup/StartupScreen'
import Workspace from './shell/Workspace'
import NewProjectDialog from './project/NewProjectDialog'
import ProjectPropertiesDialog from './project/ProjectPropertiesDialog'
import AboutDialog from './components/AboutDialog'
import ShortcutsDialog from './components/ShortcutsDialog'
import ToastHost from './components/ToastHost'
import type { ProjectMeta } from './core/types'

export default function App() {
  const view = useStore((s) => s.view)
  const modal = useStore((s) => s.modal)
  const project = useStore((s) => s.project)
  const dirty = useStore((s) => s.dirty)
  const setModal = useStore((s) => s.setModal)
  const openProject = useStore((s) => s.openProject)
  const saveProject = useStore((s) => s.saveProject)
  const setPreviewOpen = useStore((s) => s.setPreviewOpen)
  const setActiveKind = useStore((s) => s.setActiveKind)
  const setExplorerVisible = useStore((s) => s.setExplorerVisible)
  const setInspectorVisible = useStore((s) => s.setInspectorVisible)
  const showToast = useStore((s) => s.showToast)

  async function openProjectById(id: string) {
    try {
      if (dirty && project) {
        const res = await window.masar.dialogs.message({
          type: 'warning',
          buttons: ['حفظ', 'تجاهل', 'إلغاء'],
          defaultId: 0,
          cancelId: 2,
          title: 'تغييرات غير محفوظة',
          message: `يوجد تغييرات غير محفوظة في مشروع "${project.name}"`,
          detail: 'هل تريد الحفظ قبل الفتح؟'
        })
        if (res.response === 2) return
        if (res.response === 0) {
          const ok = await saveProject()
          if (!ok) return
        }
      }
      const p = await window.masar.projects.open(id)
      openProject(p)
      showToast('تم فتح المشروع', 'success')
    } catch (e: any) {
      showToast(e?.message ?? 'تعذر فتح المشروع', 'error')
    }
  }

  async function confirmSaveAndProceed(action: () => Promise<void>) {
    if (dirty && project) {
      const res = await window.masar.dialogs.message({
        type: 'warning',
        buttons: ['حفظ', 'تجاهل', 'إلغاء'],
        defaultId: 0,
        cancelId: 2,
        title: 'تغييرات غير محفوظة',
        message: `يوجد تغييرات غير محفوظة في مشروع "${project.name}"`,
        detail: 'هل تريد الحفظ قبل المتابعة؟'
      })
      if (res.response === 2) return
      if (res.response === 0) {
        const ok = await saveProject()
        if (!ok) return
      }
    }
    await action()
  }

  async function goHome() {
    await confirmSaveAndProceed(async () => {
      useStore.getState().setView('start')
    })
  }

  async function handleMenuCommand(cmd: string) {
    switch (cmd) {
      case 'file:new':
        await confirmSaveAndProceed(async () => setModal('new'))
        break
      case 'file:open': {
        const res = await window.masar.dialogs.open({
          title: 'فتح مشروع Masar',
          properties: ['openFile'],
          filters: [{ name: 'Masar Project', extensions: ['json'] }]
        })
        if (!res.canceled && res.filePaths[0]) {
          const p = await window.masar.projects.openPath(res.filePaths[0])
          openProject(p)
          showToast('تم فتح المشروع', 'success')
        }
        break
      }
      case 'file:save':
        if (project) {
          const ok = await saveProject()
          showToast(ok ? 'تم حفظ المشروع' : 'فشل الحفظ', ok ? 'success' : 'error')
        }
        break
      case 'file:saveAs':
      case 'file:export':
        if (project) {
          try {
            const res = await window.masar.projects.export(project.id)
            if (!res.canceled && res.ok) {
              showToast(`تم تصدير المشروع إلى: ${res.dir}`, 'success')
            }
          } catch (e: any) {
            showToast(e?.message ?? 'فشل التصدير', 'error')
          }
        }
        break
      case 'view:toggleExplorer':
        setExplorerVisible(!useStore.getState().explorerVisible)
        break
      case 'view:toggleInspector':
        setInspectorVisible(!useStore.getState().inspectorVisible)
        break
      case 'view:preview':
        setPreviewOpen(true)
        break
      case 'project:properties':
        setModal('project')
        break
      case 'project:products':
        useStore.getState().openProductsView()
        break
      case 'project:pdfs':
        setActiveKind('pdfs')
        break
      case 'help:shortcuts':
        setModal('shortcuts')
        break
      case 'help:about':
        setModal('about')
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.masar.onMenuCommand(handleMenuCommand)
    useStore.getState().loadRecent()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      if (mod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) useStore.getState().redo()
        else useStore.getState().undo()
      } else if (mod && key === 'y') {
        e.preventDefault()
        useStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {view === 'start' ? (
        <StartupScreen onOpenProject={openProjectById} />
      ) : (
        <Workspace onOpenProject={openProjectById} onHome={goHome} />
      )}
      {modal === 'new' && <NewProjectDialog />}
      {modal === 'project' && <ProjectPropertiesDialog />}
      {modal === 'about' && <AboutDialog />}
      {modal === 'shortcuts' && <ShortcutsDialog />}
      <ToastHost />
    </>
  )
}

export type { ProjectMeta }
