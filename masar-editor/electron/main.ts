import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { registerProjectIpc } from './ipc/projects'
import { registerAssetIpc } from './ipc/assets'

const isDev = !!process.env.VITE_DEV_SERVER_URL

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    frame: false,
    backgroundColor: '#1e1e1e',
    title: 'Masar Editor',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('maximize', () => mainWindow?.webContents.send('shell:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('shell:maximized', false))
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function sendMenuCommand(command: string) {
  mainWindow?.webContents.send('menu:command', command)
}

function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'ملف',
      submenu: [
        { label: 'مشروع جديد', accelerator: 'Ctrl+N', click: () => sendMenuCommand('file:new') },
        { label: 'فتح مشروع…', accelerator: 'Ctrl+O', click: () => sendMenuCommand('file:open') },
        { type: 'separator' },
        { label: 'حفظ', accelerator: 'Ctrl+S', click: () => sendMenuCommand('file:save') },
        { label: 'حفظ باسم…', accelerator: 'Ctrl+Shift+S', click: () => sendMenuCommand('file:saveAs') },
        { type: 'separator' },
        { label: 'تصدير المشروع…', accelerator: 'Ctrl+E', click: () => sendMenuCommand('file:export') },
        { type: 'separator' },
        { label: 'خروج', role: 'quit' }
      ]
    },
    {
      label: 'تعديل',
      submenu: [
        { label: 'تراجع', role: 'undo', enabled: false },
        { label: 'إعادة', role: 'redo', enabled: false },
        { type: 'separator' },
        { label: 'قص', role: 'cut', enabled: false },
        { label: 'نسخ', role: 'copy', enabled: false },
        { label: 'لصق', role: 'paste', enabled: false },
        { label: 'حذف', role: 'delete', enabled: false }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        { label: 'إخفاء/إظهار مستكشف المشروع', accelerator: 'Ctrl+B', click: () => sendMenuCommand('view:toggleExplorer') },
        { label: 'إخفاء/إظهار الخصائص', accelerator: 'Ctrl+I', click: () => sendMenuCommand('view:toggleInspector') },
        { type: 'separator' },
        { label: 'معاينة الجولة', accelerator: 'F5', click: () => sendMenuCommand('view:preview') },
        { type: 'separator' },
        { label: 'وضع ملء الشاشة', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'مشروع',
      submenu: [
        { label: 'خصائص المشروع', accelerator: 'Ctrl+Shift+P', click: () => sendMenuCommand('project:properties') },
        { type: 'separator' },
        { label: 'المنتجات', click: () => sendMenuCommand('project:products') },
        { label: 'ملفات PDF', click: () => sendMenuCommand('project:pdfs') }
      ]
    },
    {
      label: 'مساعدة',
      submenu: [
        { label: 'اختصارات لوحة المفاتيح', accelerator: 'F1', click: () => sendMenuCommand('help:shortcuts') },
        { type: 'separator' },
        { label: 'حول Masar Editor', click: () => sendMenuCommand('help:about') }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  registerProjectIpc()
  registerAssetIpc()
  buildMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('shell:minimize', () => mainWindow?.minimize())
ipcMain.handle('shell:toggleMaximize', () => {
  if (!mainWindow) return false
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
  return mainWindow.isMaximized()
})
ipcMain.handle('shell:close', () => mainWindow?.close())

ipcMain.handle('shell:showOpenDialog', async (_e, opts: Electron.OpenDialogOptions) => {
  const win = BrowserWindow.getFocusedWindow() ?? mainWindow
  if (!win) return { canceled: true, filePaths: [] }
  return dialog.showOpenDialog(win, opts)
})

ipcMain.handle('shell:showSaveDialog', async (_e, opts: Electron.SaveDialogOptions) => {
  const win = BrowserWindow.getFocusedWindow() ?? mainWindow
  if (!win) return { canceled: true, filePath: undefined }
  return dialog.showSaveDialog(win, opts)
})

ipcMain.handle('shell:message', (_e, opts: Electron.MessageBoxOptions) => {
  const win = BrowserWindow.getFocusedWindow() ?? mainWindow
  if (!win) return
  return dialog.showMessageBox(win, opts)
})

ipcMain.handle('shell:openPath', (_e, filePath: string) => shell.openPath(filePath))
ipcMain.handle('shell:openExternal', (_e, url: string) => shell.openExternal(url))

ipcMain.handle('shell:saveImage', async (_e, defaultName: string, dataUrl: string) => {
  const win = BrowserWindow.getFocusedWindow() ?? mainWindow
  if (!win) return { canceled: true }
  const result = await dialog.showSaveDialog(win, {
    title: 'حفظ صورة',
    defaultPath: defaultName,
    filters: [{ name: 'صورة JPEG', extensions: ['jpg'] }]
  })
  if (result.canceled || !result.filePath) return { canceled: true }
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
  fs.writeFileSync(result.filePath, Buffer.from(base64, 'base64'))
  return { canceled: false, path: result.filePath }
})

export function getMainWindow() {
  return mainWindow
}
