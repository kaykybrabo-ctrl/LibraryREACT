"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = count;
const connection_1 = require("../DB/connection");
async function count(_req, res) {
    try {
        const result = await (0, connection_1.executeQuery)('SELECT COUNT(*) AS total FROM authors');
        res.json({ total: result[0].total });
    }
    catch {
        res.sendStatus(500);
    }
}
