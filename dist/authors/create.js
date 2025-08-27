"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const connection_1 = require("../DB/connection");
async function create(req, res) {
    let { name_author } = req.body;
    if (!name_author || typeof name_author !== 'string') {
        return res.sendStatus(400);
    }
    name_author = name_author.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    try {
        await (0, connection_1.executeQuery)('INSERT INTO authors (name_author) VALUES (?)', [name_author]);
        res.sendStatus(201);
    }
    catch {
        res.sendStatus(500);
    }
}
