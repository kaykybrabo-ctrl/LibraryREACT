import { Request, Response } from 'express';
import { executeQuery } from '../../DB/connection';

export async function updateAuthorImage(req: Request, res: Response) {
    const id = Number(req.params.id);
    const file = req.file;

    if (isNaN(id)) return res.status(400).json({ error: 'Invalid author ID' });

    try {
        let photo = null;
        
        if (file) {
            photo = (file as any).path || file.filename;
            await executeQuery('UPDATE authors SET photo = ? WHERE author_id = ?', [photo, id]);
        }

        const updatedAuthor: any[] = await executeQuery(
            'SELECT author_id, name_author, photo, description FROM authors WHERE author_id = ? LIMIT 1',
            [id]
        );

        if (updatedAuthor.length > 0) {
            res.json({
                author_id: updatedAuthor[0].author_id,
                name_author: updatedAuthor[0].name_author,
                photo: updatedAuthor[0].photo,
                description: updatedAuthor[0].description
            });
        } else {
            res.status(404).json({ error: 'Author not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
