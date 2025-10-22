import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function getProfile(req: Request, res: Response) {
    const sessionUser = (req.session as any)?.user;
    const username = req.query.username as string;

    if (!username && !sessionUser) {
        return res.status(401).json({ error: 'Username required or login needed' });
    }

    const targetUsername = username || sessionUser.username;

    try {
        const results: any[] = await executeQuery(
            'SELECT id, username, role, profile_image, description FROM users WHERE username = ? LIMIT 1',
            [targetUsername]
        );

        if (!results.length) return res.status(404).json({ error: 'User not found' });

        const user = results[0];
        
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            profile_image: user.profile_image || null,
            description: user.description || ''
        });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}
