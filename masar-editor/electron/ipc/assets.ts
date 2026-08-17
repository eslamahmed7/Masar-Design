import { app, ipcMain, protocol, net } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { pathToFileURL } from 'url'
import { PROJECTS_DIR, projectDir } from './projects'

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']
const VIDEO_EXT = ['.mp4', '.webm', '.mov']
const PDF_EXT = ['.pdf']

export function classifyFile(filePath: string): 'image' | 'video' | 'pdf' | 'other' {
  const ext = path.extname(filePath).toLowerCase()
  if (IMAGE_EXT.includes(ext)) return 'image'
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (PDF_EXT.includes(ext)) return 'pdf'
  return 'other'
}

export function registerAssetIpc() {
  protocol.handle('masar', (request) => {
    const url = new URL(request.url)
    const projectId = url.hostname
    const rel = decodeURIComponent(url.pathname.replace(/^\//, ''))
    const filePath = path.join(PROJECTS_DIR, projectId, rel)
    if (!filePath.startsWith(projectDir(projectId)) || !fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 })
    }
    return net.fetch(pathToFileURL(filePath).toString())
  })

  ipcMain.handle('assets:import', (_e, projectId: string, filePath: string) => {
    if (!filePath || !fs.existsSync(filePath)) throw new Error('الملف غير موجود')
    const kind = classifyFile(filePath)
    const sub = kind === 'pdf' ? 'assets/pdfs' : kind === 'video' ? 'assets/videos' : 'assets/images'
    const ext = path.extname(filePath).toLowerCase()
    const base = path.basename(filePath, ext).replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40) || 'file'
    let name = `${base}${ext}`
    let i = 1
    const destDir = path.join(projectDir(projectId), sub)
    fs.mkdirSync(destDir, { recursive: true })
    while (fs.existsSync(path.join(destDir, name))) {
      name = `${base}_${i}${ext}`
      i++
    }
    fs.copyFileSync(filePath, path.join(destDir, name))
    return { relPath: `${sub.replace(/\\/g, '/')}/${name}`, kind }
  })

  ipcMain.handle('assets:remove', (_e, projectId: string, relPath: string) => {
    const filePath = path.join(projectDir(projectId), relPath)
    if (filePath.startsWith(projectDir(projectId)) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return true
  })

  ipcMain.handle('assets:readDataUrl', (_e, projectId: string, relPath: string) => {
    const filePath = path.join(projectDir(projectId), relPath)
    if (!fs.existsSync(filePath)) return null
    const data = fs.readFileSync(filePath)
    const mime =
      path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
    return `data:${mime};base64,${data.toString('base64')}`
  })
}
