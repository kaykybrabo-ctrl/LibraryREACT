"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const connection_1 = require("../DB/connection");
async function update(req, res) {
    const id = Number(req.params.id);
    const { author_id } = req.body;
    let { title } = req.body;
    if (!author_id || !title || typeof title !== 'string' || title.trim() === '') {
        return res.sendStatus(400);
    }
    if (isNaN(id) || id <= 0 || isNaN(Number(author_id)) || Number(author_id) <= 0) {
        return res.sendStatus(400);
    }
    title = title.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    try {
        const result = await (0, connection_1.executeQuery)('UPDATE books SET author_id = ?, title = ? WHERE book_id = ?', [Number(author_id), title, id]);
        if (result.affectedRows === 0) {
            return res.sendStatus(404);
        }
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(500);
    }
}
