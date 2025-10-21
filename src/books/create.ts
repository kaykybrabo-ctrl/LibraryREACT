import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function create(req: Request, res: Response) {
    const { author_id, author_name } = req.body;
    let { title } = req.body;

    if (!title || typeof title !== 'string') {
        return res.sendStatus(400);
    }

    if (!author_id && !author_name) {
        return res.status(400).json({ error: 'Author ID or Author Name is required' });
    }

    title = title.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

    try {
        let finalAuthorId = author_id;

        if (!author_id && author_name) {
            const existingAuthor: any = await executeQuery(
                'SELECT author_id FROM authors WHERE name_author = ? LIMIT 1',
                [author_name.trim()]
            );

            if (existingAuthor.length > 0) {
                finalAuthorId = existingAuthor[0].author_id;
            } else {
                const result: any = await executeQuery(
                    'INSERT INTO authors (name_author, biography) VALUES (?, ?)',
                    [author_name.trim(), `Biografia de ${author_name.trim()}`]
                );
                finalAuthorId = result.insertId;
            }
        }

        await executeQuery('INSERT INTO books (author_id, title) VALUES (?, ?)', [finalAuthorId, title]);
        res.status(201).json({ 
            message: 'Book created successfully',
            author_created: !author_id && author_name
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create book' });
    }
}
