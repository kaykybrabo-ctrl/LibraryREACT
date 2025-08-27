"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = read;
const connection_1 = require("../DB/connection");
async function read(req, res) {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    const search = req.query.search;
    if (isNaN(limit) || limit <= 0)
        limit = 5;
    if (isNaN(offset) || offset < 0)
        offset = 0;
    try {
        let query = 'SELECT * FROM books';
        const params = [];
        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }
        query += ` LIMIT ${limit} OFFSET ${offset}`;
        const books = await (0, connection_1.executeQuery)(query, params);
        res.json(books);
    }
    catch {
        res.sendStatus(500);
    }
}
