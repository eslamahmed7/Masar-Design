"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWindow = getMainWindow;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const projects_1 = require("./ipc/projects");
const assets_1 = require("./ipc/assets");
const isDev = !!process.env.VITE_DEV_SERVER_URL;
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    });
    if (isDev) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    mainWindow.on('maximize', () => mainWindow?.webContents.send('shell:maximized', true));
    mainWindow.on('unmaximize', () => mainWindow?.webContents.send('shell:maximized', false));
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
function sendMenuCommand(command) {
    mainWindow?.webContents.send('menu:command', command);
}
function buildMenu() {
    const template = [
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
    ];
    electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(template));
}
electron_1.app.whenReady().then(() => {
    (0, projects_1.registerProjectIpc)();
    (0, assets_1.registerAssetIpc)();
    buildMenu();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.ipcMain.handle('shell:minimize', () => mainWindow?.minimize());
electron_1.ipcMain.handle('shell:toggleMaximize', () => {
    if (!mainWindow)
        return false;
    if (mainWindow.isMaximized())
        mainWindow.unmaximize();
    else
        mainWindow.maximize();
    return mainWindow.isMaximized();
});
electron_1.ipcMain.handle('shell:close', () => mainWindow?.close());
electron_1.ipcMain.handle('shell:showOpenDialog', async (_e, opts) => {
    const win = electron_1.BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win)
        return { canceled: true, filePaths: [] };
    return electron_1.dialog.showOpenDialog(win, opts);
});
electron_1.ipcMain.handle('shell:showSaveDialog', async (_e, opts) => {
    const win = electron_1.BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win)
        return { canceled: true, filePath: undefined };
    return electron_1.dialog.showSaveDialog(win, opts);
});
electron_1.ipcMain.handle('shell:message', (_e, opts) => {
    const win = electron_1.BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win)
        return;
    return electron_1.dialog.showMessageBox(win, opts);
});
electron_1.ipcMain.handle('shell:openPath', (_e, filePath) => electron_1.shell.openPath(filePath));
electron_1.ipcMain.handle('shell:openExternal', (_e, url) => electron_1.shell.openExternal(url));
electron_1.ipcMain.handle('shell:saveImage', async (_e, defaultName, dataUrl) => {
    const win = electron_1.BrowserWindow.getFocusedWindow() ?? mainWindow;
    if (!win)
        return { canceled: true };
    const result = await electron_1.dialog.showSaveDialog(win, {
        title: 'حفظ صورة',
        defaultPath: defaultName,
        filters: [{ name: 'صورة JPEG', extensions: ['jpg'] }]
    });
    if (result.canceled || !result.filePath)
        return { canceled: true };
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(result.filePath, Buffer.from(base64, 'base64'));
    return { canceled: false, path: result.filePath };
});
function getMainWindow() {
    return mainWindow;
}
