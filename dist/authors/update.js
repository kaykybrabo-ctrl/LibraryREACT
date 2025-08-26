"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const connection_1 = require("../DB/connection");
async function update(req, res) {
    const id = Number(req.params.id);
    let { name_author } = req.body;
    if (!name_author || typeof name_author !== 'string' || name_author.trim() === '') {
        return res.sendStatus(400);
    }
    if (isNaN(id) || id <= 0) {
        return res.sendStatus(400);
    }
    name_author = name_author.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()).trim();
    try {
        const result = await (0, connection_1.executeQuery)('UPDATE authors SET name_author = ? WHERE author_id = ?', [name_author, id]);
        if (result.affectedRows === 0) {
            return res.sendStatus(404);
        }
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(500);
    }
}
//# sourceMappingURL=update.js.map