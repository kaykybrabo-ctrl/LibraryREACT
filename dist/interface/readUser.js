"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = read;
const connection_1 = require("../DB/connection");
async function read(req, res) {
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 5;
    const offset = Number(req.query.offset) >= 0 ? Number(req.query.offset) : 0;
    const search = req.query.search;
    try {
        const params = [];
        let query = 'SELECT * FROM books';
        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const books = await (0, connection_1.executeQuery)(query, params);
        res.json(books);
    }
    catch {
        res.sendStatus(500);
    }
}
