import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function getProfile(req: Request, res: Response) {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const username = (req.query.username as string) || sessionUser.username;

    if (sessionUser.role !== 'admin' && sessionUser.username !== username) {
        return res.status(403).json({ error: 'You can only view your own profile' });
    }

    try {
        const results: any[] = await executeQuery(
            'SELECT id, username, role, photo AS profile_image, description FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (!results.length) return res.status(404).json({ error: 'User not found' });

        const user = results[0];

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            profile_image: user.profile_image || 'default-user.png',
            description: user.description || ''
        });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}
