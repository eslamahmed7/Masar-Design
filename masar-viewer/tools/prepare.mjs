#!/usr/bin/env node
/*
 * masar-viewer — project publisher
 *
 * Usage:
 *   node tools/prepare.mjs <path-to-exported-project> [--slug=<custom-slug>]
 *       Adds / updates a client project inside this site and rebuilds projects.json.
 *       <path-to-exported-project> = the folder produced by exporting from
 *       Masar Editor (a *.msar file or its extracted folder).
 *
 *   node tools/prepare.mjs            (no args)
 *       Rebuilds projects.json from the project folders already present.
 *
 *   node tools/prepare.mjs --remove <slug>
 *       Removes a project folder and rebuilds projects.json.
 *
 * Example:
 *   node tools/prepare.mjs "C:\Work\فيلا-النخيل.msar"
 *   → creates ./فيلا-النخيل/  and updates ./projects.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const PROJECTS_JSON = path.join(ROOT, 'projects.json')

const RESERVED = new Set([
  'index',
  'viewer',
  'projects',
  'tools',
  'vendor',
  'assets',
  'index.html',
  'viewer.html',
  'viewer.css',
  'viewer.js',
  'projects.json'
])

function slugify(name) {
  let s = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!s) s = 'project'
  if (RESERVED.has(s)) s = 'project-' + s
  return s
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

function findProjectDir(input) {
  let p = path.resolve(input)
  if (!fs.existsSync(p)) {
    console.error(`✗ المسار غير موجود: ${p}`)
    process.exit(1)
  }
  if (fs.statSync(p).isFile()) {
    const lower = p.toLowerCase()
    if (lower.endsWith('.msar')) {
      const base = path.join(path.dirname(p), path.basename(p, path.extname(p)))
      if (fs.existsSync(base) && fs.existsSync(path.join(base, 'project.json'))) return base
      console.error(`✗ ملف التصدير لم يُستخرج بعد: ${p}`)
      console.error(`  قم بفك ضغطه إلى مجلد ثم مرر المجلد للأداة.`)
      process.exit(1)
    }
    return path.dirname(p)
  }
  return p
}

function readProjectJson(projRoot) {
  try {
    return JSON.parse(fs.readFileSync(path.join(projRoot, 'project.json'), 'utf-8'))
  } catch {
    return null
  }
}

function publish(projRoot, customSlug) {
  const data = readProjectJson(projRoot)
  if (!data || !data.id) {
    console.error(`✗ ${projRoot} ليس مجلد مشروع Masar (لا يحتوي project.json صالحاً)`)
    process.exit(1)
  }
  const slug = customSlug || slugify(data.name || data.id)
  const destDir = path.join(ROOT, slug)

  if (!fs.existsSync(path.join(projRoot, 'assets'))) {
    console.error(`✗ لا يوجد مجلد assets داخل التصدير — أعد التصدير من Masar Editor`)
    process.exit(1)
  }

  console.log(`▶ نشر المشروع: ${data.name}`)
  console.log(`  الرابط: ${slug}/`)

  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(path.join(projRoot, 'project.json'), path.join(destDir, 'project.json'))
  copyDir(path.join(projRoot, 'assets'), path.join(destDir, 'assets'))

  const encoded = encodeURIComponent(slug)
  const redirect =
    `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n` +
    `<meta charset="utf-8"/>\n` +
    `<meta http-equiv="refresh" content="0; url=../viewer.html?project=${encoded}"/>\n` +
    `<link rel="canonical" href="../viewer.html?project=${encoded}"/>\n` +
    `<title>${data.name} — مسار</title>\n</head>\n` +
    `<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0d0b;color:#a49d94;font-family:Tahoma,sans-serif;font-size:14px">\n` +
    `  جاري فتح المشروع… ` +
    `<a href="../viewer.html?project=${encoded}" style="color:#e5ba5f;margin-inline-start:8px">اضغط هنا إن لم يتم التحويل</a>\n` +
    `</body>\n</html>\n`
  fs.writeFileSync(path.join(destDir, 'index.html'), redirect, 'utf-8')

  console.log(`✓ تم نشر ${data.name} → ${path.relative(ROOT, destDir)}`)
  rebuildIndex()
}

function removeProject(slug) {
  const destDir = path.join(ROOT, slug)
  if (!fs.existsSync(destDir) || !fs.existsSync(path.join(destDir, 'project.json'))) {
    console.error(`✗ لا يوجد مشروع بالاسم: ${slug}`)
    process.exit(1)
  }
  fs.rmSync(destDir, { recursive: true, force: true })
  console.log(`✓ تم حذف ${slug}`)
  rebuildIndex()
}

function rebuildIndex() {
  const list = []
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const projRoot = path.join(ROOT, entry.name)
    const data = readProjectJson(projRoot)
    if (!data) continue
    list.push({
      slug: entry.name,
      name: data.name || entry.name,
      clientName: data.clientName || '',
      description: data.description || '',
      cover: data.coverPath || null,
      updatedAt: data.updatedAt || 0,
      rooms: (data.rooms || []).filter((r) => !r.hidden).length,
      products: (data.products || []).length,
      pdfs: (data.pdfs || []).length
    })
  }
  list.sort((a, b) => b.updatedAt - a.updatedAt)
  fs.writeFileSync(
    PROJECTS_JSON,
    JSON.stringify({ updatedAt: Date.now(), projects: list }, null, 2) + '\n',
    'utf-8'
  )
  console.log(`✓ تم تحديث projects.json — ${list.length} مشروع`)
}

/* ---------------- main ---------------- */
const args = process.argv.slice(2)

if (args[0] === '--remove') {
  if (!args[1]) {
    console.error('استخدام: node tools/prepare.mjs --remove <slug>')
    process.exit(1)
  }
  removeProject(args[1])
} else if (args.length === 0) {
  rebuildIndex()
} else {
  const customSlug = args.find((a) => a.startsWith('--slug='))?.slice('--slug='.length)
  const input = args.find((a) => !a.startsWith('--'))
  if (!input) {
    console.error('استخدام: node tools/prepare.mjs <مسار-التصدير> [--slug=اسم-مخصص]')
    process.exit(1)
  }
  publish(findProjectDir(input), customSlug)
}
