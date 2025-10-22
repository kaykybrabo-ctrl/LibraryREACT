import { Request, Response } from 'express';
import { executeQuery } from '../../DB/connection';

export async function readOneBook(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid book ID' });

    try {
        const results: any[] = await executeQuery(`
            SELECT 
                b.book_id, 
                b.title, 
                a.name_author AS author_name, 
                b.description,
                b.photo,
                'N/A' AS categories,
                'N/A' AS publisher
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.author_id
            WHERE b.book_id = ?
        `, [id]);

        if (!results.length) return res.status(404).json({ error: 'Book not found' });

        res.json(results[0]);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
}
