import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    let { title, description, author_id, new_author_name } = req.body;
    const photo = (req.file as any)?.path;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Título é obrigatório' });
    }

    if (new_author_name && typeof new_author_name === 'string' && new_author_name.trim()) {
        try {
            const authorResult: any = await executeQuery(
                'INSERT INTO authors (name_author) VALUES (?)',
                [new_author_name.trim()]
            );
            author_id = authorResult.insertId;
        } catch (error) {
            return res.status(500).json({ error: 'Falha ao criar novo autor' });
        }
    } else if (!author_id || isNaN(Number(author_id)) || Number(author_id) <= 0) {
        return res.status(400).json({ error: 'Autor é obrigatório' });
    }

    title = title.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

    try {
        const updates = ['author_id = ?', 'title = ?'];
        const params: any[] = [Number(author_id), title];

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (photo) {
            updates.push('photo = ?');
            params.push(photo);
        }

        params.push(id);

        const result = await executeQuery(
            `UPDATE books SET ${updates.join(', ')} WHERE book_id = ?`,
            params
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json({ message: 'Livro atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ error: 'Falha ao atualizar livro' });
    }
}
