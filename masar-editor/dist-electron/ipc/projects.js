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
exports.PROJECTS_DIR = exports.APP_DATA_DIR = void 0;
exports.registerProjectIpc = registerProjectIpc;
exports.projectDir = projectDir;
exports.projectFile = projectFile;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const main_1 = require("../main");
const export_1 = require("./export");
exports.APP_DATA_DIR = path.join(electron_1.app.getPath('appData'), 'masar-editor');
exports.PROJECTS_DIR = path.join(exports.APP_DATA_DIR, 'projects');
const RECENT_FILE = path.join(exports.APP_DATA_DIR, 'recent.json');
function ensureDirs() {
    fs.mkdirSync(exports.PROJECTS_DIR, { recursive: true });
    fs.mkdirSync(path.join(exports.APP_DATA_DIR, 'exports'), { recursive: true });
}
function readJson(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    catch {
        return fallback;
    }
}
function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}
function projectDir(id) {
    return path.join(exports.PROJECTS_DIR, id);
}
function projectFile(id) {
    return path.join(projectDir(id), 'project.json');
}
function readRecent() {
    return readJson(RECENT_FILE, []);
}
function writeRecent(meta) {
    const recents = readRecent().filter((p) => p.id !== meta.id);
    recents.unshift(meta);
    writeJson(RECENT_FILE, recents.slice(0, 12));
}
function getMeta(id) {
    const full = readJson(projectFile(id), null);
    if (!full)
        return null;
    return {
        id: full.id,
        name: full.name,
        clientName: full.clientName,
        companyName: full.companyName,
        updatedAt: full.updatedAt,
        createdAt: full.createdAt,
        coverPath: full.coverPath
    };
}
function copyIntoProject(src, projectId, sub) {
    if (!src || !fs.existsSync(src))
        return null;
    const ext = path.extname(src).toLowerCase();
    const base = path.basename(src, ext).replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40) || 'file';
    let name = `${base}${ext}`;
    let i = 1;
    const destDir = path.join(projectDir(projectId), sub);
    fs.mkdirSync(destDir, { recursive: true });
    while (fs.existsSync(path.join(destDir, name))) {
        name = `${base}_${i}${ext}`;
        i++;
    }
    fs.copyFileSync(src, path.join(destDir, name));
    return `${sub.replace(/\\/g, '/')}/${name}`;
}
function registerProjectIpc() {
    ensureDirs();
    electron_1.ipcMain.handle('projects:list', () => {
        const recents = readRecent();
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
        }));
    });
    electron_1.ipcMain.handle('projects:open', (_e, id) => {
        const file = projectFile(id);
        if (!fs.existsSync(file))
            throw new Error('المشروع غير موجود');
        const project = readJson(file, null);
        if (project)
            getMeta(id) && writeRecent(getMeta(id));
        return project;
    });
    electron_1.ipcMain.handle('projects:openPath', (_e, file) => {
        if (!file || !fs.existsSync(file))
            throw new Error('ملف المشروع غير موجود');
        const project = readJson(file, null);
        if (!project?.id)
            throw new Error('ملف غير صالح — ليس مشروع Masar');
        const target = projectFile(project.id);
        if (path.resolve(file) !== path.resolve(target)) {
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.copyFileSync(file, target);
        }
        getMeta(project.id) && writeRecent(getMeta(project.id));
        return project;
    });
    electron_1.ipcMain.handle('projects:create', async (_e, data, coverPath, logoPath) => {
        const id = data.id;
        fs.mkdirSync(projectDir(id), { recursive: true });
        fs.mkdirSync(path.join(projectDir(id), 'assets'), { recursive: true });
        if (coverPath) {
            const rel = copyIntoProject(coverPath, id, 'assets/covers');
            if (rel)
                data.coverPath = rel;
        }
        if (logoPath) {
            const rel = copyIntoProject(logoPath, id, 'assets/logos');
            if (rel)
                data.logoPath = rel;
        }
        writeJson(projectFile(id), data);
        writeRecent(getMeta(id));
        return data;
    });
    electron_1.ipcMain.handle('projects:save', (_e, data) => {
        if (!data?.id)
            throw new Error('معرف المشروع غير موجود');
        fs.mkdirSync(projectDir(data.id), { recursive: true });
        writeJson(projectFile(data.id), data);
        writeRecent(getMeta(data.id));
        return { ok: true, savedAt: Date.now() };
    });
    electron_1.ipcMain.handle('projects:export', async (_e, id) => {
        const win = (0, main_1.getMainWindow)();
        if (!win)
            throw new Error('No window');
        const meta = getMeta(id);
        if (!meta || !fs.existsSync(projectFile(id)))
            throw new Error('المشروع غير موجود');
        const result = await electron_1.dialog.showSaveDialog(win, {
            title: 'تصدير المشروع',
            defaultPath: `${meta.name}.msar`,
            filters: [{ name: 'Masar Package', extensions: ['msar'] }]
        });
        if (result.canceled || !result.filePath)
            return { canceled: true };
        return (0, export_1.exportProject)(id, result.filePath);
    });
    electron_1.ipcMain.handle('projects:recent', () => readRecent());
    electron_1.ipcMain.handle('projects:removeRecent', (_e, id) => {
        writeJson(RECENT_FILE, readRecent().filter((p) => p.id !== id));
        return true;
    });
}
