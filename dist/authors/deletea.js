"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletea = deletea;
const connection_1 = require("../DB/connection");
async function deletea(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0)
        return res.sendStatus(400);
    try {
        const result = await (0, connection_1.executeQuery)('DELETE FROM authors WHERE author_id = ?', [id]);
        if (result.affectedRows === 0)
            return res.sendStatus(404);
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(500);
    }
}
