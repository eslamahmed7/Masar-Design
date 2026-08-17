import type { Project, ProjectMeta } from './types'

declare global {
  interface Window {
    masar: {
      window: {
        minimize: () => Promise<void>
        toggleMaximize: () => Promise<boolean>
        close: () => Promise<void>
        onMaximized: (cb: (max: boolean) => void) => void
      }
      dialogs: {
        open: (opts: any) => Promise<{ canceled: boolean; filePaths: string[] }>
        save: (opts: any) => Promise<{ canceled: boolean; filePath?: string }>
        message: (opts: any) => Promise<any>
        openPath: (filePath: string) => Promise<string>
        openExternal: (url: string) => Promise<void>
        saveImage: (defaultName: string, dataUrl: string) => Promise<{ canceled: boolean; path?: string }>
      }
      projects: {
        list: () => Promise<ProjectMeta[]>
        open: (id: string) => Promise<Project>
        openPath: (filePath: string) => Promise<Project>
        create: (data: any, coverPath?: string | null, logoPath?: string | null) => Promise<Project>
        save: (data: Project) => Promise<{ ok: boolean; savedAt: number }>
        export: (id: string) => Promise<{ canceled?: boolean; ok?: boolean; dir?: string }>
        getRecent: () => Promise<ProjectMeta[]>
        removeRecent: (id: string) => Promise<boolean>
      }
      assets: {
        import: (projectId: string, filePath: string) => Promise<{ relPath: string; kind: string }>
        remove: (projectId: string, relPath: string) => Promise<boolean>
        readFileAsDataUrl: (projectId: string, relPath: string) => Promise<string | null>
      }
      onMenuCommand: (cb: (cmd: string) => void) => void
    }
  }
}

export function assetUrl(projectId: string, relPath?: string | null): string {
  if (!relPath) return ''
  return `masar://${projectId}/${relPath}`
}

export async function pickImageFile(multiple = false): Promise<string[]> {
  const res = await window.masar.dialogs.open({
    title: 'اختر صورة',
    properties: ['openFile', multiple ? 'multiSelections' : undefined].filter(Boolean) as string[],
    filters: [
      { name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'] }
    ]
  })
  return res.canceled ? [] : res.filePaths
}

export async function pickAnyFile(filters: { name: string; extensions: string[] }[], multiple = false) {
  const res = await window.masar.dialogs.open({
    title: 'اختر ملف',
    properties: ['openFile', multiple ? 'multiSelections' : undefined].filter(Boolean) as string[],
    filters
  })
  return res.canceled ? [] : res.filePaths
}

export async function importAsset(projectId: string, filePath: string) {
  return window.masar.assets.import(projectId, filePath)
}

export async function uploadImage(projectId: string): Promise<string | null> {
  const files = await pickImageFile()
  if (!files[0]) return null
  const { relPath } = await importAsset(projectId, files[0])
  return relPath
}

export async function uploadVideo(projectId: string): Promise<string | null> {
  const files = await pickAnyFile(
    [{ name: 'فيديو', extensions: ['mp4', 'webm', 'mov'] }]
  )
  if (!files[0]) return null
  const { relPath } = await importAsset(projectId, files[0])
  return relPath
}
