"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAuthorImage = updateAuthorImage;
const connection_1 = require("../../DB/connection");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function updateAuthorImage(req, res) {
    const id = Number(req.params.id);
    const file = req.file;
    if (isNaN(id))
        return res.status(400).json({ error: 'Invalid author ID' });
    try {
        let photo;
        if (file) {
            photo = file.filename;
            const old = await (0, connection_1.executeQuery)('SELECT photo FROM authors WHERE author_id = ?', [id]);
            if (old.length && old[0].photo) {
                const oldPath = path_1.default.join(__dirname, '../../../FRONTEND/uploads', old[0].photo);
                if (fs_1.default.existsSync(oldPath))
                    fs_1.default.unlinkSync(oldPath);
            }
            await (0, connection_1.executeQuery)('UPDATE authors SET photo = ? WHERE author_id = ?', [photo, id]);
        }
        res.json({ photo });
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
}
