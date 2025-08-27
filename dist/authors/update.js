"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const connection_1 = require("../DB/connection");
async function update(req, res) {
    const id = Number(req.params.id);
    let { name_author, biography } = req.body;
    if (!name_author || typeof name_author !== 'string' || name_author.trim() === '') {
        return res.sendStatus(400);
    }
    if (isNaN(id) || id <= 0) {
        return res.sendStatus(400);
    }
    name_author = name_author.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()).trim();
    try {
        let query = 'UPDATE authors SET name_author = ?';
        let params = [name_author];
        if (biography !== undefined) {
            query += ', biography = ?';
            params.push(biography);
        }
        query += ' WHERE author_id = ?';
        params.push(id);
        const result = await (0, connection_1.executeQuery)(query, params);
        if (result.affectedRows === 0) {
            return res.sendStatus(404);
        }
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(500);
    }
}
