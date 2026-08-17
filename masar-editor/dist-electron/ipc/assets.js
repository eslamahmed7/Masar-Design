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
exports.classifyFile = classifyFile;
exports.registerAssetIpc = registerAssetIpc;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url_1 = require("url");
const projects_1 = require("./projects");
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];
const PDF_EXT = ['.pdf'];
function classifyFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (IMAGE_EXT.includes(ext))
        return 'image';
    if (VIDEO_EXT.includes(ext))
        return 'video';
    if (PDF_EXT.includes(ext))
        return 'pdf';
    return 'other';
}
function registerAssetIpc() {
    electron_1.protocol.handle('masar', (request) => {
        const url = new URL(request.url);
        const projectId = url.hostname;
        const rel = decodeURIComponent(url.pathname.replace(/^\//, ''));
        const filePath = path.join(projects_1.PROJECTS_DIR, projectId, rel);
        if (!filePath.startsWith((0, projects_1.projectDir)(projectId)) || !fs.existsSync(filePath)) {
            return new Response('Not found', { status: 404 });
        }
        return electron_1.net.fetch((0, url_1.pathToFileURL)(filePath).toString());
    });
    electron_1.ipcMain.handle('assets:import', (_e, projectId, filePath) => {
        if (!filePath || !fs.existsSync(filePath))
            throw new Error('الملف غير موجود');
        const kind = classifyFile(filePath);
        const sub = kind === 'pdf' ? 'assets/pdfs' : kind === 'video' ? 'assets/videos' : 'assets/images';
        const ext = path.extname(filePath).toLowerCase();
        const base = path.basename(filePath, ext).replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40) || 'file';
        let name = `${base}${ext}`;
        let i = 1;
        const destDir = path.join((0, projects_1.projectDir)(projectId), sub);
        fs.mkdirSync(destDir, { recursive: true });
        while (fs.existsSync(path.join(destDir, name))) {
            name = `${base}_${i}${ext}`;
            i++;
        }
        fs.copyFileSync(filePath, path.join(destDir, name));
        return { relPath: `${sub.replace(/\\/g, '/')}/${name}`, kind };
    });
    electron_1.ipcMain.handle('assets:remove', (_e, projectId, relPath) => {
        const filePath = path.join((0, projects_1.projectDir)(projectId), relPath);
        if (filePath.startsWith((0, projects_1.projectDir)(projectId)) && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return true;
    });
    electron_1.ipcMain.handle('assets:readDataUrl', (_e, projectId, relPath) => {
        const filePath = path.join((0, projects_1.projectDir)(projectId), relPath);
        if (!fs.existsSync(filePath))
            return null;
        const data = fs.readFileSync(filePath);
        const mime = path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        return `data:${mime};base64,${data.toString('base64')}`;
    });
}
