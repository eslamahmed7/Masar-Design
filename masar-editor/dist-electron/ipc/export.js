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
exports.exportProject = exportProject;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const projects_1 = require("./projects");
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory())
            copyDir(s, d);
        else
            fs.copyFileSync(s, d);
    }
}
function exportProject(id, destPath) {
    const destDir = destPath.toLowerCase().endsWith('.msar')
        ? destPath.slice(0, -5)
        : destPath;
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.mkdirSync(destDir, { recursive: true });
    copyDir((0, projects_1.projectDir)(id), destDir);
    const viewerDir = path.join(__dirname, '..', '..', 'dist-viewer');
    if (fs.existsSync(viewerDir)) {
        copyDir(viewerDir, path.join(destDir, 'viewer'));
    }
    fs.writeFileSync(path.join(destDir, 'masar.json'), JSON.stringify({
        format: 'masar-project',
        version: 1,
        exportedAt: new Date().toISOString(),
        viewer: fs.existsSync(viewerDir)
    }, null, 2), 'utf-8');
    return { ok: true, dir: destDir };
}
