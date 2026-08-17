"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('masar', {
    window: {
        minimize: () => electron_1.ipcRenderer.invoke('shell:minimize'),
        toggleMaximize: () => electron_1.ipcRenderer.invoke('shell:toggleMaximize'),
        close: () => electron_1.ipcRenderer.invoke('shell:close'),
        onMaximized: (cb) => {
            electron_1.ipcRenderer.on('shell:maximized', (_e, max) => cb(max));
        }
    },
    dialogs: {
        open: (opts) => electron_1.ipcRenderer.invoke('shell:showOpenDialog', opts),
        save: (opts) => electron_1.ipcRenderer.invoke('shell:showSaveDialog', opts),
        message: (opts) => electron_1.ipcRenderer.invoke('shell:message', opts),
        openPath: (filePath) => electron_1.ipcRenderer.invoke('shell:openPath', filePath),
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:openExternal', url),
        saveImage: (defaultName, dataUrl) => electron_1.ipcRenderer.invoke('shell:saveImage', defaultName, dataUrl)
    },
    projects: {
        list: () => electron_1.ipcRenderer.invoke('projects:list'),
        open: (id) => electron_1.ipcRenderer.invoke('projects:open', id),
        create: (data, coverPath, logoPath) => electron_1.ipcRenderer.invoke('projects:create', data, coverPath, logoPath),
        save: (data) => electron_1.ipcRenderer.invoke('projects:save', data),
        export: (id) => electron_1.ipcRenderer.invoke('projects:export', id),
        getRecent: () => electron_1.ipcRenderer.invoke('projects:recent'),
        removeRecent: (id) => electron_1.ipcRenderer.invoke('projects:removeRecent', id)
    },
    assets: {
        import: (projectId, filePath) => electron_1.ipcRenderer.invoke('assets:import', projectId, filePath),
        remove: (projectId, relPath) => electron_1.ipcRenderer.invoke('assets:remove', projectId, relPath),
        readFileAsDataUrl: (projectId, relPath) => electron_1.ipcRenderer.invoke('assets:readDataUrl', projectId, relPath)
    },
    onMenuCommand: (cb) => {
        electron_1.ipcRenderer.on('menu:command', (_e, cmd) => cb(cmd));
    }
});
