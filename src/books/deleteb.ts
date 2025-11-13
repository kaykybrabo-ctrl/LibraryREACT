import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';
import { safeDeleteImage } from '../utils/cloudinaryProtection';

export async function deleteb(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) return res.sendStatus(400);

    try {
        const bookResult = await executeQuery('SELECT * FROM books WHERE book_id = ?', [id]);
        
        if ((bookResult as any[]).length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        const book = (bookResult as any[])[0];
        
        const deleteResult = await executeQuery('DELETE FROM books WHERE book_id = ?', [id]);

        if ((deleteResult as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        if (book.photo) {
            let imagePublicId = book.photo;
            
            if (!imagePublicId.startsWith('pedbook/')) {
                imagePublicId = `pedbook/books/${imagePublicId}`;
            }
            
            const deleteImageResult = await safeDeleteImage(imagePublicId);
            
            if (!deleteImageResult.success) {
            }
        }

        res.json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
