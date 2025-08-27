"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = read;
const connection_1 = require("../DB/connection");
async function read(req, res) {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    if (isNaN(limit) || limit <= 0)
        limit = 5;
    if (isNaN(offset) || offset < 0)
        offset = 0;
    try {
        const authors = await (0, connection_1.executeQuery)(`SELECT * FROM authors LIMIT ${limit} OFFSET ${offset}`);
        res.json(authors);
    }
    catch {
        res.sendStatus(500);
    }
}
