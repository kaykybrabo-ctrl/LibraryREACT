import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';
import { safeDeleteImage } from '../utils/cloudinaryProtection';

export async function deleteb(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) return res.sendStatus(400);

    try {
        // Primeiro, buscar informações do livro (incluindo a imagem)
        const bookResult = await executeQuery('SELECT * FROM books WHERE book_id = ?', [id]);
        
        if ((bookResult as any[]).length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        const book = (bookResult as any[])[0];
        
        // Deletar o livro do banco de dados
        const deleteResult = await executeQuery('DELETE FROM books WHERE book_id = ?', [id]);

        if ((deleteResult as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        // Tentar deletar a imagem do Cloudinary (com proteção)
        if (book.photo) {
            let imagePublicId = book.photo;
            
            // Se não for uma URL completa, construir o public_id
            if (!imagePublicId.startsWith('pedbook/')) {
                imagePublicId = `pedbook/books/${imagePublicId}`;
            }
            
            const deleteImageResult = await safeDeleteImage(imagePublicId);
            
            if (!deleteImageResult.success) {
                console.log('Aviso ao deletar imagem:', deleteImageResult.message);
            }
        }

        res.json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
