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
        let imageFilename = req.file?.filename;

        if (!imageFilename) {
            const result: any[] = await executeQuery(
                'SELECT photo FROM users WHERE username = ? LIMIT 1',
                [username]
            );
            imageFilename = result.length > 0 ? result[0].photo : 'default-user.png';
        }

        await executeQuery(
            'UPDATE users SET photo = ?, description = ? WHERE username = ?',
            [imageFilename, description, username]
        );

        const updatedProfile: any[] = await executeQuery(
            'SELECT id, username, role, photo AS profile_image, description FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (updatedProfile.length > 0) {
            const user = updatedProfile[0];
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                profile_image: user.profile_image || 'default-user.png',
                description: user.description || ''
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}
