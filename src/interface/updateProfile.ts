import { Response, Request } from 'express';
import { executeQuery } from '../DB/connection';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export async function updateProfile(req: MulterRequest, res: Response) {
    const { username, description } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    // Check if user is authenticated
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Users can only edit their own profile, admins can edit any profile
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

        res.json({ profile_image: imageFilename, username, description });
    } catch {
        res.status(500).json({ error: 'Database error' });
    }
}
