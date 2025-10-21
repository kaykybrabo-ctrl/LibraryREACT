import { Response, Request } from 'express';
import { executeQuery } from '../DB/connection';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
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
        let imageFilename = null;
        
        if (req.file) {
            imageFilename = (req.file as any).path || req.file.filename;
        } else {
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
            
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                profile_image: user.profile_image,
                description: user.description || ''
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Database error' });
    }
}
