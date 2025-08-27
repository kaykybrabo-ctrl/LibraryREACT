"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOneBook = readOneBook;
const connection_1 = require("../../DB/connection");
async function readOneBook(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id))
        return res.status(400).json({ error: 'Invalid book ID' });
    try {
        const results = await (0, connection_1.executeQuery)(`
            SELECT 
                b.book_id, 
                b.title, 
                a.name_author AS author_name, 
                b.description,
                b.photo,
                COALESCE(GROUP_CONCAT(DISTINCT c.name_category), 'N/A') AS categories,
                COALESCE(GROUP_CONCAT(DISTINCT p.publish_name), 'N/A') AS publisher
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.author_id
            LEFT JOIN book_categories bc ON b.book_id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.category_id
            LEFT JOIN book_publishers bp ON b.book_id = bp.book_id
            LEFT JOIN publishers p ON bp.publish_id = p.publish_id
            WHERE b.book_id = ?
            GROUP BY b.book_id, b.title, b.description, a.name_author, b.photo
        `, [id]);
        if (!results.length)
            return res.status(404).json({ error: 'Book not found' });
        res.json(results[0]);
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
}
