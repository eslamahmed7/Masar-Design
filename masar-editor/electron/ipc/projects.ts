import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { getMainWindow } from '../main'
import { exportProject } from './export'

export const APP_DATA_DIR = path.join(app.getPath('appData'), 'masar-editor')
export const PROJECTS_DIR = path.join(APP_DATA_DIR, 'projects')
const RECENT_FILE = path.join(APP_DATA_DIR, 'recent.json')

interface ProjectMeta {
  id: string
  name: string
  clientName: string
  companyName: string
  updatedAt: number
  createdAt: number
  coverPath?: string | null
}

function ensureDirs() {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true })
  fs.mkdirSync(path.join(APP_DATA_DIR, 'exports'), { recursive: true })
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJson(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

function projectDir(id: string) {
  return path.join(PROJECTS_DIR, id)
}

function projectFile(id: string) {
  return path.join(projectDir(id), 'project.json')
}

function readRecent(): ProjectMeta[] {
  return readJson<ProjectMeta[]>(RECENT_FILE, [])
}

function writeRecent(meta: ProjectMeta) {
  const recents = readRecent().filter((p) => p.id !== meta.id)
  recents.unshift(meta)
  writeJson(RECENT_FILE, recents.slice(0, 12))
}

function getMeta(id: string): ProjectMeta | null {
  const full = readJson<any>(projectFile(id), null)
  if (!full) return null
  return {
    id: full.id,
    name: full.name,
    clientName: full.clientName,
    companyName: full.companyName,
    updatedAt: full.updatedAt,
    createdAt: full.createdAt,
    coverPath: full.coverPath
  }
}

function copyIntoProject(src: string, projectId: string, sub: string): string | null {
  if (!src || !fs.existsSync(src)) return null
  const ext = path.extname(src).toLowerCase()
  const base = path.basename(src, ext).replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40) || 'file'
  let name = `${base}${ext}`
  let i = 1
  const destDir = path.join(projectDir(projectId), sub)
  fs.mkdirSync(destDir, { recursive: true })
  while (fs.existsSync(path.join(destDir, name))) {
    name = `${base}_${i}${ext}`
    i++
  }
  fs.copyFileSync(src, path.join(destDir, name))
  return `${sub.replace(/\\/g, '/')}/${name}`
}

export function registerProjectIpc() {
  ensureDirs()

  ipcMain.handle('projects:list', () => {
    const recents = readRecent()
    return recents
      .filter((r) => fs.existsSync(projectFile(r.id)))
      .map((r) => ({
        id: r.id,
        name: r.name,
        clientName: r.clientName,
        companyName: r.companyName,
        updatedAt: r.updatedAt,
        createdAt: r.createdAt,
        coverPath: r.coverPath
          ? `masar://${r.id}/${r.coverPath.replace(/\\/g, '/')}`
          : null
      }))
  })

  ipcMain.handle('projects:open', (_e, id: string) => {
    const file = projectFile(id)
    if (!fs.existsSync(file)) throw new Error('المشروع غير موجود')
    const project = readJson<any>(file, null)
    if (project) getMeta(id) && writeRecent(getMeta(id)!)
    return project
  })

  ipcMain.handle('projects:openPath', (_e, file: string) => {
    if (!file || !fs.existsSync(file)) throw new Error('ملف المشروع غير موجود')
    const project = readJson<any>(file, null)
    if (!project?.id) throw new Error('ملف غير صالح — ليس مشروع Masar')
    const target = projectFile(project.id)
    if (path.resolve(file) !== path.resolve(target)) {
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.copyFileSync(file, target)
    }
    getMeta(project.id) && writeRecent(getMeta(project.id)!)
    return project
  })

  ipcMain.handle('projects:create', async (_e, data: any, coverPath?: string | null, logoPath?: string | null) => {
    const id = data.id as string
    fs.mkdirSync(projectDir(id), { recursive: true })
    fs.mkdirSync(path.join(projectDir(id), 'assets'), { recursive: true })

    if (coverPath) {
      const rel = copyIntoProject(coverPath, id, 'assets/covers')
      if (rel) data.coverPath = rel
    }
    if (logoPath) {
      const rel = copyIntoProject(logoPath, id, 'assets/logos')
      if (rel) data.logoPath = rel
    }

    writeJson(projectFile(id), data)
    writeRecent(getMeta(id)!)
    return data
  })

  ipcMain.handle('projects:save', (_e, data: any) => {
    if (!data?.id) throw new Error('معرف المشروع غير موجود')
    fs.mkdirSync(projectDir(data.id), { recursive: true })
    writeJson(projectFile(data.id), data)
    writeRecent(getMeta(data.id)!)
    return { ok: true, savedAt: Date.now() }
  })

  ipcMain.handle('projects:export', async (_e, id: string) => {
    const win = getMainWindow()
    if (!win) throw new Error('No window')
    const meta = getMeta(id)
    if (!meta || !fs.existsSync(projectFile(id))) throw new Error('المشروع غير موجود')
    const result = await dialog.showSaveDialog(win, {
      title: 'تصدير المشروع',
      defaultPath: `${meta.name}.msar`,
      filters: [{ name: 'Masar Package', extensions: ['msar'] }]
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    return exportProject(id, result.filePath)
  })

  ipcMain.handle('projects:recent', () => readRecent())
  ipcMain.handle('projects:removeRecent', (_e, id: string) => {
    writeJson(RECENT_FILE, readRecent().filter((p) => p.id !== id))
    return true
  })
}

export { projectDir, projectFile }
