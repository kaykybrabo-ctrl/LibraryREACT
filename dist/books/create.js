"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const connection_1 = require("../DB/connection");
async function create(req, res) {
    const { author_id } = req.body;
    let { title } = req.body;
    if (!author_id || !title || typeof title !== 'string') {
        return res.sendStatus(400);
    }
    title = title.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    try {
        await (0, connection_1.executeQuery)('INSERT INTO books (author_id, title) VALUES (?, ?)', [author_id, title]);
        res.sendStatus(201);
    }
    catch {
        res.sendStatus(500);
    }
}
