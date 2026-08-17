import * as fs from 'fs'
import * as path from 'path'
import { projectDir } from './projects'

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

export function exportProject(id: string, destPath: string): { ok: boolean; dir: string } {
  const destDir = destPath.toLowerCase().endsWith('.msar')
    ? destPath.slice(0, -5)
    : destPath
  fs.rmSync(destDir, { recursive: true, force: true })
  fs.mkdirSync(destDir, { recursive: true })

  copyDir(projectDir(id), destDir)

  const viewerDir = path.join(__dirname, '..', '..', 'dist-viewer')
  if (fs.existsSync(viewerDir)) {
    copyDir(viewerDir, path.join(destDir, 'viewer'))
  }

  fs.writeFileSync(
    path.join(destDir, 'masar.json'),
    JSON.stringify(
      {
        format: 'masar-project',
        version: 1,
        exportedAt: new Date().toISOString(),
        viewer: fs.existsSync(viewerDir)
      },
      null,
      2
    ),
    'utf-8'
  )
  return { ok: true, dir: destDir }
}
