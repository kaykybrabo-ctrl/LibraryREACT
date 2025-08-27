"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = count;
const connection_1 = require("../DB/connection");
async function count(req, res) {
    const search = req.query.search;
    try {
        let query = 'SELECT COUNT(*) AS total FROM books';
        const params = [];
        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }
        const result = await (0, connection_1.executeQuery)(query, params);
        res.json({ total: result[0].total });
    }
    catch {
        res.sendStatus(500);
    }
}
