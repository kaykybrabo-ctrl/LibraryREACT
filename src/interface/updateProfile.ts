import { Response, Request } from 'express';
import { executeQuery } from '../DB/connection';
import fs from 'fs';
import path from 'path';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

function findActualFilename(originalName: string): string | null {
    if (!originalName) return null;
    
    const uploadsDir = path.join(__dirname, '../../FRONTEND/uploads');
    
    try {
        const files = fs.readdirSync(uploadsDir);
        // Procura por arquivo que termina com o nome original
        const foundFile = files.find(file => file.endsWith(originalName));
        return foundFile || null;
    } catch (error) {
        return null;
    }
}

export async function updateProfile(req: MulterRequest, res: Response) {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const username = req.body.username || sessionUser.username;
    const description = req.body.description || '';

    if (sessionUser.role !== 'admin' && sessionUser.username !== username) {
        return res.status(403).json({ error: 'You can only edit your own profile' });
    }

    try {
        let imageFilename = req.file?.filename;
        console.log('Upload file info:', req.file);
        console.log('Image filename to save:', imageFilename);

        if (!imageFilename) {
            const result: any[] = await executeQuery(
                'SELECT profile_image FROM users WHERE username = ? LIMIT 1',
                [username]
            );
            imageFilename = result.length > 0 ? result[0].profile_image : null;
        }

        await executeQuery(
            'UPDATE users SET profile_image = ?, description = ? WHERE username = ?',
            [imageFilename, description, username]
        );

        const updatedProfile: any[] = await executeQuery(
            'SELECT id, username, role, profile_image, description FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (updatedProfile.length > 0) {
            const user = updatedProfile[0];
            // Encontrar o nome real do arquivo com timestamp
            const actualFilename = user.profile_image ? findActualFilename(user.profile_image) : null;
            
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                profile_image: actualFilename || null,
                description: user.description || ''
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}
