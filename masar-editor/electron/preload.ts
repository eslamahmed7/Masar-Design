import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('masar', {
  window: {
    minimize: () => ipcRenderer.invoke('shell:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('shell:toggleMaximize'),
    close: () => ipcRenderer.invoke('shell:close'),
    onMaximized: (cb: (max: boolean) => void) => {
      ipcRenderer.on('shell:maximized', (_e, max: boolean) => cb(max))
    }
  },
  dialogs: {
    open: (opts: any) => ipcRenderer.invoke('shell:showOpenDialog', opts),
    save: (opts: any) => ipcRenderer.invoke('shell:showSaveDialog', opts),
    message: (opts: any) => ipcRenderer.invoke('shell:message', opts),
    openPath: (filePath: string) => ipcRenderer.invoke('shell:openPath', filePath),
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    saveImage: (defaultName: string, dataUrl: string) =>
      ipcRenderer.invoke('shell:saveImage', defaultName, dataUrl)
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    open: (id: string) => ipcRenderer.invoke('projects:open', id),
    create: (data: any, coverPath?: string | null, logoPath?: string | null) =>
      ipcRenderer.invoke('projects:create', data, coverPath, logoPath),
    save: (data: any) => ipcRenderer.invoke('projects:save', data),
    export: (id: string) => ipcRenderer.invoke('projects:export', id),
    getRecent: () => ipcRenderer.invoke('projects:recent'),
    removeRecent: (id: string) => ipcRenderer.invoke('projects:removeRecent', id)
  },
  assets: {
    import: (projectId: string, filePath: string) => ipcRenderer.invoke('assets:import', projectId, filePath),
    remove: (projectId: string, relPath: string) => ipcRenderer.invoke('assets:remove', projectId, relPath),
    readFileAsDataUrl: (projectId: string, relPath: string) =>
      ipcRenderer.invoke('assets:readDataUrl', projectId, relPath)
  },
  onMenuCommand: (cb: (cmd: string) => void) => {
    ipcRenderer.on('menu:command', (_e, cmd: string) => cb(cmd))
  }
})
