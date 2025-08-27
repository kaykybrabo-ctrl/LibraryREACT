"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOneAuthor = readOneAuthor;
const connection_1 = require("../../DB/connection");
async function readOneAuthor(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id))
        return res.status(400).json({ error: 'Invalid author ID' });
    try {
        const results = await (0, connection_1.executeQuery)('SELECT author_id, name_author, biography, photo FROM authors WHERE author_id = ? LIMIT 1', [id]);
        if (!results.length)
            return res.status(404).json({ error: 'Author not found' });
        res.json(results[0]);
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
}
