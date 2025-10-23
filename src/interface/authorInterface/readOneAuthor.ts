import { Request, Response } from 'express';
import { executeQuery } from '../../DB/connection';

export async function readOneAuthor(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid author ID' });

    try {
        const results: any[] = await executeQuery(
            'SELECT author_id, name_author, description, photo FROM authors WHERE author_id = ? LIMIT 1',
            [id]
        );

        if (!results.length) return res.status(404).json({ error: 'Author not found' });

        res.json(results[0]);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
}
