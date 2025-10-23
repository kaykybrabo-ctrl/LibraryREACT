import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    let { name_author, description } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.sendStatus(400);
    }

    if (!name_author && description === undefined) {
        return res.status(400).json({ error: 'At least name_author or description must be provided' });
    }

    try {
        let query = 'UPDATE authors SET';
        let params: any[] = [];
        let updates: string[] = [];

        if (name_author && typeof name_author === 'string' && name_author.trim() !== '') {
            name_author = name_author.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()).trim();
            updates.push(' name_author = ?');
            params.push(name_author);
        }

        if (description !== undefined) {
            updates.push(' description = ?');
            params.push(description);
        }

        query += updates.join(',');
        query += ' WHERE author_id = ?';
        params.push(id);

        const result = await executeQuery(query, params);

        if ((result as any).affectedRows === 0) {
            return res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}
