import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';
import { safeDeleteImage } from '../utils/cloudinaryProtection';

export async function deletea(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) return res.sendStatus(400);

    try {
        const authorResult = await executeQuery('SELECT * FROM authors WHERE author_id = ?', [id]);
        
        if ((authorResult as any[]).length === 0) {
            return res.status(404).json({ error: 'Autor não encontrado' });
        }

        const author = (authorResult as any[])[0];
        
        const booksResult = await executeQuery('SELECT COUNT(*) as count FROM books WHERE author_id = ?', [id]);
        const bookCount = (booksResult as any[])[0].count;
        
        if (bookCount > 0) {
            return res.status(400).json({ 
                error: `Não é possível deletar o autor. Existem ${bookCount} livro(s) associado(s) a este autor.` 
            });
        }
        
        const deleteResult = await executeQuery('DELETE FROM authors WHERE author_id = ?', [id]);

        if ((deleteResult as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Autor não encontrado' });
        }

        if (author.photo) {
            let imagePublicId = author.photo;
            
            if (!imagePublicId.startsWith('pedbook/')) {
                imagePublicId = `pedbook/profiles/${imagePublicId}`;
            }
            
            const deleteImageResult = await safeDeleteImage(imagePublicId);
            
            if (!deleteImageResult.success) {
                console.warn('Aviso ao deletar imagem:', deleteImageResult.message);
            }
        }

        res.json({ message: 'Autor deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar autor:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
